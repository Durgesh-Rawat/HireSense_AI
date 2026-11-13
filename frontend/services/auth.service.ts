import { USE_MOCK } from "@/lib/config";
import { ENDPOINTS } from "@/constants/endpoints";
import { mockAuth } from "@/mocks/mockApi";
import type { AuthResponse, ForgotPasswordPayload, LoginPayload, RegisterPayload, ResetPasswordPayload } from "@/types/auth";
import type { User } from "@/types/user";
import { http, setAccessToken, toApiError } from "./api";

/** Stores a bearer token in memory only (and only if the backend returns one). */
function captureToken(res: AuthResponse) {
  if (res.accessToken) setAccessToken(res.accessToken);
  return res;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthResponse> {
    if (USE_MOCK) return mockAuth.login(payload);
    return captureToken(await http.post<AuthResponse>(ENDPOINTS.auth.login, payload));
  },
  async register(payload: RegisterPayload): Promise<AuthResponse> {
    if (USE_MOCK) return mockAuth.register(payload);
    return captureToken(await http.post<AuthResponse>(ENDPOINTS.auth.register, payload));
  },
  /** Returns the current user, or null when there is no valid session. */
  async me(): Promise<User | null> {
    if (USE_MOCK) return mockAuth.me();
    try {
      const res = await http.get<User | { user: User }>(ENDPOINTS.auth.me);
      return "user" in res ? res.user : res;
    } catch (err) {
      if (toApiError(err).status === 401) return null;
      throw err;
    }
  },
  async logout(): Promise<void> {
    setAccessToken(null);
    if (USE_MOCK) return mockAuth.logout();
    try {
      await http.post(ENDPOINTS.auth.logout);
    } catch {
      /* the local session is cleared regardless */
    }
  },
  async forgotPassword(payload: ForgotPasswordPayload): Promise<void> {
    if (USE_MOCK) return mockAuth.forgotPassword(payload.email);
    await http.post(ENDPOINTS.auth.forgotPassword, payload);
  },
  async resetPassword(payload: ResetPasswordPayload): Promise<void> {
    if (USE_MOCK) return mockAuth.resetPassword(payload);
    await http.post(ENDPOINTS.auth.resetPassword, payload);
  },
};
