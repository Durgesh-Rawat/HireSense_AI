import Link from "next/link";
import { ScanSearch } from "lucide-react";
import { SITE } from "@/constants/site";
import { cn } from "@/lib/utils";

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <ScanSearch className="size-4.5" />
      </span>
      <span className="text-lg">{SITE.name}</span>
    </Link>
  );
}
