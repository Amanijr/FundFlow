import type { WorkflowTimelineEvent } from "@/types/workflow-instance";

import { ActivityTimeline } from "./activity-timeline";

interface WorkflowTimelineViewProps {
  events: WorkflowTimelineEvent[];
  className?: string;
}

export function WorkflowTimelineView({ events, className }: WorkflowTimelineViewProps) {
  const mapped = events.map((event) => ({
    id: event.id,
    title: event.title,
    description: event.description,
    timestamp: event.timestamp,
    actor: event.actor,
    action: event.action as import("@/types/workflow").ActivityAction | undefined,
    status: event.status,
  }));

  return <ActivityTimeline events={mapped} className={className} />;
}
