import { z } from "zod";

/* ---------- shared pieces ---------- */
const email = z.string().trim().min(1, "Email is required").email("Enter a valid email address");

export const passwordRules = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[a-z]/, "Include a lowercase letter")
  .regex(/[A-Z]/, "Include an uppercase letter")
  .regex(/[0-9]/, "Include a number");

const optionalUrl = z
  .string()
  .trim()
  .refine((v) => v === "" || /^https?:\/\/[^\s.]+\.[^\s]{2,}/i.test(v), "Enter a valid URL starting with http:// or https://")
  .optional();

/** Numeric text input: "" is allowed, otherwise must be a non-negative whole number. */
const optionalNumberText = z
  .string()
  .trim()
  .refine((v) => v === "" || /^\d+$/.test(v), "Enter a whole number")
  .optional();

/* ---------- auth ---------- */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Password is required"),
});
export type LoginValues = z.infer<typeof loginSchema>;

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name"),
    email,
    companyName: z.string().trim().optional(),
    password: passwordRules,
    confirmPassword: z.string().min(1, "Confirm your password"),
    terms: z.boolean().refine((v) => v, "You must accept the terms to continue"),
  })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export type RegisterValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({ email });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({ password: passwordRules, confirmPassword: z.string().min(1, "Confirm your password") })
  .refine((d) => d.password === d.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

/* ---------- contact ---------- */
export const contactSchema = z.object({
  name: z.string().trim().min(2, "Enter your name"),
  email,
  subject: z.string().trim().min(3, "Enter a subject"),
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(1000, "Message is too long (max 1000 characters)"),
});
export type ContactValues = z.infer<typeof contactSchema>;

/* ---------- candidate profile ---------- */
export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name"),
  email,
  phone: z.string().trim().refine((v) => v === "" || /^[+\d][\d\s-]{7,15}$/.test(v), "Enter a valid phone number").optional(),
  location: z.string().trim().optional(),
  headline: z.string().trim().max(120, "Keep the headline under 120 characters").optional(),
  summary: z.string().trim().max(600, "Keep the summary under 600 characters").optional(),
  college: z.string().trim().optional(),
  degree: z.string().trim().optional(),
  graduationYear: z
    .string()
    .trim()
    .refine((v) => v === "" || (/^\d{4}$/.test(v) && +v >= 1990 && +v <= 2040), "Enter a valid year (e.g. 2026)")
    .optional(),
  linkedinUrl: optionalUrl,
  githubUrl: optionalUrl,
  portfolioUrl: optionalUrl,
});
export type ProfileValues = z.infer<typeof profileSchema>;

export const experienceSchema = z.object({
  title: z.string().trim().min(2, "Job title is required"),
  company: z.string().trim().min(2, "Company is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  current: z.boolean().optional(),
  description: z.string().trim().max(500, "Keep it under 500 characters").optional(),
});
export type ExperienceValues = z.infer<typeof experienceSchema>;

export const projectSchema = z.object({
  name: z.string().trim().min(2, "Project name is required"),
  description: z.string().trim().min(10, "Add a short description (10+ characters)").max(500, "Keep it under 500 characters"),
  url: optionalUrl,
});
export type ProjectValues = z.infer<typeof projectSchema>;

export const certificationSchema = z.object({
  name: z.string().trim().min(2, "Certification name is required"),
  issuer: z.string().trim().min(2, "Issuer is required"),
  year: z.string().trim().refine((v) => /^\d{4}$/.test(v), "Enter a valid year"),
});
export type CertificationValues = z.infer<typeof certificationSchema>;

/* ---------- recruiter ---------- */
export const companySchema = z.object({
  name: z.string().trim().min(2, "Company name is required"),
  description: z.string().trim().min(20, "Describe your company in at least 20 characters").max(1000, "Keep it under 1000 characters"),
  website: optionalUrl,
  location: z.string().trim().min(2, "Location is required"),
  industry: z.string().trim().optional(),
});
export type CompanyValues = z.infer<typeof companySchema>;

export const jobSchema = z
  .object({
    title: z.string().trim().min(3, "Job title is required"),
    description: z.string().trim().min(50, "Describe the role in at least 50 characters"),
    requiredSkills: z.array(z.string()).min(1, "Add at least one required skill"),
    preferredSkills: z.array(z.string()),
    experienceLevel: z.enum(["FRESHER", "JUNIOR", "MID", "SENIOR"], { message: "Select an experience level" }),
    experienceRequired: z.string().trim().min(1, "Enter the experience required (e.g. 1–3 years)"),
    educationRequirements: z.string().trim().min(2, "Education requirement is required"),
    location: z.string().trim().min(2, "Location is required"),
    salaryMin: optionalNumberText,
    salaryMax: optionalNumberText,
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "REMOTE"], { message: "Select an employment type" }),
    openings: z.string().trim().refine((v) => /^\d+$/.test(v) && +v >= 1 && +v <= 500, "Enter a number between 1 and 500"),
    deadline: z
      .string()
      .min(1, "Application deadline is required")
      .refine((v) => new Date(v).getTime() >= new Date(new Date().toDateString()).getTime(), "Deadline cannot be in the past"),
  })
  .refine((d) => !d.salaryMin || !d.salaryMax || +d.salaryMin <= +d.salaryMax, { path: ["salaryMax"], message: "Maximum salary must be at least the minimum" });
export type JobValues = z.infer<typeof jobSchema>;
