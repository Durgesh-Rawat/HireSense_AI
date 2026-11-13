import { USE_MOCK } from "@/lib/config";
import { ENDPOINTS } from "@/constants/endpoints";
import { mockAdmin, mockJobs } from "@/mocks/mockApi";
import type { AdminAnalytics, AdminDashboardData, AdminUser, AdminUserFilters } from "@/types/admin";
import type { Job, JobFilters } from "@/types/job";
import type { Paginated } from "@/types/common";
import { cleanParams, http } from "./api";

export const adminService = {
  dashboard: (): Promise<AdminDashboardData> => (USE_MOCK ? mockAdmin.dashboard() : http.get(ENDPOINTS.admin.dashboard)),
  listUsers: (filters: AdminUserFilters = {}): Promise<Paginated<AdminUser>> =>
    USE_MOCK ? mockAdmin.listUsers(filters) : http.get(ENDPOINTS.admin.users, { params: cleanParams(filters) }),
  setUserActive: (id: string, isActive: boolean): Promise<AdminUser> =>
    USE_MOCK ? mockAdmin.setUserActive(id, isActive) : http.patch(ENDPOINTS.admin.userStatus(id), { isActive }),
  listJobs: (filters: JobFilters = {}): Promise<Paginated<Job>> =>
    USE_MOCK ? mockJobs.list(filters) : http.get(ENDPOINTS.admin.jobs, { params: cleanParams(filters) }),
  removeJob: (id: string): Promise<void> => (USE_MOCK ? mockJobs.remove(id) : http.delete(ENDPOINTS.admin.jobs + `/${id}`)),
  dismissFlag: (id: string): Promise<void> =>
    USE_MOCK ? mockAdmin.dismissFlag(id) : http.post(ENDPOINTS.admin.jobModeration(id), { action: "dismiss" }),
  analytics: (): Promise<AdminAnalytics> => (USE_MOCK ? mockAdmin.analytics() : http.get(ENDPOINTS.admin.analytics)),
};
