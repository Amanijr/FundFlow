import type { ActivityEvent } from "@/types/workflow";
import { cn } from "@/lib/utils";

import { TimelineEvent } from "./timeline-event";

interface ActivityTimelineProps {
  events: ActivityEvent[];
  className?: string;
}

export function ActivityTimeline({ events, className }: ActivityTimelineProps) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No activity yet.</p>;
  }

  return (
    <ol className={cn("space-y-4", className)}>
      {events.map((event, index) => (
        <TimelineEvent
          key={event.id}
          event={event}
          isLast={index === events.length - 1}
        />
      ))}
    </ol>
  );
}
