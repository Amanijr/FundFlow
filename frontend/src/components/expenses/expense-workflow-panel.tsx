"use client";

import { useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";

import { ApprovalWorkflow } from "@/components/workflow/approval-workflow";
import { WorkflowStepper } from "@/components/workflow/workflow-stepper";
import { PermissionGate } from "@/components/security/permission-gate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel, PanelContent, PanelHeader, PanelTitle } from "@/components/ui/panel";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formatEnumLabel } from "@/components/finance/finance-status-badge";
import type { ExpenseResponse, PaymentMethod } from "@/types/finance";

const expenseSteps = ["DRAFT", "SUBMITTED", "APPROVED", "PAID", "RECONCILED"] as const;

const paymentMethods: PaymentMethod[] = ["CASH", "BANK_TRANSFER", "MOBILE_MONEY", "CARD", "CHEQUE"];

interface ExpenseWorkflowPanelProps {
  expense: ExpenseResponse;
  onSubmit: () => Promise<void>;
  onApprove: () => Promise<void>;
  onReject: (reason: string) => Promise<void>;
  onPay: (paymentMethod: PaymentMethod, paymentReference: string, paidAt: string) => Promise<void>;
  onReconcile: () => Promise<void>;
  onRefresh: () => void;
}

export function ExpenseWorkflowPanel({
  expense,
  onSubmit,
  onApprove,
  onReject,
  onPay,
  onReconcile,
  onRefresh,
}: ExpenseWorkflowPanelProps) {
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [payOpen, setPayOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BANK_TRANSFER");
  const [paymentReference, setPaymentReference] = useState("");
  const [loading, setLoading] = useState(false);

  async function runAction(action: () => Promise<void>) {
    setLoading(true);
    try {
      await action();
      onRefresh();
    } catch {
      toast.error("Action failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <WorkflowStepper
        steps={expenseSteps}
        current={expense.status}
        labels={Object.fromEntries(expenseSteps.map((step) => [step, formatEnumLabel(step)]))}
      />

      {expense.status === "DRAFT" && (
        <Panel>
          <PanelHeader>
            <PanelTitle>Submit for approval</PanelTitle>
          </PanelHeader>
          <PanelContent>
            <Button size="sm" disabled={loading} onClick={() => runAction(onSubmit)}>
              Submit expense
            </Button>
          </PanelContent>
        </Panel>
      )}

      {expense.status === "SUBMITTED" && (
        <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
          <ApprovalWorkflow
            canApprove
            canReject
            onApprove={() => runAction(onApprove)}
            onReject={() => setRejectOpen(true)}
            onReturn={() => setRejectOpen(true)}
          />
        </PermissionGate>
      )}

      {expense.status === "APPROVED" && (
        <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
          <Panel>
            <PanelHeader>
              <PanelTitle>Record payment</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <Button size="sm" disabled={loading} onClick={() => setPayOpen(true)}>
                Pay expense
              </Button>
            </PanelContent>
          </Panel>
        </PermissionGate>
      )}

      {expense.status === "PAID" && (
        <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
          <Panel>
            <PanelHeader>
              <PanelTitle>Reconciliation</PanelTitle>
            </PanelHeader>
            <PanelContent>
              <Button size="sm" disabled={loading} onClick={() => runAction(onReconcile)}>
                Mark reconciled
              </Button>
            </PanelContent>
          </Panel>
        </PermissionGate>
      )}

      {expense.rejectionReason && (
        <p className="text-xs text-danger">Rejection reason: {expense.rejectionReason}</p>
      )}

      <Dialog open={rejectOpen} onOpenChange={setRejectOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reject-reason">Reason</Label>
            <Input
              id="reject-reason"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this expense is rejected"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!rejectReason.trim() || loading}
              onClick={() =>
                runAction(async () => {
                  await onReject(rejectReason.trim());
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

      <Dialog open={payOpen} onOpenChange={setPayOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pay expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment method</Label>
              <select
                className="h-9 w-full rounded-md border border-input bg-surface px-2.5 text-sm"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {formatEnumLabel(method)}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-ref">Reference</Label>
              <Input
                id="payment-ref"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                placeholder="Check #, transfer ref, etc."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPayOpen(false)}>
              Cancel
            </Button>
            <Button
              disabled={!paymentReference.trim() || loading}
              onClick={() =>
                runAction(async () => {
                  await onPay(
                    paymentMethod,
                    paymentReference.trim(),
                    format(new Date(), "yyyy-MM-dd'T'HH:mm:ss"),
                  );
                  setPayOpen(false);
                })
              }
            >
              Confirm payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
