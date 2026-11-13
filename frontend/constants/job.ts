import type { EmploymentType, ExperienceLevel, JobSort } from "@/types/job";

export const EMPLOYMENT_TYPES: { value: EmploymentType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "CONTRACT", label: "Contract" },
  { value: "REMOTE", label: "Remote" },
];

export const EXPERIENCE_LEVELS: { value: ExperienceLevel; label: string }[] = [
  { value: "FRESHER", label: "Fresher (0–1 yrs)" },
  { value: "JUNIOR", label: "Junior (1–3 yrs)" },
  { value: "MID", label: "Mid-level (3–6 yrs)" },
  { value: "SENIOR", label: "Senior (6+ yrs)" },
];

export const JOB_SORT_OPTIONS: { value: JobSort; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title (A–Z)" },
  { value: "salary_high", label: "Highest salary" },
];

export const LOCATIONS = ["Bengaluru", "Hyderabad", "Pune", "Delhi NCR", "Mumbai", "Chennai", "Remote"];

export const COMMON_SKILLS = [
  "React", "Next.js", "TypeScript", "JavaScript", "Node.js", "Python", "FastAPI", "Django", "Java", "Spring Boot",
  "SQL", "PostgreSQL", "MongoDB", "Docker", "Kubernetes", "AWS", "Machine Learning", "NLP", "TensorFlow", "Figma",
  "Git", "REST APIs", "Tailwind CSS", "Data Analysis",
];

export const employmentLabel = (v: EmploymentType) => EMPLOYMENT_TYPES.find((e) => e.value === v)?.label ?? v;
export const experienceLabel = (v: ExperienceLevel) => EXPERIENCE_LEVELS.find((e) => e.value === v)?.label ?? v;
