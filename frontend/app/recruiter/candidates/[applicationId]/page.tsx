import { CandidateDetailView } from "@/components/recruiter/candidate-detail-view";

export default async function Page({ params }: { params: Promise<{ applicationId: string }> }) {
  const { applicationId } = await params;
  return <CandidateDetailView applicationId={applicationId} />;
}
