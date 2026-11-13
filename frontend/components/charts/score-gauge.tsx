"use client";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from "recharts";
import { scoreTone } from "@/components/common/score-bar";
import { cn } from "@/lib/utils";

const fillFor = (v: number) => (v >= 80 ? "#10b981" : v >= 60 ? "#f59e0b" : "#ef4444");

/** Displays a score that was PRODUCED BY THE AI ENGINE. Never pass a value calculated in the UI. */
export function ScoreGauge({ value, size = 160, label = "Overall match" }: { value: number; size?: number; label?: string }) {
  return (
    <div className="relative mx-auto" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${value}%`}>
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart innerRadius="78%" outerRadius="100%" data={[{ value }]} startAngle={90} endAngle={-270}>
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} angleAxisId={0} />
          <RadialBar dataKey="value" cornerRadius={10} fill={fillFor(value)} background={{ fill: "#e2e8f0" }} angleAxisId={0} />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn("text-3xl font-bold tabular-nums", scoreTone(value))}>{value}%</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
