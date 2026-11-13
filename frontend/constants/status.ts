/**
 * Application statuses. The values MUST be aligned with the backend developer.
 */
export const APPLICATION_STATUSES = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED", "REJECTED"] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export type BadgeTone = "secondary" | "info" | "warning" | "success" | "destructive" | "purple" | "accent";

export const APPLICATION_STATUS_META: Record<ApplicationStatus, { label: string; tone: BadgeTone }> = {
  APPLIED: { label: "Applied", tone: "secondary" },
  UNDER_REVIEW: { label: "Under review", tone: "info" },
  SHORTLISTED: { label: "Shortlisted", tone: "purple" },
  INTERVIEW: { label: "Interview", tone: "warning" },
  SELECTED: { label: "Selected", tone: "success" },
  REJECTED: { label: "Rejected", tone: "destructive" },
};

export const RESUME_STATUS_META = {
  MISSING: { label: "No resume", tone: "secondary" },
  UPLOADED: { label: "Uploaded", tone: "info" },
  PARSING: { label: "Parsing", tone: "warning" },
  PARSED: { label: "Parsed", tone: "success" },
  FAILED: { label: "Failed", tone: "destructive" },
} as const;

export const SCREENING_STATUS_META = {
  NOT_SCREENED: { label: "Not screened", tone: "secondary" },
  PENDING: { label: "In progress", tone: "warning" },
  COMPLETED: { label: "Screened", tone: "success" },
  FAILED: { label: "Failed", tone: "destructive" },
} as const;
