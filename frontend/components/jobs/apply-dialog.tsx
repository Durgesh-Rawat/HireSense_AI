"use client";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Job } from "@/types/job";

export function ApplyDialog({
  job, loading, onCancel, onConfirm,
}: { job: Job | null; loading: boolean; onCancel: () => void; onConfirm: () => void }) {
  return (
    <Dialog open={Boolean(job)} onOpenChange={(o) => !o && !loading && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Apply to {job?.title}?</DialogTitle>
          <DialogDescription>
            Your profile and current resume will be shared with {job?.companyName}. You can track the application status from the Applications page.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onCancel} disabled={loading}>Cancel</Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading && <Loader2 className="animate-spin" />} Submit application
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
