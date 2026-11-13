import { FlaskConical } from "lucide-react";
import { USE_MOCK } from "@/lib/config";
import { Badge } from "@/components/ui/badge";

/** Small inline label for demo-only data. Renders nothing when real API mode is on. */
export function DemoBadge({ label = "Demo data" }: { label?: string }) {
  if (!USE_MOCK) return null;
  return (
    <Badge variant="warning" className="gap-1">
      <FlaskConical /> {label}
    </Badge>
  );
}

export function DemoBanner({ children }: { children?: React.ReactNode }) {
  if (!USE_MOCK) return null;
  return (
    <div className="mb-4 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
      <FlaskConical className="mt-0.5 size-4 shrink-0" />
      <p>{children ?? "You are viewing demo data. Figures and AI results are fixed sample values, not real output."}</p>
    </div>
  );
}
