export interface ScreeningResult {
  applicationId: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  /** All scores are 0–100 and are produced by the AI engine, never by the frontend. */
  overallScore: number;
  skillsScore: number;
  experienceScore: number;
  educationScore: number;
  semanticScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  strengths: string[];
  verificationAreas: string[];
  summary?: string | null;
  generatedAt: string;
  /** True only for mock/demo data — the UI shows a "Demo data" label when set. */
  isDemo?: boolean;
}

export interface ScreeningFilters {
  minScore?: number;
  maxScore?: number;
  sort?: "score_desc" | "score_asc" | "name";
}

export interface AnalyzeResponse {
  jobId: string;
  status: "QUEUED" | "RUNNING" | "COMPLETED";
  analyzed?: number;
}
