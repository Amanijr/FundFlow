import { cn } from "@/lib/utils";
import { formatPresenceStatus } from "@/lib/session/labels";
import type { UserPresenceStatus } from "@/types/session";

const statusColor: Record<UserPresenceStatus, string> = {
  online: "bg-success",
  away: "bg-warning",
  busy: "bg-danger",
  offline: "bg-muted-foreground/50",
};

interface StatusIndicatorProps {
  status: UserPresenceStatus;
  showLabel?: boolean;
  className?: string;
}

export function StatusIndicator({ status, showLabel = false, className }: StatusIndicatorProps) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", statusColor[status])} aria-hidden />
      {showLabel && <span>{formatPresenceStatus(status)}</span>}
    </span>
  );
}
