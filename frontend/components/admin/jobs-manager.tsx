"use client";
import { useState } from "react";
import { Eye, Flag, ShieldCheck, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DemoBanner } from "@/components/common/demo-banner";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/filter-select";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { SkillChips } from "@/components/common/skill-chips";
import { TableSkeleton } from "@/components/common/skeletons";
import { useAsync } from "@/hooks/use-async";
import { useDebounce } from "@/hooks/use-debounce";
import { adminService } from "@/services/admin.service";
import { toApiError } from "@/services/api";
import { EMPLOYMENT_TYPES, employmentLabel } from "@/constants/job";
import { formatDate, formatSalary } from "@/lib/utils";
import type { EmploymentType, Job } from "@/types/job";

const PAGE_SIZE = 8;

export function AdminJobsManager() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [type, setType] = useState("");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [viewing, setViewing] = useState<Job | null>(null);
  const [removing, setRemoving] = useState<Job | null>(null);
  const dq = useDebounce(q);
  const { data, error, initialLoading, loading, reload } = useAsync(
    () => adminService.listJobs({ q: dq, isActive: status === "" ? undefined : status === "active", employmentType: type as EmploymentType | "", flaggedOnly: flaggedOnly || undefined, page, pageSize: PAGE_SIZE, sort: "newest" }),
    [dq, status, type, flaggedOnly, page],
  );

  const remove = async () => {
    if (!removing) return;
    try {
      await adminService.removeJob(removing.id);
      toast.success("Job removed");
      setRemoving(null);
      setViewing(null);
      reload();
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  const dismiss = async (job: Job) => {
    try {
      await adminService.dismissFlag(job.id);
      toast.success("Report dismissed");
      setViewing(null);
      reload();
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <DemoBanner>Demo jobs. Reported jobs and removals only affect this browser session.</DemoBanner>
      <Card className="space-y-3 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto_auto]">
          <SearchBar value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Search by title, company or skill" />
          <FilterSelect value={status} onChange={(v) => { setStatus(v); setPage(1); }} placeholder="Any status" options={[{ value: "active", label: "Active" }, { value: "inactive", label: "Inactive" }]} />
          <FilterSelect value={type} onChange={(v) => { setType(v); setPage(1); }} placeholder="Any type" options={EMPLOYMENT_TYPES} />
          <label className="flex items-center gap-2 text-sm"><Switch checked={flaggedOnly} onCheckedChange={(c) => { setFlaggedOnly(c); setPage(1); }} /> Reported only</label>
        </div>
      </Card>
      <Card className="overflow-hidden">
        {initialLoading ? <TableSkeleton cols={5} rows={7} /> : data && data.items.length === 0 ? <div className="p-6"><EmptyState icon={ShieldCheck} title="No jobs found" description="Try a different search or filter." /></div> : data ? (
          <div className={loading ? "opacity-60" : undefined}>
            <Table>
              <TableHeader><TableRow><TableHead>Job</TableHead><TableHead>Company</TableHead><TableHead>Type</TableHead><TableHead>Posted</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {data.items.map((j) => (
                  <TableRow key={j.id}>
                    <TableCell><p className="max-w-64 truncate font-medium">{j.title}</p>{j.isFlagged && <Badge variant="destructive" className="mt-1"><Flag /> Reported</Badge>}</TableCell>
                    <TableCell>{j.companyName}</TableCell>
                    <TableCell><Badge variant="accent">{employmentLabel(j.employmentType)}</Badge></TableCell>
                    <TableCell className="whitespace-nowrap">{formatDate(j.postedAt)}</TableCell>
                    <TableCell><Badge variant={j.isActive ? "success" : "secondary"}>{j.isActive ? "Active" : "Inactive"}</Badge></TableCell>
                    <TableCell className="text-right"><div className="flex justify-end gap-1"><Button variant="ghost" size="sm" onClick={() => setViewing(j)}><Eye /> View</Button><Button variant="ghost" size="icon" aria-label={`Remove ${j.title}`} onClick={() => setRemoving(j)}><Trash2 className="text-destructive" /></Button></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
          </div>
        ) : null}
      </Card>

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-2xl">
          {viewing && (<>
            <DialogHeader><DialogTitle>{viewing.title}</DialogTitle><DialogDescription>{viewing.companyName} · {viewing.location} · {employmentLabel(viewing.employmentType)}</DialogDescription></DialogHeader>
            {viewing.isFlagged && <div role="alert" className="flex gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"><Flag className="mt-0.5 size-4 shrink-0" /><div><p className="font-medium">Reported by users</p><p>{viewing.flagReason}</p></div></div>}
            <p className="max-h-48 overflow-y-auto text-sm whitespace-pre-line text-muted-foreground">{viewing.description}</p>
            <div className="space-y-2 text-sm"><p><span className="font-medium">Required skills:</span></p><SkillChips skills={viewing.requiredSkills} variant="accent" /><p className="pt-1"><span className="font-medium">Salary:</span> {formatSalary(viewing.salaryMin, viewing.salaryMax)} · <span className="font-medium">Applicants:</span> {viewing.applicantsCount ?? 0}</p></div>
            <DialogFooter>
              {viewing.isFlagged && <Button variant="outline" onClick={() => dismiss(viewing)}>Dismiss report</Button>}
              <Button variant="destructive" onClick={() => setRemoving(viewing)}><Trash2 /> Remove job</Button>
            </DialogFooter>
          </>)}
        </DialogContent>
      </Dialog>
      <ConfirmDialog open={!!removing} onOpenChange={(o) => !o && setRemoving(null)} destructive title="Remove this job?" description={`"${removing?.title}" will be taken down from the platform. This can't be undone.`} confirmLabel="Remove job" onConfirm={remove} />
    </div>
  );
}
