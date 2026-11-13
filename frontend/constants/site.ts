/** Central place for branding — change the placeholder name here. */
export const SITE = {
  name: "HireSense AI",
  tagline: "Hire smarter. Get hired faster.",
  description:
    "An AI-powered resume screening and job portal that connects candidates with recruiters and helps recruiters find the best-matched applicants.",
  email: "support@hiresense.example",
};

export const DEMO_PASSWORD = "Demo@1234";
export const DEMO_ACCOUNTS = [
  { role: "CANDIDATE", label: "Candidate", email: "candidate@demo.com" },
  { role: "RECRUITER", label: "Recruiter", email: "recruiter@demo.com" },
  { role: "ADMIN", label: "Admin", email: "admin@demo.com" },
] as const;
