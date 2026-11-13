"use client";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Download, Eye, MoreHorizontal, ScanSearch, Users, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/filter-select";
import { Pagination } from "@/components/common/pagination";
import { SearchBar } from "@/components/common/search-bar";
import { ResumeStatusBadge, ScreeningStatusBadge, StatusBadge } from "@/components/common/status-badge";
import { ScorePill } from "@/components/common/score-bar";
import { TableSkeleton } from "@/components/common/skeletons";
import { DemoBanner } from "@/components/common/demo-banner";
import { StatusUpdater } from "./status-updater";
import { useAsync } from "@/hooks/use-async";
import { useDebounce } from "@/hooks/use-debounce";
import { recruiterService } from "@/services/recruiter.service";
import { toApiError } from "@/services/api";
import { saveBlob } from "@/lib/download";
import { formatDate } from "@/lib/utils";
import { APPLICATION_STATUSES, APPLICATION_STATUS_META, SCREENING_STATUS_META } from "@/constants/status";
import type { ApplicantFilters, ApplicationStatus, ScreeningStatus } from "@/types/application";

const PAGE_SIZE = 8;
const SCORE_RANGES = [
  { value: "80", label: "AI score 80%+" },
  { value: "60", label: "AI score 60%+" },
  { value: "lt60", label: "AI score below 60%" },
];
const SORTS = [
  { value: "score_desc", label: "Highest AI score" },
  { value: "score_asc", label: "Lowest AI score" },
  { value: "oldest", label: "Oldest applications" },
  { value: "name", label: "Name (A–Z)" },
];

export function ApplicantsTable({ fixedJobId }: { fixedJobId?: string }) {
  const [jobId, setJobId] = useState(fixedJobId ?? "");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [screening, setScreening] = useState("");
  const [range, setRange] = useState("");
  const [sort, setSort] = useState<NonNullable<ApplicantFilters["sort"]>>("newest");
  const [page, setPage] = useState(1);
  const dq = useDebounce(q);
  const reset = <T,>(set: (v: T) => void) => (v: T) => { set(v); setPage(1); };

  const jobs = useAsync(() => recruiterService.listJobs({ pageSize: 100 }), []);
  const filters: ApplicantFilters = {
    jobId: jobId || undefined, q: dq, status: status as ApplicationStatus | "", screeningStatus: screening as ScreeningStatus | "",
    minScore: range === "80" ? 80 : range === "60" ? 60 : undefined, maxScore: range === "lt60" ? 59 : undefined, sort, page, pageSize: PAGE_SIZE,
  };
  const { data, error, initialLoading, loading, reload, setData } = useAsync(() => recruiterService.listApplicants(filters), [jobId, dq, status, screening, range, sort, page]);
  const hasFilters = Boolean(q || status || screening || range || (!fixedJobId && jobId));
  const jobTitle = fixedJobId ? jobs.data?.items.find((j) => j.id === fixedJobId)?.title : undefined;

  const viewResume = async (candidateId: string, name: string) => {
    try {
      const { blob, fileName } = await recruiterService.downloadCandidateResume(candidateId, `${name}_resume`);
      saveBlob(blob, fileName);
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  const onUpdated = (id: string, s: ApplicationStatus) => setData((p) => p && { ...p, items: p.items.map((a) => (a.applicationId === id ? { ...a, status: s } : a)) });

  if (error) return <ErrorState message={error} onRetry={reload} />;

  return (
    <div className="space-y-4">
      <DemoBanner>AI scores in this table are fixed sample values for demonstration. Real scores come from the AI engine.</DemoBanner>
      {jobTitle && <p className="text-sm text-muted-foreground">Showing applicants for <span className="font-medium text-foreground">{jobTitle}</span></p>}
      <Card className="space-y-3 p-4">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto]">
          <SearchBar value={q} onChange={reset(setQ)} placeholder="Search by candidate name or email" />
          <FilterSelect value={sort === "newest" ? "" : sort} onChange={(v) => reset(setSort)((v || "newest") as typeof sort)} options={SORTS} placeholder="Newest first" ariaLabel="Sort applicants" className="lg:w-48" />
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {!fixedJobId && <FilterSelect className="sm:w-full" value={jobId} onChange={reset(setJobId)} placeholder="All jobs" options={(jobs.data?.items ?? []).map((j) => ({ value: j.id, label: j.title }))} />}
          <FilterSelect className="sm:w-full" value={status} onChange={reset(setStatus)} placeholder="All statuses" options={APPLICATION_STATUSES.map((s) => ({ value: s, label: APPLICATION_STATUS_META[s].label }))} />
          <FilterSelect className="sm:w-full" value={screening} onChange={reset(setScreening)} placeholder="Any screening status" options={Object.entries(SCREENING_STATUS_META).map(([v, m]) => ({ value: v, label: m.label }))} />
          <FilterSelect className="sm:w-full" value={range} onChange={reset(setRange)} placeholder="Any AI score" options={SCORE_RANGES} />
        </div>
      </Card>

      <Card className="overflow-hidden">
        {initialLoading ? <TableSkeleton cols={6} rows={7} /> : data && data.items.length === 0 ? (
          <div className="p-6"><EmptyState icon={Users} title="No applicants found" description={hasFilters ? "Try adjusting your filters." : "Applicants will appear here once candidates apply."} action={hasFilters ? <Button variant="outline" onClick={() => { setQ(""); setStatus(""); setScreening(""); setRange(""); if (!fixedJobId) setJobId(""); setPage(1); }}>Clear filters</Button> : undefined} /></div>
        ) : data ? (
          <StatusUpdater onUpdated={onUpdated}>
            {(request) => (
              <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Candidate</TableHead>{!fixedJobId && <TableHead>Job</TableHead>}<TableHead>Applied</TableHead><TableHead>Resume</TableHead>
                      <TableHead>AI screening</TableHead><TableHead>AI score</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.items.map((a) => (
                      <TableRow key={a.applicationId}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar name={a.candidateName} src={a.avatarUrl} className="size-9" />
                            <div className="min-w-0">
                              <Link href={`/recruiter/candidates/${a.applicationId}`} className="block font-medium hover:text-primary hover:underline">{a.candidateName}</Link>
                              {a.email && <p className="truncate text-xs text-muted-foreground">{a.email}</p>}
                            </div>
                          </div>
                        </TableCell>
                        {!fixedJobId && <TableCell className="max-w-48 truncate">{a.jobTitle}</TableCell>}
                        <TableCell className="whitespace-nowrap">{formatDate(a.appliedAt)}</TableCell>
                        <TableCell><ResumeStatusBadge status={a.resumeStatus} /></TableCell>
                        <TableCell><ScreeningStatusBadge status={a.screeningStatus} /></TableCell>
                        <TableCell><ScorePill value={a.aiScore} /></TableCell>
                        <TableCell><StatusBadge status={a.status} /></TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" aria-label={`Actions for ${a.candidateName}`}><MoreHorizontal /></Button></DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem asChild><Link href={`/recruiter/candidates/${a.applicationId}`}><Eye /> View candidate</Link></DropdownMenuItem>
                              <DropdownMenuItem disabled={a.resumeStatus === "MISSING"} onSelect={() => viewResume(a.candidateId, a.candidateName)}><Download /> View resume</DropdownMenuItem>
                              <DropdownMenuItem asChild><Link href={`/recruiter/screening/${a.jobId}`}><ScanSearch /> AI screening</Link></DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem disabled={a.status === "SHORTLISTED"} onSelect={() => request(a, "SHORTLISTED")}><CheckCircle2 className="text-emerald-600" /> Shortlist</DropdownMenuItem>
                              <DropdownMenuItem destructive disabled={a.status === "REJECTED"} onSelect={() => request(a, "REJECTED")}><XCircle /> Reject</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuLabel>Update status</DropdownMenuLabel>
                              {APPLICATION_STATUSES.filter((s) => s !== "REJECTED" && s !== "SHORTLISTED").map((s) => (
                                <DropdownMenuItem key={s} disabled={a.status === s} onSelect={() => request(a, s)}>{APPLICATION_STATUS_META[s].label}</DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} />
              </div>
            )}
          </StatusUpdater>
        ) : null}
      </Card>
    </div>
  );
}
