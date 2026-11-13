import { USE_MOCK } from "@/lib/config";
import { ENDPOINTS } from "@/constants/endpoints";
import { mockApplications, mockCandidate } from "@/mocks/mockApi";
import type { Applicant, Application, ApplicationStatus } from "@/types/application";
import { http } from "./api";

export const applicationService = {
  /** Candidate applies to a job. */
  apply: (jobId: string): Promise<Application> =>
    USE_MOCK ? mockApplications.apply(jobId) : http.post(ENDPOINTS.applications.create, { jobId }),
  /** Candidate's own applications. */
  listMine: (): Promise<Application[]> =>
    USE_MOCK ? mockCandidate.applications() : http.get(ENDPOINTS.candidate.applications),
  /** Recruiter changes an application's status. */
  updateStatus: (applicationId: string, status: ApplicationStatus, note?: string): Promise<Applicant> =>
    USE_MOCK
      ? mockApplications.updateStatus(applicationId, status, note)
      : http.patch(ENDPOINTS.applications.updateStatus(applicationId), { status, note }),
};
