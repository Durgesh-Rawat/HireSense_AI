import { cn } from "@/lib/utils";

export function AuthCard({ title, description, children, footer, className }: { title: string; description?: string; children: React.ReactNode; footer?: React.ReactNode; className?: string }) {
  return (
    <div className={cn("w-full max-w-md", className)}>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      {description && <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-6">{children}</div>
      {footer && <div className="mt-6 text-center text-sm text-muted-foreground">{footer}</div>}
    </div>
  );
}

export function FormAlert({ message, tone = "error" }: { message?: string | null; tone?: "error" | "info" }) {
  if (!message) return null;
  return (
    <div role="alert" className={cn("rounded-lg border px-3 py-2.5 text-sm", tone === "error" ? "border-red-200 bg-red-50 text-red-700" : "border-sky-200 bg-sky-50 text-sky-800")}>
      {message}
    </div>
  );
}
