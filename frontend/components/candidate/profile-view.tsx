"use client";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton } from "@/components/common/skeletons";
import { useAsync } from "@/hooks/use-async";
import { candidateService } from "@/services/candidate.service";
import { ProfileEditor } from "./profile-editor";

export function CandidateProfileView() {
  const { data, error, initialLoading, reload } = useAsync(async () => {
    const [profile, resume] = await Promise.all([candidateService.getProfile(), candidateService.getResume()]);
    return { profile, hasResume: Boolean(resume) };
  }, []);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading || !data) return <div className="space-y-4"><CardSkeleton lines={2} /><CardSkeleton lines={6} /></div>;
  return <ProfileEditor key={data.profile.id} initial={data.profile} hasResume={data.hasResume} />;
}
