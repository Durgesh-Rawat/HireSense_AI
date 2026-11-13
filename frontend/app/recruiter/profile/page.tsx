import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { CompanyProfileView } from "@/components/recruiter/company-form";

export const metadata: Metadata = { title: "Company profile" };

export default function Page() {
  return (<><PageHeader title="Company profile" description="This information appears on your job postings." /><CompanyProfileView /></>);
}
