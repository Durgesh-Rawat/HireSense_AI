import type { CandidateProfile } from "@/types/candidate";

/** Simple UI metric: how many profile sections are filled in (not an AI score). */
export function calcProfileCompletion(p: CandidateProfile, hasResume: boolean): number {
  const checks = [
    Boolean(p.fullName), Boolean(p.email), Boolean(p.phone), Boolean(p.location), Boolean(p.avatarUrl),
    Boolean(p.college), Boolean(p.degree), Boolean(p.graduationYear),
    p.skills.length > 0, p.experience.length > 0, p.projects.length > 0, p.certifications.length > 0,
    Boolean(p.linkedinUrl), Boolean(p.githubUrl), Boolean(p.portfolioUrl), hasResume,
  ];
  return Math.round((checks.filter(Boolean).length / checks.length) * 100);
}
