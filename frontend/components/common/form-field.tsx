import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

/** Label + control + validation message. Pass the `id` used by the control so the label is associated. */
export function FormField({
  id, label, error, hint, required, children, className,
}: { id: string; label: string; error?: string; hint?: string; required?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id}>
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </Label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
