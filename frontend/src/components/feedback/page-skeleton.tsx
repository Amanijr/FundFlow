"use client";

import { cn } from "@/lib/utils";

function Shimmer({ className }: { className?: string }) {
  return <div className={cn("skeleton-shimmer rounded-sm", className)} />;
}

interface PageSkeletonProps {
  layout?: "list" | "detail" | "dashboard";
  className?: string;
}

export function PageSkeleton({ layout = "list", className }: PageSkeletonProps) {
  if (layout === "dashboard") {
    return (
      <div className={cn("loader-fade-in space-y-4", className)}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Shimmer className="h-6 w-44" />
            <Shimmer className="h-3.5 w-56" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-md border border-border p-3" style={{ animationDelay: `${i * 60}ms` }}>
              <Shimmer className="mb-2 h-3 w-20" />
              <Shimmer className="h-6 w-24" />
            </div>
          ))}
        </div>
        <div className="grid gap-3 lg:grid-cols-2">
          <div className="rounded-md border border-border p-3">
            <Shimmer className="mb-3 h-4 w-32" />
            <Shimmer className="h-40 w-full rounded-md" />
          </div>
          <div className="rounded-md border border-border p-3">
            <Shimmer className="mb-3 h-4 w-28" />
            <Shimmer className="h-40 w-full rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (layout === "detail") {
    return (
      <div className={cn("loader-fade-in space-y-4", className)}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <Shimmer className="h-3 w-32" />
            <Shimmer className="h-6 w-52" />
            <Shimmer className="h-3.5 w-72" />
          </div>
          <div className="flex gap-2">
            <Shimmer className="h-9 w-20" />
            <Shimmer className="h-9 w-24" />
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-md border border-border p-3 skeleton-row-in" style={{ animationDelay: `${i * 80}ms` }}>
              <Shimmer className="mb-2 h-3 w-16" />
              <Shimmer className="h-5 w-28" />
            </div>
          ))}
        </div>
        <div className="rounded-md border border-border p-4">
          <Shimmer className="mb-3 h-4 w-36" />
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex justify-between gap-4 skeleton-row-in" style={{ animationDelay: `${i * 50}ms` }}>
                <Shimmer className="h-3.5 w-28" />
                <Shimmer className="h-3.5 w-40" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("loader-fade-in space-y-4", className)}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Shimmer className="h-6 w-40" />
          <Shimmer className="h-3.5 w-64" />
        </div>
        <Shimmer className="h-9 w-28" />
      </div>
      <div className="rounded-md border border-border px-3 py-2">
        <div className="flex gap-2">
          <Shimmer className="h-8 flex-1 max-w-xs" />
          <Shimmer className="h-8 w-24" />
        </div>
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        <div className="border-b border-border bg-muted/30 px-3 py-2">
          <div className="flex gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <Shimmer key={i} className="h-3.5 w-16" />
            ))}
          </div>
        </div>
        {Array.from({ length: 7 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 border-b border-border px-3 py-2.5 last:border-0 skeleton-row-in"
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <Shimmer className="h-3.5 w-1/4" />
            <Shimmer className="h-3.5 w-1/5" />
            <Shimmer className="hidden h-3.5 w-1/6 sm:block" />
            <Shimmer className="ml-auto h-3.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}
