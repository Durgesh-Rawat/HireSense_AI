import { JobDetailView } from "@/components/jobs/job-detail-view";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return <JobDetailView jobId={jobId} backHref="/candidate/jobs" backLabel="Back to jobs" />;
}
