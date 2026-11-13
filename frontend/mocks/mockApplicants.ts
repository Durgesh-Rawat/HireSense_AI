/** DEMO DATA ONLY — fictional candidates and recruiter-side applicant rows. */
import type { Applicant, ApplicationStatus, ResumeStatus, ScreeningStatus } from "@/types/application";
import type { CandidateProfile } from "@/types/candidate";
import { daysAgo } from "./helpers";
import { MOCK_JOBS } from "./mockJobs";

export type ScreenState = "done" | "pending" | "none" | "failed";

export interface ApplicantSeed {
  candidateId: string;
  name: string;
  college: string;
  degree: string;
  year: number;
  location: string;
  years: number;
  skills: string[];
  jobId: string;
  status: ApplicationStatus;
  applied: number;
  state: ScreenState;
  /** overall, skills, experience, education, semantic — fixed DEMO values */
  scores?: [number, number, number, number, number];
  strengths?: string[];
  verify?: string[];
}

export const APPLICANT_SEEDS: ApplicantSeed[] = [
  { candidateId: "cand-ananya", name: "Ananya Iyer", college: "BITS Pilani", degree: "B.E. Computer Science", year: 2022, location: "Bengaluru", years: 2, skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Docker", "Tailwind CSS"], jobId: "j1", status: "SHORTLISTED", applied: 3, state: "done", scores: [92, 95, 88, 90, 91], strengths: ["Strong hands-on React + Next.js portfolio", "Production Node.js and PostgreSQL experience", "Clear, quantified project outcomes"], verify: ["Depth of Docker/CI experience"] },
  { candidateId: "cand-rohan", name: "Rohan Verma", college: "VIT Vellore", degree: "B.Tech Information Technology", year: 2021, location: "Pune", years: 3, skills: ["React", "JavaScript", "Node.js", "MongoDB", "AWS"], jobId: "j1", status: "UNDER_REVIEW", applied: 4, state: "done", scores: [78, 70, 85, 80, 76], strengths: ["3 years of relevant experience", "Cloud deployment exposure on AWS"], verify: ["TypeScript proficiency", "Experience with relational databases"] },
  { candidateId: "cand-sneha", name: "Sneha Kulkarni", college: "COEP Pune", degree: "B.Tech Computer Engineering", year: 2025, location: "Pune", years: 0, skills: ["React", "JavaScript", "Git", "Tailwind CSS"], jobId: "j1", status: "APPLIED", applied: 2, state: "done", scores: [61, 55, 40, 85, 63], strengths: ["Solid academic background", "Good front-end fundamentals"], verify: ["No professional experience", "Backend and database skills"] },
  { candidateId: "cand-karan", name: "Karan Malhotra", college: "Delhi Technological University", degree: "B.Tech Computer Science", year: 2020, location: "Delhi NCR", years: 4, skills: ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL", "Python"], jobId: "j1", status: "INTERVIEW", applied: 6, state: "done", scores: [88, 90, 92, 82, 86], strengths: ["Full-stack delivery at product companies", "Strong TypeScript and API design"], verify: ["Notice period / availability"] },
  { candidateId: "cand-divya", name: "Divya Nair", college: "NIT Calicut", degree: "B.Tech Computer Science", year: 2023, location: "Bengaluru", years: 1, skills: ["React", "TypeScript", "Node.js"], jobId: "j1", status: "APPLIED", applied: 1, state: "pending" },
  { candidateId: "cand-vikram", name: "Vikram Singh", college: "IIIT Hyderabad", degree: "M.Tech Computer Science", year: 2022, location: "Hyderabad", years: 4, skills: ["Python", "Machine Learning", "NLP", "TensorFlow", "SQL", "Docker"], jobId: "j2", status: "SHORTLISTED", applied: 5, state: "done", scores: [94, 96, 90, 95, 93], strengths: ["Published NLP research and shipped models to production", "Covers every required skill", "Advanced degree in a relevant field"], verify: ["Cloud (AWS) deployment experience"] },
  { candidateId: "cand-meera", name: "Meera Joshi", college: "IIT Bombay", degree: "B.Tech Electrical Engineering", year: 2021, location: "Mumbai", years: 3, skills: ["Python", "Machine Learning", "SQL", "Pandas"], jobId: "j2", status: "UNDER_REVIEW", applied: 6, state: "done", scores: [72, 68, 75, 78, 70], strengths: ["Strong ML fundamentals", "Relevant analytics experience"], verify: ["NLP and TensorFlow experience not evident", "Production deployment of models"] },
  { candidateId: "cand-arjun", name: "Arjun Reddy", college: "JNTU Hyderabad", degree: "B.Tech Computer Science", year: 2024, location: "Hyderabad", years: 1, skills: ["Python", "TensorFlow", "Java"], jobId: "j2", status: "REJECTED", applied: 8, state: "done", scores: [48, 45, 35, 60, 50], strengths: ["Enthusiastic about deep learning"], verify: ["Limited experience for a mid-level role", "No SQL or NLP experience listed"] },
  { candidateId: "cand-ishita", name: "Ishita Gupta", college: "Amity University", degree: "M.Sc. Data Science", year: 2023, location: "Delhi NCR", years: 2, skills: ["Python", "Machine Learning", "SQL", "NLP"], jobId: "j2", status: "APPLIED", applied: 1, state: "none" },
  { candidateId: "cand-pooja", name: "Pooja Bansal", college: "NID Ahmedabad", degree: "B.Des Interaction Design", year: 2022, location: "Remote", years: 2, skills: ["Figma", "Data Analysis", "Tailwind CSS"], jobId: "j3", status: "SHORTLISTED", applied: 7, state: "done", scores: [85, 88, 80, 90, 84], strengths: ["Polished case studies with measurable impact", "Comfortable working with front-end constraints"], verify: ["Experience with design systems at scale"] },
  { candidateId: "cand-siddharth", name: "Siddharth Rao", college: "MIT Manipal", degree: "B.Tech Computer Science", year: 2024, location: "Bengaluru", years: 0, skills: ["Figma"], jobId: "j3", status: "APPLIED", applied: 3, state: "done", scores: [58, 60, 40, 70, 55], strengths: ["Good visual taste in portfolio"], verify: ["Limited research / analytics exposure", "No work experience"] },
  { candidateId: "cand-neha", name: "Neha Kapoor", college: "NSUT Delhi", degree: "B.Tech Computer Science", year: 2025, location: "Delhi NCR", years: 0, skills: ["Python", "FastAPI", "PostgreSQL", "REST APIs", "Docker", "Git"], jobId: "j4", status: "INTERVIEW", applied: 4, state: "done", scores: [90, 95, 80, 88, 91], strengths: ["Built and deployed multiple FastAPI services", "Covers all required and preferred skills"], verify: ["Testing practices on larger codebases"] },
  { candidateId: "cand-aditya", name: "Aditya Patil", college: "PICT Pune", degree: "B.E. Computer Engineering", year: 2025, location: "Pune", years: 0, skills: ["Python", "Django", "SQL"], jobId: "j4", status: "APPLIED", applied: 2, state: "failed" },
  { candidateId: "cand-kavya", name: "Kavya Menon", college: "RV College of Engineering", degree: "B.E. Information Science", year: 2025, location: "Bengaluru", years: 0, skills: ["Python", "FastAPI", "SQL", "Git"], jobId: "j4", status: "SHORTLISTED", applied: 5, state: "done", scores: [81, 85, 70, 86, 80], strengths: ["Good FastAPI project work", "Strong CS fundamentals"], verify: ["PostgreSQL-specific experience"] },
  { candidateId: "u-cand-1", name: "Aarav Sharma", college: "Delhi Technological University", degree: "B.Tech Computer Science", year: 2025, location: "Delhi NCR", years: 0, skills: ["Python", "FastAPI", "SQL", "Git", "React", "TypeScript", "Tailwind CSS"], jobId: "j4", status: "UNDER_REVIEW", applied: 6, state: "done", scores: [74, 78, 60, 86, 76], strengths: ["Relevant FastAPI internship project", "Broad skills across front-end and back-end"], verify: ["PostgreSQL and Docker experience"] },
  { candidateId: "cand-manish", name: "Manish Tiwari", college: "SRM University", degree: "B.Tech Computer Science", year: 2026, location: "Chennai", years: 0, skills: ["JavaScript", "Python", "Git"], jobId: "j5", status: "APPLIED", applied: 2, state: "done", scores: [70, 75, 60, 75, 68], strengths: ["Meets all required skills for an internship"], verify: ["Project depth"] },
];

const RESUME_BY_STATE: Record<ScreenState, ResumeStatus> = { done: "PARSED", pending: "PARSING", none: "UPLOADED", failed: "FAILED" };
const SCREEN_BY_STATE: Record<ScreenState, ScreeningStatus> = { done: "COMPLETED", pending: "PENDING", none: "NOT_SCREENED", failed: "FAILED" };

export const toApplicant = (s: ApplicantSeed, idx: number): Applicant => ({
  applicationId: `app-${s.jobId}-${idx + 1}`,
  jobId: s.jobId,
  jobTitle: MOCK_JOBS.find((j) => j.id === s.jobId)?.title ?? "",
  candidateId: s.candidateId,
  candidateName: s.name,
  email: `${s.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
  avatarUrl: null,
  appliedAt: daysAgo(s.applied, 9 + (idx % 8)),
  resumeStatus: RESUME_BY_STATE[s.state],
  screeningStatus: SCREEN_BY_STATE[s.state],
  aiScore: s.state === "done" && s.scores ? s.scores[0] : null,
  status: s.status,
});

export const buildProfile = (s: ApplicantSeed): CandidateProfile => ({
  id: s.candidateId,
  fullName: s.name,
  email: `${s.name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
  phone: "+91 98XXXXXX" + String(10 + (s.name.length % 80)),
  location: s.location,
  avatarUrl: null,
  headline: `${s.degree} graduate · ${s.skills.slice(0, 3).join(" · ")}`,
  summary: `${s.name} is a ${s.years > 0 ? `${s.years}-year experienced` : "fresh"} candidate from ${s.college} interested in roles involving ${s.skills.slice(0, 2).join(" and ")}. (Demo profile)`,
  college: s.college,
  degree: s.degree,
  graduationYear: s.year,
  education: [{ id: "edu-1", degree: s.degree, institution: s.college, graduationYear: s.year, grade: "8.4 CGPA" }],
  skills: s.skills,
  experience:
    s.years > 0
      ? [{ id: "exp-1", title: "Software Engineer", company: "Acme Software Pvt. Ltd.", location: s.location, startDate: `${s.year}-07-01`, endDate: null, current: true, description: `Worked on ${s.skills.slice(0, 3).join(", ")} projects with a cross-functional team.` }]
      : [{ id: "exp-1", title: "Software Intern", company: "TechStart Solutions", location: s.location, startDate: `${s.year - 1}-05-01`, endDate: `${s.year - 1}-07-31`, description: `Built internal tooling using ${s.skills.slice(0, 2).join(" and ")}.` }],
  projects: [{ id: "prj-1", name: "Capstone Project", description: `A full project demonstrating ${s.skills.slice(0, 3).join(", ")}.`, techStack: s.skills.slice(0, 4), url: "https://github.com/example/project" }],
  certifications: [{ id: "cert-1", name: "Professional Certificate in Software Development", issuer: "Coursera", year: s.year }],
  linkedinUrl: "https://linkedin.com/in/example",
  githubUrl: "https://github.com/example",
  portfolioUrl: "",
});
