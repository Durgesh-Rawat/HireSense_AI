import type { User } from "./user";

export type Role = "CANDIDATE" | "RECRUITER" | "ADMIN";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, "ADMIN">;
  /** Recruiter only */
  companyName?: string;
}

/**
 * Result of login / register / me.
 * `accessToken` is only present if the backend contract chooses bearer tokens (UNCONFIRMED).
 * With cookie sessions the backend would return only `user`.
 */
export interface AuthResponse {
  user: User;
  accessToken?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
