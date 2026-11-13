"use client";
import { useState } from "react";
import { Users } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DemoBanner } from "@/components/common/demo-banner";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/filter-select";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { TableSkeleton } from "@/components/common/skeletons";
import { useAsync } from "@/hooks/use-async";
import { useDebounce } from "@/hooks/use-debounce";
import { adminService } from "@/services/admin.service";
import { toApiError } from "@/services/api";
import { formatDate, timeAgo } from "@/lib/utils";
import type { AdminUser } from "@/types/admin";

const PAGE_SIZE = 10;

export function UsersManager() {
  const [role, setRole] = useState<"" | "CANDIDATE" | "RECRUITER">("");
  const [q, setQ] = useState("");
  const [active, setActive] = useState("");
  const [page, setPage] = useState(1);
  const [target, setTarget] = useState<AdminUser | null>(null);
  const dq = useDebounce(q);
  const { data, error, initialLoading, loading, reload, setData } = useAsync(
    () => adminService.listUsers({ q: dq, role, isActive: active === "" ? "" : active === "active", page, pageSize: PAGE_SIZE }),
    [dq, role, active, page],
  );

  const setUserActive = async (u: AdminUser, next: boolean) => {
    try {
      await adminService.setUserActive(u.id, next);
      setData((p) => p && { ...p, items: p.items.map((x) => (x.id === u.id ? { ...x, isActive: next } : x)) });
      toast.success(`${u.name} ${next ? "activated" : "deactivated"}`);
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <DemoBanner>Showing demo users. Activation changes only affect this browser session.</DemoBanner>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Tabs value={role || "all"} onValueChange={(v) => { setRole(v === "all" ? "" : (v as "CANDIDATE" | "RECRUITER")); setPage(1); }}>
          <TabsList><TabsTrigger value="all">All users</TabsTrigger><TabsTrigger value="CANDIDATE">Candidates</TabsTrigger><TabsTrigger value="RECRUITER">Recruiters</TabsTrigger></TabsList>
        </Tabs>
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search by name or email" className="flex-1" />
        <FilterSelect value={active} onChange={(v) => { setActive(v); setPage(1); }} placeholder="Any status" options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Deactivated" }]} />
      </div>
      <Card className="overflow-hidden">
        {initialLoading ? <TableSkeleton cols={5} rows={8} /> : data && data.items.length === 0 ? <div className="p-6"><EmptyState icon={Users} title="No users found" description="Try a different search or filter." /></div> : data ? (
          <div className={loading ? "opacity-60" : undefined}>
            <Table>
              <TableHeader><TableRow><TableHead>User</TableHead><TableHead>Role</TableHead><TableHead>Joined</TableHead><TableHead>Last active</TableHead><TableHead>Account</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.items.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell><div className="flex items-center gap-3"><Avatar name={u.name} className="size-9" /><div className="min-w-0"><p className="font-medium">{u.name}</p><p className="truncate text-xs text-muted-foreground">{u.email}</p></div></div></TableCell>
                    <TableCell><Badge variant={u.role === "RECRUITER" ? "purple" : "info"}>{u.role === "RECRUITER" ? "Recruiter" : "Candidate"}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(u.createdAt)}</TableCell>
                    <TableCell className="whitespace-nowrap text-muted-foreground">{u.lastActiveAt ? timeAgo(u.lastActiveAt) : "—"}</TableCell>
                    <TableCell><div className="flex items-center gap-2"><Switch checked={u.isActive} onCheckedChange={(c) => (c ? setUserActive(u, true) : setTarget(u))} aria-label={`${u.isActive ? "Deactivate" : "Activate"} ${u.name}`} /><span className="text-xs text-muted-foreground">{u.isActive ? "Active" : "Deactivated"}</span></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </div>
        ) : null}
      </Card>
      <ConfirmDialog open={!!target} onOpenChange={(o) => !o && setTarget(null)} destructive title={`Deactivate ${target?.name}?`} description="They won't be able to sign in until the account is reactivated." confirmLabel="Deactivate" onConfirm={async () => { if (target) await setUserActive(target, false); setTarget(null); }} />
    </div>
  );
}
