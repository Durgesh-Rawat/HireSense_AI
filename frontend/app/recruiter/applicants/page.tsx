import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ApplicantsTable } from "@/components/recruiter/applicants-table";

export const metadata: Metadata = { title: "Applicants" };

export default function Page() {
  return (<><PageHeader title="Applicants" description="All candidates who applied to your jobs." /><ApplicantsTable /></>);
}
