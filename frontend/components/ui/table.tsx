import * as React from "react";
import { cn } from "@/lib/utils";

function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="relative w-full overflow-x-auto">
      <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
    </div>
  );
}
const TableHeader = (p: React.ComponentProps<"thead">) => <thead {...p} className={cn("bg-secondary/60 [&_tr]:border-b", p.className)} />;
const TableBody = (p: React.ComponentProps<"tbody">) => <tbody {...p} className={cn("[&_tr:last-child]:border-0", p.className)} />;
const TableRow = (p: React.ComponentProps<"tr">) => <tr {...p} className={cn("border-b transition-colors hover:bg-secondary/40", p.className)} />;
const TableHead = (p: React.ComponentProps<"th">) => (
  <th {...p} className={cn("h-10 px-4 text-left align-middle text-xs font-semibold tracking-wide text-muted-foreground uppercase whitespace-nowrap", p.className)} />
);
const TableCell = (p: React.ComponentProps<"td">) => <td {...p} className={cn("px-4 py-3 align-middle", p.className)} />;
export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
