import { PageHeader } from "@/components/common/page-header";
import { ScreeningView } from "@/components/recruiter/screening-view";

export default async function Page({ params }: { params: Promise<{ jobId: string }> }) {
  const { jobId } = await params;
  return (<><PageHeader title="AI resume screening" description="Review AI compatibility results, filter by score and compare candidates." /><ScreeningView initialJobId={jobId} /></>);
}
