"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ApprovalWorkflowProps {
  canApprove?: boolean;
  canReject?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
  onReturn?: () => void;
}

export function ApprovalWorkflow({
  canApprove = true,
  canReject = true,
  onApprove,
  onReject,
  onReturn,
}: ApprovalWorkflowProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Approval actions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        {canApprove && (
          <Button type="button" onClick={onApprove}>
            Approve
          </Button>
        )}
        {canReject && (
          <Button type="button" variant="destructive" onClick={onReject}>
            Reject
          </Button>
        )}
        <Button type="button" variant="outline" onClick={onReturn}>
          Return for revision
        </Button>
      </CardContent>
    </Card>
  );
}
