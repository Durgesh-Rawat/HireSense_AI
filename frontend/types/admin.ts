import type { Role } from "./auth";
import type { TimePoint } from "./recruiter";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Exclude<Role, "ADMIN">;
  isActive: boolean;
  createdAt: string;
  lastActiveAt?: string | null;
}

export interface AdminUserFilters {
  q?: string;
  role?: Exclude<Role, "ADMIN"> | "";
  isActive?: boolean | "";
  page?: number;
  pageSize?: number;
}

export interface AdminDashboardData {
  totals: { users: number; candidates: number; recruiters: number; jobs: number; applications: number };
  activity: { label: string; users: number; applications: number }[];
}

export interface AdminAnalytics {
  registrations: { label: string; candidates: number; recruiters: number }[];
  jobPostings: TimePoint[];
  applicationStats: { status: string; count: number }[];
  screeningActivity: TimePoint[];
}
