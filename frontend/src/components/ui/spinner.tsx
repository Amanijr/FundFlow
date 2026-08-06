"use client";

import { DotPulse } from "ldrs/react";
import "ldrs/react/DotPulse.css";

import { cn } from "@/lib/utils";

const sizeMap = {
  sm: 18,
  default: 24,
  lg: 32,
} as const;

export interface SpinnerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizeMap;
  label?: string;
}

/** Inline spinner powered by ldrs (UI Ball) DotPulse. */
export function Spinner({
  size = "default",
  label = "Loading…",
  className,
  ...props
}: SpinnerProps) {
  return (
    <div
      role="status"
      className={cn("inline-flex items-center text-muted-foreground", className)}
      {...props}
    >
      <DotPulse size={sizeMap[size]} speed={1.2} color="currentColor" />
      <span className="sr-only">{label}</span>
    </div>
  );
}
