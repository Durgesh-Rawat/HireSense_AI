/**
 * DEMO DATA ONLY — in-memory implementation of the backend, used when NEXT_PUBLIC_USE_MOCK_DATA=true.
 * Function signatures mirror what the real services return, so the UI does not care where data comes from.
 */
import type { AuthResponse, LoginPayload, RegisterPayload, ResetPasswordPayload } from "@/types/auth";
import type { User, Notification } from "@/types/user";
import type { Application, ApplicationStatus, Applicant, ApplicantFilters } from "@/types/application";
import type { CandidateDashboardData, CandidateProfile, Resume } from "@/types/candidate";
import type { Job, JobFilters, JobFormValues, RecommendedJob } from "@/types/job";
import type { CandidateDetails, CompanyProfile, RecruiterDashboardData } from "@/types/recruiter";
import type { AnalyzeResponse, ScreeningFilters, ScreeningResult } from "@/types/screening";
import type { AdminAnalytics, AdminDashboardData, AdminUser, AdminUserFilters } from "@/types/admin";
import type { Paginated } from "@/types/common";
import { sleep } from "@/lib/utils";
import { calcProfileCompletion } from "@/lib/profile";
import { db, DEMO_MATCH_SCORES } from "./store";
import { nextId } from "./helpers";
import { buildDemoResult } from "./mockScreeningResults";

export class MockApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 400, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const delay = (ms = 350) => sleep(ms + Math.random() * 250);
const SESSION_KEY = "demo_session_user"; // demo user id only — NOT a token

function paginate<T>(items: T[], page = 1, pageSize = 10): Paginated<T> {
  const start = (page - 1) * pageSize;
  return { items: items.slice(start, start + pageSize), total: items.length, page, pageSize };
}

/* ---------------- session helpers ---------------- */
function currentUserId(): string | null {
  if (db.sessionUserId) return db.sessionUserId;
  if (typeof window !== "undefined") {
    const id = window.sessionStorage.getItem(SESSION_KEY);
    if (id && db.accounts.some((a) => a.id === id)) db.sessionUserId = id;
  }
  return db.sessionUserId;
}
function requireUser(): User {
  const id = currentUserId();
  const acc = db.accounts.find((a) => a.id === id);
  if (!acc) throw new MockApiError("Your session has expired. Please sign in again.", 401);
  return stripPassword(acc);
}
function stripPassword(acc: (typeof db.accounts)[number]): User {
  const { password: _pw, ...user } = acc;
  void _pw;
  return user;
}
function setSession(id: string | null) {
  db.sessionUserId = id;
  if (typeof window !== "undefined") {
    if (id) window.sessionStorage.setItem(SESSION_KEY, id);
    else window.sessionStorage.removeItem(SESSION_KEY);
  }
}

/* ---------------- per-user candidate / recruiter state ---------------- */
interface CandidateState {
  profile: CandidateProfile;
  resume: Resume | null;
  applications: Application[];
  bookmarks: Set<string>;
}
const candidateStates = new Map<string, CandidateState>([
  ["u-cand-1", { profile: db.candidateProfile, resume: db.resume, applications: db.applications, bookmarks: db.bookmarks }],
]);
function cs(): CandidateState {
  const user = requireUser();
  let s = candidateStates.get(user.id);
  if (!s) {
    s = {
      profile: {
        id: user.id, fullName: user.name, email: user.email, avatarUrl: null, education: [], skills: [],
        experience: [], projects: [], certifications: [],
      },
      resume: null, applications: [], bookmarks: new Set(),
    };
    candidateStates.set(user.id, s);
    db.profiles[user.id] = s.profile;
  }
  return s;
}
const companies = new Map<string, CompanyProfile>([["u-rec-1", db.company]]);
function company(): CompanyProfile {
  const user = requireUser();
  let c = companies.get(user.id);
  if (!c) {
    c = { id: `c-${user.id}`, name: "My Company", logoUrl: null, description: "", website: "", location: "" };
    companies.set(user.id, c);
  }
  return c;
}
const ownJobIds = () => db.jobs.filter((j) => j.companyId === company().id).map((j) => j.id);
const ownApplicants = () => db.applicants.filter((a) => ownJobIds().includes(a.jobId));
const PROGRESSED: ApplicationStatus[] = ["SHORTLISTED", "INTERVIEW", "SELECTED"];

/* ---------------- auth ---------------- */
export const mockAuth = {
  async login(p: LoginPayload): Promise<AuthResponse> {
    await delay();
    const acc = db.accounts.find((a) => a.email.toLowerCase() === p.email.toLowerCase() && a.password === p.password);
    if (!acc) throw new MockApiError("Invalid email or password.", 401);
    if (!acc.isActive) throw new MockApiError("This account has been deactivated. Contact support.", 403);
    setSession(acc.id);
    return { user: stripPassword(acc) };
  },
  async register(p: RegisterPayload): Promise<AuthResponse> {
    await delay();
    if (db.accounts.some((a) => a.email.toLowerCase() === p.email.toLowerCase()))
      throw new MockApiError("An account with this email already exists.", 409);
    const acc = { id: nextId("u"), name: p.name, email: p.email, role: p.role, isActive: true, createdAt: new Date().toISOString(), password: p.password };
    db.accounts.push(acc);
    db.adminUsers.unshift({ id: acc.id, name: acc.name, email: acc.email, role: p.role, isActive: true, createdAt: acc.createdAt, lastActiveAt: acc.createdAt });
    setSession(acc.id);
    if (p.role === "RECRUITER") {
      companies.set(acc.id, { id: `c-${acc.id}`, name: p.companyName ?? "My Company", logoUrl: null, description: "", website: "", location: "" });
    }
    return { user: stripPassword(acc) };
  },
  async me(): Promise<User | null> {
    await delay(120);
    const id = currentUserId();
    const acc = db.accounts.find((a) => a.id === id);
    return acc ? stripPassword(acc) : null;
  },
  async logout() {
    await delay(100);
    setSession(null);
  },
  async forgotPassword(email: string) {
    await delay();
    void email; // Always succeeds so account existence is not revealed.
  },
  async resetPassword(p: ResetPasswordPayload) {
    await delay();
    if (p.token === "expired") throw new MockApiError("This reset link has expired. Please request a new one.", 400);
  },
};

/* ---------------- jobs ---------------- */
const withCount = (j: Job): Job => ({ ...j, applicantsCount: db.applicants.filter((a) => a.jobId === j.id).length });

function filterJobs(f: JobFilters): Job[] {
  let list = db.jobs.map(withCount);
  if (f.isActive !== undefined) list = list.filter((j) => j.isActive === f.isActive);
  if (f.companyId) list = list.filter((j) => j.companyId === f.companyId);
  if (f.flaggedOnly) list = list.filter((j) => j.isFlagged);
  if (f.q) {
    const q = f.q.toLowerCase();
    list = list.filter((j) => j.title.toLowerCase().includes(q) || j.companyName.toLowerCase().includes(q) || j.requiredSkills.some((s) => s.toLowerCase().includes(q)));
  }
  if (f.location) list = list.filter((j) => j.location.toLowerCase() === f.location!.toLowerCase());
  if (f.employmentType) list = list.filter((j) => j.employmentType === f.employmentType);
  if (f.experienceLevel) list = list.filter((j) => j.experienceLevel === f.experienceLevel);
  if (f.skills?.length) {
    const wanted = f.skills.map((s) => s.toLowerCase());
    list = list.filter((j) => [...j.requiredSkills, ...j.preferredSkills].some((s) => wanted.includes(s.toLowerCase())));
  }
  const sort = f.sort ?? "newest";
  list.sort((a, b) => {
    if (sort === "oldest") return +new Date(a.postedAt) - +new Date(b.postedAt);
    if (sort === "title") return a.title.localeCompare(b.title);
    if (sort === "salary_high") return (b.salaryMax ?? 0) - (a.salaryMax ?? 0);
    return +new Date(b.postedAt) - +new Date(a.postedAt);
  });
  return list;
}

export const mockJobs = {
  async list(f: JobFilters = {}): Promise<Paginated<Job>> {
    await delay();
    return paginate(filterJobs(f), f.page, f.pageSize ?? 9);
  },
  async get(id: string): Promise<Job> {
    await delay();
    const job = db.jobs.find((j) => j.id === id);
    if (!job) throw new MockApiError("This job could not be found. It may have been removed.", 404);
    return withCount(job);
  },
  async create(v: JobFormValues): Promise<Job> {
    await delay();
    const c = company();
    const job: Job = { ...v, id: nextId("j"), companyId: c.id, companyName: c.name, companyLogoUrl: c.logoUrl, postedAt: new Date().toISOString(), isActive: true, applicantsCount: 0, isFlagged: false, flagReason: null };
    db.jobs.unshift(job);
    return job;
  },
  async update(id: string, v: JobFormValues): Promise<Job> {
    await delay();
    const idx = db.jobs.findIndex((j) => j.id === id);
    if (idx < 0) throw new MockApiError("Job not found.", 404);
    db.jobs[idx] = { ...db.jobs[idx], ...v };
    return withCount(db.jobs[idx]);
  },
  async remove(id: string) {
    await delay();
    db.jobs = db.jobs.filter((j) => j.id !== id);
  },
  async setActive(id: string, isActive: boolean): Promise<Job> {
    await delay(200);
    const job = db.jobs.find((j) => j.id === id);
    if (!job) throw new MockApiError("Job not found.", 404);
    job.isActive = isActive;
    return withCount(job);
  },
  async listOwn(f: JobFilters = {}): Promise<Paginated<Job>> {
    return mockJobs.list({ ...f, companyId: company().id });
  },
};

/* ---------------- candidate ---------------- */
function candidateAppsDone(apps: Application[]) {
  return {
    applications: apps.length,
    shortlisted: apps.filter((a) => PROGRESSED.includes(a.status)).length,
    rejected: apps.filter((a) => a.status === "REJECTED").length,
    interviews: apps.filter((a) => a.status === "INTERVIEW").length,
  };
}

export const mockCandidate = {
  async dashboard(): Promise<CandidateDashboardData> {
    await delay();
    const s = cs();
    return {
      profileCompletion: calcProfileCompletion(s.profile, Boolean(s.resume)),
      resume: s.resume,
      totals: candidateAppsDone(s.applications),
      recommendedJobs: (await mockCandidate.recommended()).slice(0, 3),
      recentActivity: [...s.applications].sort((a, b) => +new Date(b.history.at(-1)!.at) - +new Date(a.history.at(-1)!.at)).slice(0, 5),
    };
  },
  async getProfile(): Promise<CandidateProfile> {
    await delay();
    return structuredClone(cs().profile);
  },
  async updateProfile(patch: Partial<CandidateProfile>): Promise<CandidateProfile> {
    await delay();
    const s = cs();
    Object.assign(s.profile, patch);
    const acc = db.accounts.find((a) => a.id === requireUser().id);
    if (acc && patch.fullName) acc.name = patch.fullName;
    return structuredClone(s.profile);
  },
  async uploadAvatar(file: File): Promise<string> {
    await delay();
    return URL.createObjectURL(file);
  },
  async getResume(): Promise<Resume | null> {
    await delay();
    return cs().resume ? { ...cs().resume! } : null;
  },
  async uploadResume(file: File, onProgress?: (pct: number) => void): Promise<Resume> {
    const s = cs();
    for (let pct = 0; pct <= 100; pct += 10) {
      onProgress?.(pct);
      await sleep(120);
    }
    const resume: Resume = { id: nextId("res"), fileName: file.name, fileSize: file.size, mimeType: file.type, uploadedAt: new Date().toISOString(), parseStatus: "UPLOADED" };
    s.resume = resume;
    // Parsing is done by the backend/AI engine; the mock just flips the status later.
    setTimeout(() => {
      if (s.resume?.id === resume.id) s.resume.parseStatus = "PARSED";
    }, 4000);
    return { ...resume };
  },
  async deleteResume() {
    await delay();
    cs().resume = null;
  },
  async downloadResume(): Promise<{ blob: Blob; fileName: string }> {
    await delay(150);
    const r = cs().resume;
    if (!r) throw new MockApiError("No resume found.", 404);
    return { blob: new Blob([`Demo placeholder for ${r.fileName}. The real file is served by the backend.`], { type: "text/plain" }), fileName: `${r.fileName}.demo.txt` };
  },
  async recommended(): Promise<RecommendedJob[]> {
    await delay();
    const applied = new Set(cs().applications.map((a) => a.jobId));
    return Object.entries(DEMO_MATCH_SCORES)
      .map(([id, score]) => ({ job: db.jobs.find((j) => j.id === id), score }))
      .filter((x): x is { job: Job; score: number } => Boolean(x.job?.isActive) && !applied.has(x.job!.id))
      .sort((a, b) => b.score - a.score)
      .map(({ job, score }) => ({ ...withCount(job), matchScore: score, isDemo: true }));
  },
  async applications(): Promise<Application[]> {
    await delay();
    return [...cs().applications].sort((a, b) => +new Date(b.appliedAt) - +new Date(a.appliedAt)).map((a) => structuredClone(a));
  },
  async savedJobs(): Promise<Job[]> {
    await delay(150);
    const ids = cs().bookmarks;
    return db.jobs.filter((j) => ids.has(j.id)).map(withCount);
  },
  async toggleBookmark(jobId: string): Promise<boolean> {
    await delay(150);
    const b = cs().bookmarks;
    if (b.has(jobId)) {
      b.delete(jobId);
      return false;
    }
    b.add(jobId);
    return true;
  },
};

/* ---------------- applications ---------------- */
export const mockApplications = {
  async apply(jobId: string): Promise<Application> {
    await delay();
    const s = cs();
    const user = requireUser();
    const job = db.jobs.find((j) => j.id === jobId);
    if (!job) throw new MockApiError("Job not found.", 404);
    if (!job.isActive) throw new MockApiError("This job is no longer accepting applications.", 400);
    if (s.applications.some((a) => a.jobId === jobId)) throw new MockApiError("You have already applied to this job.", 409);
    if (!s.resume) throw new MockApiError("Please upload a resume before applying.", 400, "RESUME_REQUIRED");
    const now = new Date().toISOString();
    const app: Application = {
      id: nextId("app"), jobId, jobTitle: job.title, companyName: job.companyName, location: job.location, appliedAt: now,
      status: "APPLIED", history: [{ status: "APPLIED", at: now }],
    };
    s.applications.push(app);
    db.applicants.unshift({
      applicationId: app.id, jobId, jobTitle: job.title, candidateId: user.id, candidateName: user.name, email: user.email, avatarUrl: s.profile.avatarUrl ?? null,
      appliedAt: now, resumeStatus: "UPLOADED", screeningStatus: "NOT_SCREENED", aiScore: null, status: "APPLIED",
    });
    db.profiles[user.id] = s.profile;
    db.notifications.RECRUITER.unshift({ id: nextId("n"), type: "NEW_APPLICANT", title: "New applicant", message: `${user.name} applied for ${job.title}.`, createdAt: now, isRead: false, href: "/recruiter/applicants" });
    return structuredClone(app);
  },
  async updateStatus(applicationId: string, status: ApplicationStatus, note?: string): Promise<Applicant> {
    await delay(250);
    const applicant = db.applicants.find((a) => a.applicationId === applicationId);
    if (!applicant) throw new MockApiError("Application not found.", 404);
    applicant.status = status;
    const at = new Date().toISOString();
    const state = candidateStates.get(applicant.candidateId);
    const app = state?.applications.find((a) => a.id === applicationId);
    if (app) {
      app.status = status;
      app.history.push({ status, at, note });
    }
    if (applicant.candidateId === "u-cand-1") {
      db.notifications.CANDIDATE.unshift({
        id: nextId("n"), type: status === "SHORTLISTED" ? "SHORTLISTED" : status === "INTERVIEW" ? "INTERVIEW" : "APPLICATION_UPDATE",
        title: "Application status updated", message: `${applicant.jobTitle}: your application is now "${status.replace("_", " ").toLowerCase()}".`, createdAt: at, isRead: false, href: "/candidate/applications",
      });
    }
    return { ...applicant };
  },
};

/* ---------------- recruiter ---------------- */
export const mockRecruiter = {
  async dashboard(): Promise<RecruiterDashboardData> {
    await delay();
    const mine = ownApplicants();
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const sample = [4, 7, 5, 9, 6, 3, 8];
    return {
      totals: {
        activeJobs: db.jobs.filter((j) => j.companyId === company().id && j.isActive).length,
        applicants: mine.length,
        shortlisted: mine.filter((a) => PROGRESSED.includes(a.status)).length,
        rejected: mine.filter((a) => a.status === "REJECTED").length,
      },
      recentApplications: [...mine].sort((a, b) => +new Date(b.appliedAt) - +new Date(a.appliedAt)).slice(0, 6),
      jobPerformance: db.jobs
        .filter((j) => j.companyId === company().id)
        .map((j) => {
          const list = mine.filter((a) => a.jobId === j.id);
          return { jobId: j.id, title: j.title.length > 22 ? `${j.title.slice(0, 22)}…` : j.title, applicants: list.length, shortlisted: list.filter((a) => PROGRESSED.includes(a.status)).length };
        })
        .filter((p) => p.applicants > 0),
      applicationsTrend: days.map((label, i) => ({ label, value: sample[i] })),
      screeningActivity: {
        screened: mine.filter((a) => a.screeningStatus === "COMPLETED").length,
        pending: mine.filter((a) => a.screeningStatus === "PENDING").length,
        notScreened: mine.filter((a) => a.screeningStatus === "NOT_SCREENED" || a.screeningStatus === "FAILED").length,
      },
    };
  },
  async getCompany(): Promise<CompanyProfile> {
    await delay();
    return { ...company() };
  },
  async updateCompany(patch: Partial<CompanyProfile>): Promise<CompanyProfile> {
    await delay();
    const c = company();
    Object.assign(c, patch);
    db.jobs.forEach((j) => {
      if (j.companyId === c.id) {
        j.companyName = c.name;
        j.companyLogoUrl = c.logoUrl;
      }
    });
    return { ...c };
  },
  async uploadLogo(file: File): Promise<string> {
    await delay();
    return URL.createObjectURL(file);
  },
  async listApplicants(f: ApplicantFilters = {}): Promise<Paginated<Applicant>> {
    await delay();
    let list = ownApplicants().map((a) => ({ ...a }));
    if (f.jobId) list = list.filter((a) => a.jobId === f.jobId);
    if (f.q) {
      const q = f.q.toLowerCase();
      list = list.filter((a) => a.candidateName.toLowerCase().includes(q) || (a.email ?? "").toLowerCase().includes(q));
    }
    if (f.status) list = list.filter((a) => a.status === f.status);
    if (f.screeningStatus) list = list.filter((a) => a.screeningStatus === f.screeningStatus);
    if (f.minScore !== undefined) list = list.filter((a) => a.aiScore !== null && a.aiScore >= f.minScore!);
    if (f.maxScore !== undefined) list = list.filter((a) => a.aiScore !== null && a.aiScore <= f.maxScore!);
    const sort = f.sort ?? "newest";
    list.sort((a, b) => {
      if (sort === "oldest") return +new Date(a.appliedAt) - +new Date(b.appliedAt);
      if (sort === "name") return a.candidateName.localeCompare(b.candidateName);
      if (sort === "score_desc") return (b.aiScore ?? -1) - (a.aiScore ?? -1);
      if (sort === "score_asc") return (a.aiScore ?? 101) - (b.aiScore ?? 101);
      return +new Date(b.appliedAt) - +new Date(a.appliedAt);
    });
    return paginate(list, f.page, f.pageSize ?? 8);
  },
  async candidateDetails(applicationId: string): Promise<CandidateDetails> {
    await delay();
    const applicant = db.applicants.find((a) => a.applicationId === applicationId);
    const profile = applicant ? db.profiles[applicant.candidateId] : undefined;
    if (!applicant || !profile) throw new MockApiError("Candidate application not found.", 404);
    const own = candidateStates.get(applicant.candidateId)?.resume;
    const resume: Resume | null =
      applicant.resumeStatus === "MISSING" ? null
        : own ?? {
            id: `res-${applicant.candidateId}`, fileName: `${profile.fullName.replace(/\s+/g, "_")}_Resume.pdf`, fileSize: 150000 + (profile.fullName.length % 7) * 21000,
            mimeType: "application/pdf", uploadedAt: applicant.appliedAt,
            parseStatus: applicant.resumeStatus === "PARSED" ? "PARSED" : applicant.resumeStatus === "FAILED" ? "FAILED" : applicant.resumeStatus === "PARSING" ? "PARSING" : "UPLOADED",
          };
    return { applicant: { ...applicant }, profile: structuredClone(profile), resume, screening: db.screening[applicationId] ?? null };
  },
  async downloadCandidateResume(candidateId: string): Promise<{ blob: Blob; fileName: string }> {
    await delay(150);
    const p = db.profiles[candidateId];
    const name = p?.fullName ?? "candidate";
    return { blob: new Blob([`Demo placeholder resume for ${name}. The real file is served by the backend.`], { type: "text/plain" }), fileName: `${name.replace(/\s+/g, "_")}_Resume.demo.txt` };
  },
};

/* ---------------- screening ---------------- */
export const mockScreening = {
  async results(jobId: string, f: ScreeningFilters = {}): Promise<ScreeningResult[]> {
    await delay();
    if (!ownJobIds().includes(jobId)) return [];
    let list = db.applicants.filter((a) => a.jobId === jobId).map((a) => db.screening[a.applicationId]).filter(Boolean);
    if (f.minScore !== undefined) list = list.filter((r) => r.overallScore >= f.minScore!);
    if (f.maxScore !== undefined) list = list.filter((r) => r.overallScore <= f.maxScore!);
    const sort = f.sort ?? "score_desc";
    list.sort((a, b) => (sort === "name" ? a.candidateName.localeCompare(b.candidateName) : sort === "score_asc" ? a.overallScore - b.overallScore : b.overallScore - a.overallScore));
    return structuredClone(list);
  },
  async analyze(jobId: string): Promise<AnalyzeResponse> {
    await sleep(1500);
    let analyzed = 0;
    db.applicants
      .filter((a) => a.jobId === jobId && a.screeningStatus !== "COMPLETED" && a.resumeStatus !== "FAILED")
      .forEach((a) => {
        const result = buildDemoResult(a, db.profiles[a.candidateId]?.skills);
        if (!result) return;
        db.screening[a.applicationId] = result;
        a.screeningStatus = "COMPLETED";
        a.resumeStatus = "PARSED";
        a.aiScore = result.overallScore;
        analyzed += 1;
      });
    db.notifications.RECRUITER.unshift({ id: nextId("n"), type: "SCREENING_COMPLETE", title: "Screening complete", message: `AI screening finished (${analyzed} candidate${analyzed === 1 ? "" : "s"}) — demo results.`, createdAt: new Date().toISOString(), isRead: false, href: "/recruiter/screening" });
    return { jobId, status: "COMPLETED", analyzed };
  },
};

/* ---------------- notifications ---------------- */
export const mockNotifications = {
  async list(): Promise<Notification[]> {
    await delay(200);
    return structuredClone(db.notifications[requireUser().role]);
  },
  async markRead(id: string) {
    await delay(100);
    const n = db.notifications[requireUser().role].find((x) => x.id === id);
    if (n) n.isRead = true;
  },
  async markAllRead() {
    await delay(150);
    db.notifications[requireUser().role].forEach((n) => (n.isRead = true));
  },
};

/* ---------------- admin ---------------- */
const MONTHS = () => {
  const out: string[] = [];
  const d = new Date();
  for (let i = 5; i >= 0; i--) out.push(new Date(d.getFullYear(), d.getMonth() - i, 1).toLocaleString("en", { month: "short" }));
  return out;
};

export const mockAdmin = {
  async dashboard(): Promise<AdminDashboardData> {
    await delay();
    const weeks = ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"];
    const users = [38, 45, 41, 58, 62, 55, 71, 80];
    const apps = [120, 150, 138, 190, 210, 185, 240, 265];
    return {
      totals: { users: 1284, candidates: 1103, recruiters: 181, jobs: 342, applications: 5918 },
      activity: weeks.map((label, i) => ({ label, users: users[i], applications: apps[i] })),
    };
  },
  async listUsers(f: AdminUserFilters = {}): Promise<Paginated<AdminUser>> {
    await delay();
    let list = [...db.adminUsers];
    if (f.q) {
      const q = f.q.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    if (f.role) list = list.filter((u) => u.role === f.role);
    if (f.isActive !== undefined && f.isActive !== "") list = list.filter((u) => u.isActive === f.isActive);
    return paginate(list, f.page, f.pageSize ?? 10);
  },
  async setUserActive(id: string, isActive: boolean): Promise<AdminUser> {
    await delay(200);
    const u = db.adminUsers.find((x) => x.id === id);
    if (!u) throw new MockApiError("User not found.", 404);
    u.isActive = isActive;
    const acc = db.accounts.find((a) => a.id === id);
    if (acc) acc.isActive = isActive;
    return { ...u };
  },
  async dismissFlag(jobId: string) {
    await delay(200);
    const j = db.jobs.find((x) => x.id === jobId);
    if (j) {
      j.isFlagged = false;
      j.flagReason = null;
    }
  },
  async analytics(): Promise<AdminAnalytics> {
    await delay();
    const m = MONTHS();
    const cands = [90, 110, 135, 128, 170, 205];
    const recs = [12, 15, 19, 22, 25, 31];
    const posts = [28, 35, 44, 52, 61, 74];
    const screens = [210, 320, 450, 610, 780, 940];
    return {
      registrations: m.map((label, i) => ({ label, candidates: cands[i], recruiters: recs[i] })),
      jobPostings: m.map((label, i) => ({ label, value: posts[i] })),
      applicationStats: [
        { status: "Applied", count: 2310 }, { status: "Under review", count: 1480 }, { status: "Shortlisted", count: 920 },
        { status: "Interview", count: 610 }, { status: "Selected", count: 240 }, { status: "Rejected", count: 358 },
      ],
      screeningActivity: m.map((label, i) => ({ label, value: screens[i] })),
    };
  },
};
