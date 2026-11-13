import type { Metadata } from "next";
import { RecruiterDashboardView } from "@/components/recruiter/dashboard-view";

export const metadata: Metadata = { title: "Recruiter dashboard" };

export default function Page() {
  return <RecruiterDashboardView />;
}
