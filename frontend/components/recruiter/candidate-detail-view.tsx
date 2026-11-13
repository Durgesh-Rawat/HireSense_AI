"use client";
import Link from "next/link";
import { ArrowLeft, Award, Briefcase, CheckCircle2, Download, FileText, FolderGit2, GraduationCap, Code2, Globe, Link2, Mail, MapPin, Phone, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ErrorState } from "@/components/common/error-state";
import { CardSkeleton } from "@/components/common/skeletons";
import { ResumeStatusBadge, ScreeningStatusBadge, StatusBadge } from "@/components/common/status-badge";
import { SkillChips } from "@/components/common/skill-chips";
import { EmptyState } from "@/components/common/empty-state";
import { ScreeningResultPanel } from "./screening-result-panel";
import { StatusUpdater } from "./status-updater";
import { useAsync } from "@/hooks/use-async";
import { recruiterService } from "@/services/recruiter.service";
import { toApiError } from "@/services/api";
import { saveBlob } from "@/lib/download";
import { formatDate, formatFileSize } from "@/lib/utils";
import { APPLICATION_STATUSES, APPLICATION_STATUS_META } from "@/constants/status";

const Section = ({ icon: Icon, title, children }: { icon: typeof Briefcase; title: string; children: React.ReactNode }) => (
  <Card><CardHeader><CardTitle className="flex items-center gap-2"><Icon className="size-4.5 text-primary" />{title}</CardTitle></CardHeader><CardContent>{children}</CardContent></Card>
);

export function CandidateDetailView({ applicationId }: { applicationId: string }) {
  const { data, error, initialLoading, reload, setData } = useAsync(() => recruiterService.candidateDetails(applicationId), [applicationId]);
  const back = <Link href="/recruiter/applicants" className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to applicants</Link>;

  if (error) return <div>{back}<ErrorState message={error} onRetry={reload} /></div>;
  if (initialLoading || !data) return <div>{back}<div className="grid gap-6 lg:grid-cols-3"><div className="space-y-4 lg:col-span-2"><CardSkeleton lines={4} /><CardSkeleton lines={6} /></div><CardSkeleton lines={6} /></div></div>;

  const { applicant, profile, resume, screening } = data;
  const links = [
    { href: profile.linkedinUrl, icon: Link2, label: "LinkedIn" },
    { href: profile.githubUrl, icon: Code2, label: "GitHub" },
    { href: profile.portfolioUrl, icon: Globe, label: "Portfolio" },
  ].filter((l) => l.href);

  const downloadResume = async () => {
    try {
      const { blob, fileName } = await recruiterService.downloadCandidateResume(profile.id, resume?.fileName);
      saveBlob(blob, fileName);
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  return (
    <div>
      {back}
      <StatusUpdater onUpdated={(_, status) => setData((p) => p && { ...p, applicant: { ...p.applicant, status } })}>
        {(request) => (
          <Card className="mb-6 flex flex-col gap-4 p-5 lg:flex-row lg:items-center">
            <Avatar name={profile.fullName} src={profile.avatarUrl} className="size-16 text-lg" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2"><h1 className="text-2xl font-semibold tracking-tight">{profile.fullName}</h1><StatusBadge status={applicant.status} /></div>
              {profile.headline && <p className="text-muted-foreground">{profile.headline}</p>}
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                {applicant.email && <span className="inline-flex items-center gap-1"><Mail className="size-3.5" />{applicant.email}</span>}
                {profile.phone && <span className="inline-flex items-center gap-1"><Phone className="size-3.5" />{profile.phone}</span>}
                {profile.location && <span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{profile.location}</span>}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button disabled={applicant.status === "SHORTLISTED"} onClick={() => request(applicant, "SHORTLISTED")}><CheckCircle2 /> Shortlist</Button>
              <Button variant="outline" className="text-destructive hover:text-destructive" disabled={applicant.status === "REJECTED"} onClick={() => request(applicant, "REJECTED")}><XCircle /> Reject</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">Update status</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {APPLICATION_STATUSES.map((s) => <DropdownMenuItem key={s} disabled={s === applicant.status} onSelect={() => request(applicant, s)}>{APPLICATION_STATUS_META[s].label}</DropdownMenuItem>)}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        )}
      </StatusUpdater>

      <div className="grid items-start gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader><CardTitle>AI screening results</CardTitle></CardHeader>
            <CardContent>
              {screening ? <ScreeningResultPanel result={screening} /> : (
                <EmptyState icon={FileText} title="Not screened yet" description={applicant.screeningStatus === "PENDING" ? "Screening is in progress." : applicant.screeningStatus === "FAILED" ? "Screening failed — the resume could not be processed." : "Run AI screening for this job to see compatibility results."} action={<Button asChild variant="outline"><Link href={`/recruiter/screening/${applicant.jobId}`}>Go to AI screening</Link></Button>} />
              )}
            </CardContent>
          </Card>

          {profile.summary && <Card><CardHeader><CardTitle>Summary</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">{profile.summary}</p></CardContent></Card>}

          <Section icon={Briefcase} title="Experience">
            {profile.experience.length === 0 ? <p className="text-sm text-muted-foreground">No experience listed.</p> : (
              <ul className="space-y-4">{profile.experience.map((e) => (
                <li key={e.id}><p className="font-medium">{e.title} · {e.company}</p><p className="text-sm text-muted-foreground">{formatDate(e.startDate, { month: "short", year: "numeric" })} – {e.current || !e.endDate ? "Present" : formatDate(e.endDate, { month: "short", year: "numeric" })}</p>{e.description && <p className="mt-1 text-sm">{e.description}</p>}</li>
              ))}</ul>
            )}
          </Section>
          <Section icon={FolderGit2} title="Projects">
            {profile.projects.length === 0 ? <p className="text-sm text-muted-foreground">No projects listed.</p> : (
              <ul className="space-y-4">{profile.projects.map((p) => (
                <li key={p.id}><p className="font-medium">{p.name}</p><p className="text-sm text-muted-foreground">{p.description}</p><div className="mt-2"><SkillChips skills={p.techStack} /></div></li>
              ))}</ul>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle>Application</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between gap-2"><span className="text-muted-foreground">Applied for</span><span className="text-right font-medium">{applicant.jobTitle}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Applied on</span><span className="font-medium">{formatDate(applicant.appliedAt)}</span></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">Resume</span><ResumeStatusBadge status={applicant.resumeStatus} /></div>
              <div className="flex items-center justify-between"><span className="text-muted-foreground">AI screening</span><ScreeningStatusBadge status={applicant.screeningStatus} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Resume</CardTitle></CardHeader>
            <CardContent>
              {resume ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3"><FileText className="size-8 text-primary" /><div className="min-w-0"><p className="truncate text-sm font-medium">{resume.fileName}</p><p className="text-xs text-muted-foreground">{formatFileSize(resume.fileSize)} · {formatDate(resume.uploadedAt)}</p></div></div>
                  <Button variant="outline" className="w-full" onClick={downloadResume}><Download /> View / download resume</Button>
                </div>
              ) : <p className="text-sm text-muted-foreground">No resume uploaded.</p>}
            </CardContent>
          </Card>
          <Section icon={GraduationCap} title="Education">
            {profile.education.length === 0 ? <p className="text-sm text-muted-foreground">No education listed.</p> : (
              <ul className="space-y-3">{profile.education.map((e) => <li key={e.id}><p className="text-sm font-medium">{e.degree}</p><p className="text-sm text-muted-foreground">{e.institution} · {e.graduationYear}{e.grade ? ` · ${e.grade}` : ""}</p></li>)}</ul>
            )}
          </Section>
          <Card><CardHeader><CardTitle>Skills</CardTitle></CardHeader><CardContent>
            {profile.skills.length === 0 ? <p className="text-sm text-muted-foreground">No skills listed.</p> : <SkillChips skills={profile.skills} variant="accent" />}
            {screening && screening.missingSkills.length > 0 && <p className="mt-3 text-xs text-muted-foreground">Missing for this job: {screening.missingSkills.join(", ")}</p>}
          </CardContent></Card>
          <Section icon={Award} title="Certifications">
            {profile.certifications.length === 0 ? <p className="text-sm text-muted-foreground">None listed.</p> : <ul className="space-y-2 text-sm">{profile.certifications.map((c) => <li key={c.id}><span className="font-medium">{c.name}</span> <span className="text-muted-foreground">· {c.issuer}, {c.year}</span></li>)}</ul>}
          </Section>
          {links.length > 0 && (
            <Card><CardHeader><CardTitle>Links</CardTitle></CardHeader><CardContent className="flex flex-wrap gap-2">
              {links.map(({ href, icon: Icon, label }) => <Button key={label} asChild variant="outline" size="sm"><a href={href} target="_blank" rel="noreferrer"><Icon /> {label}</a></Button>)}
            </CardContent></Card>
          )}
        </div>
      </div>
      <p className="sr-only"><Badge>candidate</Badge></p>
    </div>
  );
}
