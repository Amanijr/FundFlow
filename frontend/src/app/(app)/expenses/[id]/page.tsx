"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo } from "react";

import { WorkflowDetailView } from "@/components/workflow/workflow-detail-view";
import { AttachmentList } from "@/components/documents/attachment-list";
import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { ExpenseStatusBadge, formatEnumLabel } from "@/components/finance/finance-status-badge";
import { ExpenseWorkflowPanel } from "@/components/expenses/expense-workflow-panel";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { AuditTrail } from "@/components/workflow/audit-trail";
import { useAuth } from "@/hooks/use-auth";
import { listJournalEntries } from "@/lib/api/accounting";
import { findJournalEntriesForExpense, journalPostingSummary } from "@/lib/accounting/journal-links";
import {
  approveExpense,
  getExpense,
  payExpense,
  reconcileExpense,
  rejectExpense,
  submitExpense,
} from "@/lib/api/expenses";
import { formatCurrency, toNumber } from "@/lib/utils/format";
import { formatDateTime } from "@/lib/utils/dates";
import type { AuditRecord } from "@/types/workflow";
import type { PaymentMethod } from "@/types/finance";

export default function ExpenseDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const expenseId = Number(params.id);

  const expenseQuery = useQuery({
    queryKey: ["expenses", expenseId],
    queryFn: async () => (await getExpense(accessToken!, expenseId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(expenseId),
  });

  const journalQuery = useQuery({
    queryKey: ["accounting", "journal-entries"],
    queryFn: async () => (await listJournalEntries(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const linkedJournalEntries = useMemo(
    () => findJournalEntriesForExpense(journalQuery.data ?? [], expenseId),
    [journalQuery.data, expenseId],
  );

  const auditRecords = useMemo<AuditRecord[]>(() => {
    const expense = expenseQuery.data;
    if (!expense) return [];
    const records: AuditRecord[] = [
      { id: "created", user: `User #${expense.requestedByUserId ?? "—"}`, action: "Created", timestamp: expense.createdAt },
    ];
    if (expense.submittedAt) {
      records.push({ id: "submitted", user: "Requester", action: "Submitted", timestamp: expense.submittedAt });
    }
    if (expense.approvedAt) {
      records.push({
        id: "approved",
        user: `User #${expense.approvedByUserId ?? "—"}`,
        action: "Approved",
        timestamp: expense.approvedAt,
      });
    }
    if (expense.rejectionReason) {
      records.push({
        id: "rejected",
        user: "Finance",
        action: "Rejected",
        timestamp: expense.submittedAt ?? expense.createdAt,
        details: expense.rejectionReason,
      });
    }
    if (expense.paidAt) {
      records.push({
        id: "paid",
        user: `User #${expense.paidByUserId ?? "—"}`,
        action: "Paid",
        timestamp: expense.paidAt,
        details: expense.paymentReference,
      });
    }
    if (expense.reconciledAt) {
      records.push({
        id: "reconciled",
        user: `User #${expense.reconciledByUserId ?? "—"}`,
        action: "Reconciled",
        timestamp: expense.reconciledAt,
      });
    }
    return records;
  }, [expenseQuery.data]);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["expenses", expenseId] });
    await queryClient.invalidateQueries({ queryKey: ["expenses"] });
  }

  if (expenseQuery.isLoading) return <LoadingState />;
  if (expenseQuery.isError || !expenseQuery.data) return <ErrorAlert message="Unable to load expense." />;

  const expense = expenseQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Expenses", href: "/expenses" }, { label: expense.title }]}
        title={expense.title}
        description={formatDateTime(expense.createdAt)}
      />

      <ExpenseStatusBadge status={expense.status} />

      <div className="grid gap-4 lg:grid-cols-2">
        <DetailCard
          title="Expense details"
          fields={[
            { label: "Amount", value: formatCurrency(toNumber(expense.amount)) },
            { label: "Category", value: formatEnumLabel(expense.category) },
            { label: "Type", value: formatEnumLabel(expense.expenseType) },
            { label: "Description", value: expense.description ?? "—" },
          ]}
        />
        <DetailCard
          title="Allocation"
          fields={[
            {
              label: "Fund",
              value: expense.fundId ? (
                <Link href={`/funds/${expense.fundId}`} className="text-primary hover:underline">
                  {expense.fundName ?? `Fund #${expense.fundId}`}
                </Link>
              ) : (
                "—"
              ),
            },
            { label: "Payee", value: expense.payeeName ?? "—" },
            { label: "Department", value: expense.department ?? "—" },
            {
              label: "Payment",
              value:
                expense.paymentMethod != null
                  ? `${formatEnumLabel(expense.paymentMethod)} · ${expense.paymentReference ?? ""}`
                  : "—",
            },
          ]}
        />
      </div>

      <DetailCard
        title="Accounting"
        fields={[
          {
            label: "Posted to the books",
            value:
              linkedJournalEntries.length > 0 ? (
                <span className="flex flex-col gap-1">
                  {linkedJournalEntries.map((entry) => (
                    <Link
                      key={entry.id}
                      href={`/accounting/journal-entries/${entry.id}`}
                      className="text-primary hover:underline"
                    >
                      {journalPostingSummary(entry) ?? "View books entry"}
                    </Link>
                  ))}
                </span>
              ) : (
                <span className="text-muted-foreground">
                  Posted after payment is recorded.{" "}
                  <Link href="/accounting/journal-entries" className="text-primary hover:underline">
                    Browse journal entries
                  </Link>
                </span>
              ),
          },
        ]}
      />

      <section className="space-y-4">
        <SectionHeader title="Approval" description="Workflow status and actions" />
        <WorkflowDetailView entityType="expense" entityId={expenseId} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Attachments" description="Invoices, receipts, and supporting documents" />
        <AttachmentList entityType="expense" entityId={expenseId} category="receipt" />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Workflow" description="Submit, approve, pay, and reconcile" />
        <ExpenseWorkflowPanel
          expense={expense}
          onSubmit={() => submitExpense(accessToken!, expenseId).then(() => undefined)}
          onApprove={() => approveExpense(accessToken!, expenseId).then(() => undefined)}
          onReject={(reason) => rejectExpense(accessToken!, expenseId, { reason }).then(() => undefined)}
          onPay={(paymentMethod: PaymentMethod, paymentReference, paidAt) =>
            payExpense(accessToken!, expenseId, { paymentMethod, paymentReference, paidAt }).then(() => undefined)
          }
          onReconcile={() => reconcileExpense(accessToken!, expenseId).then(() => undefined)}
          onRefresh={refresh}
        />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Audit trail" />
        <AuditTrail records={auditRecords} />
      </section>
    </div>
  );
}
