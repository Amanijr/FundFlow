# Approval UI Guidelines

**Phase:** 12 — Workflow & Approval System

---

## 1. Purpose

This guide defines the **approval detail experience** — summary, actions, comments, documents, diagram, and history — so every module shares one pattern.

---

## 2. `WorkflowDetailView`

```tsx
interface WorkflowDetailViewProps {
  workflowInstanceId?: string;
  entityType: string;
  entityId: string | number;
  readOnly?: boolean;
  className?: string;
}
```

Composes:

| Section | Component |
|---------|-----------|
| Summary | Entity-specific `DetailCard` (parent page) |
| Status + diagram | `WorkflowStatusBadge` + `WorkflowDiagram` |
| SLA | `SLAIndicator` |
| Actions | `ApprovalActions` |
| Documents | `AttachmentList` (Phase 11) |
| Comments | `CommentPanel` |
| History | `WorkflowTimeline` / `ApprovalHistory` |

Parent page layout (expense example):

```tsx
<PageHeader ... />
<DetailCard ... />
<WorkflowDetailView entityType="expense" entityId={expenseId} />
<AttachmentList entityType="expense" entityId={expenseId} />
```

Gradually replace `ExpenseWorkflowPanel` internals with `WorkflowDetailView` + entity-specific submit/pay panels.

---

## 3. `ApprovalActions`

Extends `ApprovalWorkflow` (`components/workflow/approval-workflow.tsx`).

```tsx
interface ApprovalActionsProps {
  instance: WorkflowInstance;
  canApprove: boolean;
  canReject: boolean;
  canReturn: boolean;
  canDelegate: boolean;
  canReassign: boolean;
  canCancel: boolean;
  onApprove: (comment?: string) => Promise<void>;
  onReject: (reason: string, comment?: string) => Promise<void>;
  onReturn: (comment: string) => Promise<void>;
  onDelegate: (payload: DelegatePayload) => Promise<void>;
  onReassign: (payload: ReassignPayload) => Promise<void>;
  isSubmitting?: boolean;
}
```

### Action buttons

| Action | Variant | Dialog |
|--------|---------|--------|
| Approve | Primary | Optional comment |
| Reject | Destructive | **Required** reason |
| Return | Outline | **Required** comment |
| Delegate | Outline | `DelegationDialog` |
| Reassign | Outline | User picker + reason (admin) |
| Cancel | Ghost | Confirm (requestor only) |

Gate with `PermissionGate` and `instance.actions` flags from API.

### Reject dialog (existing pattern)

Reuse expense panel pattern:

```tsx
<Dialog>
  <Label>Reason for rejection</Label>
  <Textarea required />
</Dialog>
```

---

## 4. `CommentPanel`

```tsx
interface WorkflowComment {
  id: string;
  author: { id: number; name: string };
  body: string;
  createdAt: string;
  visibility: "public" | "internal";
  attachments?: { documentId: string; name: string }[];
}

interface CommentPanelProps {
  workflowInstanceId: string;
  comments: WorkflowComment[];
  onAddComment: (body: string, visibility: "public" | "internal") => Promise<void>;
  canComment: boolean;
}
```

| Feature | v1 | Future |
|---------|-----|--------|
| Plain text | ✅ | |
| Rich text | | ✅ |
| Mentions | | ✅ |
| Attachments | Link existing documents | Upload inline |
| Internal notes | ✅ Toggle visibility | |

List: chronological, author + timestamp. Internal comments: `bg-amber-50` + "Internal" badge.

---

## 5. `WorkflowTimeline`

Extends `ActivityTimeline` with workflow-specific events:

| Event | Title example |
|-------|---------------|
| `submitted` | Submitted for approval |
| `approved` | Approved by Finance |
| `rejected` | Rejected |
| `returned` | Returned for revision |
| `delegated` | Delegated to Jane Doe |
| `reassigned` | Reassigned to David Mwangi |
| `commented` | Comment added |
| `escalated` | Escalated due to SLA |

Data: `GET /api/v1/workflow/instances/{id}/timeline` → `ActivityEvent[]` (extend `ActivityAction`).

Replace synthetic `AuditTrail` on expense page when API available.

---

## 6. `ApprovalHistory`

Read-only table variant for auditors — wraps `AuditTrail` with workflow columns:

| Column | Field |
|--------|-------|
| When | `timestamp` |
| User | `actor` |
| Action | `action` |
| Step | `stepLabel` |
| Comment | `details` |

Export CSV via Phase 06 `downloadCsv` for audit exports.

---

## 7. Delegation

### `DelegationDialog`

```tsx
interface DelegatePayload {
  delegateUserId: number;
  effectiveFrom: string;
  effectiveTo: string;
  reason: string;
}
```

Fields:

- Delegate to (user lookup / select)
- Effective dates (date range)
- Reason (required)

API: `POST /api/v1/workflow/instances/{id}/delegate`

Show active delegation on diagram assignee chip.

---

## 8. Reassignment

Admin or workflow owner reassigns current step to another user.

```tsx
interface ReassignPayload {
  assigneeUserId: number;
  reason: string;
}
```

API: `POST /api/v1/workflow/instances/{id}/reassign`

Confirm with `AlertDialog`.

---

## 9. Submit for Approval

Before workflow starts:

1. Validate entity form
2. Check required attachments (Phase 11 `requiredCategories`)
3. `POST /api/v1/workflow/submit` or entity `.../submit`

Show validation summary (Phase 07 `ValidationSummary`) when blocked.

---

## 10. API Summary (target)

| Endpoint | Method | Action |
|----------|--------|--------|
| `/api/v1/workflow/submit` | POST | Start workflow |
| `/api/v1/workflow/instances/{id}` | GET | Instance + steps |
| `/api/v1/workflow/instances/{id}/approve` | POST | Approve step |
| `/api/v1/workflow/instances/{id}/reject` | POST | Reject |
| `/api/v1/workflow/instances/{id}/return` | POST | Return |
| `/api/v1/workflow/instances/{id}/delegate` | POST | Delegate |
| `/api/v1/workflow/instances/{id}/reassign` | POST | Reassign |
| `/api/v1/workflow/instances/{id}/comments` | GET/POST | Comments |
| `/api/v1/workflow/instances/{id}/timeline` | GET | Timeline |

Entity-scoped interim (current): `POST /api/v1/expenses/{id}/approve` — migrate to workflow instance endpoints.

---

## 11. Hooks

```ts
export function useWorkflow(entityType: string, entityId: string | number) { ... }

export function useWorkflowActions(instanceId: string) {
  return {
    approve: useMutation(...),
    reject: useMutation(...),
    return: useMutation(...),
    delegate: useMutation(...),
    reassign: useMutation(...),
  };
}

export function useWorkflowComments(instanceId: string) { ... }
```

Mutations invalidate: `["workflow", ...]`, `["workflow", "inbox"]`, entity query, activity feed.

Toast success/error via Sonner (Phase 10).

---

## 12. Mobile

- Actions sticky bottom bar: Approve | Reject | More (Return, Delegate)
- Diagram vertical, collapsible
- Comments full-width below actions
- Swipe inbox card → open detail (inbox page)

---

## 13. Accessibility

- Action toolbar: `role="toolbar"`, labelled buttons
- Comment form: `aria-label="Add approval comment"`
- Focus trap in reject/delegate dialogs
- Timeline: semantic `<ol>` (existing `ActivityTimeline` pattern)

---

## 14. Module Migration Checklist

| Module | Current | Target |
|--------|---------|--------|
| Expenses | `ExpenseWorkflowPanel` | `WorkflowDetailView` + pay/reconcile panel |
| Budgets | Inline approve buttons | `WorkflowDetailView` |
| Grants | Activate/close only | `WorkflowDetailView` when workflow API ready |
| Journal entries | None | `WorkflowDetailView` |

---

## 15. Component Checklist

- [ ] `WorkflowDetailView` shell
- [ ] `ApprovalActions` with dialogs
- [ ] `CommentPanel`
- [ ] `DelegationDialog`
- [ ] `WorkflowTimeline` (API-backed)
- [ ] `ApprovalHistory`
- [ ] `useWorkflow` + `useWorkflowActions`
- [ ] Migrate expense panel
- [ ] Wire notifications on action success
