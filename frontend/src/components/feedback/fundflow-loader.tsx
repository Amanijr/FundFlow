"use client";

import { Ring } from "ldrs/react";
import "ldrs/react/Ring.css";

import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { ring: 28, stroke: 3, gap: "gap-3", label: "text-[11px]" },
  md: { ring: 40, stroke: 3.5, gap: "gap-4", label: "text-xs" },
  lg: { ring: 52, stroke: 4, gap: "gap-5", label: "text-sm" },
} as const;

interface FundFlowLoaderProps {
  size?: keyof typeof sizeMap;
  label?: string;
  className?: string;
}

/** Full-page / section loader powered by ldrs (UI Ball) Ring. */
export function FundFlowLoader({ size = "md", label, className }: FundFlowLoaderProps) {
  const s = sizeMap[size];

  return (
    <div
      className={cn("loader-enter flex flex-col items-center text-foreground", s.gap, className)}
      role="status"
      aria-live="polite"
      aria-label={label ?? "Loading"}
    >
      <Ring
        size={s.ring}
        stroke={s.stroke}
        speed={1.6}
        color="currentColor"
        bgOpacity={0.12}
      />

      {label ? (
        <p className={cn("font-medium tracking-wide text-muted-foreground", s.label)}>{label}</p>
      ) : null}
    </div>
  );
}
