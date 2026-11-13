import { PageHeader } from "@/components/common/page-header";
import { JobForm } from "@/components/recruiter/job-form";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return (<><PageHeader title="Edit job" description="Update the posting details." /><JobForm jobId={jobId} /></>);
}
