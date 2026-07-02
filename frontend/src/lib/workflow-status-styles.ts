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

export const WORKFLOW_STATUS_STYLES: Record<
  WorkflowInstanceStatus,
  { label: string; className: string; icon: LucideIcon }
> = {
  draft: { label: "Draft", className: "bg-muted text-muted-foreground", icon: FileEdit },
  submitted: { label: "Submitted", className: "bg-blue-50 text-blue-800", icon: Send },
  pending: { label: "Pending", className: "bg-amber-50 text-amber-800", icon: Clock },
  in_review: { label: "In review", className: "bg-stone-900 text-white", icon: Eye },
  waiting: { label: "Waiting", className: "bg-muted text-muted-foreground", icon: Pause },
  approved: { label: "Approved", className: "bg-emerald-50 text-emerald-800", icon: CheckCircle },
  partially_approved: {
    label: "Partially approved",
    className: "bg-amber-50 text-amber-800",
    icon: CheckCircle2,
  },
  rejected: { label: "Rejected", className: "bg-red-50 text-red-800", icon: XCircle },
  returned: { label: "Returned", className: "bg-orange-50 text-orange-800", icon: RotateCcw },
  cancelled: { label: "Cancelled", className: "bg-muted text-muted-foreground", icon: Ban },
  expired: { label: "Expired", className: "bg-red-50 text-red-800", icon: AlertTriangle },
  completed: { label: "Completed", className: "bg-emerald-50 text-emerald-800", icon: CheckCheck },
};
