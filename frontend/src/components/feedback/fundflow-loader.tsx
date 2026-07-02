"use client";

import { cn } from "@/lib/utils";

const sizeMap = {
  sm: { box: "h-10 w-10", logo: "h-5 w-5 text-[10px]", ring: "inset-0", dot: "h-1 w-1" },
  md: { box: "h-14 w-14", logo: "h-7 w-7 text-xs", ring: "inset-0", dot: "h-1.5 w-1.5" },
  lg: { box: "h-20 w-20", logo: "h-10 w-10 text-sm", ring: "-inset-1", dot: "h-2 w-2" },
} as const;

interface FundFlowLoaderProps {
  size?: keyof typeof sizeMap;
  label?: string;
  className?: string;
}

export function FundFlowLoader({ size = "md", label, className }: FundFlowLoaderProps) {
  const s = sizeMap[size];

  return (
    <div className={cn("loader-fade-in flex flex-col items-center gap-4", className)}>
      <div className={cn("relative", s.box)} role="status" aria-label={label ?? "Loading"}>
        {/* Flow lines — subtle data-stream motif */}
        <div className="pointer-events-none absolute -left-6 top-1/2 flex -translate-y-1/2 flex-col gap-1 opacity-40">
          <span className="loader-flow-line h-px w-4 bg-primary/60" style={{ animationDelay: "0ms" }} />
          <span className="loader-flow-line h-px w-6 bg-primary/80" style={{ animationDelay: "150ms" }} />
          <span className="loader-flow-line h-px w-3 bg-primary/50" style={{ animationDelay: "300ms" }} />
        </div>
        <div className="pointer-events-none absolute -right-6 top-1/2 flex -translate-y-1/2 flex-col gap-1 opacity-40">
          <span className="loader-flow-line-reverse h-px w-5 bg-primary/70" style={{ animationDelay: "100ms" }} />
          <span className="loader-flow-line-reverse h-px w-3 bg-primary/50" style={{ animationDelay: "250ms" }} />
          <span className="loader-flow-line-reverse h-px w-6 bg-primary/80" style={{ animationDelay: "400ms" }} />
        </div>

        {/* Outer pulse ring */}
        <div className={cn("absolute rounded-full border border-primary/15 loader-pulse-ring", s.ring)} />

        {/* Spinning arc */}
        <div
          className={cn(
            "absolute rounded-full border-2 border-transparent border-t-primary border-r-primary/30 loader-spin",
            s.ring,
          )}
        />

        {/* Counter-spin inner arc */}
        <div
          className={cn(
            "absolute inset-1 rounded-full border-2 border-transparent border-b-primary/40 loader-spin-reverse",
          )}
        />

        {/* Brand mark */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            className={cn(
              "flex items-center justify-center rounded-sm bg-primary/10 font-bold text-primary loader-logo-pulse",
              s.logo,
            )}
          >
            C
          </span>
        </div>

        {/* Orbiting dot */}
        <div className="absolute inset-0 loader-orbit">
          <div className={cn("absolute left-1/2 top-0 -translate-x-1/2 rounded-full bg-primary shadow-sm", s.dot)} />
        </div>
      </div>

      {label && (
        <p className="loader-label-fade text-sm text-muted-foreground" aria-live="polite">
          {label}
        </p>
      )}
    </div>
  );
}
