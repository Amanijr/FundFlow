# Approval Inbox

**Phase:** 12 — Workflow & Approval System

---

## 1. Purpose

Every approver needs a **single queue** of pending items across modules — expenses, budgets, purchase requests, and more — without visiting each entity list.

The approval inbox is distinct from the **notification center** (Phase 10): notifications alert; the inbox is where work gets done.

---

## 2. Route & Navigation

| Item | Value |
|------|-------|
| Route | `/approvals` |
| Nav label | Approvals |
| Nav group | Communication (or Operations) |
| Badge | Count of `actionRequired` inbox items |

Spec reference: Phase 03 [NAVIGATION_SYSTEM.md](../phase-03/NAVIGATION_SYSTEM.md) — Approvals route was planned but not built.

---

## 3. Inbox Item Model

```ts
type InboxPriority = "low" | "normal" | "high" | "critical";

interface InboxItem {
  id: string;
  workflowInstanceId: string;
  title: string;
  summary?: string;
  module: string;              // e.g. "Expenses"
  entityType: string;
  entityId: string | number;
  requestor: {
    id: number;
    name: string;
  };
  submittedAt: string;
  currentStage: string;
  currentStageLabel: string;
  status: WorkflowInstanceStatus;
  priority: InboxPriority;
  slaDueAt?: string;
  slaBreached?: boolean;
  actionRequired: boolean;     // user can approve/reject now
  href: string;                // deep link to approval detail
  amount?: number;
  currency?: string;
}
```

---

## 4. Component: `ApprovalInbox`

```tsx
interface ApprovalInboxProps {
  filters?: InboxFilters;
  onFiltersChange?: (filters: InboxFilters) => void;
  showBulkActions?: boolean;
}
```

### Page layout

```
┌─ Approvals ─────────────────────────────────────────┐
│ [Pending] [All] [Expenses] [Budgets] [High priority] │
│ Search: [________________]   Sort: [Newest ▼]        │
├──────────────────────────────────────────────────────┤
│ WorkflowCard                                         │
│ WorkflowCard                                         │
│ WorkflowCard                                         │
├──────────────────────────────────────────────────────┤
│ Showing 12 of 48                        [Load more]  │
└──────────────────────────────────────────────────────┘
```

---

## 5. `WorkflowCard` (inbox row)

```
┌────────────────────────────────────────────────────────┐
│ ● Expense: Q1 travel reimbursement          [SLA 4h]  │
│   David Mwangi · Expenses · Submitted 2h ago           │
│   Stage: Finance review · TZS 850,000                │
│                              [Review] [Quick approve]  │
└────────────────────────────────────────────────────────┘
```

| Element | Source |
|---------|--------|
| Title | `title` |
| Requestor + module | `requestor.name`, `module` |
| Time | Relative `submittedAt` |
| Stage | `currentStageLabel` |
| Amount | Optional formatted currency |
| SLA | `SLAIndicator` when `slaDueAt` set |
| Actions | Navigate to detail; optional quick approve if policy allows |

Unread / action-required: left border `border-l-primary` or dot indicator.

---

## 6. Filters & Search

```ts
interface InboxFilters {
  status?: "pending" | "action_required" | "all";
  entityType?: string;
  priority?: InboxPriority;
  module?: string;
  from?: string;
  to?: string;
  q?: string;
  sort?: "newest" | "oldest" | "priority" | "sla";
  page?: number;
  size?: number;
}
```

Reuse Phase 06 filter chip pattern (`FilterChip` / chip bar).

| Filter | Options |
|--------|---------|
| Status | Pending, Action required, All |
| Module | Expenses, Budgets, Grants, … |
| Priority | High, Critical |
| Date | Submitted range |

---

## 7. Sorting

| Sort | Field |
|------|-------|
| Newest | `submittedAt` desc |
| Oldest | `submittedAt` asc |
| Priority | `priority` then `submittedAt` |
| SLA urgency | `slaDueAt` asc (breached first) |

---

## 8. Bulk Actions

When `showBulkActions` and policy allows:

| Action | Scope | Confirmation |
|--------|-------|--------------|
| Bulk approve | Selected items same stage + user can act | `AlertDialog` |
| Bulk reject | Not default — require per-item reason | Disabled in v1 or wizard |

Bulk approve calls `POST /api/v1/workflow/inbox/bulk-approve` with `{ ids: string[] }`.

Respect permissions — hide bulk bar when user lacks bulk permission.

---

## 9. API Contracts (target)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/workflow/inbox` | GET | List inbox items (paginated, filterable) |
| `/api/v1/workflow/inbox/count` | GET | Badge count (action required) |
| `/api/v1/workflow/inbox/bulk-approve` | POST | Bulk approve |

**List query params:** `status`, `entityType`, `priority`, `q`, `sort`, `page`, `size`

**Headers:** `Authorization`, `X-Organization-Id`

**Response:**

```json
{
  "success": true,
  "data": {
    "items": [ InboxItem[] ],
    "page": 0,
    "totalPages": 3,
    "totalElements": 42
  }
}
```

---

## 10. Hook: `useApprovalInbox`

```ts
export function useApprovalInbox(filters?: InboxFilters) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["workflow", "inbox", organizationId, filters ?? {}],
    queryFn: async () => (await listInbox(token!, organizationId, filters)).data,
    enabled: Boolean(token),
    refetchInterval: 60_000, // optional polling while on page
  });
}

export function useInboxCount() {
  return useQuery({
    queryKey: ["workflow", "inbox", "count", organizationId],
    queryFn: async () => (await getInboxCount(token!, organizationId)).data,
    enabled: Boolean(token),
  });
}
```

Invalidate on workflow action mutations and Phase 10 notification events.

---

## 11. Empty & Loading States

| State | Message |
|-------|---------|
| Loading | Skeleton cards (5 rows) |
| Empty (pending) | "No pending approvals." |
| Empty (filtered) | "No items match your filters." |
| Error | Inline retry |

---

## 12. Mobile

- Full-width cards; stack metadata vertically
- Swipe actions (future): approve / open detail
- Sticky filter bar collapses to `Sheet`
- Quick approve as bottom sheet confirmation

---

## 13. Dashboard Widget (Phase 08)

`PendingApprovalsWidget` on finance dashboard:

- Top 5 inbox items (`actionRequired: true`)
- Link "View all" → `/approvals`
- Reuse `WorkflowCard` compact variant

---

## 14. Mock Data

`lib/mock/workflow-store.ts`:

```ts
const MOCK_INBOX: InboxItem[] = [
  {
    id: "inbox-1",
    title: "Expense: Q1 travel reimbursement",
    entityType: "expense",
    entityId: 1,
    actionRequired: true,
    // ...
  },
];
```

Handler in `mock/handlers.ts` for `GET /api/v1/workflow/inbox`.

---

## 15. Checklist

- [ ] `InboxItem` type in `types/workflow-instance.ts`
- [ ] `listInbox` / `getInboxCount` API
- [ ] `useApprovalInbox` hook
- [ ] `ApprovalInbox` page at `/approvals`
- [ ] `WorkflowCard` component
- [ ] Nav item + badge count
- [ ] Filter bar + search
- [ ] Mock inbox fixtures
- [ ] `PendingApprovalsWidget` on finance dashboard
