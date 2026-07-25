export type WorkflowStatusValue =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "ARCHIVED";

export type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "approved"
  | "rejected"
  | "submitted"
  | "commented"
  | "assigned"
  | "login"
  | "exported";

export interface ActivityEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
  action?: ActivityAction;
  entityType?: string;
  entityId?: string | number;
  entityLabel?: string;
  organizationId?: number;
  status?: "success" | "warning" | "error" | "neutral";
  link?: string;
}

export interface AuditRecord {
  id: string;
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}
