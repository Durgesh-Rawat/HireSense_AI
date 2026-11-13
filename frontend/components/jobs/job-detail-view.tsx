"use client";
import Link from "next/link";
import { ArrowLeft, Briefcase, Building2, CalendarClock, Check, GraduationCap, MapPin, Users, Wallet, Bookmark, BookmarkCheck } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton } from "@/components/common/skeletons";
import { SkillChips } from "@/components/common/skill-chips";
import { ApplyDialog } from "./apply-dialog";
import { useAsync } from "@/hooks/use-async";
import { useAuth } from "@/context/auth-context";
import { useCandidateJobs } from "@/hooks/use-candidate-jobs";
import { jobService } from "@/services/job.service";
import { employmentLabel } from "@/constants/job";
import { formatDate, formatSalary, timeAgo } from "@/lib/utils";

function Fact({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <li className="flex items-start gap-3">
      <Icon className="mt-0.5 size-4 text-muted-foreground" />
      <div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-medium">{value}</p></div>
    </li>
  );
}

export function JobDetailView({ jobId, backHref, backLabel }: { jobId: string; backHref: string; backLabel: string }) {
  const { user } = useAuth();
  const cj = useCandidateJobs();
  const { data: job, error, loading, reload } = useAsync(() => jobService.get(jobId), [jobId]);

  const back = (
    <Link href={backHref} className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
      <ArrowLeft className="size-4" /> {backLabel}
    </Link>
  );

  if (error) return <div>{back}<ErrorState message={error} onRetry={reload} /></div>;
  if (!job || loading && !job) {
    return (
      <div>{back}
        <div className="grid gap-6 lg:grid-cols-[1fr_20rem]"><div className="space-y-4"><Skeleton className="h-24" /><CardSkeleton lines={8} /></div><CardSkeleton lines={6} /></div>
      </div>
    );
  }

  const applied = cj.appliedIds.has(job.id);
  const saved = cj.savedIds.has(job.id);
  const closed = !job.isActive;

  return (
    <div>
      {back}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
              <Avatar name={job.companyName} src={job.companyLogoUrl} className="size-16 rounded-xl text-lg" />
              <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-semibold tracking-tight">{job.title}</h1>
                <p className="mt-1 flex items-center gap-1.5 text-muted-foreground"><Building2 className="size-4" />{job.companyName}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="accent">{employmentLabel(job.employmentType)}</Badge>
                  <Badge variant="outline">{job.experienceRequired}</Badge>
                  <Badge variant="outline">{job.location}</Badge>
                  {closed && <Badge variant="destructive">Closed</Badge>}
                </div>
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader><CardTitle>About the role</CardTitle></CardHeader>
            <CardContent><p className="text-sm leading-relaxed whitespace-pre-line text-muted-foreground">{job.description}</p></CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Skills &amp; requirements</CardTitle></CardHeader>
            <CardContent className="space-y-5">
              <div><p className="mb-2 text-sm font-medium">Required skills</p><SkillChips skills={job.requiredSkills} variant="accent" /></div>
              {job.preferredSkills.length > 0 && <div><p className="mb-2 text-sm font-medium">Nice to have</p><SkillChips skills={job.preferredSkills} /></div>}
              <div><p className="mb-1 text-sm font-medium">Education</p><p className="text-sm text-muted-foreground">{job.educationRequirements}</p></div>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <Card className="space-y-3 p-5">
            {cj.enabled ? (
              <>
                <Button className="w-full" size="lg" disabled={applied || closed} onClick={() => cj.requestApply(job)}>
                  {applied ? <><Check /> Applied</> : closed ? "Applications closed" : "Apply now"}
                </Button>
                <Button variant="outline" className="w-full" onClick={() => cj.toggleSaved(job)}>
                  {saved ? <><BookmarkCheck /> Saved</> : <><Bookmark /> Save job</>}
                </Button>
              </>
            ) : !user ? (
              <>
                <Button asChild className="w-full" size="lg" disabled={closed}><Link href="/login">Log in to apply</Link></Button>
                <p className="text-center text-xs text-muted-foreground">New here? <Link href="/register/candidate" className="font-medium text-primary hover:underline">Create a candidate account</Link></p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Only candidate accounts can apply to jobs.</p>
            )}
          </Card>
          <Card className="p-5">
            <ul className="space-y-4">
              <Fact icon={MapPin} label="Location" value={job.location} />
              <Fact icon={Wallet} label="Salary" value={formatSalary(job.salaryMin, job.salaryMax)} />
              <Fact icon={Briefcase} label="Experience" value={job.experienceRequired} />
              <Fact icon={GraduationCap} label="Education" value={job.educationRequirements} />
              <Fact icon={Users} label="Openings" value={String(job.openings)} />
              <Fact icon={CalendarClock} label="Apply before" value={formatDate(job.deadline)} />
            </ul>
            <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">Posted {timeAgo(job.postedAt)}</p>
          </Card>
        </aside>
      </div>
      <ApplyDialog {...cj.applyDialog} />
    </div>
  );
}
