"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Logo } from "@/components/common/logo";
import { UserMenu } from "./user-menu";
import { useAuth } from "@/context/auth-context";
import { DASHBOARD_HOME } from "@/constants/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Find jobs", href: "/jobs" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, status } = useAuth();
  const [open, setOpen] = useState(false);

  const actions = (mobile = false) =>
    status === "authenticated" && user ? (
      <Button asChild size={mobile ? "default" : "sm"} className={mobile ? "w-full" : undefined}>
        <Link href={DASHBOARD_HOME[user.role]} onClick={() => setOpen(false)}>Go to dashboard</Link>
      </Button>
    ) : (
      <>
        <Button asChild variant="outline" size={mobile ? "default" : "sm"} className={mobile ? "w-full" : undefined}>
          <Link href="/login" onClick={() => setOpen(false)}>Log in</Link>
        </Button>
        <Button asChild size={mobile ? "default" : "sm"} className={mobile ? "w-full" : undefined}>
          <Link href="/register" onClick={() => setOpen(false)}>Register</Link>
        </Button>
      </>
    );

  return (
    <header className="sticky top-0 z-40 border-b bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Main">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn("rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground", pathname.startsWith(l.href) && "text-foreground")}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {actions()}
          {status === "authenticated" && <UserMenu />}
        </div>
        <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
          <Menu />
        </Button>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent side="right" className="flex flex-col gap-1 p-4">
          <DialogTitle className="mb-3"><Logo /></DialogTitle>
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-secondary">
              {l.label}
            </Link>
          ))}
          <div className="mt-4 flex flex-col gap-2">{actions(true)}</div>
        </DialogContent>
      </Dialog>
    </header>
  );
}
