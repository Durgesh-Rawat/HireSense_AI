import { USE_MOCK } from "@/lib/config";
import { ENDPOINTS } from "@/constants/endpoints";
import { mockJobs, mockRecruiter } from "@/mocks/mockApi";
import type { Applicant, ApplicantFilters } from "@/types/application";
import type { Job, JobFilters } from "@/types/job";
import type { Paginated } from "@/types/common";
import type { CandidateDetails, CompanyProfile, RecruiterDashboardData } from "@/types/recruiter";
import { api, cleanParams, getBlob, http } from "./api";

export const recruiterService = {
  dashboard: (): Promise<RecruiterDashboardData> => (USE_MOCK ? mockRecruiter.dashboard() : http.get(ENDPOINTS.recruiter.dashboard)),
  getCompany: (): Promise<CompanyProfile> => (USE_MOCK ? mockRecruiter.getCompany() : http.get(ENDPOINTS.recruiter.company)),
  updateCompany: (patch: Partial<CompanyProfile>): Promise<CompanyProfile> =>
    USE_MOCK ? mockRecruiter.updateCompany(patch) : http.put(ENDPOINTS.recruiter.company, patch),
  async uploadLogo(file: File): Promise<string> {
    if (USE_MOCK) return mockRecruiter.uploadLogo(file);
    const form = new FormData();
    form.append("file", file);
    const res = await api.post<{ url: string }>(ENDPOINTS.recruiter.companyLogo, form);
    return res.data.url;
  },
  /** The recruiter's own jobs (all statuses). */
  listJobs: (filters: JobFilters = {}): Promise<Paginated<Job>> =>
    USE_MOCK ? mockJobs.listOwn(filters) : http.get(ENDPOINTS.recruiter.jobs, { params: cleanParams(filters) }),
  /** Applicants across all of the recruiter's jobs, or for one job when `jobId` is set. */
  listApplicants(filters: ApplicantFilters = {}): Promise<Paginated<Applicant>> {
    if (USE_MOCK) return mockRecruiter.listApplicants(filters);
    const { jobId, ...rest } = filters;
    return jobId
      ? http.get(ENDPOINTS.recruiter.jobApplicants(jobId), { params: cleanParams(rest) })
      : http.get(ENDPOINTS.recruiter.applicants, { params: cleanParams(rest) });
  },
  candidateDetails: (applicationId: string): Promise<CandidateDetails> =>
    USE_MOCK ? mockRecruiter.candidateDetails(applicationId) : http.get(ENDPOINTS.recruiter.candidateDetails(applicationId)),
  downloadCandidateResume: (candidateId: string, fallbackName = "resume"): Promise<{ blob: Blob; fileName: string }> =>
    USE_MOCK ? mockRecruiter.downloadCandidateResume(candidateId) : getBlob(ENDPOINTS.recruiter.candidateResume(candidateId), fallbackName),
};
