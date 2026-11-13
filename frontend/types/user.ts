import type { Role } from "./auth";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatarUrl?: string | null;
  isActive: boolean;
  createdAt: string;
}

export type NotificationType =
  | "APPLICATION_UPDATE"
  | "SHORTLISTED"
  | "INTERVIEW"
  | "NEW_APPLICANT"
  | "SCREENING_COMPLETE"
  | "SYSTEM";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
  /** Optional in-app link */
  href?: string;
}
