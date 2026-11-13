import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { AnalyticsView } from "@/components/admin/analytics-view";

export const metadata: Metadata = { title: "Platform analytics" };

export default function Page() {
  return (<><PageHeader title="Platform analytics" description="Trends across registrations, jobs, applications and screening." /><AnalyticsView /></>);
}
