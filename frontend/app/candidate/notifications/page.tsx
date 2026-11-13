import type { Metadata } from "next";
import { PageHeader } from "@/components/common/page-header";
import { NotificationList } from "@/components/common/notification-list";

export const metadata: Metadata = { title: "Notifications" };

export default function Page() {
  return (
    <>
      <PageHeader title="Notifications" description="Updates about your applications and account." />
      <NotificationList />
    </>
  );
}
