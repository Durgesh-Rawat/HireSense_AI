"use client";
import Link from "next/link";
import { useState } from "react";
import { Bell, BellRing, CalendarCheck, CheckCheck, ClipboardCheck, Info, UserPlus, ScanSearch } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { CardSkeleton } from "./skeletons";
import { useAsync } from "@/hooks/use-async";
import { notificationService } from "@/services/notification.service";
import { cn, timeAgo } from "@/lib/utils";
import type { NotificationType } from "@/types/user";

const ICONS: Record<NotificationType, typeof Bell> = {
  APPLICATION_UPDATE: ClipboardCheck, SHORTLISTED: BellRing, INTERVIEW: CalendarCheck, NEW_APPLICANT: UserPlus, SCREENING_COMPLETE: ScanSearch, SYSTEM: Info,
};

export function NotificationList() {
  const { data, error, initialLoading, reload, setData } = useAsync(() => notificationService.list(), []);
  const [tab, setTab] = useState<"all" | "unread">("all");

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading || !data) return <CardSkeleton lines={5} />;

  const unread = data.filter((n) => !n.isRead).length;
  const list = tab === "unread" ? data.filter((n) => !n.isRead) : data;

  const markAll = async () => {
    setData((p) => p?.map((n) => ({ ...n, isRead: true })));
    await notificationService.markAllRead();
  };
  const markOne = async (id: string) => {
    setData((p) => p?.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    await notificationService.markRead(id);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "unread")}>
          <TabsList><TabsTrigger value="all">All</TabsTrigger><TabsTrigger value="unread">Unread ({unread})</TabsTrigger></TabsList>
        </Tabs>
        <Button variant="outline" size="sm" disabled={unread === 0} onClick={markAll}><CheckCheck /> Mark all read</Button>
      </div>
      {list.length === 0 ? <EmptyState icon={Bell} title={tab === "unread" ? "No unread notifications" : "No notifications yet"} description="We'll let you know when something happens with your applications." /> : (
        <Card className="divide-y overflow-hidden">
          {list.map((n) => {
            const Icon = ICONS[n.type];
            return (
              <Link key={n.id} href={n.href ?? "#"} onClick={() => !n.isRead && markOne(n.id)} className={cn("flex gap-4 p-4 hover:bg-secondary/50", !n.isRead && "bg-accent/40")}>
                <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", n.isRead ? "bg-secondary text-muted-foreground" : "bg-accent text-accent-foreground")}><Icon className="size-5" /></span>
                <div className="min-w-0 flex-1"><p className="font-medium">{n.title}</p><p className="text-sm text-muted-foreground">{n.message}</p><p className="mt-1 text-xs text-muted-foreground">{timeAgo(n.createdAt)}</p></div>
                {!n.isRead && <span className="mt-2 size-2.5 shrink-0 rounded-full bg-primary" aria-label="Unread" />}
              </Link>
            );
          })}
        </Card>
      )}
    </div>
  );
}
