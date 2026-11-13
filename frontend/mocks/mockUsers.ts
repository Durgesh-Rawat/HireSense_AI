/** DEMO DATA ONLY — fake accounts used when NEXT_PUBLIC_USE_MOCK_DATA=true. */
import type { User } from "@/types/user";
import type { AdminUser } from "@/types/admin";
import { DEMO_PASSWORD } from "@/constants/site";
import { daysAgo } from "./helpers";

export interface MockAccount extends User {
  password: string;
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  { id: "u-cand-1", name: "Aarav Sharma", email: "candidate@demo.com", role: "CANDIDATE", isActive: true, createdAt: daysAgo(120), password: DEMO_PASSWORD },
  { id: "u-rec-1", name: "Priya Menon", email: "recruiter@demo.com", role: "RECRUITER", isActive: true, createdAt: daysAgo(200), password: DEMO_PASSWORD },
  { id: "u-admin-1", name: "Platform Admin", email: "admin@demo.com", role: "ADMIN", isActive: true, createdAt: daysAgo(400), password: DEMO_PASSWORD },
];

const NAMES: [string, "CANDIDATE" | "RECRUITER"][] = [
  ["Ananya Iyer", "CANDIDATE"], ["Rohan Verma", "CANDIDATE"], ["Sneha Kulkarni", "CANDIDATE"], ["Karan Malhotra", "CANDIDATE"],
  ["Divya Nair", "CANDIDATE"], ["Vikram Singh", "CANDIDATE"], ["Meera Joshi", "CANDIDATE"], ["Arjun Reddy", "CANDIDATE"],
  ["Ishita Gupta", "CANDIDATE"], ["Rahul Desai", "CANDIDATE"], ["Pooja Bansal", "CANDIDATE"], ["Siddharth Rao", "CANDIDATE"],
  ["Neha Kapoor", "CANDIDATE"], ["Aditya Patil", "CANDIDATE"], ["Kavya Menon", "CANDIDATE"], ["Manish Tiwari", "CANDIDATE"],
  ["Rhea Fernandes", "RECRUITER"], ["Sandeep Kumar", "RECRUITER"], ["Tanvi Shah", "RECRUITER"], ["Harsh Vora", "RECRUITER"],
  ["Lakshmi Pillai", "RECRUITER"], ["Faizan Ali", "RECRUITER"],
];

export const MOCK_ADMIN_USERS: AdminUser[] = [
  ...MOCK_ACCOUNTS.filter((a) => a.role !== "ADMIN").map<AdminUser>((a) => ({
    id: a.id, name: a.name, email: a.email, role: a.role as "CANDIDATE" | "RECRUITER", isActive: true, createdAt: a.createdAt, lastActiveAt: daysAgo(0),
  })),
  ...NAMES.map<AdminUser>(([name, role], i) => ({
    id: `u-seed-${i + 1}`,
    name,
    email: `${name.toLowerCase().replace(/[^a-z]+/g, ".")}@example.com`,
    role,
    isActive: i % 7 !== 3,
    createdAt: daysAgo(10 + i * 9),
    lastActiveAt: daysAgo(i % 9),
  })),
];
