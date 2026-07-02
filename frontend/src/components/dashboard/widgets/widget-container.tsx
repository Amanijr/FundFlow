"use client";

import { RefreshCw } from "lucide-react";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

import type { WidgetStatus } from "../types";

interface WidgetContainerProps {
  id: string;
  title?: string;
  variant?: "kpi" | "chart" | "panel";
  status: WidgetStatus;
  errorMessage?: string;
  emptyMessage?: string;
  onRefresh?: () => void;
  className?: string;
  children: React.ReactNode;
}

function WidgetSkeleton({ variant }: { variant: "kpi" | "chart" | "panel" }) {
  if (variant === "kpi") {
    return (
      <div className="rounded-md border border-border bg-surface px-3 py-2.5">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="mt-2 h-6 w-32" />
        <Skeleton className="mt-2 h-3 w-20" />
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className="rounded-md border border-border bg-surface">
        <div className="border-b border-border px-4 py-2.5">
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="m-2 h-52 w-[calc(100%-1rem)]" />
      </div>
    );
  }

  return (
    <div className="rounded-md border border-border bg-surface p-4">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-3 h-20 w-full" />
    </div>
  );
}

export function WidgetContainer({
  id,
  title,
  variant = "panel",
  status,
  errorMessage = "Unable to load this widget.",
  emptyMessage = "No data available.",
  onRefresh,
  className,
  children,
}: WidgetContainerProps) {
  if (status === "loading") {
    return (
      <div className={className} aria-busy="true" aria-labelledby={title ? `${id}-title` : undefined}>
        <WidgetSkeleton variant={variant} />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={cn("rounded-md border border-border bg-surface p-4", className)}>
        <ErrorAlert message={errorMessage} />
        {onRefresh && (
          <Button type="button" variant="outline" size="sm" className="mt-3" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className={cn("rounded-md border border-border bg-surface p-4 text-sm text-muted-foreground", className)}>
        {emptyMessage}
      </div>
    );
  }

  if (variant === "kpi") {
    return (
      <div className={className} role="group" aria-label={title}>
        {children}
      </div>
    );
  }

  if (variant === "chart" && title) {
    return (
      <div className={className}>
        <Panel>
          <PanelHeader className="flex flex-row items-center justify-between space-y-0">
            <PanelTitle id={`${id}-title`}>{title}</PanelTitle>
            {onRefresh && (
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh} aria-label="Refresh chart">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </PanelHeader>
          <PanelContent>{children}</PanelContent>
        </Panel>
      </div>
    );
  }

  if (title) {
    return (
      <div className={className}>
        <Panel>
          <PanelHeader className="flex flex-row items-center justify-between space-y-0">
            <PanelTitle id={`${id}-title`}>{title}</PanelTitle>
            {onRefresh && (
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onRefresh} aria-label="Refresh widget">
                <RefreshCw className="h-4 w-4" />
              </Button>
            )}
          </PanelHeader>
          <PanelContent>{children}</PanelContent>
        </Panel>
      </div>
    );
  }

  return <div className={className}>{children}</div>;
}
