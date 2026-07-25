"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DelegationDialog } from "@/components/workflow/delegation-dialog";
import type { WorkflowInstance } from "@/types/workflow-instance";

interface ApprovalActionsProps {
  instance: WorkflowInstance;
  onApprove: (comment?: string) => Promise<void>;
  onReject: (reason: string, comment?: string) => Promise<void>;
  onReturn: (comment: string) => Promise<void>;
  onDelegate: (payload: {
    delegateUserId: number;
    effectiveFrom: string;
    effectiveTo: string;
    reason: string;
  }) => Promise<void>;
  onReassign: (payload: { assigneeUserId: number; reason: string }) => Promise<void>;
  isSubmitting?: boolean;
}

export function ApprovalActions({
  instance,
  onApprove,
  onReject,
  onReturn,
  onDelegate,
  onReassign,
  isSubmitting = false,
}: ApprovalActionsProps) {
  const { actions } = instance;
  const [rejectOpen, setRejectOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [reassignOpen, setReassignOpen] = useState(false);
  const [delegateOpen, setDelegateOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [returnComment, setReturnComment] = useState("");
  const [reassignUserId, setReassignUserId] = useState("2");
  const [reassignReason, setReassignReason] = useState("");

  const hasActions =
    actions.canApprove ||
    actions.canReject ||
    actions.canReturn ||
    actions.canDelegate ||
    actions.canReassign;

  if (!hasActions) return null;

  return (
    <div className="flex flex-wrap gap-2" role="toolbar" aria-label="Approval actions">
      {actions.canApprove && (
        <Button
          type="button"
          size="sm"
          disabled={isSubmitting}
          onClick={() => void onApprove()}
        >
          Approve
        </Button>
      )}
      {actions.canReject && (
        <Button
          type="button"
          size="sm"
          variant="destructive"
          disabled={isSubmitting}
          onClick={() => setRejectOpen(true)}
        >
          Reject
        </Button>
      )}
      {actions.canReturn && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setReturnOpen(true)}
        >
          Return
        </Button>
      )}
      {actions.canDelegate && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setDelegateOpen(true)}
        >
          Delegate
        </Button>
      )}
      {actions.canReassign && (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isSubmitting}
          onClick={() => setReassignOpen(true)}
        >
          Reassign
        </Button>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject request</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Textarea
              id="reject-reason"
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Explain why this request is rejected"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || isSubmitting}
              onClick={() =>
                void onReject(rejectReason.trim()).then(() => {
                  setRejectOpen(false);
                  setRejectReason("");
                })
              }
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={returnOpen} onOpenChange={setReturnOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return for revision</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="return-comment">Comment</Label>
            <Textarea
              id="return-comment"
              value={returnComment}
              onChange={(event) => setReturnComment(event.target.value)}
              placeholder="What needs to be revised?"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!returnComment.trim() || isSubmitting}
              onClick={() =>
                void onReturn(returnComment.trim()).then(() => {
                  setReturnOpen(false);
                  setReturnComment("");
                })
              }
            >
              Return
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <DelegationDialog
        open={delegateOpen}
        onOpenChange={setDelegateOpen}
        isSubmitting={isSubmitting}
        onSubmit={onDelegate}
      />

      <Dialog open={reassignOpen} onOpenChange={setReassignOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reassign approval</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reassign-user">Assignee user ID</Label>
              <Input
                id="reassign-user"
                value={reassignUserId}
                onChange={(event) => setReassignUserId(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reassign-reason">Reason</Label>
              <Textarea
                id="reassign-reason"
                value={reassignReason}
                onChange={(event) => setReassignReason(event.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReassignOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!reassignReason.trim() || isSubmitting}
              onClick={() =>
                void onReassign({
                  assigneeUserId: Number(reassignUserId),
                  reason: reassignReason.trim(),
                }).then(() => setReassignOpen(false))
              }
            >
              Reassign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
