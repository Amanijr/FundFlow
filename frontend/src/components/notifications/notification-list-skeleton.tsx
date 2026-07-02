import { Skeleton } from "@/components/ui/skeleton";

export function NotificationListSkeleton() {
  return (
    <div className="space-y-2 px-2 py-1">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex gap-3 px-1 py-2">
          <Skeleton className="h-4 w-4 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-2.5 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
