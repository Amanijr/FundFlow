# Workflow Statuses

**Phase:** 12 — Workflow & Approval System

---

## 1. Purpose

Standardized workflow statuses ensure users recognize state instantly across modules — same label, color, and icon everywhere.

---

## 2. Instance Status Model

```ts
type WorkflowInstanceStatus =
  | "draft"
  | "submitted"
  | "pending"
  | "in_review"
  | "waiting"
  | "approved"
  | "partially_approved"
  | "rejected"
  | "returned"
  | "cancelled"
  | "expired"
  | "completed";
```

### Lifecycle mapping

| Status | Meaning | Typical next |
|--------|---------|--------------|
| `draft` | Not yet submitted | `submitted` |
| `submitted` | Sent to workflow engine | `pending` / `in_review` |
| `pending` | Queued for first approver | `in_review` |
| `in_review` | Active step awaiting decision | `approved`, `rejected`, `returned` |
| `waiting` | Blocked on external input or parallel step | `in_review` |
| `approved` | All steps approved | `executed` / `completed` |
| `partially_approved` | Parallel: some lanes done | `in_review` or `approved` |
| `rejected` | Terminal denial | — |
| `returned` | Sent back to requestor for revision | `draft` / `submitted` |
| `cancelled` | Withdrawn by requestor or admin | — |
| `expired` | SLA / policy timeout | — |
| `completed` | Post-execution terminal success | — |

---

## 3. Step Status Model

```ts
type WorkflowStepStatus =
  | "pending"
  | "active"
  | "completed"
  | "skipped"
  | "rejected";
```

Used by `WorkflowDiagram` — see [WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md).

---

## 4. Entity Status vs Workflow Status

FundFlow has **two layers**:

| Layer | Example | Component |
|-------|---------|-----------|
| **Entity lifecycle** | `ExpenseStatus`: DRAFT, SUBMITTED, APPROVED, PAID | `WorkflowStepper`, `ExpenseStatusBadge` |
| **Workflow instance** | `WorkflowInstanceStatus`: in_review, returned | `WorkflowStatusBadge` |

Map entity status to workflow display when no separate instance API exists (interim expense panel). Target: entity pages show **workflow instance status** as source of truth for approval UI.

Existing types:

- `WorkflowStatusValue` in `types/workflow.ts` — generic enum (partial overlap)
- `ExpenseStatus`, `BudgetStatus` in `types/finance.ts` — domain enums

**Target:** extend `types/workflow-instance.ts` with `WorkflowInstanceStatus`; keep finance enums for accounting state.

---

## 5. Component: `WorkflowStatusBadge`

```tsx
interface WorkflowStatusBadgeProps {
  status: WorkflowInstanceStatus;
  size?: "sm" | "md";
  showIcon?: boolean;
}
```

### Visual tokens

| Status | Label | Variant / color | Icon |
|--------|-------|-----------------|------|
| `draft` | Draft | `secondary` / muted | `FileEdit` |
| `submitted` | Submitted | `outline` / blue | `Send` |
| `pending` | Pending | `outline` / amber | `Clock` |
| `in_review` | In review | `default` / primary | `Eye` |
| `waiting` | Waiting | `outline` / muted | `Pause` |
| `approved` | Approved | `success` / emerald | `CheckCircle` |
| `partially_approved` | Partially approved | `warning` / amber | `CheckCircle2` |
| `rejected` | Rejected | `destructive` / red | `XCircle` |
| `returned` | Returned | `warning` / orange | `RotateCcw` |
| `cancelled` | Cancelled | `secondary` / muted | `Ban` |
| `expired` | Expired | `destructive` / red | `AlertTriangle` |
| `completed` | Completed | `success` / emerald | `CheckCheck` |

Define in `lib/workflow-status-styles.ts`:

```ts
export const WORKFLOW_STATUS_STYLES: Record<
  WorkflowInstanceStatus,
  { label: string; className: string; icon: LucideIcon }
> = { ... };
```

Align with Phase 04 design tokens — use semantic `success`, `warning`, `danger` where Badge variants exist.

---

## 6. Existing Components

| Component | Path | Role |
|-----------|------|------|
| `WorkflowStatus` | `workflow-status.tsx` | Generic status display |
| `ExpenseStatusBadge` | `finance-status-badge.tsx` | Expense-specific |
| `GrantStatusBadge` | `vertical-status-badge.tsx` | Grant-specific |

**Migration:** module badges remain for list views; detail approval sections use `WorkflowStatusBadge` from instance API.

---

## 7. Inbox & Card Status

`WorkflowCard` shows:

- Primary: `WorkflowStatusBadge`
- Secondary: `currentStageLabel` ("Finance review")

When `slaBreached`: add `SLAIndicator` — see [SLA_AND_ESCALATION.md](./SLA_AND_ESCALATION.md).

---

## 8. Terminal States

No approval actions when status is:

- `rejected`, `cancelled`, `expired`, `completed`

Show read-only timeline and optional "Resubmit" only when `returned` or policy allows reopen from `rejected`.

---

## 9. Partial Approval (parallel)

`partially_approved`:

- Badge on instance
- Diagram shows completed parallel lanes + active lane
- Inbox remains `actionRequired` until all required lanes complete

---

## 10. API

Status returned on:

- `GET /api/v1/workflow/instances/{id}`
- `GET /api/v1/workflow/inbox` (per item)
- Entity GET may embed `workflow: { status, currentStepId }`

Mutations return updated `WorkflowInstance` with new `status`.

---

## 11. Notifications by Status

| Transition | Notification (Phase 10) |
|------------|-------------------------|
| → `in_review` (assigned) | "Approval requested" — category `workflow` |
| → `approved` | "Request approved" |
| → `rejected` | "Request rejected" — severity `warning` |
| → `returned` | "Returned for revision" |
| → `expired` | "Approval overdue" — severity `critical` |

---

## 12. Checklist

- [ ] `WorkflowInstanceStatus` in `types/workflow-instance.ts`
- [ ] `workflow-status-styles.ts`
- [ ] `WorkflowStatusBadge` component
- [ ] Map mock/instance statuses in handlers
- [ ] Replace ad-hoc status labels in inbox cards
- [ ] Document entity vs instance status mapping per module
