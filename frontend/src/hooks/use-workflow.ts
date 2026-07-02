"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiContext } from "@/hooks/use-api-context";
import {
  addWorkflowComment,
  approveWorkflow,
  delegateWorkflow,
  getInboxCount,
  getWorkflowByEntity,
  getWorkflowInstance,
  getWorkflowTimeline,
  listInbox,
  listWorkflowComments,
  reassignWorkflow,
  rejectWorkflow,
  returnWorkflow,
} from "@/lib/api/workflow";
import type { DelegatePayload, InboxFilters, ReassignPayload } from "@/types/workflow-instance";

export function useApprovalInbox(filters?: InboxFilters) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["workflow", "inbox", organizationId, filters ?? {}],
    queryFn: async () => (await listInbox(token!, organizationId, filters)).data,
    enabled: Boolean(token),
  });
}

export function useInboxCount() {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["workflow", "inbox", "count", organizationId],
    queryFn: async () => (await getInboxCount(token!, organizationId)).data,
    enabled: Boolean(token),
  });
}

export function useWorkflowInstance(id?: string) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["workflow", "instance", id, organizationId],
    queryFn: async () => (await getWorkflowInstance(token!, id!, organizationId)).data,
    enabled: Boolean(token && id),
  });
}

export function useWorkflowByEntity(entityType: string, entityId: string | number) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["workflow", "entity", entityType, entityId, organizationId],
    queryFn: async () => {
      const response = await getWorkflowByEntity(token!, entityType, entityId, organizationId);
      return response.data;
    },
    enabled: Boolean(token && entityId),
  });
}

export function useWorkflowComments(instanceId?: string) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["workflow", instanceId, "comments", organizationId],
    queryFn: async () => (await listWorkflowComments(token!, instanceId!, organizationId)).data,
    enabled: Boolean(token && instanceId),
  });
}

export function useWorkflowTimeline(instanceId?: string) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["workflow", instanceId, "timeline", organizationId],
    queryFn: async () => (await getWorkflowTimeline(token!, instanceId!, organizationId)).data,
    enabled: Boolean(token && instanceId),
  });
}

function invalidateWorkflowQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  organizationId?: number,
) {
  void queryClient.invalidateQueries({ queryKey: ["workflow", organizationId] });
  void queryClient.invalidateQueries({ queryKey: ["workflow", "inbox", organizationId] });
}

export function useWorkflowActions(instanceId: string) {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();

  const approve = useMutation({
    mutationFn: (comment?: string) => approveWorkflow(token!, instanceId, { comment }, organizationId),
    onSuccess: () => {
      toast.success("Approved");
      invalidateWorkflowQueries(queryClient, organizationId);
    },
    onError: () => toast.error("Unable to approve"),
  });

  const reject = useMutation({
    mutationFn: (payload: { reason: string; comment?: string }) =>
      rejectWorkflow(token!, instanceId, payload, organizationId),
    onSuccess: () => {
      toast.success("Rejected");
      invalidateWorkflowQueries(queryClient, organizationId);
    },
    onError: () => toast.error("Unable to reject"),
  });

  const returnForRevision = useMutation({
    mutationFn: (comment: string) => returnWorkflow(token!, instanceId, { comment }, organizationId),
    onSuccess: () => {
      toast.success("Returned for revision");
      invalidateWorkflowQueries(queryClient, organizationId);
    },
    onError: () => toast.error("Unable to return request"),
  });

  const delegate = useMutation({
    mutationFn: (payload: DelegatePayload) => delegateWorkflow(token!, instanceId, payload, organizationId),
    onSuccess: () => {
      toast.success("Delegation saved");
      invalidateWorkflowQueries(queryClient, organizationId);
    },
    onError: () => toast.error("Unable to delegate"),
  });

  const reassign = useMutation({
    mutationFn: (payload: ReassignPayload) => reassignWorkflow(token!, instanceId, payload, organizationId),
    onSuccess: () => {
      toast.success("Reassigned");
      invalidateWorkflowQueries(queryClient, organizationId);
    },
    onError: () => toast.error("Unable to reassign"),
  });

  const addComment = useMutation({
    mutationFn: (payload: { body: string; visibility: "public" | "internal" }) =>
      addWorkflowComment(token!, instanceId, payload, organizationId),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["workflow", instanceId, "comments", organizationId] });
    },
    onError: () => toast.error("Unable to add comment"),
  });

  return { approve, reject, returnForRevision, delegate, reassign, addComment };
}
