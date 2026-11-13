"use client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton } from "@/components/common/skeletons";
import { DemoBanner } from "@/components/common/demo-banner";
import { SimpleBarChart } from "@/components/charts/bar-chart-card";
import { TrendChart } from "@/components/charts/trend-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { useAsync } from "@/hooks/use-async";
import { adminService } from "@/services/admin.service";

const STATUS_COLORS = ["#94a3b8", "#0ea5e9", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444"];

export function AnalyticsView() {
  const { data, error, initialLoading, reload } = useAsync(() => adminService.analytics(), []);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading || !data) return <div className="grid gap-6 lg:grid-cols-2">{[0, 1, 2, 3].map((i) => <CardSkeleton key={i} lines={6} />)}</div>;
  return (
    <div className="space-y-6">
      <DemoBanner>Demo analytics — fixed sample figures.</DemoBanner>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>User registration trends</CardTitle><CardDescription>New accounts per month</CardDescription></CardHeader>
          <CardContent><SimpleBarChart stacked data={data.registrations} series={[{ key: "candidates", label: "Candidates" }, { key: "recruiters", label: "Recruiters", color: "#8b5cf6" }]} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Job posting trends</CardTitle><CardDescription>Jobs posted per month</CardDescription></CardHeader>
          <CardContent><TrendChart data={data.jobPostings.map((p) => ({ label: p.label, jobs: p.value }))} series={[{ key: "jobs", label: "Jobs posted", color: "#10b981" }]} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Application statistics</CardTitle><CardDescription>Applications by current status</CardDescription></CardHeader>
          <CardContent><DonutChart centerLabel="applications" data={data.applicationStats.map((s, i) => ({ name: s.status, value: s.count, color: STATUS_COLORS[i] }))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Screening activity</CardTitle><CardDescription>Resumes screened by the AI engine per month</CardDescription></CardHeader>
          <CardContent><TrendChart data={data.screeningActivity.map((p) => ({ label: p.label, screened: p.value }))} series={[{ key: "screened", label: "Resumes screened" }]} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
