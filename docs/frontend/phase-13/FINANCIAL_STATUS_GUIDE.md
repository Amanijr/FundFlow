# Financial Status Guide

**Phase:** 13 — Financial UX & Data Standards

---

## 1. Purpose

Financial statuses must have consistent labels, icons, colors, badge styles, and tooltips across expenses, budgets, donations, journals, reports, and accounting workflows.

The app currently has module-specific badges such as `ExpenseStatusBadge`, `BudgetStatusBadge`, `DonationStatusBadge`, and `WorkflowStatusBadge`. Phase 13 defines the shared financial status registry they should converge toward.

---

## 2. Status Layers

Financial screens can show two different status types:

| Layer | Examples | Source |
|-------|----------|--------|
| **Entity lifecycle** | Draft, Approved, Paid, Reconciled | Finance/donation/accounting domain APIs |
| **Workflow approval** | In review, Returned, Expired | Phase 12 workflow instance API |

Do not mix these meanings. A request can be workflow `approved` while an expense lifecycle is not yet `paid`.

---

## 3. Core Financial Status Registry

| Status | Meaning | Color | Icon | Badge |
|--------|---------|-------|------|-------|
| `draft` | Editable, not submitted | Muted | `FileEdit` | Secondary |
| `pending` | Awaiting action | Amber | `Clock` | Warning |
| `submitted` | Sent for review | Blue / primary | `Send` | Outline / primary |
| `approved` | Approved but not necessarily posted | Success | `CheckCircle` | Success |
| `rejected` | Denied | Danger | `XCircle` | Danger |
| `returned` | Sent back for revision | Orange | `RotateCcw` | Warning |
| `posted` | Accounting entry posted | Success | `BookCheck` | Success |
| `cancelled` | Voided before completion | Muted | `Ban` | Secondary |
| `completed` | Finished process | Success | `CheckCheck` | Success |
| `reconciled` | Matched to bank/ledger | Outline / success | `Scale` | Outline |
| `overdue` | Past due date or SLA | Danger | `AlertTriangle` | Danger |
| `paid` | Payment completed | Success | `BadgeCheck` | Success |
| `unpaid` | Payment outstanding | Amber | `Clock` | Warning |
| `refunded` | Funds returned | Blue | `Undo2` | Outline |
| `reversed` | Accounting reversal posted | Danger / muted | `RotateCcw` | Danger / outline |

---

## 4. Component API

Target:

```tsx
type FinancialStatus =
  | "draft"
  | "pending"
  | "submitted"
  | "approved"
  | "rejected"
  | "returned"
  | "posted"
  | "cancelled"
  | "completed"
  | "reconciled"
  | "overdue"
  | "paid"
  | "unpaid"
  | "refunded"
  | "reversed";

interface FinancialBadgeProps {
  status: FinancialStatus;
  label?: string;
  size?: "sm" | "md";
  showIcon?: boolean;
  tooltip?: string;
  className?: string;
}
```

Usage:

```tsx
<FinancialBadge status="reconciled" />
```

---

## 5. Module Mapping

### Expense

| Current `ExpenseStatus` | Shared status |
|-------------------------|---------------|
| `DRAFT` | `draft` |
| `SUBMITTED` | `submitted` / `pending` |
| `APPROVED` | `approved` |
| `REJECTED` | `rejected` |
| `PAID` | `paid` |
| `RECONCILED` | `reconciled` |

### Budget

| Current `BudgetStatus` | Shared status |
|------------------------|---------------|
| `DRAFT` | `draft` |
| `APPROVED` | `approved` |
| `ACTIVE` | `posted` or `completed` depending context |
| `CLOSED` | `completed` |

### Donation

| Current donation state | Shared status |
|------------------------|---------------|
| Pending confirmation | `pending` |
| Confirmed/received | `completed` |
| Refunded | `refunded` |
| Reversed | `reversed` |

### Journal Entry

| Accounting state | Shared status |
|------------------|---------------|
| Draft | `draft` |
| Posted | `posted` |
| Reversed | `reversed` |
| Cancelled | `cancelled` |

---

## 6. Tooltip Standards

Every financial badge should support a short tooltip.

Examples:

| Status | Tooltip |
|--------|---------|
| Draft | `This record has not been submitted.` |
| Pending | `Waiting for review or approval.` |
| Approved | `Approved and ready for the next step.` |
| Posted | `Posted to the accounting ledger.` |
| Reconciled | `Matched against bank or ledger records.` |
| Overdue | `Past the configured due date or SLA.` |

Tooltips are helpful, not required on every row if the status label is self-explanatory.

---

## 7. Color Rules

| Meaning | Token |
|---------|-------|
| Successful / completed | `success` |
| Waiting / needs attention | `warning` |
| Failed / blocked / overdue | `danger` |
| Neutral / inactive | `muted` |
| Informational | `primary` / `info` |

Never use color alone:

- Include text label.
- Use icon when space allows.
- Use `aria-label` for icon-only compact states.

---

## 8. Existing Components to Consolidate

| Current component | Path | Target |
|-------------------|------|--------|
| `ExpenseStatusBadge` | `components/finance/finance-status-badge.tsx` | Delegate to `FinancialBadge` |
| `BudgetStatusBadge` | `components/finance/finance-status-badge.tsx` | Delegate to `FinancialBadge` |
| `DonationStatusBadge` | `components/fundraising/fundraising-status-badge.tsx` | Delegate to `FinancialBadge` where meanings overlap |
| `StatusCell` | `components/data/cells/status-cell.tsx` | Use registry-backed badge |
| `WorkflowStatusBadge` | `components/workflow/workflow-status-badge.tsx` | Keep workflow-specific; do not replace with financial badge |

---

## 9. Tables and Filters

Status columns:

```ts
{
  accessorKey: "status",
  header: "Status",
  cell: ({ row }) => <FinancialBadge status={mapExpenseStatus(row.original.status)} />,
  meta: { type: "status" },
}
```

Filters:

- Use human labels, not raw enum values.
- Preserve raw enum in API query.
- Multi-select status filters should show chips.

---

## 10. Empty and Error States

Avoid status ambiguity:

| State | Display |
|-------|---------|
| Missing status | `Unknown` badge, muted |
| Backend enum not mapped | Log in dev, display formatted enum |
| Loading | Skeleton badge |

---

## 11. Checklist

- [ ] Add `FinancialStatus` type
- [ ] Add `FINANCIAL_STATUS_STYLES` registry
- [ ] Add `FinancialBadge`
- [ ] Map expense, budget, donation, journal statuses
- [ ] Update `StatusCell` to use registry where possible
- [ ] Add tooltips for ambiguous statuses
- [ ] Keep workflow statuses separate from financial lifecycle statuses
