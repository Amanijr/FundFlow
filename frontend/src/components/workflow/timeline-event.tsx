import Link from "next/link";
import { format } from "date-fns";

import type { ActivityEvent } from "@/types/workflow";
import { cn } from "@/lib/utils";

interface TimelineEventProps {
  event: ActivityEvent;
  isLast?: boolean;
}

const STATUS_DOT: Record<NonNullable<ActivityEvent["status"]>, string> = {
  success: "border-emerald-600",
  warning: "border-amber-500",
  error: "border-red-600",
  neutral: "border-primary",
};

export function TimelineEvent({ event, isLast = false }: TimelineEventProps) {
  const dotClass = event.status ? STATUS_DOT[event.status] : "border-primary";

  const body = (
    <div className="space-y-1">
      <p className="text-sm font-medium text-foreground">{event.title}</p>
      {event.description && <p className="text-sm text-muted-foreground">{event.description}</p>}
      <p className="text-xs text-muted-foreground">
        {format(new Date(event.timestamp), "MMM d, yyyy h:mm a")}
        {event.actor ? ` · ${event.actor}` : ""}
      </p>
      {event.link && (
        <span className="text-xs font-medium text-primary">View details</span>
      )}
    </div>
  );

  return (
    <li className="relative pl-6">
      {!isLast && (
        <span className="absolute left-[7px] top-4 h-full w-px bg-border" aria-hidden />
      )}
      <span
        className={cn(
          "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-surface",
          dotClass,
        )}
      />
      {event.link ? (
        <Link href={event.link} className="block rounded-md transition-colors hover:bg-muted/40">
          {body}
        </Link>
      ) : (
        body
      )}
    </li>
  );
}
