export type EmploymentType = "FULL_TIME" | "PART_TIME" | "INTERNSHIP" | "CONTRACT" | "REMOTE";
export type ExperienceLevel = "FRESHER" | "JUNIOR" | "MID" | "SENIOR";

export interface Job {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogoUrl?: string | null;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  /** Human readable, e.g. "0–2 years" */
  experienceRequired: string;
  educationRequirements: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  salaryMin?: number | null;
  salaryMax?: number | null;
  openings: number;
  deadline: string;
  postedAt: string;
  isActive: boolean;
  applicantsCount?: number;
  /** Admin moderation (if supported by the backend) */
  isFlagged?: boolean;
  flagReason?: string | null;
}

/** Returned by the backend / AI engine. `matchScore` is NEVER computed in the frontend. */
export interface RecommendedJob extends Job {
  /** 0–100, provided by the AI engine. May be null/undefined if unavailable. */
  matchScore?: number | null;
  /** True only for mock data. */
  isDemo?: boolean;
}

export type JobSort = "newest" | "oldest" | "title" | "salary_high";

export interface JobFilters {
  q?: string;
  location?: string;
  employmentType?: EmploymentType | "";
  experienceLevel?: ExperienceLevel | "";
  skills?: string[];
  sort?: JobSort;
  page?: number;
  pageSize?: number;
  /** Recruiter/admin filters */
  isActive?: boolean;
  companyId?: string;
  flaggedOnly?: boolean;
}

export interface JobFormValues {
  title: string;
  description: string;
  requiredSkills: string[];
  preferredSkills: string[];
  experienceLevel: ExperienceLevel;
  experienceRequired: string;
  educationRequirements: string;
  location: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  employmentType: EmploymentType;
  openings: number;
  deadline: string;
}
