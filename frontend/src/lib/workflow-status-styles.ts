import {
  AlertTriangle,
  Ban,
  CheckCheck,
  CheckCircle,
  CheckCircle2,
  Clock,
  Eye,
  FileEdit,
  Pause,
  RotateCcw,
  Send,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import type { WorkflowInstanceStatus } from "@/types/workflow-instance";

/** Semantic token classes — readable in light and dark modes. */
export const WORKFLOW_STATUS_STYLES: Record<
  WorkflowInstanceStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground", icon: FileEdit },
  submitted: { label: "Submitted", className: "bg-info/15 text-info", icon: Send },
  pending: { label: "Pending", className: "bg-warning/15 text-warning", icon: Clock },
  in_review: {
    label: "In review",
    className: "bg-primary text-primary-foreground",
    icon: Eye,
  },
  waiting: { label: "Waiting", className: "bg-muted text-muted-foreground", icon: Pause },
  approved: { label: "Approved", className: "bg-success/15 text-success", icon: CheckCircle },
  partially_approved: {
    label: "Partially approved",
    className: "bg-warning/15 text-warning",
    icon: CheckCircle2,
  },
  rejected: { label: "Rejected", className: "bg-destructive/15 text-destructive", icon: XCircle },
  returned: { label: "Returned", className: "bg-warning/15 text-warning", icon: RotateCcw },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground", icon: Ban },
  expired: {
    label: "Expired",
    className: "bg-destructive/15 text-destructive",
    icon: AlertTriangle,
  },
  completed: { label: "Completed", className: "bg-success/15 text-success", icon: CheckCheck },
};
