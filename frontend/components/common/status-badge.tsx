import { Badge } from "@/components/ui/badge";
import { APPLICATION_STATUS_META, RESUME_STATUS_META, SCREENING_STATUS_META, type ApplicationStatus } from "@/constants/status";
import type { ResumeStatus, ScreeningStatus } from "@/types/application";

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  const m = APPLICATION_STATUS_META[status];
  return <Badge variant={m.tone}>{m.label}</Badge>;
}
export function ResumeStatusBadge({ status }: { status: ResumeStatus }) {
  const m = RESUME_STATUS_META[status];
  return <Badge variant={m.tone}>{m.label}</Badge>;
}
export function ScreeningStatusBadge({ status }: { status: ScreeningStatus }) {
  const m = SCREENING_STATUS_META[status];
  return <Badge variant={m.tone}>{m.label}</Badge>;
}
