"use client";
import { Briefcase, ClipboardList, GraduationCap, UserCog, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { ErrorState } from "@/components/common/error-state";
import { PageSkeleton } from "@/components/common/skeletons";
import { DemoBanner } from "@/components/common/demo-banner";
import { TrendChart } from "@/components/charts/trend-chart";
import { DonutChart } from "@/components/charts/donut-chart";
import { useAsync } from "@/hooks/use-async";
import { adminService } from "@/services/admin.service";

export function AdminDashboardView() {
  const { data, error, initialLoading, reload } = useAsync(() => adminService.dashboard(), []);
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading || !data) return <PageSkeleton />;
  const { totals, activity } = data;
  const fmt = (n: number) => n.toLocaleString("en-IN");
  return (
    <div className="space-y-6">
      <PageHeader title="Platform overview" description="Key numbers across the whole platform." />
      <DemoBanner>Totals and charts are demo figures — they do not reflect real usage.</DemoBanner>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard label="Registered users" value={fmt(totals.users)} icon={Users} tone="indigo" />
        <StatCard label="Candidates" value={fmt(totals.candidates)} icon={GraduationCap} tone="sky" />
        <StatCard label="Recruiters" value={fmt(totals.recruiters)} icon={UserCog} tone="violet" />
        <StatCard label="Jobs" value={fmt(totals.jobs)} icon={Briefcase} tone="emerald" />
        <StatCard label="Applications" value={fmt(totals.applications)} icon={ClipboardList} tone="amber" />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Platform activity</CardTitle><CardDescription>New users and applications, last 8 weeks</CardDescription></CardHeader>
          <CardContent><TrendChart data={activity} series={[{ key: "applications", label: "Applications" }, { key: "users", label: "New users", color: "#10b981" }]} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>User mix</CardTitle><CardDescription>Candidates vs recruiters</CardDescription></CardHeader>
          <CardContent><DonutChart centerLabel="users" data={[{ name: "Candidates", value: totals.candidates, color: "#4f46e5" }, { name: "Recruiters", value: totals.recruiters, color: "#8b5cf6" }]} /></CardContent>
        </Card>
      </div>
    </div>
  );
}
