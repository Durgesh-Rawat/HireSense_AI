/** Frontend runtime configuration. Only non-secret values belong in NEXT_PUBLIC_* variables. */
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

/** When true, services return in-memory mock data instead of calling the backend. */
export const USE_MOCK = (process.env.NEXT_PUBLIC_USE_MOCK_DATA ?? "true") === "true";

/**
 * AUTH CONTRACT — NOT YET CONFIRMED with the backend developer.
 *  - "cookie": httpOnly session cookie, requests sent with credentials.
 *  - "bearer": Authorization: Bearer <token>; token kept in memory only (never localStorage).
 */
export type AuthStrategy = "cookie" | "bearer";
export const AUTH_STRATEGY = (process.env.NEXT_PUBLIC_AUTH_STRATEGY ?? "cookie") as AuthStrategy;

/** JSON key casing used by the backend. FastAPI defaults to snake_case unless aliases are configured. */
export const API_CASE = (process.env.NEXT_PUBLIC_API_CASE ?? "camel") as "camel" | "snake";

export const MAX_RESUME_SIZE_MB = 5;
export const ACCEPTED_RESUME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
export const ACCEPTED_RESUME_EXTENSIONS = [".pdf", ".docx"];
