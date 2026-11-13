import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ApplicationsView } from "@/components/candidate/applications-view";

export const metadata: Metadata = { title: "My applications" };

export default function Page() {
  return (
    <>
      <PageHeader title="My applications" description="Track the status of every job you've applied to." />
      <ApplicationsView />
    </>
  );
}
