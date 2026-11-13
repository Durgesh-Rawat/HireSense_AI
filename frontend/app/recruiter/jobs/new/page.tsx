import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { JobForm } from "@/components/recruiter/job-form";

export const metadata: Metadata = { title: "Post a job" };

export default function Page() {
  return (<><PageHeader title="Post a job" description="Fill in the details to publish a new opening." /><JobForm /></>);
}
