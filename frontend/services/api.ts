import axios, { AxiosError, type AxiosRequestConfig } from "axios";
import { API_CASE, API_URL, AUTH_STRATEGY } from "@/lib/config";
import { keysToCamel, keysToSnake } from "@/lib/case";
import type { ApiErrorShape } from "@/types/common";

/**
 * Centralised Axios client. Every real (non-mock) service call goes through this instance.
 * Auth strategy is configurable until the contract is confirmed (see lib/config.ts).
 */
let accessToken: string | null = null; // memory only — never persisted to localStorage
export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

type UnauthorizedHandler = () => void;
let onUnauthorized: UnauthorizedHandler | null = null;
export const registerUnauthorizedHandler = (fn: UnauthorizedHandler | null) => {
  onUnauthorized = fn;
};

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: AUTH_STRATEGY === "cookie",
  headers: { "Content-Type": "application/json", Accept: "application/json" },
  timeout: 30000,
  // Arrays are sent as repeated keys (skills=a&skills=b), which is what FastAPI List[str] query params expect.
  paramsSerializer: { indexes: null },
});

api.interceptors.request.use((config) => {
  if (AUTH_STRATEGY === "bearer" && accessToken) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  if (API_CASE === "snake") {
    if (config.data && !(config.data instanceof FormData)) config.data = keysToSnake(config.data);
    if (config.params) config.params = keysToSnake(config.params);
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (API_CASE === "snake" && res.data) res.data = keysToCamel(res.data);
    return res;
  },
  (error: AxiosError) => {
    const url = error.config?.url ?? "";
    // A 401 on the login call just means "wrong credentials"; anywhere else it means the session expired.
    if (error.response?.status === 401 && !url.includes("/auth/login")) onUnauthorized?.();
    return Promise.reject(error);
  },
);

/** Normalises FastAPI / Axios errors into a shape the UI can display. */
export function toApiError(err: unknown): ApiErrorShape {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    const data = err.response?.data as { detail?: unknown; message?: string } | undefined;
    if (!err.response) return { message: "Cannot reach the server. Check your connection and try again.", status };
    if (typeof data?.detail === "string") return { message: data.detail, status };
    if (Array.isArray(data?.detail)) {
      const fieldErrors: Record<string, string> = {};
      (data.detail as { loc?: (string | number)[]; msg?: string }[]).forEach((d) => {
        const field = d.loc?.[d.loc.length - 1];
        if (field !== undefined && d.msg) fieldErrors[String(field)] = d.msg;
      });
      return { message: "Please fix the highlighted fields.", status, fieldErrors };
    }
    if (data?.message) return { message: data.message, status };
    return { message: `Request failed${status ? ` (${status})` : ""}.`, status };
  }
  if (err && typeof err === "object" && "message" in err) {
    const e = err as ApiErrorShape;
    return { message: e.message, status: e.status, code: e.code };
  }
  return { message: "Something went wrong. Please try again." };
}

/** Thin typed helpers so services stay tiny. */
export const http = {
  get: async <T>(url: string, config?: AxiosRequestConfig) => (await api.get<T>(url, config)).data,
  post: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => (await api.post<T>(url, body, config)).data,
  put: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => (await api.put<T>(url, body, config)).data,
  patch: async <T>(url: string, body?: unknown, config?: AxiosRequestConfig) => (await api.patch<T>(url, body, config)).data,
  delete: async <T = void>(url: string, config?: AxiosRequestConfig) => (await api.delete<T>(url, config)).data,
};

export default api;

/** Removes undefined / empty-string params so they are not sent to the backend. */
export function cleanParams<T extends object>(params: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null && !(Array.isArray(v) && v.length === 0)),
  ) as Partial<T>;
}

/** Download a binary resource. File name comes from Content-Disposition when present. */
export async function getBlob(url: string, fallbackName: string): Promise<{ blob: Blob; fileName: string }> {
  const res = await api.get<Blob>(url, { responseType: "blob" });
  const cd = (res.headers["content-disposition"] as string | undefined) ?? "";
  const match = /filename\*?=(?:UTF-8'')?"?([^";]+)"?/i.exec(cd);
  return { blob: res.data, fileName: match ? decodeURIComponent(match[1]) : fallbackName };
}
