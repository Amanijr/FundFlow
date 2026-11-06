import * as React from "react";

import { cn } from "@/lib/utils";

/** Flat bordered surface for ERP data panels — no shadow, compact padding. */
export function Panel({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-card)] border border-border bg-surface text-foreground",
        className,
      )}
      {...props}
    />
  );
}

export function PanelHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-[var(--space-3)] border-b border-border px-[var(--layout-card-padding)] py-[var(--space-3)]",
        className,
      )}
      {...props}
    />
  );
}

export function PanelTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("text-card-heading", className)} {...props} />;
}

export function PanelDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-supporting", className)} {...props} />;
}

export function PanelContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-[var(--layout-card-padding)] py-[var(--layout-card-padding-compact)]", className)}
      {...props}
    />
  );
}
