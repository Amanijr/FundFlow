"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { type ColumnDef } from "@tanstack/react-table";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { DetailCard } from "@/components/display/detail-card";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { LoadingState } from "@/components/feedback/loading-state";
import { BudgetStatusBadge, formatEnumLabel } from "@/components/finance/finance-status-badge";
import { CurrencyInput } from "@/components/forms/currency-input";
import { EntitySelector } from "@/components/forms/entity-selector";
import { PageHeader } from "@/components/layout/page-header";
import { SectionHeader } from "@/components/layout/section-header";
import { PermissionGate } from "@/components/security/permission-gate";
import { DataTable } from "@/components/tables/data-table";
import { WorkflowDetailView } from "@/components/workflow/workflow-detail-view";
import { AuditTrail } from "@/components/workflow/audit-trail";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import {
  activateBudget,
  addBudgetLine,
  approveBudget,
  closeBudget,
  getBudget,
  getBudgetVariance,
} from "@/lib/api/budgets";
import { listFunds } from "@/lib/api/funds";
import { formatCurrency, formatPercent, toNumber } from "@/lib/utils/format";
import { formatDate } from "@/lib/utils/dates";
import { ApiError } from "@/types/api";
import type { AuditRecord } from "@/types/workflow";
import type { BudgetLineResponse, BudgetVarianceLine, ExpenseCategory } from "@/types/finance";

const categories: ExpenseCategory[] = [
  "OPERATIONS",
  "PROGRAM",
  "ADMINISTRATIVE",
  "FUNDRAISING",
  "MISCELLANEOUS",
];

export default function BudgetDetailPage() {
  const params = useParams();
  const queryClient = useQueryClient();
  const { accessToken } = useAuth();
  const budgetId = Number(params.id);

  const [lineCategory, setLineCategory] = useState<ExpenseCategory>("OPERATIONS");
  const [lineAmount, setLineAmount] = useState(0);
  const [lineFundId, setLineFundId] = useState("");
  const [lineDescription, setLineDescription] = useState("");
  const [addingLine, setAddingLine] = useState(false);

  const budgetQuery = useQuery({
    queryKey: ["budgets", budgetId],
    queryFn: async () => (await getBudget(accessToken!, budgetId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(budgetId),
  });

  const varianceQuery = useQuery({
    queryKey: ["budgets", budgetId, "variance"],
    queryFn: async () => (await getBudgetVariance(accessToken!, budgetId)).data,
    enabled: Boolean(accessToken) && !Number.isNaN(budgetId),
  });

  const fundsQuery = useQuery({
    queryKey: ["funds"],
    queryFn: async () => (await listFunds(accessToken!)).data,
    enabled: Boolean(accessToken),
  });

  const fundOptions = useMemo(
    () => (fundsQuery.data ?? []).map((f) => ({ id: String(f.id), label: f.name, description: f.code })),
    [fundsQuery.data],
  );

  const lineColumns = useMemo<ColumnDef<BudgetLineResponse>[]>(
    () => [
      { accessorKey: "category", header: "Category", cell: ({ row }) => formatEnumLabel(row.original.category) },
      { accessorKey: "department", header: "Department", cell: ({ row }) => row.original.department ?? "—" },
      { accessorKey: "fundName", header: "Fund", cell: ({ row }) => row.original.fundName ?? "—" },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => formatCurrency(toNumber(row.original.amount)),
      },
      { accessorKey: "description", header: "Description", cell: ({ row }) => row.original.description ?? "—" },
    ],
    [],
  );

  const varianceColumns = useMemo<ColumnDef<BudgetVarianceLine>[]>(
    () => [
      { accessorKey: "category", header: "Category", cell: ({ row }) => formatEnumLabel(row.original.category) },
      {
        accessorKey: "budgetAmount",
        header: "Budget",
        cell: ({ row }) => formatCurrency(toNumber(row.original.budgetAmount)),
      },
      {
        accessorKey: "actualAmount",
        header: "Actual",
        cell: ({ row }) => formatCurrency(toNumber(row.original.actualAmount)),
      },
      {
        accessorKey: "variance",
        header: "Variance",
        cell: ({ row }) => formatCurrency(toNumber(row.original.variance)),
      },
      {
        accessorKey: "utilizationPercent",
        header: "Utilization",
        cell: ({ row }) => formatPercent(toNumber(row.original.utilizationPercent)),
      },
    ],
    [],
  );

  const auditRecords = useMemo<AuditRecord[]>(() => {
    const budget = budgetQuery.data;
    if (!budget) return [];
    const records: AuditRecord[] = [
      { id: "created", user: "System", action: "Created", timestamp: budget.createdAt },
    ];
    if (budget.status !== "DRAFT") {
      records.push({ id: "approved", user: "Finance", action: "Approved", timestamp: budget.createdAt });
    }
    if (budget.status === "ACTIVE" || budget.status === "CLOSED") {
      records.push({ id: "activated", user: "Finance", action: "Activated", timestamp: budget.startDate });
    }
    if (budget.status === "CLOSED") {
      records.push({ id: "closed", user: "Finance", action: "Closed", timestamp: budget.endDate });
    }
    return records;
  }, [budgetQuery.data]);

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["budgets", budgetId] });
    await queryClient.invalidateQueries({ queryKey: ["budgets", budgetId, "variance"] });
  }

  async function handleWorkflow(action: "approve" | "activate" | "close") {
    try {
      if (action === "approve") await approveBudget(accessToken!, budgetId);
      if (action === "activate") await activateBudget(accessToken!, budgetId);
      if (action === "close") await closeBudget(accessToken!, budgetId);
      toast.success(`Budget ${action}d`);
      await refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Action failed");
    }
  }

  async function handleAddLine() {
    if (lineAmount <= 0) return;
    setAddingLine(true);
    try {
      await addBudgetLine(accessToken!, budgetId, {
        category: lineCategory,
        amount: lineAmount,
        fundId: lineFundId ? Number(lineFundId) : undefined,
        description: lineDescription || undefined,
      });
      toast.success("Line added");
      setLineAmount(0);
      setLineDescription("");
      setLineFundId("");
      await refresh();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Unable to add line");
    } finally {
      setAddingLine(false);
    }
  }

  if (budgetQuery.isLoading) return <LoadingState />;
  if (budgetQuery.isError || !budgetQuery.data) return <ErrorAlert message="Unable to load budget." />;

  const budget = budgetQuery.data;
  const variance = varianceQuery.data;

  return (
    <div className="space-y-4">
      <PageHeader
        breadcrumbs={[{ label: "Budgets", href: "/budgets" }, { label: budget.name }]}
        title={budget.name}
        description={`FY ${budget.fiscalYear} · ${formatEnumLabel(budget.scopeType)}`}
        action={
          <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
            <div className="flex flex-wrap gap-2">
              {budget.status === "DRAFT" && (
                <Button onClick={() => handleWorkflow("approve")}>Approve</Button>
              )}
              {budget.status === "APPROVED" && (
                <Button onClick={() => handleWorkflow("activate")}>Activate</Button>
              )}
              {budget.status === "ACTIVE" && (
                <Button variant="outline" onClick={() => handleWorkflow("close")}>
                  Close
                </Button>
              )}
            </div>
          </PermissionGate>
        }
      />

      <BudgetStatusBadge status={budget.status} />

      <div className="grid gap-4 md:grid-cols-2">
        <DetailCard
          title="Overview"
          fields={[
            { label: "Period", value: `${formatDate(budget.startDate)} – ${formatDate(budget.endDate)}` },
            { label: "Total budget", value: formatCurrency(toNumber(budget.totalBudget)) },
            { label: "Department", value: budget.department ?? "—" },
            { label: "Fund", value: budget.fundName ?? "—" },
          ]}
        />
        {variance && (
          <DetailCard
            title="Variance summary"
            fields={[
              { label: "Total actual", value: formatCurrency(toNumber(variance.totalActual)) },
              { label: "Variance", value: formatCurrency(toNumber(variance.totalVariance)) },
              { label: "Utilization", value: formatPercent(toNumber(variance.utilizationPercent)) },
            ]}
          />
        )}
      </div>

      <section className="space-y-4">
        <SectionHeader title="Allocations" description="Budget line items by category" />
        <DataTable columns={lineColumns} data={budget.lines} />
        {budget.status === "DRAFT" && (
          <PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
            <div className="grid gap-3 rounded-lg border border-dashed border-border p-4 md:grid-cols-2 lg:grid-cols-4">
              <select
                className="h-10 rounded-md border border-input bg-surface px-3 text-sm"
                value={lineCategory}
                onChange={(e) => setLineCategory(e.target.value as ExpenseCategory)}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {formatEnumLabel(cat)}
                  </option>
                ))}
              </select>
              <CurrencyInput value={lineAmount} onChange={(v) => setLineAmount(v === "" ? 0 : v)} />
              <EntitySelector
                value={lineFundId}
                onChange={setLineFundId}
                options={fundOptions}
                placeholder="Fund (optional)"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Description"
                  value={lineDescription}
                  onChange={(e) => setLineDescription(e.target.value)}
                />
                <Button disabled={addingLine || lineAmount <= 0} onClick={handleAddLine}>
                  Add
                </Button>
              </div>
            </div>
          </PermissionGate>
        )}
      </section>

      {variance && variance.lines.length > 0 && (
        <section className="space-y-4">
          <SectionHeader title="Variance by line" description="Budget vs actual spending" />
          <DataTable columns={varianceColumns} data={variance.lines} />
        </section>
      )}

      <section className="space-y-4">
        <SectionHeader title="Approval workflow" />
        <WorkflowDetailView entityType="budget" entityId={budgetId} />
      </section>

      <section className="space-y-4">
        <SectionHeader title="Audit trail" />
        <AuditTrail records={auditRecords} />
      </section>
    </div>
  );
}
