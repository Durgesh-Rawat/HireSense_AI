import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/common/page-header";
import { JobsManager } from "@/components/recruiter/jobs-manager";

export const metadata: Metadata = { title: "Manage jobs" };

export default function Page() {
  return (
    <>
      <PageHeader title="Jobs" description="Create, edit and manage your job postings." actions={<Button asChild><Link href="/recruiter/jobs/new"><Plus /> Post a job</Link></Button>} />
      <JobsManager />
    </>
  );
}
