import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { RecommendationsView } from "@/components/candidate/recommendations-view";

export const metadata: Metadata = { title: "Recommended jobs" };

export default function Page() {
  return (
    <>
      <PageHeader title="Recommended jobs" description="Roles suggested by the AI engine based on your profile and resume." />
      <RecommendationsView />
    </>
  );
}
