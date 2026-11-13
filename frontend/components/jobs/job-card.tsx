"use client";
import Link from "next/link";
import { Bookmark, BookmarkCheck, Check, Clock, MapPin, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { SkillChips } from "@/components/common/skill-chips";
import { ScorePill } from "@/components/common/score-bar";
import { DemoBadge } from "@/components/common/demo-banner";
import { employmentLabel } from "@/constants/job";
import { formatSalary, timeAgo, cn } from "@/lib/utils";
import type { Job } from "@/types/job";

export interface JobCardProps {
  job: Job;
  detailsHref: string;
  /** Show candidate apply / save controls */
  candidateActions?: boolean;
  applied?: boolean;
  saved?: boolean;
  onApply?: (job: Job) => void;
  onToggleSave?: (job: Job) => void;
  /** Guests: apply button sends them to login */
  guestLoginHref?: string;
  /** From the AI engine — displayed as returned, never calculated here */
  matchScore?: number | null;
  matchIsDemo?: boolean;
}

export function JobCard({ job, detailsHref, candidateActions, applied, saved, onApply, onToggleSave, guestLoginHref, matchScore, matchIsDemo }: JobCardProps) {
  const closed = !job.isActive;
  return (
    <Card className="flex h-full flex-col p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <Avatar name={job.companyName} src={job.companyLogoUrl} className="size-11 rounded-xl text-sm" />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 leading-snug font-semibold">
            <Link href={detailsHref} className="hover:text-primary hover:underline">{job.title}</Link>
          </h3>
          <p className="truncate text-sm text-muted-foreground">{job.companyName}</p>
        </div>
        {candidateActions && (
          <button
            type="button"
            onClick={() => onToggleSave?.(job)}
            aria-label={saved ? `Remove ${job.title} from saved jobs` : `Save ${job.title}`}
            aria-pressed={saved}
            className={cn("rounded-md p-1.5 hover:bg-secondary cursor-pointer", saved ? "text-primary" : "text-muted-foreground")}
          >
            {saved ? <BookmarkCheck className="size-5" /> : <Bookmark className="size-5" />}
          </button>
        )}
      </div>

      {(matchScore !== undefined && matchScore !== null) && (
        <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent/60 px-3 py-2 text-sm">
          <span className="text-muted-foreground">AI match</span>
          <ScorePill value={matchScore} />
          {matchIsDemo && <DemoBadge />}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{job.location}</span>
        <span className="inline-flex items-center gap-1"><Wallet className="size-3.5" />{formatSalary(job.salaryMin, job.salaryMax)}</span>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <Badge variant="accent">{employmentLabel(job.employmentType)}</Badge>
        <Badge variant="outline">{job.experienceRequired}</Badge>
        {closed && <Badge variant="destructive">Closed</Badge>}
      </div>

      <div className="mt-3"><SkillChips skills={job.requiredSkills} max={4} /></div>

      <div className="mt-auto flex items-center justify-between gap-2 pt-4">
        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Clock className="size-3.5" />{timeAgo(job.postedAt)}</span>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm"><Link href={detailsHref}>View details</Link></Button>
          {candidateActions && (
            <Button size="sm" disabled={applied || closed} onClick={() => onApply?.(job)}>
              {applied ? <><Check /> Applied</> : "Apply"}
            </Button>
          )}
          {guestLoginHref && !closed && (
            <Button asChild size="sm"><Link href={guestLoginHref}>Apply</Link></Button>
          )}
        </div>
      </div>
    </Card>
  );
}
