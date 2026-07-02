import { apiRequest } from "@/lib/api/client";
import type {
  DelegatePayload,
  InboxFilters,
  InboxListResponse,
  ReassignPayload,
  WorkflowComment,
  WorkflowInstance,
  WorkflowTimelineEvent,
} from "@/types/workflow-instance";

function buildInboxQuery(filters?: InboxFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.status) params.set("status", filters.status);
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.q) params.set("q", filters.q);
  if (filters.sort) params.set("sort", filters.sort);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.size != null) params.set("size", String(filters.size));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listInbox(token: string, organizationId?: number, filters?: InboxFilters) {
  return apiRequest<InboxListResponse>(
    `/api/v1/workflow/inbox${buildInboxQuery(filters)}`,
    { token, organizationId },
  );
}

export function getInboxCount(token: string, organizationId?: number) {
  return apiRequest<number>("/api/v1/workflow/inbox/count", { token, organizationId });
}

export function getWorkflowInstance(token: string, id: string, organizationId?: number) {
  return apiRequest<WorkflowInstance>(`/api/v1/workflow/instances/${id}`, { token, organizationId });
}

export function getWorkflowByEntity(
  token: string,
  entityType: string,
  entityId: string | number,
  organizationId?: number,
) {
  return apiRequest<WorkflowInstance>(
    `/api/v1/workflow/instances?entityType=${entityType}&entityId=${entityId}`,
    { token, organizationId },
  );
}

export function listWorkflowComments(token: string, instanceId: string, organizationId?: number) {
  return apiRequest<WorkflowComment[]>(
    `/api/v1/workflow/instances/${instanceId}/comments`,
    { token, organizationId },
  );
}

export function addWorkflowComment(
  token: string,
  instanceId: string,
  body: { body: string; visibility: "public" | "internal" },
  organizationId?: number,
) {
  return apiRequest<WorkflowComment>(`/api/v1/workflow/instances/${instanceId}/comments`, {
    method: "POST",
    token,
    organizationId,
    body,
  });
}

export function getWorkflowTimeline(token: string, instanceId: string, organizationId?: number) {
  return apiRequest<WorkflowTimelineEvent[]>(
    `/api/v1/workflow/instances/${instanceId}/timeline`,
    { token, organizationId },
  );
}

export function approveWorkflow(
  token: string,
  instanceId: string,
  body?: { comment?: string },
  organizationId?: number,
) {
  return apiRequest<WorkflowInstance>(`/api/v1/workflow/instances/${instanceId}/approve`, {
    method: "POST",
    token,
    organizationId,
    body,
  });
}

export function rejectWorkflow(
  token: string,
  instanceId: string,
  body: { reason: string; comment?: string },
  organizationId?: number,
) {
  return apiRequest<WorkflowInstance>(`/api/v1/workflow/instances/${instanceId}/reject`, {
    method: "POST",
    token,
    organizationId,
    body,
  });
}

export function returnWorkflow(
  token: string,
  instanceId: string,
  body: { comment: string },
  organizationId?: number,
) {
  return apiRequest<WorkflowInstance>(`/api/v1/workflow/instances/${instanceId}/return`, {
    method: "POST",
    token,
    organizationId,
    body,
  });
}

export function delegateWorkflow(
  token: string,
  instanceId: string,
  body: DelegatePayload,
  organizationId?: number,
) {
  return apiRequest<WorkflowInstance>(`/api/v1/workflow/instances/${instanceId}/delegate`, {
    method: "POST",
    token,
    organizationId,
    body,
  });
}

export function reassignWorkflow(
  token: string,
  instanceId: string,
  body: ReassignPayload,
  organizationId?: number,
) {
  return apiRequest<WorkflowInstance>(`/api/v1/workflow/instances/${instanceId}/reassign`, {
    method: "POST",
    token,
    organizationId,
    body,
  });
}

export {
  approveMockWorkflow,
  delegateMockWorkflow,
  getMockInbox,
  getMockInboxCount,
  getMockWorkflowByEntity,
  getMockWorkflowComments,
  getMockWorkflowInstance,
  getMockWorkflowTimeline,
  addMockWorkflowComment,
  rejectMockWorkflow,
  reassignMockWorkflow,
  returnMockWorkflow,
} from "@/lib/mock/workflow-store";
