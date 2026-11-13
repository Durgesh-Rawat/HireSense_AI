"use client";
import Link from "next/link";
import { useState } from "react";
import { Bookmark, Briefcase, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SearchBar } from "@/components/common/search-bar";
import { FilterSelect } from "@/components/common/filter-select";
import { Pagination } from "@/components/common/pagination";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { JobCardSkeletons } from "@/components/common/skeletons";
import { JobCard } from "./job-card";
import { ApplyDialog } from "./apply-dialog";
import { useAsync } from "@/hooks/use-async";
import { useDebounce } from "@/hooks/use-debounce";
import { useCandidateJobs } from "@/hooks/use-candidate-jobs";
import { useAuth } from "@/context/auth-context";
import { jobService } from "@/services/job.service";
import { COMMON_SKILLS, EMPLOYMENT_TYPES, EXPERIENCE_LEVELS, JOB_SORT_OPTIONS, LOCATIONS } from "@/constants/job";
import type { EmploymentType, ExperienceLevel, JobSort } from "@/types/job";

const PAGE_SIZE = 9;

/** Shared job discovery UI used by the public /jobs page and the candidate dashboard. */
export function JobsExplorer({ detailsBase, loginRedirect = true }: { detailsBase: string; loginRedirect?: boolean }) {
  const { user } = useAuth();
  const cj = useCandidateJobs();
  const [tab, setTab] = useState<"all" | "saved">("all");
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState("");
  const [level, setLevel] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [sort, setSort] = useState<JobSort>("newest");
  const [page, setPage] = useState(1);
  const debouncedQ = useDebounce(q);

  const { data, error, loading, initialLoading, reload } = useAsync(
    () =>
      jobService.list({
        q: debouncedQ, location, employmentType: type as EmploymentType | "", experienceLevel: level as ExperienceLevel | "",
        skills, sort, page, pageSize: PAGE_SIZE, isActive: true,
      }),
    [debouncedQ, location, type, level, skills, sort, page],
  );

  const resetPage = <T,>(setter: (v: T) => void) => (v: T) => {
    setter(v);
    setPage(1);
  };
  const hasFilters = Boolean(q || location || type || level || skills.length);
  const clear = () => {
    setQ(""); setLocation(""); setType(""); setLevel(""); setSkills([]); setPage(1);
  };

  const cardProps = (job: Parameters<typeof JobCard>[0]["job"]) => ({
    job,
    detailsHref: `${detailsBase}/${job.id}`,
    candidateActions: cj.enabled,
    applied: cj.appliedIds.has(job.id),
    saved: cj.savedIds.has(job.id),
    onApply: cj.requestApply,
    onToggleSave: cj.toggleSaved,
    guestLoginHref: !user && loginRedirect ? "/login" : undefined,
  });

  return (
    <div className="space-y-5">
      {cj.enabled && (
        <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "saved")}>
          <TabsList>
            <TabsTrigger value="all"><Briefcase className="size-4" /> All jobs</TabsTrigger>
            <TabsTrigger value="saved"><Bookmark className="size-4" /> Saved ({cj.saved.length})</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {tab === "saved" && cj.enabled ? (
        cj.saved.length === 0 ? (
          <EmptyState icon={Bookmark} title="No saved jobs yet" description="Tap the bookmark icon on any job to save it for later." action={<Button onClick={() => setTab("all")}>Browse jobs</Button>} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {cj.saved.map((job) => <JobCard key={job.id} {...cardProps(job)} />)}
          </div>
        )
      ) : (
        <>
          <Card className="space-y-3 p-4">
            <div className="grid gap-3 md:grid-cols-[1fr_auto]">
              <SearchBar value={q} onChange={resetPage(setQ)} placeholder="Search by job title, company or skill" />
              <FilterSelect value={sort} onChange={(v) => resetPage(setSort)((v || "newest") as JobSort)} options={JOB_SORT_OPTIONS} placeholder="Newest first" ariaLabel="Sort jobs" />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <FilterSelect className="sm:w-full" value={location} onChange={resetPage(setLocation)} options={LOCATIONS.map((l) => ({ value: l, label: l }))} placeholder="Any location" />
              <FilterSelect className="sm:w-full" value={type} onChange={resetPage(setType)} options={EMPLOYMENT_TYPES} placeholder="Any job type" />
              <FilterSelect className="sm:w-full" value={level} onChange={resetPage(setLevel)} options={EXPERIENCE_LEVELS} placeholder="Any experience" />
              <FilterSelect
                className="sm:w-full"
                value=""
                onChange={(v) => v && !skills.includes(v) && resetPage(setSkills)([...skills, v])}
                options={COMMON_SKILLS.filter((s) => !skills.includes(s)).map((s) => ({ value: s, label: s }))}
                placeholder="Add skill filter"
              />
            </div>
            {(skills.length > 0 || hasFilters) && (
              <div className="flex flex-wrap items-center gap-2">
                {skills.map((s) => (
                  <Badge key={s} variant="accent" className="gap-1 pr-1">
                    {s}
                    <button aria-label={`Remove ${s} filter`} onClick={() => resetPage(setSkills)(skills.filter((x) => x !== s))} className="rounded-full p-0.5 hover:bg-indigo-100 cursor-pointer"><X /></button>
                  </Badge>
                ))}
                {hasFilters && <Button variant="ghost" size="sm" onClick={clear}>Clear all filters</Button>}
              </div>
            )}
          </Card>

          {error ? (
            <ErrorState message={error} onRetry={reload} />
          ) : initialLoading ? (
            <JobCardSkeletons />
          ) : data && data.items.length === 0 ? (
            <EmptyState icon={Briefcase} title="No jobs match your search" description="Try removing a filter or searching with different keywords." action={hasFilters ? <Button variant="outline" onClick={clear}>Clear filters</Button> : undefined} />
          ) : data ? (
            <div className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
              <p className="mb-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">{data.total}</span> job{data.total === 1 ? "" : "s"} found</p>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {data.items.map((job) => <JobCard key={job.id} {...cardProps(job)} />)}
              </div>
              <Card className="mt-4"><Pagination page={data.page} pageSize={data.pageSize} total={data.total} onPageChange={setPage} /></Card>
            </div>
          ) : null}
        </>
      )}

      <ApplyDialog {...cj.applyDialog} />
      {!user && (
        <p className="text-center text-sm text-muted-foreground">
          <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link> or <Link href="/register/candidate" className="font-medium text-primary hover:underline">create a free account</Link> to apply and save jobs.
        </p>
      )}
    </div>
  );
}
