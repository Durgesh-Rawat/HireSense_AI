import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { ResumeManager } from "@/components/candidate/resume-manager";

export const metadata: Metadata = { title: "Resume" };

export default function Page() {
  return (
    <>
      <PageHeader title="Resume" description="Upload, replace or download the resume used for your applications." />
      <div className="max-w-3xl"><ResumeManager /></div>
    </>
  );
}
