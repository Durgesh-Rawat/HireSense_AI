"use client";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/context/auth-context";
import { applicationService } from "@/services/application.service";
import { candidateService } from "@/services/candidate.service";
import { toApiError } from "@/services/api";
import type { Job } from "@/types/job";

/**
 * Candidate-side state for job cards: which jobs are saved / applied, and the apply + bookmark actions.
 * For guests and other roles it stays empty and actions are unavailable.
 */
export function useCandidateJobs() {
  const { user } = useAuth();
  const router = useRouter();
  const enabled = user?.role === "CANDIDATE";
  const [saved, setSaved] = useState<Job[]>([]);
  const [appliedIds, setAppliedIds] = useState<Set<string>>(new Set());
  const [pending, setPending] = useState<Job | null>(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    Promise.all([candidateService.savedJobs(), applicationService.listMine()])
      .then(([s, apps]) => {
        if (cancelled) return;
        setSaved(s);
        setAppliedIds(new Set(apps.map((a) => a.jobId)));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [enabled, user?.id]);

  const savedIds = new Set(saved.map((j) => j.id));

  const toggleSaved = useCallback(
    async (job: Job) => {
      const was = saved.some((j) => j.id === job.id);
      setSaved((prev) => (was ? prev.filter((j) => j.id !== job.id) : [job, ...prev])); // optimistic
      try {
        await candidateService.toggleBookmark(job.id, was);
        toast.success(was ? "Removed from saved jobs" : "Job saved");
      } catch (e) {
        setSaved((prev) => (was ? [job, ...prev] : prev.filter((j) => j.id !== job.id)));
        toast.error(toApiError(e).message);
      }
    },
    [saved],
  );

  const confirmApply = useCallback(async () => {
    if (!pending) return;
    setApplying(true);
    try {
      await applicationService.apply(pending.id);
      setAppliedIds((prev) => new Set(prev).add(pending.id));
      toast.success(`Application sent to ${pending.companyName}`);
      setPending(null);
    } catch (e) {
      const err = toApiError(e);
      setPending(null);
      toast.error(err.message, err.code === "RESUME_REQUIRED" ? { action: { label: "Upload resume", onClick: () => router.push("/candidate/resume") } } : undefined);
    } finally {
      setApplying(false);
    }
  }, [pending, router]);

  return {
    enabled,
    saved,
    savedIds,
    appliedIds,
    toggleSaved,
    requestApply: (job: Job) => setPending(job),
    applyDialog: { job: pending, loading: applying, onCancel: () => setPending(null), onConfirm: confirmApply },
  };
}
