import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell role="RECRUITER">{children}</DashboardShell>;
}
