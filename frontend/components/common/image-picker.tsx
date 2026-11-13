"use client";
import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { toApiError } from "@/services/api";

const MAX_MB = 2;

/** Avatar / logo picker. `onUpload` receives the validated file and must resolve to the stored image URL. */
export function ImagePicker({
  name, src, onUploaded, upload, label = "Change photo", rounded = true,
}: { name: string; src?: string | null; onUploaded: (url: string) => void; upload: (file: File) => Promise<string>; label?: string; rounded?: boolean }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handle = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error("Please choose an image file (PNG, JPG or WebP).");
    if (file.size > MAX_MB * 1024 * 1024) return toast.error(`Image must be smaller than ${MAX_MB} MB.`);
    setBusy(true);
    try {
      onUploaded(await upload(file));
      toast.success("Image updated");
    } catch (e) {
      toast.error(toApiError(e).message);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar name={name || "?"} src={src} className={rounded ? "size-20 text-xl" : "size-20 rounded-xl text-xl"} />
      <div>
        <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" aria-label={label} onChange={(e) => handle(e.target.files?.[0])} />
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="animate-spin" /> : <Camera />} {label}
        </Button>
        <p className="mt-1.5 text-xs text-muted-foreground">PNG, JPG or WebP · max {MAX_MB} MB</p>
      </div>
    </div>
  );
}
