"use client";
import Link from "next/link";
import { ChevronDown, LayoutDashboard, LogOut, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/auth-context";
import { DASHBOARD_HOME } from "@/constants/navigation";

const PROFILE_HREF = { CANDIDATE: "/candidate/profile", RECRUITER: "/recruiter/profile", ADMIN: null } as const;

export function UserMenu() {
  const { user, logout } = useAuth();
  if (!user) return null;
  const profileHref = PROFILE_HREF[user.role];
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex items-center gap-2 rounded-lg p-1 pr-2 hover:bg-secondary cursor-pointer" aria-label="Open user menu">
        <Avatar name={user.name} src={user.avatarUrl} className="size-8" />
        <span className="hidden max-w-32 truncate text-sm font-medium md:block">{user.name}</span>
        <ChevronDown className="hidden size-4 text-muted-foreground md:block" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="text-sm font-semibold text-foreground">{user.name}</p>
          <p className="truncate font-normal">{user.email}</p>
          <p className="text-[11px] tracking-wide uppercase">{user.role.toLowerCase()}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={DASHBOARD_HOME[user.role]}><LayoutDashboard /> Dashboard</Link>
        </DropdownMenuItem>
        {profileHref && (
          <DropdownMenuItem asChild>
            <Link href={profileHref}><UserRound /> Profile</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          destructive
          onSelect={async () => {
            await logout();
            toast.success("You have been signed out.");
          }}
        >
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
