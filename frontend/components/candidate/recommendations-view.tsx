"use client";
import { Sparkles } from "lucide-react";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { JobCardSkeletons } from "@/components/common/skeletons";
import { DemoBanner } from "@/components/common/demo-banner";
import { JobCard } from "@/components/jobs/job-card";
import { ApplyDialog } from "@/components/jobs/apply-dialog";
import { useAsync } from "@/hooks/use-async";
import { useCandidateJobs } from "@/hooks/use-candidate-jobs";
import { candidateService } from "@/services/candidate.service";

export function RecommendationsView() {
  const { data, error, initialLoading, reload } = useAsync(() => candidateService.recommendedJobs(), []);
  const cj = useCandidateJobs();
  return (
    <div className="space-y-4">
      <DemoBanner>Recommendations and match percentages shown here are fixed sample values. In production they come from the AI engine and are never calculated in the browser.</DemoBanner>
      {error ? <ErrorState message={error} onRetry={reload} /> : initialLoading ? <JobCardSkeletons /> : data && data.length === 0 ? (
        <EmptyState icon={Sparkles} title="No recommendations yet" description="Upload your resume and complete your profile so the AI engine can suggest matching jobs." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {data?.map((j) => (
            <JobCard key={j.id} job={j} detailsHref={`/candidate/jobs/${j.id}`} candidateActions applied={cj.appliedIds.has(j.id)} saved={cj.savedIds.has(j.id)} onApply={cj.requestApply} onToggleSave={cj.toggleSaved} matchScore={j.matchScore} matchIsDemo={j.isDemo} />
          ))}
        </div>
      )}
      <ApplyDialog {...cj.applyDialog} />
    </div>
  );
}
