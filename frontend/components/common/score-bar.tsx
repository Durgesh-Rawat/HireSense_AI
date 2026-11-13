import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export const scoreTone = (s: number) => (s >= 80 ? "text-emerald-600" : s >= 60 ? "text-amber-600" : "text-rose-600");
const scoreBg = (s: number) => (s >= 80 ? "bg-emerald-500" : s >= 60 ? "bg-amber-500" : "bg-rose-500");

export function ScoreBar({ label, value, className }: { label?: string; value: number; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-sm">
        {label && <span className="text-muted-foreground">{label}</span>}
        <span className={cn("font-semibold tabular-nums", scoreTone(value))}>{value}%</span>
      </div>
      <Progress value={value} aria-label={label ?? "Score"} indicatorClassName={scoreBg(value)} />
    </div>
  );
}

export function ScorePill({ value }: { value: number | null | undefined }) {
  if (value === null || value === undefined) return <span className="text-sm text-muted-foreground">—</span>;
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tabular-nums", value >= 80 ? "bg-emerald-50 text-emerald-700" : value >= 60 ? "bg-amber-50 text-amber-700" : "bg-rose-50 text-rose-700")}>
      {value}%
    </span>
  );
}
