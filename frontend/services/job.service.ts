import { USE_MOCK } from "@/lib/config";
import { ENDPOINTS } from "@/constants/endpoints";
import { mockJobs } from "@/mocks/mockApi";
import type { Job, JobFilters, JobFormValues } from "@/types/job";
import type { Paginated } from "@/types/common";
import { cleanParams, http } from "./api";

export const jobService = {
  list: (filters: JobFilters = {}): Promise<Paginated<Job>> =>
    USE_MOCK ? mockJobs.list(filters) : http.get(ENDPOINTS.jobs.list, { params: cleanParams(filters) }),
  get: (id: string): Promise<Job> => (USE_MOCK ? mockJobs.get(id) : http.get(ENDPOINTS.jobs.detail(id))),
  create: (values: JobFormValues): Promise<Job> => (USE_MOCK ? mockJobs.create(values) : http.post(ENDPOINTS.jobs.create, values)),
  update: (id: string, values: JobFormValues): Promise<Job> =>
    USE_MOCK ? mockJobs.update(id, values) : http.put(ENDPOINTS.jobs.update(id), values),
  remove: (id: string): Promise<void> => (USE_MOCK ? mockJobs.remove(id) : http.delete(ENDPOINTS.jobs.remove(id))),
  setActive: (id: string, isActive: boolean): Promise<Job> =>
    USE_MOCK ? mockJobs.setActive(id, isActive) : http.patch(ENDPOINTS.jobs.setActive(id), { isActive }),
};
