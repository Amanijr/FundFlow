import { StatusBadge } from "@/components/display/status-badge";
import type { WorkflowStatusValue } from "@/types/workflow";
import { cn } from "@/lib/utils";

export interface StatusCellProps {
  status: WorkflowStatusValue;
  className?: string;
}

export function StatusCell({ status, className }: StatusCellProps) {
  return <StatusBadge status={status} className={cn(className)} />;
}
