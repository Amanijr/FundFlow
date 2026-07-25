"use client";

import { LoadingState } from "@/components/feedback/loading-state";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";
import { ApprovalActions } from "@/components/workflow/approval-actions";
import { CommentPanel } from "@/components/workflow/comment-panel";
import { SLAIndicator } from "@/components/workflow/sla-indicator";
import { WorkflowDiagram } from "@/components/workflow/workflow-diagram";
import { WorkflowStatusBadge } from "@/components/workflow/workflow-status-badge";
import { WorkflowTimelineView } from "@/components/workflow/workflow-timeline-view";
import {
  useWorkflowActions,
  useWorkflowByEntity,
  useWorkflowComments,
  useWorkflowTimeline,
} from "@/hooks/use-workflow";
import { cn } from "@/lib/utils";

interface WorkflowDetailViewProps {
  entityType: string;
  entityId: string | number;
  className?: string;
}

export function WorkflowDetailView({ entityType, entityId, className }: WorkflowDetailViewProps) {
  const workflowQuery = useWorkflowByEntity(entityType, entityId);
  const instanceId = workflowQuery.data?.id;
  const commentsQuery = useWorkflowComments(instanceId);
  const timelineQuery = useWorkflowTimeline(instanceId);
  const actions = useWorkflowActions(instanceId ?? "pending");

  if (workflowQuery.isLoading) {
    return <LoadingState />;
  }

  if (workflowQuery.isError || !workflowQuery.data) {
    return null;
  }

  const instance = workflowQuery.data;

  const isSubmitting =
    actions.approve.isPending ||
    actions.reject.isPending ||
    actions.returnForRevision.isPending ||
    actions.delegate.isPending ||
    actions.reassign.isPending;

  return (
    <Panel className={cn(className)}>
      <PanelHeader>
        <div className="flex flex-wrap items-center gap-2">
          <PanelTitle>Approval workflow</PanelTitle>
          <WorkflowStatusBadge status={instance.status} />
          <SLAIndicator sla={instance.sla} />
        </div>
      </PanelHeader>
      <PanelContent className="space-y-6">
        <WorkflowDiagram
          steps={instance.steps}
          currentStepId={instance.currentStepId}
          variant="horizontal"
          className="hidden md:block"
        />
        <WorkflowDiagram
          steps={instance.steps}
          currentStepId={instance.currentStepId}
          variant="vertical"
          className="md:hidden"
        />

        <ApprovalActions
          instance={instance}
          isSubmitting={isSubmitting}
          onApprove={async (comment) => {
            await actions.approve.mutateAsync(comment);
          }}
          onReject={async (reason) => {
            await actions.reject.mutateAsync({ reason });
          }}
          onReturn={async (comment) => {
            await actions.returnForRevision.mutateAsync(comment);
          }}
          onDelegate={async (payload) => {
            await actions.delegate.mutateAsync(payload);
          }}
          onReassign={async (payload) => {
            await actions.reassign.mutateAsync(payload);
          }}
        />

        <CommentPanel
          comments={commentsQuery.data ?? []}
          canComment={instance.actions.canComment}
          isSubmitting={actions.addComment.isPending}
          onAddComment={async (body, visibility) => {
            await actions.addComment.mutateAsync({ body, visibility });
          }}
        />

        {timelineQuery.data && timelineQuery.data.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-foreground">History</h3>
            <WorkflowTimelineView events={timelineQuery.data} />
          </div>
        )}
      </PanelContent>
    </Panel>
  );
}
