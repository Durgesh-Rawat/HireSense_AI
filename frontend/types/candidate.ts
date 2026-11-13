import type { Application } from "./application";
import type { RecommendedJob } from "./job";

export interface Education {
  id: string;
  degree: string;
  institution: string;
  fieldOfStudy?: string;
  graduationYear: number;
  grade?: string;
}

export interface WorkExperience {
  id: string;
  title: string;
  company: string;
  location?: string;
  startDate: string;
  endDate?: string | null;
  current?: boolean;
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  techStack: string[];
  url?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
  url?: string;
}

export interface CandidateProfile {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  location?: string;
  avatarUrl?: string | null;
  headline?: string;
  summary?: string;
  college?: string;
  degree?: string;
  graduationYear?: number;
  education: Education[];
  skills: string[];
  experience: WorkExperience[];
  projects: Project[];
  certifications: Certification[];
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
}

export interface Resume {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  downloadUrl?: string;
  /** Parsing is done by the backend / AI engine. */
  parseStatus: "UPLOADED" | "PARSING" | "PARSED" | "FAILED";
}

export interface CandidateDashboardData {
  profileCompletion: number;
  resume: Resume | null;
  totals: { applications: number; shortlisted: number; rejected: number; interviews: number };
  recommendedJobs: RecommendedJob[];
  recentActivity: Application[];
}
