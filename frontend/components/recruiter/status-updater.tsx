"use client";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { applicationService } from "@/services/application.service";
import { toApiError } from "@/services/api";
import { APPLICATION_STATUS_META, type ApplicationStatus } from "@/constants/status";

interface Target {
  applicationId: string;
  candidateName: string;
}

/** Render-prop helper that performs status changes (with a confirmation for rejections). */
export function StatusUpdater({
  onUpdated, children,
}: { onUpdated: (applicationId: string, status: ApplicationStatus) => void; children: (request: (t: Target, status: ApplicationStatus) => void) => React.ReactNode }) {
  const [reject, setReject] = useState<Target | null>(null);

  const run = async (t: Target, status: ApplicationStatus) => {
    try {
      await applicationService.updateStatus(t.applicationId, status);
      onUpdated(t.applicationId, status);
      toast.success(`${t.candidateName} marked as ${APPLICATION_STATUS_META[status].label.toLowerCase()}`);
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  return (
    <>
      {children((t, status) => (status === "REJECTED" ? setReject(t) : run(t, status)))}
      <ConfirmDialog
        open={!!reject}
        onOpenChange={(o) => !o && setReject(null)}
        destructive
        title={`Reject ${reject?.candidateName}?`}
        description="The candidate will be notified that their application was not successful. You can change the status later."
        confirmLabel="Reject candidate"
        onConfirm={async () => {
          if (reject) await run(reject, "REJECTED");
          setReject(null);
        }}
      />
    </>
  );
}
