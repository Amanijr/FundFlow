"use client";

import { useState } from "react";

import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { PageHeader } from "@/components/layout/page-header";
import { WorkflowCard } from "@/components/workflow/workflow-card";
import { Input } from "@/components/ui/input";
import { useApprovalInbox, useWorkflowActions } from "@/hooks/use-workflow";
import type { InboxFilters } from "@/types/workflow-instance";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "action_required", label: "Action required" },
  { value: "pending", label: "Pending" },
  { value: "all", label: "All" },
] as const;

const MODULE_FILTERS = [
  { value: "expense", label: "Expenses" },
  { value: "budget", label: "Budgets" },
  { value: "grant", label: "Grants" },
] as const;

export default function ApprovalsPage() {
  const [filters, setFilters] = useState<InboxFilters>({
    status: "action_required",
    sort: "sla",
    size: 50,
  });
  const [search, setSearch] = useState("");

  const inboxQuery = useApprovalInbox({
    ...filters,
    q: search || filters.q,
  });

  const items = inboxQuery.data?.items ?? [];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Approvals"
        description="Review and act on pending approval requests."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search approvals…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
          aria-label="Search approvals"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setFilters((prev) => ({ ...prev, status: option.value }))}
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                filters.status === option.value
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
          {MODULE_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  entityType: prev.entityType === option.value ? undefined : option.value,
                }))
              }
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                filters.entityType === option.value
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {inboxQuery.isLoading && <LoadingState />}
      {inboxQuery.isError && <ErrorAlert message="Unable to load approval inbox." />}

      {!inboxQuery.isLoading && !inboxQuery.isError && items.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">No pending approvals.</p>
      )}

      <div className="space-y-2">
        {items.map((item) => (
          <InboxCardRow key={item.id} item={item} onSuccess={() => void inboxQuery.refetch()} />
        ))}
      </div>
    </div>
  );
}

function InboxCardRow({
  item,
  onSuccess,
}: {
  item: import("@/types/workflow-instance").InboxItem;
  onSuccess: () => void;
}) {
  const actions = useWorkflowActions(item.workflowInstanceId);

  return (
    <WorkflowCard
      item={item}
      onQuickApprove={
        item.actionRequired
          ? () =>
              void actions.approve.mutateAsync(undefined).then(() => onSuccess())
          : undefined
      }
    />
  );
}
