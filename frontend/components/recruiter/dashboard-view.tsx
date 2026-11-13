"use client";
import Link from "next/link";
import { Briefcase, CheckCircle2, ScanSearch, Users, XCircle } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { StatusBadge } from "@/components/common/status-badge";
import { ScorePill } from "@/components/common/score-bar";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { PageSkeleton } from "@/components/common/skeletons";
import { DemoBanner } from "@/components/common/demo-banner";
import { TrendChart } from "@/components/charts/trend-chart";
import { SimpleBarChart } from "@/components/charts/bar-chart-card";
import { DonutChart } from "@/components/charts/donut-chart";
import { useAsync } from "@/hooks/use-async";
import { recruiterService } from "@/services/recruiter.service";
import { timeAgo } from "@/lib/utils";

export function RecruiterDashboardView() {
  const { data, error, initialLoading, reload } = useAsync(() => recruiterService.dashboard(), []);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading || !data) return <PageSkeleton />;
  const { totals, recentApplications, jobPerformance, applicationsTrend, screeningActivity } = data;

  return (
    <div className="space-y-6">
      <PageHeader title="Recruiter overview" description="A snapshot of your hiring pipeline." actions={<Button asChild><Link href="/recruiter/jobs/new"><Briefcase /> Post a job</Link></Button>} />
      <DemoBanner />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active jobs" value={totals.activeJobs} icon={Briefcase} tone="indigo" />
        <StatCard label="Total applicants" value={totals.applicants} icon={Users} tone="sky" />
        <StatCard label="Shortlisted" value={totals.shortlisted} icon={CheckCircle2} tone="emerald" hint="Incl. interviews & offers" />
        <StatCard label="Rejected" value={totals.rejected} icon={XCircle} tone="rose" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Applications this week</CardTitle><CardDescription>New applications received per day</CardDescription></CardHeader>
          <CardContent><TrendChart data={applicationsTrend.map((p) => ({ label: p.label, applications: p.value }))} series={[{ key: "applications", label: "Applications" }]} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ScanSearch className="size-4.5 text-primary" /> Screening activity</CardTitle><CardDescription>AI screening status of applicants</CardDescription></CardHeader>
          <CardContent>
            <DonutChart centerLabel="applicants" data={[
              { name: "Screened", value: screeningActivity.screened, color: "#10b981" },
              { name: "In progress", value: screeningActivity.pending, color: "#f59e0b" },
              { name: "Not screened", value: screeningActivity.notScreened, color: "#94a3b8" },
            ]} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Job performance</CardTitle><CardDescription>Applicants vs shortlisted per job</CardDescription></CardHeader>
          <CardContent>
            {jobPerformance.length === 0 ? <EmptyState title="No applicants yet" description="Performance appears once candidates start applying." /> : (
              <SimpleBarChart data={jobPerformance.map((j) => ({ label: j.title, applicants: j.applicants, shortlisted: j.shortlisted }))} series={[{ key: "applicants", label: "Applicants" }, { key: "shortlisted", label: "Shortlisted", color: "#10b981" }]} />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between"><CardTitle>Recent applications</CardTitle><Button asChild variant="ghost" size="sm"><Link href="/recruiter/applicants">View all</Link></Button></CardHeader>
          <CardContent>
            {recentApplications.length === 0 ? <EmptyState icon={Users} title="No applications yet" /> : (
              <ul className="divide-y">
                {recentApplications.map((a) => (
                  <li key={a.applicationId} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <Avatar name={a.candidateName} src={a.avatarUrl} className="size-9" />
                    <div className="min-w-0 flex-1">
                      <Link href={`/recruiter/candidates/${a.applicationId}`} className="block truncate text-sm font-medium hover:text-primary hover:underline">{a.candidateName}</Link>
                      <p className="truncate text-xs text-muted-foreground">{a.jobTitle} · {timeAgo(a.appliedAt)}</p>
                    </div>
                    <ScorePill value={a.aiScore} />
                    <StatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
