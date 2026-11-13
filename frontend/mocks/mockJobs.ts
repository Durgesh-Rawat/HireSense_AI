/** DEMO DATA ONLY — fictional companies and job postings. */
import type { Job, EmploymentType, ExperienceLevel } from "@/types/job";
import type { CompanyProfile } from "@/types/recruiter";
import { daysAgo, daysFromNow } from "./helpers";

export const DEMO_COMPANY_ID = "c-nimbus";

export const MOCK_COMPANY: CompanyProfile = {
  id: DEMO_COMPANY_ID,
  name: "Nimbus Labs",
  logoUrl: null,
  description:
    "Nimbus Labs builds cloud-native developer tools used by engineering teams across India. We are a remote-friendly team of 120 engineers, designers and data scientists.",
  website: "https://nimbus-labs.example.com",
  location: "Bengaluru, India",
  industry: "Software / SaaS",
  size: "51–200 employees",
};

const COMPANIES: Record<string, string> = {
  [DEMO_COMPANY_ID]: "Nimbus Labs",
  "c-finwave": "Finwave Technologies",
  "c-greenleaf": "Greenleaf Health",
  "c-orbit": "Orbit Systems",
  "c-pixel": "PixelCraft Studio",
  "c-datanest": "DataNest Analytics",
  "c-cloudkart": "CloudKart",
};

type Seed = [
  id: string, title: string, companyId: string, location: string, type: EmploymentType, level: ExperienceLevel,
  exp: string, req: string[], pref: string[], salary: [number, number] | null, posted: number, deadline: number,
  opts?: { active?: boolean; flagged?: string; openings?: number; edu?: string },
];

const SEEDS: Seed[] = [
  ["j1", "Full Stack Developer (Next.js + FastAPI)", DEMO_COMPANY_ID, "Bengaluru", "FULL_TIME", "JUNIOR", "1–3 years", ["React", "Next.js", "TypeScript", "Node.js", "PostgreSQL"], ["Docker", "AWS"], [900000, 1600000], 4, 24, { openings: 3 }],
  ["j2", "Machine Learning Engineer", DEMO_COMPANY_ID, "Hyderabad", "FULL_TIME", "MID", "3–5 years", ["Python", "Machine Learning", "NLP", "TensorFlow", "SQL"], ["Docker", "AWS"], [1800000, 3200000], 7, 30, { openings: 2, edu: "B.Tech / M.Tech in CSE, AI or related field" }],
  ["j3", "UI/UX Designer", DEMO_COMPANY_ID, "Remote", "REMOTE", "JUNIOR", "1–3 years", ["Figma", "Data Analysis"], ["Tailwind CSS"], [700000, 1300000], 10, 20, { openings: 1 }],
  ["j4", "Backend Developer (Python)", DEMO_COMPANY_ID, "Bengaluru", "FULL_TIME", "FRESHER", "0–1 years", ["Python", "FastAPI", "PostgreSQL", "REST APIs"], ["Docker", "Git"], [600000, 1000000], 3, 28, { openings: 4 }],
  ["j5", "Software Engineering Intern", DEMO_COMPANY_ID, "Pune", "INTERNSHIP", "FRESHER", "Freshers welcome", ["JavaScript", "Python", "Git"], ["React"], [240000, 360000], 12, 15, { openings: 5 }],
  ["j6", "DevOps Engineer", DEMO_COMPANY_ID, "Hyderabad", "FULL_TIME", "MID", "3–6 years", ["Docker", "Kubernetes", "AWS", "Git"], ["Python"], [1400000, 2400000], 40, -5, { active: false }],
  ["j7", "Frontend Engineer (React)", "c-finwave", "Mumbai", "FULL_TIME", "JUNIOR", "1–3 years", ["React", "TypeScript", "JavaScript", "Tailwind CSS"], ["Next.js"], [1000000, 1800000], 2, 26],
  ["j8", "Data Analyst", "c-greenleaf", "Delhi NCR", "FULL_TIME", "FRESHER", "0–2 years", ["SQL", "Data Analysis", "Python"], ["Tableau"], [500000, 800000], 6, 18],
  ["j9", "Java Backend Engineer", "c-orbit", "Chennai", "FULL_TIME", "MID", "3–6 years", ["Java", "Spring Boot", "SQL", "REST APIs"], ["Kubernetes", "AWS"], [1500000, 2600000], 9, 35],
  ["j10", "Product Designer", "c-pixel", "Remote", "REMOTE", "MID", "3–5 years", ["Figma", "Data Analysis"], [], [1200000, 2000000], 5, 22],
  ["j11", "Data Scientist", "c-datanest", "Bengaluru", "FULL_TIME", "MID", "2–4 years", ["Python", "Machine Learning", "SQL", "NLP"], ["TensorFlow"], [1600000, 2800000], 1, 30],
  ["j12", "Cloud Support Associate", "c-cloudkart", "Pune", "FULL_TIME", "FRESHER", "0–1 years", ["AWS", "Git", "SQL"], ["Docker"], [450000, 700000], 14, 21],
  ["j13", "Frontend Developer Intern", "c-pixel", "Remote", "INTERNSHIP", "FRESHER", "Freshers welcome", ["JavaScript", "React"], ["TypeScript"], [180000, 300000], 8, 12],
  ["j14", "Senior Node.js Engineer", "c-finwave", "Bengaluru", "FULL_TIME", "SENIOR", "6+ years", ["Node.js", "TypeScript", "MongoDB", "AWS"], ["Kubernetes"], [2800000, 4500000], 11, 40],
  ["j15", "Python Developer (Contract)", "c-orbit", "Remote", "CONTRACT", "JUNIOR", "1–3 years", ["Python", "Django", "PostgreSQL"], ["Docker"], [800000, 1400000], 15, 16],
  ["j16", "Quick Money — No Experience Needed!!!", "c-cloudkart", "Remote", "PART_TIME", "FRESHER", "None", ["Git"], [], null, 3, 10, { flagged: "Suspicious payment-upfront language reported by 3 users" }],
];

const DESCRIPTION = (title: string, company: string) =>
  `${company} is looking for a ${title} to join a growing team.\n\nWhat you'll do\n• Collaborate with product, design and engineering to ship high-quality features.\n• Write clean, tested and maintainable code and take ownership of what you build.\n• Participate in code reviews, planning and continuous improvement of our practices.\n\nWhat we offer\n• Competitive compensation, flexible work and learning budget.\n• A supportive, transparent team culture.\n\n(Demo description — fictional posting generated for frontend development.)`;

export const MOCK_JOBS: Job[] = SEEDS.map(([id, title, companyId, location, type, level, exp, req, pref, salary, posted, deadline, opts]) => ({
  id,
  title,
  companyId,
  companyName: COMPANIES[companyId],
  companyLogoUrl: null,
  location,
  employmentType: type,
  experienceLevel: level,
  experienceRequired: exp,
  educationRequirements: opts?.edu ?? "B.Tech / B.E. / BCA / MCA or equivalent",
  description: DESCRIPTION(title, COMPANIES[companyId]),
  requiredSkills: req,
  preferredSkills: pref,
  salaryMin: salary?.[0] ?? null,
  salaryMax: salary?.[1] ?? null,
  openings: opts?.openings ?? 1,
  deadline: daysFromNow(deadline),
  postedAt: daysAgo(posted),
  isActive: opts?.active ?? true,
  isFlagged: Boolean(opts?.flagged),
  flagReason: opts?.flagged ?? null,
}));
