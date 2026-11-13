"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ClipboardList, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/filter-select";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { StatusBadge } from "@/components/common/status-badge";
import { TableSkeleton } from "@/components/common/skeletons";
import { useAsync } from "@/hooks/use-async";
import { applicationService } from "@/services/application.service";
import { APPLICATION_STATUSES, APPLICATION_STATUS_META } from "@/constants/status";
import { formatDate, formatDateTime } from "@/lib/utils";
import type { Application } from "@/types/application";

const PAGE_SIZE = 8;

export function ApplicationsView() {
  const { data, error, initialLoading, reload } = useAsync(() => applicationService.listMine(), []);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Application | null>(null);

  const filtered = useMemo(() => {
    const term = q.toLowerCase();
    return (data ?? []).filter((a) => (!status || a.status === status) && (!term || a.jobTitle.toLowerCase().includes(term) || a.companyName.toLowerCase().includes(term)));
  }, [data, q, status]);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search by job or company" className="flex-1" />
        <FilterSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }} placeholder="All statuses" options={APPLICATION_STATUSES.map((s) => ({ value: s, label: APPLICATION_STATUS_META[s].label }))} />
      </div>
      <Card className="overflow-hidden">
        {initialLoading ? <TableSkeleton cols={5} /> : filtered.length === 0 ? (
          <div className="p-6"><EmptyState icon={ClipboardList} title={data?.length ? "No applications match your filters" : "You haven't applied to any jobs yet"} description={data?.length ? undefined : "Browse open roles and apply with your resume in one click."} action={!data?.length ? <Button asChild><Link href="/candidate/jobs">Find jobs</Link></Button> : undefined} /></div>
        ) : (
          <>
            <Table>
              <TableHeader><TableRow><TableHead>Job</TableHead><TableHead>Company</TableHead><TableHead>Applied</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Details</TableHead></TableRow></TableHeader>
              <TableBody>
                {pageItems.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell><p className="font-medium">{a.jobTitle}</p><p className="text-xs text-muted-foreground">{a.location}</p></TableCell>
                    <TableCell>{a.companyName}</TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(a.appliedAt)}</TableCell>
                    <TableCell><StatusBadge status={a.status} /></TableCell>
                    <TableCell className="text-right"><Button variant="ghost" size="sm" onClick={() => setSelected(a)}><Eye /> View</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={page} pageSize={PAGE_SIZE} total={filtered.length} onPageChange={setPage} />
          </>
        )}
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>{selected.jobTitle}</DialogTitle>
                <DialogDescription>{selected.companyName} · {selected.location}</DialogDescription>
              </DialogHeader>
              <div>
                <p className="mb-3 text-sm font-medium">Application history</p>
                <ol className="relative space-y-4 border-l pl-5">
                  {[...selected.history].reverse().map((h, i) => (
                    <li key={`${h.status}-${h.at}`} className="relative">
                      <span className={`absolute -left-[26px] top-1 size-3 rounded-full border-2 border-card ${i === 0 ? "bg-primary" : "bg-slate-300"}`} />
                      <div className="flex items-center gap-2"><StatusBadge status={h.status} /><span className="text-xs text-muted-foreground">{formatDateTime(h.at)}</span></div>
                      {h.note && <p className="mt-1 text-sm text-muted-foreground">{h.note}</p>}
                    </li>
                  ))}
                </ol>
              </div>
              <Button asChild variant="outline"><Link href={`/candidate/jobs/${selected.jobId}`}>View job details</Link></Button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
