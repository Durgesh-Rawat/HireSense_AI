/** DEMO DATA ONLY — in-memory mutable store that lives for the duration of the browser tab. */
import type { Role } from "@/types/auth";
import type { Application, ApplicationStatus, Applicant } from "@/types/application";
import type { CandidateProfile, Resume } from "@/types/candidate";
import type { Job } from "@/types/job";
import type { Notification } from "@/types/user";
import type { CompanyProfile } from "@/types/recruiter";
import type { ScreeningResult } from "@/types/screening";
import { daysAgo } from "./helpers";
import { MOCK_ACCOUNTS, MOCK_ADMIN_USERS } from "./mockUsers";
import { MOCK_JOBS, MOCK_COMPANY } from "./mockJobs";
import { APPLICANT_SEEDS, buildProfile, toApplicant } from "./mockApplicants";
import { buildDemoResult } from "./mockScreeningResults";

const applicants: Applicant[] = APPLICANT_SEEDS.map(toApplicant);
const profiles: Record<string, CandidateProfile> = Object.fromEntries(APPLICANT_SEEDS.map((s) => [s.candidateId, buildProfile(s)]));
const screening: Record<string, ScreeningResult> = {};
applicants.forEach((a) => {
  const r = a.screeningStatus === "COMPLETED" ? buildDemoResult(a) : null;
  if (r) screening[a.applicationId] = r;
});

const FLOW: ApplicationStatus[] = ["APPLIED", "UNDER_REVIEW", "SHORTLISTED", "INTERVIEW", "SELECTED"];
export function buildHistory(status: ApplicationStatus, appliedDaysAgo: number) {
  const path: ApplicationStatus[] = status === "REJECTED" ? ["APPLIED", "UNDER_REVIEW", "REJECTED"] : FLOW.slice(0, FLOW.indexOf(status) + 1);
  return path.map((s, i) => ({ status: s, at: daysAgo(Math.max(appliedDaysAgo - i * 2, 0), 11) }));
}

const APP_SEEDS: [jobId: string, status: ApplicationStatus, days: number][] = [
  ["j7", "SHORTLISTED", 5], ["j4", "UNDER_REVIEW", 6], ["j11", "INTERVIEW", 9], ["j8", "APPLIED", 1],
  ["j9", "REJECTED", 14], ["j13", "SELECTED", 20], ["j15", "APPLIED", 2],
];
const applications: Application[] = APP_SEEDS.map(([jobId, status, days], i) => {
  const job = MOCK_JOBS.find((j) => j.id === jobId)!;
  const linked = applicants.find((a) => a.candidateId === "u-cand-1" && a.jobId === jobId);
  return {
    id: linked?.applicationId ?? `app-c-${i + 1}`,
    jobId, jobTitle: job.title, companyName: job.companyName, location: job.location,
    appliedAt: daysAgo(days), status, history: buildHistory(status, days),
  };
});

const candidateProfile: CandidateProfile = {
  ...buildProfile(APPLICANT_SEEDS.find((s) => s.candidateId === "u-cand-1")!),
  id: "u-cand-1",
  email: "candidate@demo.com",
  phone: "+91 98765 43210",
  headline: "B.Tech CSE · Full-stack & Python developer",
  summary: "Final-year computer science student building web applications with React and FastAPI. Looking for a software engineering role.",
  githubUrl: "https://github.com/aarav-demo",
  linkedinUrl: "https://linkedin.com/in/aarav-demo",
};

const resume: Resume | null = {
  id: "res-1",
  fileName: "Aarav_Sharma_Resume.pdf",
  fileSize: 184320,
  mimeType: "application/pdf",
  uploadedAt: daysAgo(20),
  parseStatus: "PARSED",
};

const notifications: Record<Role, Notification[]> = {
  CANDIDATE: [
    { id: "n1", type: "SHORTLISTED", title: "You've been shortlisted", message: "Finwave Technologies shortlisted you for Frontend Engineer (React).", createdAt: daysAgo(0, 8), isRead: false, href: "/candidate/applications" },
    { id: "n2", type: "INTERVIEW", title: "Interview scheduled", message: "DataNest Analytics invited you for a Data Scientist interview.", createdAt: daysAgo(1, 15), isRead: false, href: "/candidate/applications" },
    { id: "n3", type: "APPLICATION_UPDATE", title: "Application under review", message: "Nimbus Labs started reviewing your application for Backend Developer (Python).", createdAt: daysAgo(3), isRead: true, href: "/candidate/applications" },
    { id: "n4", type: "APPLICATION_UPDATE", title: "Application update", message: "Orbit Systems closed your application for Java Backend Engineer.", createdAt: daysAgo(8), isRead: true, href: "/candidate/applications" },
    { id: "n5", type: "SYSTEM", title: "Complete your profile", message: "Add a portfolio link to improve your profile completeness.", createdAt: daysAgo(10), isRead: true, href: "/candidate/profile" },
  ],
  RECRUITER: [
    { id: "r1", type: "NEW_APPLICANT", title: "New applicant", message: "Divya Nair applied for Full Stack Developer (Next.js + FastAPI).", createdAt: daysAgo(0, 9), isRead: false, href: "/recruiter/applicants" },
    { id: "r2", type: "SCREENING_COMPLETE", title: "Screening complete", message: "AI screening finished for Backend Developer (Python).", createdAt: daysAgo(1, 12), isRead: false, href: "/recruiter/screening" },
    { id: "r3", type: "SYSTEM", title: "Job expiring soon", message: "Software Engineering Intern closes in 15 days.", createdAt: daysAgo(2), isRead: true, href: "/recruiter/jobs" },
  ],
  ADMIN: [
    { id: "a1", type: "SYSTEM", title: "Job reported", message: "A job posting was flagged by users and needs review.", createdAt: daysAgo(0, 7), isRead: false, href: "/admin/jobs" },
    { id: "a2", type: "SYSTEM", title: "New recruiter registrations", message: "3 recruiter accounts registered in the last 24 hours.", createdAt: daysAgo(1), isRead: true, href: "/admin/users" },
  ],
};

export const db = {
  sessionUserId: null as string | null,
  accounts: [...MOCK_ACCOUNTS],
  adminUsers: [...MOCK_ADMIN_USERS],
  jobs: [...MOCK_JOBS] as Job[],
  bookmarks: new Set<string>(["j11", "j1"]),
  applications,
  applicants,
  profiles,
  screening,
  candidateProfile,
  resume: resume as Resume | null,
  company: { ...MOCK_COMPANY } as CompanyProfile,
  notifications,
};

/** Demo-only match scores for "recommended jobs". Fixed sample values — NOT calculated. */
export const DEMO_MATCH_SCORES: Record<string, number> = { j7: 91, j1: 87, j4: 84, j15: 78, j11: 74, j8: 66, j13: 62, j12: 55 };
