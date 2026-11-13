import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { UsersManager } from "@/components/admin/users-manager";

export const metadata: Metadata = { title: "User management" };

export default function Page() {
  return (<><PageHeader title="User management" description="View, search and manage candidate and recruiter accounts." /><UsersManager /></>);
}
