"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { DASHBOARD_HOME } from "@/constants/navigation";
import type { Role } from "@/types/auth";

export function FullPageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center" role="status" aria-live="polite">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" /> {label}
      </div>
    </div>
  );
}

/**
 * UX-only route guard. It keeps users out of other roles' screens during normal navigation,
 * but it is NOT security — the backend must authorise every request.
 */
export function RoleGuard({ role, children }: { role: Role; children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  const allowed = status === "authenticated" && user?.role === role;

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/login");
    else if (status === "authenticated" && user && user.role !== role) router.replace(DASHBOARD_HOME[user.role]);
  }, [status, user, role, router]);

  if (!allowed) return <FullPageLoader label={status === "loading" ? "Checking your session…" : "Redirecting…"} />;
  return <>{children}</>;
}

/** For login/register pages: send signed-in users to their dashboard. */
export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { user, status } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (status === "authenticated" && user) router.replace(DASHBOARD_HOME[user.role]);
  }, [status, user, router]);
  if (status === "authenticated") return <FullPageLoader label="Redirecting…" />;
  return <>{children}</>;
}
