import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { JobsExplorer } from "@/components/jobs/jobs-explorer";

export const metadata: Metadata = { title: "Find jobs" };

export default function Page() {
  return (
    <>
      <PageHeader title="Find jobs" description="Search, filter, save and apply to open roles." />
      <JobsExplorer detailsBase="/candidate/jobs" loginRedirect={false} />
    </>
  );
}
