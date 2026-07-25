import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface ActivityTimelineSkeletonProps {
  rows?: number;
  className?: string;
}

export function ActivityTimelineSkeleton({ rows = 4, className }: ActivityTimelineSkeletonProps) {
  return (
    <ol className={cn("space-y-4", className)} aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="relative pl-6">
          {index < rows - 1 && (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" />
          )}
          <Skeleton className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-3/5" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </li>
      ))}
    </ol>
  );
}
