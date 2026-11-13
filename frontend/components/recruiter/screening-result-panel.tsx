import { AlertCircle, CheckCircle2, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { DemoBadge } from "@/components/common/demo-banner";
import { ScoreBar } from "@/components/common/score-bar";
import { ScoreGauge } from "@/components/charts/score-gauge";
import { formatDateTime } from "@/lib/utils";
import type { ScreeningResult } from "@/types/screening";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-2 text-sm font-semibold">{title}</h4>
      {children}
    </div>
  );
}

/** Renders a result returned by the AI engine. Nothing here is calculated in the browser. */
export function ScreeningResultPanel({ result }: { result: ScreeningResult }) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent"><Sparkles /> AI screening result</Badge>
        {result.isDemo && <DemoBadge label="Demo data — not a real AI result" />}
        <span className="text-xs text-muted-foreground">Generated {formatDateTime(result.generatedAt)}</span>
      </div>

      <div className="grid items-center gap-6 md:grid-cols-[11rem_1fr]">
        <ScoreGauge value={result.overallScore} />
        <div className="space-y-3.5">
          <ScoreBar label="Skills match" value={result.skillsScore} />
          <ScoreBar label="Experience match" value={result.experienceScore} />
          <ScoreBar label="Education match" value={result.educationScore} />
          <ScoreBar label="Semantic similarity" value={result.semanticScore} />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Block title={`Matching skills (${result.matchingSkills.length})`}>
          {result.matchingSkills.length === 0 ? <p className="text-sm text-muted-foreground">None identified.</p> : (
            <div className="flex flex-wrap gap-1.5">{result.matchingSkills.map((s) => <Badge key={s} variant="success"><CheckCircle2 />{s}</Badge>)}</div>
          )}
        </Block>
        <Block title={`Missing skills (${result.missingSkills.length})`}>
          {result.missingSkills.length === 0 ? <p className="text-sm text-muted-foreground">No gaps identified.</p> : (
            <div className="flex flex-wrap gap-1.5">{result.missingSkills.map((s) => <Badge key={s} variant="destructive">{s}</Badge>)}</div>
          )}
        </Block>
        <Block title="Candidate strengths">
          {result.strengths.length === 0 ? <p className="text-sm text-muted-foreground">Not available.</p> : (
            <ul className="space-y-1.5 text-sm">{result.strengths.map((s) => <li key={s} className="flex gap-2"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />{s}</li>)}</ul>
          )}
        </Block>
        <Block title="Areas requiring verification">
          {result.verificationAreas.length === 0 ? <p className="text-sm text-muted-foreground">Nothing flagged.</p> : (
            <ul className="space-y-1.5 text-sm">{result.verificationAreas.map((s) => <li key={s} className="flex gap-2"><AlertCircle className="mt-0.5 size-4 shrink-0 text-amber-600" />{s}</li>)}</ul>
          )}
        </Block>
      </div>

      {result.summary && (
        <div className="rounded-lg border bg-secondary/40 p-4">
          <h4 className="mb-1 text-sm font-semibold">AI-generated summary</h4>
          <p className="text-sm text-muted-foreground">{result.summary}</p>
        </div>
      )}
      <p className="text-xs text-muted-foreground">AI scores support — and never replace — recruiter judgement. Verify important details with the candidate.</p>
    </div>
  );
}
