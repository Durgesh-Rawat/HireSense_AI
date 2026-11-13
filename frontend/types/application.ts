import type { ApplicationStatus } from "@/constants/status";

export type { ApplicationStatus };

export interface ApplicationEvent {
  status: ApplicationStatus;
  at: string;
  note?: string;
}

/** Candidate's view of an application */
export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  companyName: string;
  location: string;
  appliedAt: string;
  status: ApplicationStatus;
  history: ApplicationEvent[];
}

export type ResumeStatus = "MISSING" | "UPLOADED" | "PARSING" | "PARSED" | "FAILED";
export type ScreeningStatus = "NOT_SCREENED" | "PENDING" | "COMPLETED" | "FAILED";

/** Recruiter's view of an application */
export interface Applicant {
  applicationId: string;
  jobId: string;
  jobTitle: string;
  candidateId: string;
  candidateName: string;
  /** Only present where the backend authorises it */
  email?: string | null;
  avatarUrl?: string | null;
  appliedAt: string;
  resumeStatus: ResumeStatus;
  screeningStatus: ScreeningStatus;
  /** From AI engine; null until screened */
  aiScore: number | null;
  status: ApplicationStatus;
}

export interface ApplicantFilters {
  jobId?: string;
  q?: string;
  status?: ApplicationStatus | "";
  screeningStatus?: ScreeningStatus | "";
  minScore?: number;
  maxScore?: number;
  sort?: "newest" | "oldest" | "score_desc" | "score_asc" | "name";
  page?: number;
  pageSize?: number;
}
