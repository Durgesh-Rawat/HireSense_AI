import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { CandidateProfileView } from "@/components/candidate/profile-view";

export const metadata: Metadata = { title: "My profile" };

export default function Page() {
  return (
    <>
      <PageHeader title="My profile" description="Keep your details up to date so recruiters can find you." />
      <CandidateProfileView />
    </>
  );
}
