"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/common/logo";
import { RoleGuard } from "./role-guard";
import { NotificationMenu } from "./notification-menu";
import { UserMenu } from "./user-menu";
import { NAV_ITEMS, DASHBOARD_HOME } from "@/constants/navigation";
import type { Role } from "@/types/auth";
import { cn } from "@/lib/utils";

const ROLE_LABEL: Record<Role, string> = { CANDIDATE: "Candidate", RECRUITER: "Recruiter", ADMIN: "Admin" };

function SidebarNav({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label={`${ROLE_LABEL[role]} navigation`}>
      {NAV_ITEMS[role].map(({ label, href, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              active ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            <Icon className="size-4.5" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

function Shell({ role, children }: { role: Role; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r bg-card lg:flex">
        <div className="flex h-16 items-center border-b px-5">
          <Logo href={DASHBOARD_HOME[role]} />
        </div>
        <SidebarNav role={role} />
        <div className="border-t p-4 text-xs text-muted-foreground">
          Signed in as <span className="font-medium text-foreground">{ROLE_LABEL[role]}</span>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b bg-card/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open navigation">
              <Menu />
            </Button>
            <span className="rounded-full bg-accent px-2.5 py-1 text-xs font-semibold text-accent-foreground">{ROLE_LABEL[role]} workspace</span>
          </div>
          <div className="flex items-center gap-1">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/jobs"><ExternalLink /> Public site</Link>
            </Button>
            <NotificationMenu />
            <UserMenu />
          </div>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent side="left" className="flex flex-col">
          <DialogTitle className="flex h-16 items-center border-b px-5"><Logo href={DASHBOARD_HOME[role]} /></DialogTitle>
          <SidebarNav role={role} onNavigate={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function DashboardShell({ role, children }: { role: Role; children: React.ReactNode }) {
  return (
    <RoleGuard role={role}>
      <Shell role={role}>{children}</Shell>
    </RoleGuard>
  );
}
