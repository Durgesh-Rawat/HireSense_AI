"use client";
import Link from "next/link";
import { ArrowRight, Bell, CheckCircle2, ClipboardList, FileText, MessageSquareText, Sparkles, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageSkeleton } from "@/components/common/skeletons";
import { DemoBanner } from "@/components/common/demo-banner";
import { JobCard } from "@/components/jobs/job-card";
import { useAsync } from "@/hooks/use-async";
import { useAuth } from "@/context/auth-context";
import { candidateService } from "@/services/candidate.service";
import { formatDate, formatFileSize, timeAgo } from "@/lib/utils";

export function CandidateDashboardView() {
  const { user } = useAuth();
  const { data, error, initialLoading, reload } = useAsync(() => candidateService.dashboard(), [user?.id]);

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading || !data) return <PageSkeleton />;
  const { totals, resume, profileCompletion, recommendedJobs, recentActivity } = data;

  return (
    <div className="space-y-6">
      <PageHeader title={`Welcome back, ${user?.name.split(" ")[0] ?? "there"} 👋`} description="Here's what's happening with your job search." actions={<Button asChild><Link href="/candidate/jobs">Find jobs <ArrowRight /></Link></Button>} />
      <DemoBanner />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total applications" value={totals.applications} icon={ClipboardList} tone="indigo" />
        <StatCard label="Shortlisted" value={totals.shortlisted} icon={CheckCircle2} tone="emerald" hint="Incl. interviews & offers" />
        <StatCard label="Interviews" value={totals.interviews} icon={MessageSquareText} tone="amber" />
        <StatCard label="Rejected" value={totals.rejected} icon={XCircle} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Profile completion</CardTitle><CardDescription>Complete profiles get better recommendations.</CardDescription></CardHeader>
          <CardContent>
            <div className="mb-2 flex items-end justify-between"><span className="text-3xl font-semibold tabular-nums">{profileCompletion}%</span>{profileCompletion < 100 && <Button asChild variant="outline" size="sm"><Link href="/candidate/profile">Complete profile</Link></Button>}</div>
            <Progress value={profileCompletion} aria-label="Profile completion" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Resume status</CardTitle><CardDescription>Needed to apply for jobs.</CardDescription></CardHeader>
          <CardContent>
            {resume ? (
              <div className="flex items-center gap-3">
                <span className="flex size-11 items-center justify-center rounded-lg bg-accent text-accent-foreground"><FileText className="size-5" /></span>
                <div className="min-w-0 flex-1"><p className="truncate font-medium">{resume.fileName}</p><p className="text-sm text-muted-foreground">{formatFileSize(resume.fileSize)} · {formatDate(resume.uploadedAt)}</p></div>
                <Badge variant={resume.parseStatus === "PARSED" ? "success" : resume.parseStatus === "FAILED" ? "destructive" : "warning"}>{resume.parseStatus === "PARSED" ? "Processed" : resume.parseStatus === "FAILED" ? "Failed" : "Processing"}</Badge>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3"><p className="text-sm text-muted-foreground">No resume uploaded yet.</p><Button asChild size="sm"><Link href="/candidate/resume">Upload resume</Link></Button></div>
            )}
          </CardContent>
        </Card>
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between"><h2 className="flex items-center gap-2 text-lg font-semibold"><Sparkles className="size-5 text-primary" /> Recommended for you</h2><Button asChild variant="ghost" size="sm"><Link href="/candidate/recommendations">See all <ArrowRight /></Link></Button></div>
        {recommendedJobs.length === 0 ? (
          <EmptyState icon={Sparkles} title="No recommendations yet" description="Upload your resume and complete your profile to get AI-powered job suggestions." />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {recommendedJobs.map((j) => <JobCard key={j.id} job={j} detailsHref={`/candidate/jobs/${j.id}`} matchScore={j.matchScore} matchIsDemo={j.isDemo} />)}
          </div>
        )}
      </section>

      <Card>
        <CardHeader className="flex-row items-center justify-between"><CardTitle>Recent application activity</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/candidate/applications">View all</Link></Button></CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? <EmptyState icon={ClipboardList} title="No applications yet" description="Apply to a job and its progress will show up here." /> : (
            <ul className="divide-y">
              {recentActivity.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="min-w-0"><p className="truncate font-medium">{a.jobTitle}</p><p className="truncate text-sm text-muted-foreground">{a.companyName} · updated {timeAgo(a.history.at(-1)?.at ?? a.appliedAt)}</p></div>
                  <StatusBadge status={a.status} />
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
      <p className="sr-only"><Bell /></p>
    </div>
  );
}
