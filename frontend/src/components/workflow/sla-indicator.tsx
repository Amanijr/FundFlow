import { formatDistanceToNow } from "date-fns";

import type { WorkflowSLA, WorkflowSLAStatus } from "@/types/workflow-instance";
import { cn } from "@/lib/utils";

interface SLAIndicatorProps {
  sla?: WorkflowSLA;
  slaDueAt?: string;
  slaStatus?: WorkflowSLAStatus;
  slaBreached?: boolean;
  compact?: boolean;
  className?: string;
}

function resolveStatus(props: SLAIndicatorProps): WorkflowSLAStatus {
  if (props.sla?.status) return props.sla.status;
  if (props.slaStatus) return props.slaStatus;
  if (props.slaBreached) return "breached";
  return "on_track";
}

function resolveDueAt(props: SLAIndicatorProps): string | undefined {
  return props.sla?.dueAt ?? props.slaDueAt;
}

export function SLAIndicator(props: SLAIndicatorProps) {
  const { compact = false, className } = props;
  const status = resolveStatus(props);
  const dueAt = resolveDueAt(props);

  if (!dueAt) return null;

  const dueDate = new Date(dueAt);
  const relative = formatDistanceToNow(dueDate, { addSuffix: true });

  const label =
    status === "breached"
      ? `Overdue ${relative.replace("in ", "")}`
      : status === "warning"
        ? `Due ${relative}`
        : `Due ${relative}`;

  const styles = {
    on_track: "bg-muted text-muted-foreground",
    warning: "bg-amber-50 text-amber-800",
    breached: "bg-red-50 text-red-800",
  }[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        styles,
        className,
      )}
      aria-label={`SLA ${status}: ${label}`}
    >
      {label}
    </span>
  );
}
