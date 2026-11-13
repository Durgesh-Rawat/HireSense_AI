import type { Metadata } from "next";
import { CandidateDashboardView } from "@/components/candidate/dashboard-view";

export const metadata: Metadata = { title: "Candidate dashboard" };

export default function Page() {
  return <CandidateDashboardView />;
}
