"use client";
import Link from "next/link";
import { useState } from "react";
import { Briefcase, MoreHorizontal, Pencil, ScanSearch, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/filter-select";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { TableSkeleton } from "@/components/common/skeletons";
import { useAsync } from "@/hooks/use-async";
import { useDebounce } from "@/hooks/use-debounce";
import { jobService } from "@/services/job.service";
import { recruiterService } from "@/services/recruiter.service";
import { toApiError } from "@/services/api";
import { employmentLabel } from "@/constants/job";
import { formatDate } from "@/lib/utils";
import type { Job } from "@/types/job";

const PAGE_SIZE = 8;

export function JobsManager() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [deleting, setDeleting] = useState<Job | null>(null);
  const dq = useDebounce(q);
  const { data, error, initialLoading, loading, reload, setData } = useAsync(
    () => recruiterService.listJobs({ q: dq, isActive: status === "" ? undefined : status === "active", page, pageSize: PAGE_SIZE, sort: "newest" }),
    [dq, status, page],
  );

  const toggle = async (job: Job, next: boolean) => {
    setData((p) => p && { ...p, items: p.items.map((j) => (j.id === job.id ? { ...j, isActive: next } : j)) });
    try {
      await jobService.setActive(job.id, next);
      toast.success(next ? "Job activated" : "Job deactivated");
    } catch (e) {
      toast.error(toApiError(e).message);
      reload();
    }
  };

  const remove = async () => {
    if (!deleting) return;
    try {
      await jobService.remove(deleting.id);
      toast.success("Job deleted");
      setDeleting(null);
      reload();
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search your jobs" className="flex-1" />
        <FilterSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }} placeholder="All statuses" options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
      </div>
      <Card className="overflow-hidden">
        {initialLoading ? <TableSkeleton cols={5} /> : data && data.items.length === 0 ? (
          <div className="p-6"><EmptyState icon={Briefcase} title="No jobs found" description={q || status ? "Try changing your search or filter." : "Post your first job to start receiving applications."} action={!q && !status ? <Button asChild><Link href="/recruiter/jobs/new">Post a job</Link></Button> : undefined} /></div>
        ) : data ? (
          <div className={loading ? "opacity-60" : undefined}>
            <Table>
              <TableHeader><TableRow><TableHead>Job</TableHead><TableHead>Type</TableHead><TableHead>Applicants</TableHead><TableHead>Deadline</TableHead><TableHead>Active</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.items.map((job) => (
                  <TableRow key={job.id}>
                    <TableCell><Link href={`/jobs/${job.id}`} className="font-medium hover:text-primary hover:underline">{job.title}</Link><p className="text-xs text-muted-foreground">{job.location} · {job.openings} opening{job.openings > 1 ? "s" : ""}</p></TableCell>
                    <TableCell><Badge variant="accent">{employmentLabel(job.employmentType)}</Badge></TableCell>
                    <TableCell><Link href={`/recruiter/jobs/${job.id}/applicants`} className="font-medium text-primary hover:underline">{job.applicantsCount ?? 0}</Link></TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(job.deadline)}</TableCell>
                    <TableCell><div className="flex items-center gap-2"><Switch checked={job.isActive} onCheckedChange={(c) => toggle(job, c)} aria-label={`${job.isActive ? "Deactivate" : "Activate"} ${job.title}`} /><span className="text-xs text-muted-foreground">{job.isActive ? "Active" : "Inactive"}</span></div></TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${job.title}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild><Link href={`/recruiter/jobs/${job.id}/edit`}><Pencil /> Edit job</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`/recruiter/jobs/${job.id}/applicants`}><Users /> View applicants</Link></DropdownMenuItem>
                          <DropdownMenuItem asChild><Link href={`/recruiter/screening/${job.id}`}><ScanSearch /> AI screening</Link></DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem destructive onSelect={() => setDeleting(job)}><Trash2 /> Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </div>
        ) : null}
      </Card>
      <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} destructive title="Delete this job?" description={`"${deleting?.title}" and its applicant list will no longer be visible. This can't be undone.`} confirmLabel="Delete job" onConfirm={remove} />
    </div>
  );
}
