import { WORKFLOW_STATUS_STYLES } from "@/lib/workflow-status-styles";
import type { WorkflowInstanceStatus } from "@/types/workflow-instance";
import { cn } from "@/lib/utils";

interface WorkflowStatusBadgeProps {
  status: WorkflowInstanceStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
  className?: string;
}

export function WorkflowStatusBadge({
  status,
  size = "sm",
  showIcon = true,
  className,
}: WorkflowStatusBadgeProps) {
  const config = WORKFLOW_STATUS_STYLES[status];
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        config.className,
        className,
      )}
    >
      {showIcon && <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} aria-hidden />}
      {config.label}
    </span>
  );
}
