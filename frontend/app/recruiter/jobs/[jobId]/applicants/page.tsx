import { PageHeader } from "@/components/common/page-header";
import { ApplicantsTable } from "@/components/recruiter/applicants-table";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return (<><PageHeader title="Job applicants" description="Review, shortlist and manage candidates for this job." /><ApplicantsTable fixedJobId={jobId} /></>);
}
