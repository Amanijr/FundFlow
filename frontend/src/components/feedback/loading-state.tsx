"use client";

import { FundFlowLoader } from "@/components/feedback/fundflow-loader";
import { PageSkeleton } from "@/components/feedback/page-skeleton";
import { cn } from "@/lib/utils";

type LoadingVariant = "brand" | "page" | "minimal";
type PageLayout = "list" | "detail" | "dashboard";

interface LoadingStateProps {
  className?: string;
  variant?: LoadingVariant;
  layout?: PageLayout;
  label?: string;
}

export function LoadingState({
  className,
  variant = "page",
  layout = "list",
  label,
}: LoadingStateProps) {
  if (variant === "brand") {
    return (
      <div
        className={cn(
          "flex min-h-screen items-center justify-center bg-background",
          className,
        )}
      >
        <FundFlowLoader size="lg" label={label ?? "Loading workspace…"} />
      </div>
    );
  }

  if (variant === "minimal") {
    return (
      <div className={cn("flex items-center justify-center py-10", className)}>
        <FundFlowLoader size="sm" label={label} />
      </div>
    );
  }

  return (
    <div className={cn("min-h-[40vh] py-2", className)}>
      <PageSkeleton layout={layout} />
    </div>
  );
}
