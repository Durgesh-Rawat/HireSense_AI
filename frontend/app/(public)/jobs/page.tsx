import type { Metadata } from "next";
import { JobsExplorer } from "@/components/jobs/jobs-explorer";

export const metadata: Metadata = { title: "Find jobs" };

export default function JobsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Find your next role</h1>
        <p className="mt-1 text-muted-foreground">Search openings from companies hiring on the platform.</p>
      </div>
      <JobsExplorer detailsBase="/jobs" />
    </div>
  );
}
