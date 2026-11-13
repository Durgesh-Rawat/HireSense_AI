"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { BarChart3, GitCompare, Loader2, ScanSearch } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DemoBanner } from "@/components/common/demo-banner";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { FilterSelect } from "@/components/common/filter-select";
import { ScorePill } from "@/components/common/score-bar";
import { TableSkeleton } from "@/components/common/skeletons";
import { SimpleBarChart } from "@/components/charts/bar-chart-card";
import { SkillChips } from "@/components/common/skill-chips";
import { ScreeningResultPanel } from "./screening-result-panel";
import { useAsync } from "@/hooks/use-async";
import { recruiterService } from "@/services/recruiter.service";
import { screeningService } from "@/services/screening.service";
import { toApiError } from "@/services/api";
import { cn } from "@/lib/utils";
import type { ScreeningFilters, ScreeningResult } from "@/types/screening";

const RANGES: Record<string, { min?: number; max?: number }> = { "80": { min: 80 }, "60": { min: 60 }, "40": { min: 40 }, lt60: { max: 59 } };
const RANGE_OPTIONS = [
  { value: "80", label: "80% and above" }, { value: "60", label: "60% and above" }, { value: "40", label: "40% and above" }, { value: "lt60", label: "Below 60%" },
];
const SORTS = [{ value: "score_asc", label: "Lowest score first" }, { value: "name", label: "Name (A–Z)" }];
const METRICS: { key: keyof ScreeningResult; label: string }[] = [
  { key: "overallScore", label: "Overall" }, { key: "skillsScore", label: "Skills" }, { key: "experienceScore", label: "Experience" },
  { key: "educationScore", label: "Education" }, { key: "semanticScore", label: "Semantic similarity" },
];

export function ScreeningView({ initialJobId }: { initialJobId?: string }) {
  const jobs = useAsync(() => recruiterService.listJobs({ pageSize: 100 }), []);
  const [jobChoice, setJobChoice] = useState(initialJobId ?? "");
  const jobId = jobChoice || jobs.data?.items.find((j) => (j.applicantsCount ?? 0) > 0)?.id || jobs.data?.items[0]?.id || "";
  const [range, setRange] = useState("");
  const [sort, setSort] = useState<NonNullable<ScreeningFilters["sort"]>>("score_desc");
  const [selected, setSelected] = useState<string[]>([]);
  const [viewing, setViewing] = useState<ScreeningResult | null>(null);
  const [comparing, setComparing] = useState(false);
  const [confirmRun, setConfirmRun] = useState(false);
  const [running, setRunning] = useState(false);

  const filters: ScreeningFilters = { minScore: RANGES[range]?.min, maxScore: RANGES[range]?.max, sort };
  const results = useAsync(() => (jobId ? screeningService.getResults(jobId, filters) : Promise.resolve([] as ScreeningResult[])), [jobId, range, sort]);
  const list = useMemo(() => results.data ?? [], [results.data]);
  const selectedResults = useMemo(() => list.filter((r) => selected.includes(r.applicationId)), [list, selected]);

  const run = async () => {
    setConfirmRun(false);
    setRunning(true);
    try {
      const res = await screeningService.analyze(jobId);
      toast.success(res.analyzed !== undefined ? `Screening complete — ${res.analyzed} new candidate${res.analyzed === 1 ? "" : "s"} analysed` : "Screening started");
      results.reload();
    } catch (e) {
      toast.error(toApiError(e).message);
    } finally {
      setRunning(false);
    }
  };

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : s.length >= 3 ? (toast.info("You can compare up to 3 candidates."), s) : [...s, id]));

  const jobOptions = (jobs.data?.items ?? []).map((j) => ({ value: j.id, label: j.title }));
  const changeJob = (v: string) => { setJobChoice(v); setSelected([]); };

  if (jobs.error) return <ErrorState message={jobs.error} onRetry={jobs.reload} />;
  if (jobs.data && jobs.data.items.length === 0) return <EmptyState icon={ScanSearch} title="Post a job first" description="AI screening runs on applicants of your jobs." action={<Button asChild><Link href="/recruiter/jobs/new">Post a job</Link></Button>} />;

  return (
    <div className="space-y-4">
      <DemoBanner>Screening results are fixed sample data for demonstration. Real results are produced by the AI engine and displayed here exactly as returned.</DemoBanner>
      <Card className="flex flex-col gap-3 p-4 lg:flex-row lg:items-center">
        <FilterSelect className="lg:w-72" value={jobId} onChange={(v) => v && changeJob(v)} options={jobOptions} placeholder="Select a job" ariaLabel="Select job" />
        <FilterSelect className="lg:w-44" value={range} onChange={setRange} options={RANGE_OPTIONS} placeholder="Any score" ariaLabel="Filter by score range" />
        <FilterSelect className="lg:w-48" value={sort === "score_desc" ? "" : sort} onChange={(v) => setSort((v || "score_desc") as typeof sort)} options={SORTS} placeholder="Highest score first" ariaLabel="Sort candidates" />
        <div className="flex flex-1 flex-wrap justify-end gap-2">
          <Button variant="outline" disabled={selectedResults.length < 2} onClick={() => setComparing(true)}><GitCompare /> Compare{selectedResults.length ? ` (${selectedResults.length})` : ""}</Button>
          <Button disabled={!jobId || running} onClick={() => setConfirmRun(true)}>{running ? <Loader2 className="animate-spin" /> : <ScanSearch />} {running ? "Screening…" : "Run AI screening"}</Button>
        </div>
      </Card>

      {results.error ? <ErrorState message={results.error} onRetry={results.reload} /> : results.initialLoading || (jobs.initialLoading) ? (
        <Card><TableSkeleton cols={6} /></Card>
      ) : list.length === 0 ? (
        <EmptyState icon={ScanSearch} title={range ? "No candidates in this score range" : "No screening results yet"} description={range ? "Try a different score range." : "Run AI screening to rank applicants for this job."} action={range ? <Button variant="outline" onClick={() => setRange("")}>Clear filter</Button> : <Button onClick={() => setConfirmRun(true)} disabled={running}>Run AI screening</Button>} />
      ) : (
        <>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="size-4.5 text-primary" /> Compatibility by candidate</CardTitle><CardDescription>Overall score as returned by the AI engine</CardDescription></CardHeader>
            <CardContent><SimpleBarChart height={220} data={list.map((r) => ({ label: r.candidateName.split(" ")[0], overall: r.overallScore, skills: r.skillsScore }))} series={[{ key: "overall", label: "Overall" }, { key: "skills", label: "Skills", color: "#0ea5e9" }]} /></CardContent>
          </Card>
          <Card className={cn("overflow-hidden", results.loading && "opacity-60")}>
            <Table>
              <TableHeader><TableRow><TableHead className="w-10"><span className="sr-only">Compare</span></TableHead><TableHead>Candidate</TableHead><TableHead>Overall</TableHead><TableHead>Skills</TableHead><TableHead>Experience</TableHead><TableHead>Education</TableHead><TableHead>Skills matched</TableHead><TableHead className="text-right">Results</TableHead></TableRow></TableHeader>
              <TableBody>
                {list.map((r) => (
                  <TableRow key={r.applicationId} data-state={selected.includes(r.applicationId) ? "selected" : undefined}>
                    <TableCell><Checkbox checked={selected.includes(r.applicationId)} onCheckedChange={() => toggle(r.applicationId)} aria-label={`Select ${r.candidateName} for comparison`} /></TableCell>
                    <TableCell><Link href={`/recruiter/candidates/${r.applicationId}`} className="font-medium hover:text-primary hover:underline">{r.candidateName}</Link></TableCell>
                    <TableCell><ScorePill value={r.overallScore} /></TableCell>
                    <TableCell className="tabular-nums">{r.skillsScore}%</TableCell>
                    <TableCell className="tabular-nums">{r.experienceScore}%</TableCell>
                    <TableCell className="tabular-nums">{r.educationScore}%</TableCell>
                    <TableCell className="tabular-nums">{r.matchingSkills.length} / {r.matchingSkills.length + r.missingSkills.length}</TableCell>
                    <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => setViewing(r)}>View results</Button></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="sm:max-w-3xl">
          {viewing && (<>
            <DialogHeader><DialogTitle>{viewing.candidateName}</DialogTitle><DialogDescription>Screening results for this job</DialogDescription></DialogHeader>
            <ScreeningResultPanel result={viewing} />
            <Button asChild variant="outline"><Link href={`/recruiter/candidates/${viewing.applicationId}`}>View full candidate profile</Link></Button>
          </>)}
        </DialogContent>
      </Dialog>

      <Dialog open={comparing} onOpenChange={setComparing}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader><DialogTitle>Compare candidates</DialogTitle><DialogDescription>Highest value per row is highlighted. Scores are AI-engine outputs.</DialogDescription></DialogHeader>
          <Table>
            <TableHeader><TableRow><TableHead>Metric</TableHead>{selectedResults.map((r) => <TableHead key={r.applicationId} className="normal-case">{r.candidateName}</TableHead>)}</TableRow></TableHeader>
            <TableBody>
              {METRICS.map((m) => {
                const best = Math.max(...selectedResults.map((r) => r[m.key] as number));
                return (
                  <TableRow key={m.key}><TableCell className="font-medium">{m.label}</TableCell>
                    {selectedResults.map((r) => { const v = r[m.key] as number; return <TableCell key={r.applicationId} className={cn("tabular-nums", v === best && "font-semibold text-emerald-600")}>{v}%</TableCell>; })}
                  </TableRow>
                );
              })}
              <TableRow><TableCell className="font-medium align-top">Matching skills</TableCell>{selectedResults.map((r) => <TableCell key={r.applicationId} className="align-top"><SkillChips skills={r.matchingSkills} variant="success" /></TableCell>)}</TableRow>
              <TableRow><TableCell className="font-medium align-top">Missing skills</TableCell>{selectedResults.map((r) => <TableCell key={r.applicationId} className="align-top">{r.missingSkills.length ? <SkillChips skills={r.missingSkills} variant="destructive" /> : <span className="text-sm text-muted-foreground">None</span>}</TableCell>)}</TableRow>
              <TableRow><TableCell className="font-medium align-top">Verify</TableCell>{selectedResults.map((r) => <TableCell key={r.applicationId} className="align-top text-sm text-muted-foreground">{r.verificationAreas.join("; ") || "—"}</TableCell>)}</TableRow>
            </TableBody>
          </Table>
        </DialogContent>
      </Dialog>

      <ConfirmDialog open={confirmRun} onOpenChange={setConfirmRun} title="Run AI screening?" description="The AI engine will analyse all applicants for this job who haven't been screened yet. This may take a moment." confirmLabel="Run screening" onConfirm={run} />
    </div>
  );
}
