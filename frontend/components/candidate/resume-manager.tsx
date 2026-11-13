"use client";
import { useRef, useState } from "react";
import { CheckCircle2, Download, FileText, Loader2, RefreshCw, Trash2, UploadCloud, X } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { ErrorState } from "@/components/common/error-state";
import { useAsync } from "@/hooks/use-async";
import { candidateService } from "@/services/candidate.service";
import { toApiError } from "@/services/api";
import { ACCEPTED_RESUME_EXTENSIONS, ACCEPTED_RESUME_TYPES, MAX_RESUME_SIZE_MB } from "@/lib/config";
import { saveBlob } from "@/lib/download";
import { cn, formatDate, formatFileSize } from "@/lib/utils";
import type { Resume } from "@/types/candidate";

const PARSE_META = {
  UPLOADED: { label: "Uploaded — awaiting processing", variant: "info" },
  PARSING: { label: "Processing", variant: "warning" },
  PARSED: { label: "Processed", variant: "success" },
  FAILED: { label: "Processing failed", variant: "destructive" },
} as const;

export function validateResumeFile(file: File): string | null {
  const ext = `.${file.name.split(".").pop()?.toLowerCase() ?? ""}`;
  const typeOk = ACCEPTED_RESUME_TYPES.includes(file.type) || (file.type === "" && ACCEPTED_RESUME_EXTENSIONS.includes(ext));
  if (!ACCEPTED_RESUME_EXTENSIONS.includes(ext) || !typeOk) return "Unsupported file type. Please upload a PDF or DOCX file.";
  if (file.size === 0) return "This file is empty. Please choose a different file.";
  if (file.size > MAX_RESUME_SIZE_MB * 1024 * 1024) return `File is ${formatFileSize(file.size)}. The maximum allowed size is ${MAX_RESUME_SIZE_MB} MB.`;
  return null;
}

export function ResumeManager({ onChanged }: { onChanged?: () => void }) {
  const { data: resume, error, initialLoading, reload, setData } = useAsync(() => candidateService.getResume(), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [replacing, setReplacing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const uploading = progress !== null;

  const choose = (file?: File) => {
    if (!file) return;
    const err = validateResumeFile(file);
    setFileError(err);
    setSelected(err ? null : file);
  };

  const upload = async () => {
    if (!selected) return;
    setProgress(0);
    try {
      const saved = await candidateService.uploadResume(selected, setProgress);
      setData(() => saved as Resume | null);
      toast.success(replacing ? "Resume replaced" : "Resume uploaded");
      setSelected(null);
      setReplacing(false);
      onChanged?.();
    } catch (e) {
      const err = toApiError(e);
      setFileError(err.message);
      toast.error(err.message);
    } finally {
      setProgress(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const download = async () => {
    try {
      const { blob, fileName } = await candidateService.downloadResume(resume?.fileName);
      saveBlob(blob, fileName);
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  const remove = async () => {
    try {
      await candidateService.deleteResume();
      setData(() => null);
      toast.success("Resume deleted");
      onChanged?.();
    } catch (e) {
      toast.error(toApiError(e).message);
    }
  };

  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (initialLoading) return <Skeleton className="h-64 w-full" />;

  const showDropzone = !resume || replacing;
  const parse = resume ? PARSE_META[resume.parseStatus] : null;

  return (
    <div className="space-y-6">
      {resume && (
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Current resume</CardTitle>
              <CardDescription>Recruiters see this file when you apply to a job.</CardDescription>
            </div>
            {parse && <Badge variant={parse.variant}>{parse.label}</Badge>}
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 rounded-lg border bg-secondary/40 p-4 sm:flex-row sm:items-center">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground"><FileText className="size-6" /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{resume.fileName}</p>
                <p className="text-sm text-muted-foreground">{formatFileSize(resume.fileSize)} · Uploaded {formatDate(resume.uploadedAt)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={download}><Download /> Download</Button>
                <Button variant="outline" size="sm" onClick={() => setReplacing((r) => !r)}><RefreshCw /> {replacing ? "Cancel replace" : "Replace"}</Button>
                <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}><Trash2 /> Delete</Button>
              </div>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">Your resume is analysed by the backend after upload. Status shows here once processing completes.</p>
            <Button variant="ghost" size="sm" className="mt-1 -ml-2" onClick={reload}><RefreshCw /> Refresh status</Button>
          </CardContent>
        </Card>
      )}

      {showDropzone && (
        <Card>
          <CardHeader>
            <CardTitle>{resume ? "Replace resume" : "Upload your resume"}</CardTitle>
            <CardDescription>PDF or DOCX · up to {MAX_RESUME_SIZE_MB} MB</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); if (!uploading) choose(e.dataTransfer.files?.[0]); }}
              className={cn("flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors", dragging ? "border-primary bg-accent/50" : "border-input bg-secondary/30")}
            >
              <UploadCloud className="mb-3 size-10 text-muted-foreground" />
              <p className="font-medium">Drag &amp; drop your resume here</p>
              <p className="my-1 text-sm text-muted-foreground">or</p>
              <input ref={inputRef} type="file" className="sr-only" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-label="Choose resume file" onChange={(e) => choose(e.target.files?.[0])} disabled={uploading} />
              <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} disabled={uploading}>Browse files</Button>
            </div>

            {fileError && <p role="alert" className="flex items-start gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"><X className="mt-0.5 size-4 shrink-0" />{fileError}</p>}

            {selected && (
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  <FileText className="size-5 text-primary" />
                  <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{selected.name}</p><p className="text-xs text-muted-foreground">{formatFileSize(selected.size)}</p></div>
                  {!uploading && <button aria-label="Remove selected file" onClick={() => setSelected(null)} className="rounded p-1 hover:bg-secondary cursor-pointer"><X className="size-4" /></button>}
                </div>
                {uploading && (
                  <div className="mt-3 space-y-1.5">
                    <Progress value={progress} aria-label="Upload progress" />
                    <p className="text-xs text-muted-foreground">{progress === 100 ? "Finishing…" : `Uploading… ${progress}%`}</p>
                  </div>
                )}
                <div className="mt-3 flex gap-2">
                  <Button onClick={upload} disabled={uploading}>{uploading ? <Loader2 className="animate-spin" /> : <CheckCircle2 />} {resume ? "Replace resume" : "Upload resume"}</Button>
                  <Button variant="ghost" onClick={() => setSelected(null)} disabled={uploading}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <ConfirmDialog open={confirmDelete} onOpenChange={setConfirmDelete} destructive title="Delete your resume?" description="You won't be able to apply to jobs until you upload a new resume. Existing applications are not affected." confirmLabel="Delete resume" onConfirm={remove} />
    </div>
  );
}
