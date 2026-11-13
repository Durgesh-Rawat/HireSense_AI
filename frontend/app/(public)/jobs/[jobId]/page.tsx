import { JobDetailView } from "@/components/jobs/job-detail-view";

export default async function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <JobDetailView jobId={jobId} backHref="/jobs" backLabel="Back to all jobs" />
    </div>
  );
}
