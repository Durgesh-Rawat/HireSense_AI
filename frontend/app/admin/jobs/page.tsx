import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { AdminJobsManager } from "@/components/admin/jobs-manager";

export const metadata: Metadata = { title: "Job management" };

export default function Page() {
  return (<><PageHeader title="Job management" description="Review all job postings and moderate reported content." /><AdminJobsManager /></>);
}
