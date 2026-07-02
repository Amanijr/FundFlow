import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

import { SLAIndicator } from "@/components/workflow/sla-indicator";
import { WorkflowStatusBadge } from "@/components/workflow/workflow-status-badge";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/utils/format";
import type { InboxItem } from "@/types/workflow-instance";
import { cn } from "@/lib/utils";

interface WorkflowCardProps {
  item: InboxItem;
  onQuickApprove?: () => void;
  compact?: boolean;
  className?: string;
}

export function WorkflowCard({
  item,
  onQuickApprove,
  compact = false,
  className,
}: WorkflowCardProps) {
  const relativeTime = formatDistanceToNow(new Date(item.submittedAt), { addSuffix: true });

  return (
    <div
      className={cn(
        "rounded-md border border-border px-4 py-3 transition-colors hover:bg-muted/40",
        item.actionRequired && "border-l-2 border-l-stone-900",
        item.slaBreached && "border-l-red-600",
        className,
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("font-medium text-foreground", compact ? "text-sm" : "text-base")}>
              {item.title}
            </p>
            <WorkflowStatusBadge status={item.status} />
            <SLAIndicator
              slaDueAt={item.slaDueAt}
              slaStatus={item.slaStatus}
              slaBreached={item.slaBreached}
              compact
            />
          </div>
          <p className="text-xs text-muted-foreground">
            {item.requestor.name} · {item.module} · {relativeTime}
          </p>
          <p className="text-xs text-muted-foreground">
            Stage: {item.currentStageLabel}
            {item.amount != null && item.currency && (
              <> · {formatCurrency(item.amount, item.currency)}</>
            )}
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={item.href}>Review</Link>
          </Button>
          {item.actionRequired && onQuickApprove && (
            <Button size="sm" onClick={onQuickApprove}>
              Approve
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
