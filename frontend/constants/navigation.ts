import {
  LayoutDashboard, UserRound, FileText, Search, Sparkles, ClipboardList, Bell, Building2, Briefcase,
  Users, ScanSearch, BarChart3, ShieldCheck, type LucideIcon,
} from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const DASHBOARD_HOME: Record<Role, string> = {
  CANDIDATE: "/candidate/dashboard",
  RECRUITER: "/recruiter/dashboard",
  ADMIN: "/admin/dashboard",
};

export const NAV_ITEMS: Record<Role, NavItem[]> = {
  CANDIDATE: [
    { label: "Overview", href: "/candidate/dashboard", icon: LayoutDashboard },
    { label: "My profile", href: "/candidate/profile", icon: UserRound },
    { label: "Resume", href: "/candidate/resume", icon: FileText },
    { label: "Find jobs", href: "/candidate/jobs", icon: Search },
    { label: "Recommended", href: "/candidate/recommendations", icon: Sparkles },
    { label: "Applications", href: "/candidate/applications", icon: ClipboardList },
    { label: "Notifications", href: "/candidate/notifications", icon: Bell },
  ],
  RECRUITER: [
    { label: "Overview", href: "/recruiter/dashboard", icon: LayoutDashboard },
    { label: "Company profile", href: "/recruiter/profile", icon: Building2 },
    { label: "Jobs", href: "/recruiter/jobs", icon: Briefcase },
    { label: "Applicants", href: "/recruiter/applicants", icon: Users },
    { label: "AI screening", href: "/recruiter/screening", icon: ScanSearch },
  ],
  ADMIN: [
    { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Users", href: "/admin/users", icon: Users },
    { label: "Jobs", href: "/admin/jobs", icon: ShieldCheck },
    { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  ],
};
