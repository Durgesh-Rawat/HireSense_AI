import Link from "next/link";
import {
  ArrowRight, BadgeCheck, BellRing, Bookmark, BrainCircuit, CheckCircle2, ClipboardCheck, FileUp, FlaskConical, GitCompare, LineChart,
  ScanSearch, Search, Sparkles, UserPlus, Users, Briefcase, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SITE } from "@/constants/site";

const STEPS = [
  { icon: UserPlus, title: "Create your account", text: "Sign up as a candidate or recruiter in under a minute." },
  { icon: FileUp, title: "Upload or post", text: "Candidates upload a resume; recruiters publish job openings." },
  { icon: ScanSearch, title: "AI screens the match", text: "Our AI engine compares resumes with job requirements." },
  { icon: ClipboardCheck, title: "Shortlist & hire", text: "Recruiters review ranked candidates and move them forward." },
];
const CANDIDATE_FEATURES = [
  { icon: FileUp, title: "One resume, many jobs", text: "Upload a PDF or DOCX once and apply in a click." },
  { icon: Sparkles, title: "AI job recommendations", text: "See roles that fit your skills, with a match score from the AI engine." },
  { icon: Bookmark, title: "Save & track", text: "Bookmark jobs and follow every application's status." },
  { icon: BellRing, title: "Real-time updates", text: "Get notified on shortlisting and interview invitations." },
];
const RECRUITER_FEATURES = [
  { icon: Briefcase, title: "Post jobs in minutes", text: "Structured forms for skills, experience and deadlines." },
  { icon: Target, title: "Ranked applicants", text: "Sort and filter candidates by AI compatibility score." },
  { icon: GitCompare, title: "Compare candidates", text: "Review strengths, missing skills and scores side by side." },
  { icon: LineChart, title: "Hiring analytics", text: "Track applicants, shortlists and screening activity." },
];
const STATS = [
  { value: "10,000+", label: "Resumes screened" },
  { value: "1,200+", label: "Active job postings" },
  { value: "350+", label: "Hiring companies" },
  { value: "70%", label: "Faster shortlisting" },
];

function SectionHeading({ kicker, title, text }: { kicker: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-10 max-w-2xl text-center">
      <p className="text-sm font-semibold tracking-wide text-primary uppercase">{kicker}</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight">{title}</h2>
      {text && <p className="mt-3 text-muted-foreground">{text}</p>}
    </div>
  );
}

function FeatureGrid({ items }: { items: typeof CANDIDATE_FEATURES }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map(({ icon: Icon, title, text }) => (
        <Card key={title} className="p-5">
          <span className="mb-3 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground"><Icon className="size-5" /></span>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{text}</p>
        </Card>
      ))}
    </div>
  );
}

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/60 to-background">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
          <div>
            <Badge variant="accent" className="mb-4"><BrainCircuit /> AI-assisted resume screening</Badge>
            <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{SITE.tagline}</h1>
            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
              {SITE.name} connects candidates with recruiters and uses AI to compare resumes against job requirements — so the best-fit people surface first.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/register/candidate">I&apos;m looking for a job <ArrowRight /></Link></Button>
              <Button asChild size="lg" variant="outline"><Link href="/register/recruiter">I&apos;m hiring</Link></Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Already have an account? <Link href="/login" className="font-medium text-primary hover:underline">Log in</Link> · <Link href="/jobs" className="font-medium text-primary hover:underline">Browse jobs</Link>
            </p>
          </div>

          {/* Illustrative screening preview */}
          <Card className="relative mx-auto w-full max-w-md p-5 shadow-lg">
            <Badge variant="warning" className="absolute -top-3 right-4"><FlaskConical /> Illustrative example</Badge>
            <div className="flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-full bg-accent font-semibold text-accent-foreground">AI</span>
              <div><p className="font-semibold">Sample candidate</p><p className="text-sm text-muted-foreground">Applied for Backend Developer</p></div>
              <span className="ml-auto text-2xl font-bold text-emerald-600">90%</span>
            </div>
            <div className="mt-5 space-y-3">
              {[["Skills match", 95], ["Experience", 80], ["Education", 88]].map(([l, v]) => (
                <div key={l as string}>
                  <div className="mb-1 flex justify-between text-xs"><span className="text-muted-foreground">{l}</span><span className="font-medium">{v}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary"><div className="h-full rounded-full bg-primary" style={{ width: `${v}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {["Python", "FastAPI", "PostgreSQL"].map((s) => <Badge key={s} variant="success"><CheckCircle2 />{s}</Badge>)}
              <Badge variant="destructive">Kubernetes missing</Badge>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-semibold tabular-nums">{s.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-amber-700"><FlaskConical className="size-3.5" /> Demo data — illustrative figures for this academic project, not real usage statistics.</p>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading kicker="How it works" title="From resume to shortlist in four steps" />
        <ol className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ icon: Icon, title, text }, i) => (
            <li key={title} className="relative rounded-xl border bg-card p-5">
              <span className="absolute -top-3 left-5 rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">Step {i + 1}</span>
              <Icon className="mt-2 mb-3 size-6 text-primary" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Features */}
      <section className="border-y bg-secondary/40">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-2xl font-semibold"><Users className="size-6 text-primary" /> For candidates</h2>
              <p className="mb-5 text-muted-foreground">Find the right job and stay on top of every application.</p>
              <FeatureGrid items={CANDIDATE_FEATURES} />
            </div>
            <div>
              <h2 className="mb-1 flex items-center gap-2 text-2xl font-semibold"><Briefcase className="size-6 text-primary" /> For recruiters</h2>
              <p className="mb-5 text-muted-foreground">Spend time interviewing, not sorting through resumes.</p>
              <FeatureGrid items={RECRUITER_FEATURES} />
            </div>
          </div>
        </div>
      </section>

      {/* AI screening */}
      <section id="ai-screening" className="mx-auto max-w-7xl scroll-mt-20 px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading kicker="AI resume screening" title="Transparent, explainable matching" text="The AI engine reads each resume and compares it with the job description. Recruiters see not just a score, but why." />
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: BrainCircuit, title: "Semantic understanding", text: "Embeddings capture meaning beyond keywords, so “built REST services” can match “API development”." },
            { icon: BadgeCheck, title: "Score breakdown", text: "Skills, experience, education and semantic similarity are shown separately, with matching and missing skills." },
            { icon: Search, title: "Human in control", text: "AI suggests, recruiters decide. Scores support decisions — they never replace review." },
          ].map(({ icon: Icon, title, text }) => (
            <Card key={title} className="p-6">
              <Icon className="mb-3 size-7 text-primary" />
              <h3 className="font-semibold">{title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{text}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl rounded-2xl bg-primary px-6 py-14 text-center text-primary-foreground">
          <h2 className="text-3xl font-semibold tracking-tight">Ready to get started?</h2>
          <p className="mx-auto mt-3 max-w-xl text-primary-foreground/80">Join as a candidate to find your next role, or as a recruiter to find your next hire.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg" variant="secondary"><Link href="/register">Create free account</Link></Button>
            <Button asChild size="lg" variant="outline" className="border-white/30 bg-transparent text-white hover:bg-white/10 hover:text-white"><Link href="/login">Log in</Link></Button>
          </div>
        </div>
      </section>
    </>
  );
}
