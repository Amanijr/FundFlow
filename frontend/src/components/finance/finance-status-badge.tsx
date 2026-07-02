import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { BudgetStatus, ExpenseStatus } from "@/types/finance";

const expenseStatusConfig: Record<
  ExpenseStatus,
  { label: string; variant: "secondary" | "warning" | "success" | "danger" | "info" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SUBMITTED: { label: "Submitted", variant: "warning" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  PAID: { label: "Paid", variant: "success" },
  RECONCILED: { label: "Reconciled", variant: "outline" },
};

const budgetStatusConfig: Record<
  BudgetStatus,
  { label: string; variant: "secondary" | "warning" | "success" | "danger" | "info" | "outline" }
> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  APPROVED: { label: "Approved", variant: "success" },
  ACTIVE: { label: "Active", variant: "info" },
  CLOSED: { label: "Closed", variant: "outline" },
};

export function ExpenseStatusBadge({ status, className }: { status: ExpenseStatus; className?: string }) {
  const config = expenseStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

export function BudgetStatusBadge({ status, className }: { status: BudgetStatus; className?: string }) {
  const config = budgetStatusConfig[status];
  return (
    <Badge variant={config.variant} className={cn(className)}>
      {config.label}
    </Badge>
  );
}

export function formatEnumLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
