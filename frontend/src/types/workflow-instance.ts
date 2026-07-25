export type WorkflowInstanceStatus =
  | "draft"
  | "submitted"
  | "pending"
  | "in_review"
  | "waiting"
  | "approved"
  | "partially_approved"
  | "rejected"
  | "returned"
  | "cancelled"
  | "expired"
  | "completed";

export type WorkflowStepStatus = "pending" | "active" | "completed" | "skipped" | "rejected";

export type InboxPriority = "low" | "normal" | "high" | "critical";

export type WorkflowSLAStatus = "on_track" | "warning" | "breached";

export interface WorkflowAssignee {
  userId: number;
  name: string;
  role?: string;
  delegatedFrom?: {
    userId: number;
    name: string;
    until?: string;
  };
}

export interface WorkflowStep {
  id: string;
  label: string;
  strategy: "single" | "sequential" | "parallel" | "conditional";
  status: WorkflowStepStatus;
  assignees?: WorkflowAssignee[];
  completedAt?: string;
  completedBy?: string;
  parallelGroup?: string;
  conditionLabel?: string;
}

export interface WorkflowSLA {
  stepId: string;
  dueAt: string;
  warningAt?: string;
  breachedAt?: string;
  percentElapsed?: number;
  status: WorkflowSLAStatus;
}

export interface WorkflowActions {
  canApprove: boolean;
  canReject: boolean;
  canReturn: boolean;
  canDelegate: boolean;
  canReassign: boolean;
  canCancel: boolean;
  canComment: boolean;
}

export interface WorkflowInstance {
  id: string;
  workflowType: string;
  entityType: string;
  entityId: string | number;
  title: string;
  summary?: string;
  status: WorkflowInstanceStatus;
  currentStepId: string;
  currentStageLabel: string;
  steps: WorkflowStep[];
  sla?: WorkflowSLA;
  actions: WorkflowActions;
  requestor: {
    id: number;
    name: string;
  };
  submittedAt?: string;
  amount?: number;
  currency?: string;
  organizationId: number;
}

export interface InboxItem {
  id: string;
  workflowInstanceId: string;
  title: string;
  summary?: string;
  module: string;
  entityType: string;
  entityId: string | number;
  requestor: {
    id: number;
    name: string;
  };
  submittedAt: string;
  currentStage: string;
  currentStageLabel: string;
  status: WorkflowInstanceStatus;
  priority: InboxPriority;
  slaDueAt?: string;
  slaBreached?: boolean;
  slaStatus?: WorkflowSLAStatus;
  actionRequired: boolean;
  href: string;
  amount?: number;
  currency?: string;
}

export interface InboxListResponse {
  items: InboxItem[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface InboxFilters {
  status?: "pending" | "action_required" | "all";
  entityType?: string;
  priority?: InboxPriority;
  module?: string;
  from?: string;
  to?: string;
  q?: string;
  sort?: "newest" | "oldest" | "priority" | "sla";
  page?: number;
  size?: number;
}

export interface WorkflowComment {
  id: string;
  author: { id: number; name: string };
  body: string;
  createdAt: string;
  visibility: "public" | "internal";
}

export interface WorkflowTimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
  action?: string;
  status?: "success" | "warning" | "error" | "neutral";
}

export interface DelegatePayload {
  delegateUserId: number;
  effectiveFrom: string;
  effectiveTo: string;
  reason: string;
}

export interface ReassignPayload {
  assigneeUserId: number;
  reason: string;
}
