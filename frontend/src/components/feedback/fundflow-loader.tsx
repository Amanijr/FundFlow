"use client";

import { cn } from "@/lib/utils";

const sizeMap = {
  sm: {
    mark: "h-8 w-8 rounded-md text-[11px]",
    bar: "w-16",
    gap: "gap-3",
    label: "text-[11px]",
  },
  md: {
    mark: "h-10 w-10 rounded-lg text-xs",
    bar: "w-24",
    gap: "gap-4",
    label: "text-xs",
  },
  lg: {
    mark: "h-12 w-12 rounded-lg text-sm",
    bar: "w-32",
    gap: "gap-5",
    label: "text-sm",
  },
} as const;

interface FundFlowLoaderProps {
  size?: keyof typeof sizeMap;
  label?: string;
  className?: string;
}

export function FundFlowLoader({ size = "md", label, className }: FundFlowLoaderProps) {
  const s = sizeMap[size];

  return (
    <div
      className={cn("loader-enter flex flex-col items-center", s.gap, className)}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      <div
        className={cn(
          "flex items-center justify-center border border-border bg-card font-nav font-bold tracking-tight text-foreground",
          s.mark,
        )}
      >
        F
      </div>

      <div className={cn("loader-track h-px overflow-hidden rounded-full bg-border", s.bar)}>
        <div className="loader-indeterminate h-full w-2/5 rounded-full bg-foreground" />
      </div>

      {label ? (
        <p className={cn("font-medium tracking-wide text-muted-foreground", s.label)}>{label}</p>
      ) : null}
    </div>
  );
}
