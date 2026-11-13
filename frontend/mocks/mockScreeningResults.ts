/**
 * DEMO DATA ONLY.
 * These screening results are fixed, hand-written sample values used so the UI can be demonstrated
 * before the AI engine exists. They are NOT produced by any algorithm and every result carries
 * `isDemo: true`, which the UI surfaces with a "Demo data" label.
 */
import type { ScreeningResult } from "@/types/screening";
import type { Applicant } from "@/types/application";
import { APPLICANT_SEEDS } from "./mockApplicants";
import { MOCK_JOBS } from "./mockJobs";

const bandText = (score: number) => (score >= 85 ? "a strong" : score >= 70 ? "a good" : score >= 55 ? "a moderate" : "a weak");

type Sample = { scores: [number, number, number, number, number]; strengths: string[]; verify: string[] };

/** Fixed sample results revealed when the demo "Run AI screening" button is used. */
const DEMO_LATE: Record<string, Sample> = {
  "cand-divya": { scores: [76, 74, 65, 82, 77], strengths: ["Good React and TypeScript base", "Relevant 1-year experience"], verify: ["PostgreSQL and Docker experience"] },
  "cand-ishita": { scores: [83, 86, 72, 88, 85], strengths: ["Covers all required ML skills", "Strong academic record in data science"], verify: ["TensorFlow and production deployment"] },
};
const DEMO_DEFAULT: Sample = { scores: [68, 70, 60, 75, 66], strengths: ["Meets several required skills"], verify: ["Depth of experience"] };

export function buildDemoResult(applicant: Applicant, fallbackSkills: string[] = []): ScreeningResult | null {
  const seed = APPLICANT_SEEDS.find((s) => s.candidateId === applicant.candidateId && s.jobId === applicant.jobId);
  const job = MOCK_JOBS.find((j) => j.id === applicant.jobId);
  if (!job) return null;
  const sample: Sample = seed?.scores
    ? { scores: seed.scores, strengths: seed.strengths ?? [], verify: seed.verify ?? [] }
    : DEMO_LATE[applicant.candidateId] ?? DEMO_DEFAULT;
  const candidateSkills = APPLICANT_SEEDS.find((s) => s.candidateId === applicant.candidateId)?.skills ?? fallbackSkills;
  const have = new Set(candidateSkills.map((s) => s.toLowerCase()));
  const all = [...job.requiredSkills, ...job.preferredSkills];
  const [overall, skills, exp, edu, sem] = sample.scores;
  return {
    applicationId: applicant.applicationId,
    candidateId: applicant.candidateId,
    candidateName: applicant.candidateName,
    jobId: applicant.jobId,
    overallScore: overall,
    skillsScore: skills,
    experienceScore: exp,
    educationScore: edu,
    semanticScore: sem,
    matchingSkills: all.filter((s) => have.has(s.toLowerCase())),
    missingSkills: all.filter((s) => !have.has(s.toLowerCase())),
    strengths: sample.strengths,
    verificationAreas: sample.verify,
    summary: `Demo summary: ${applicant.candidateName} appears to be ${bandText(overall)} match for ${job.title}. Replace with the AI engine's generated summary during integration.`,
    generatedAt: new Date().toISOString(),
    isDemo: true,
  };
}
