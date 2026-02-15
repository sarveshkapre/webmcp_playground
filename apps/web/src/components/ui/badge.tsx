import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border border-[var(--line)] bg-[var(--surface-2)] px-2.5 py-1 text-xs font-semibold text-[var(--muted)]",
        className
      )}
      {...props}
    />
  );
}
