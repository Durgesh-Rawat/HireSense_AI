import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ScreeningView } from "@/components/recruiter/screening-view";

export const metadata: Metadata = { title: "AI screening" };

export default function Page() {
  return (<><PageHeader title="AI resume screening" description="Review AI compatibility results, filter by score and compare candidates." /><ScreeningView /></>);
}
