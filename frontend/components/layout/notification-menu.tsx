"use client";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { notificationService } from "@/services/notification.service";
import { useAuth } from "@/context/auth-context";
import { timeAgo, cn } from "@/lib/utils";

export function NotificationMenu() {
  const { user } = useAuth();
  const { data, loading, error, setData } = useAsync(() => notificationService.list(), [user?.id]);
  const unread = data?.filter((n) => !n.isRead).length ?? 0;

  const markAll = async () => {
    setData((prev) => prev?.map((n) => ({ ...n, isRead: true })));
    await notificationService.markAllRead();
  };
  const markOne = async (id: string) => {
    setData((prev) => prev?.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    await notificationService.markRead(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}>
          <Bell />
          {unread > 0 && <span className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">{unread}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2.5">
          <p className="text-sm font-semibold">Notifications</p>
          {unread > 0 && (
            <button onClick={markAll} className="flex items-center gap-1 text-xs font-medium text-primary hover:underline cursor-pointer">
              <CheckCheck className="size-3.5" /> Mark all read
            </button>
          )}
        </div>
        <div className="max-h-80 overflow-y-auto">
          {loading && !data && (
            <div className="space-y-3 p-3">
              <Skeleton className="h-10" /><Skeleton className="h-10" /><Skeleton className="h-10" />
            </div>
          )}
          {error && <p className="p-4 text-sm text-destructive">{error}</p>}
          {data?.length === 0 && <p className="p-6 text-center text-sm text-muted-foreground">You&apos;re all caught up.</p>}
          {data?.map((n) => (
            <Link key={n.id} href={n.href ?? "#"} onClick={() => markOne(n.id)} className={cn("flex gap-3 border-b px-3 py-3 last:border-0 hover:bg-secondary/60", !n.isRead && "bg-accent/50")}>
              <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.isRead ? "bg-transparent" : "bg-primary")} />
              <span className="min-w-0">
                <span className="block text-sm font-medium">{n.title}</span>
                <span className="line-clamp-2 block text-xs text-muted-foreground">{n.message}</span>
                <span className="mt-1 block text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</span>
              </span>
            </Link>
          ))}
        </div>
        {user?.role === "CANDIDATE" && (
          <Link href="/candidate/notifications" className="block border-t px-3 py-2.5 text-center text-sm font-medium text-primary hover:bg-secondary/60">
            View all notifications
          </Link>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
