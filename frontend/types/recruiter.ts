import type { Applicant } from "./application";
import type { CandidateProfile, Resume } from "./candidate";
import type { ScreeningResult } from "./screening";

export interface CompanyProfile {
  id: string;
  name: string;
  logoUrl?: string | null;
  description: string;
  website?: string;
  location?: string;
  industry?: string;
  size?: string;
}

export interface JobPerformance {
  jobId: string;
  title: string;
  applicants: number;
  shortlisted: number;
}

export interface TimePoint {
  label: string;
  value: number;
}

export interface RecruiterDashboardData {
  totals: { activeJobs: number; applicants: number; shortlisted: number; rejected: number };
  recentApplications: Applicant[];
  jobPerformance: JobPerformance[];
  applicationsTrend: TimePoint[];
  screeningActivity: { screened: number; pending: number; notScreened: number };
}

export interface CandidateDetails {
  applicant: Applicant;
  profile: CandidateProfile;
  resume: Resume | null;
  /** null until the AI engine has screened this application */
  screening: ScreeningResult | null;
}
