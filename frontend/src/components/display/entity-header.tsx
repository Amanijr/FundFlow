import { StatusBadge } from "@/components/display/status-badge";
import type { WorkflowStatusValue } from "@/types/workflow";
import { cn } from "@/lib/utils";

interface EntityHeaderProps {
  title: string;
  status?: WorkflowStatusValue;
  metadata?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export function EntityHeader({ title, status, metadata, actions, className }: EntityHeaderProps) {
  return (
    <div className={cn("flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {status && <StatusBadge status={status} />}
        </div>
        {metadata && <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">{metadata}</div>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
