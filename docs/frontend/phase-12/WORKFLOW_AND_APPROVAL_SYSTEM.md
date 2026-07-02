# Phase 12 — Workflow & Approval System

**Date:** 2026-06-30  
**Status:** Implemented  
**Dependencies:** Phase 00–11

---

## 1. Executive Summary

Workflow is the operational backbone of FundFlow ERP. Sensitive financial and operational actions route through configurable approval processes based on roles, thresholds, and organizational policy — not ad-hoc module logic.

This phase defines a **centralized workflow and approval framework**. Modules submit requests and render detail views through shared services; the framework handles inbox, steps, actions, timeline, SLA, and audit.

---

## 2. Design Philosophy

| Principle | Application |
|-----------|-------------|
| **Predictable** | Same statuses, colors, and actions everywhere |
| **Transparent** | Users always see current stage and next approver |
| **Configurable** | Flow definitions live on the backend |
| **Auditable** | Every decision and comment is immutable history |
| **Secure** | Only authorized approvers act on pending steps |

---

## 3. Workflow Types

| Category | Examples | Current integration |
|----------|----------|---------------------|
| **Financial** | Expense, budget, journal entry, fund transfer | Expense panel ✅; budget inline buttons ⚠️ |
| **Operational** | Purchase request, vendor registration, campaign, project | Planned |
| **Administrative** | User invitation, role request, org change | Planned |

Backend owns workflow definitions. Frontend consumes `workflowType` + `entityType` + `entityId`.

---

## 4. Architecture

```
Module submits entity
    ↓
Backend workflow engine (definition + routing)
    ↓
lib/api/workflow.ts
    ↓
TanStack Query hooks
    ↓
├── ApprovalInbox (/approvals)
├── WorkflowDetailView (entity page section)
├── WorkflowTimeline + WorkflowDiagram
├── ApprovalActions + CommentPanel
├── DelegationDialog
└── Notifications (Phase 10) + Documents (Phase 11)
```

**Rule:** Modules do not implement custom approve/reject button rows — use `ApprovalActions` and `WorkflowDetailView`.

---

## 5. Workflow Lifecycle

```
draft → submitted → validation → approval_queue → in_review
    → approved → executed → completed

Branches: rejected | returned | cancelled | expired
```

See [WORKFLOW_STATUSES.md](./WORKFLOW_STATUSES.md).

---

## 6. Approval Strategies

| Strategy | Description | Doc |
|----------|-------------|-----|
| Single approver | One user decides | [WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md) |
| Sequential | Steps in order (Manager → Finance → Director) | Same |
| Parallel | Multiple approvers simultaneously | Same |
| Conditional | Route by amount, category, org rules | Same |

Frontend renders strategy from API `steps[]` — never hardcodes levels.

---

## 7. Current vs Target

### Implemented today

| Piece | Path | Status |
|-------|------|--------|
| Workflow stepper | `components/workflow/workflow-stepper.tsx` | ✅ Presentational |
| Workflow status | `components/workflow/workflow-status.tsx` | ✅ |
| Approval actions card | `components/workflow/approval-workflow.tsx` | ⚠️ Basic buttons |
| Activity timeline | `components/workflow/activity-timeline.tsx` | ✅ |
| Audit trail | `components/workflow/audit-trail.tsx` | ✅ |
| Expense workflow panel | `components/expenses/expense-workflow-panel.tsx` | ⚠️ Module-specific |
| Expense API actions | `lib/api/expenses.ts` (submit/approve/reject/…) | ⚠️ Entity-scoped |
| Budget approve | `budgets/[id]/page.tsx` inline buttons | ⚠️ No shared framework |
| Activity feed API | `lib/api/notifications.ts` → `listActivityFeed` | ✅ |
| Notification `workflow` category | `lib/notification-categories.ts` | ✅ Defined, lightly used |

### Target structure

```
features/workflow/
├── components/
│   ├── workflow-card.tsx
│   ├── workflow-status-badge.tsx
│   ├── workflow-timeline.tsx
│   ├── workflow-diagram.tsx
│   ├── approval-inbox.tsx
│   ├── approval-actions.tsx
│   ├── comment-panel.tsx
│   ├── delegation-dialog.tsx
│   ├── sla-indicator.tsx
│   └── approval-history.tsx
├── hooks/
│   ├── use-workflow.ts
│   ├── use-approval-inbox.ts
│   └── use-workflow-actions.ts
├── lib/
│   ├── workflow-routes.ts
│   └── workflow-status-styles.ts
├── types/
│   └── workflow-instance.ts
└── api/
    └── workflow.ts
```

Existing `components/workflow/*` primitives migrate into or wrap `features/workflow` components.

---

## 8. State Management

```ts
interface WorkflowUIState {
  instance: WorkflowInstance | null;
  inbox: InboxItem[];
  inboxFilters: InboxFilters;
  comments: WorkflowComment[];
  timeline: WorkflowEvent[];
  selectedIds: string[];
  isLoading: boolean;
  error: string | null;
}
```

| Concern | Approach |
|---------|----------|
| Workflow instance | `useWorkflow(entityType, entityId)` or `useWorkflowById(id)` |
| Approval inbox | `useApprovalInbox(filters)` |
| Actions | `useWorkflowActions()` mutations with optimistic invalidation |
| Comments | Nested query on workflow instance |
| Real-time | Invalidate inbox on notification `workflow.*` events (Phase 10) |

---

## 9. Integration Points

| Surface | Component | Notes |
|---------|-----------|-------|
| `/approvals` | `ApprovalInbox` | Central queue (new route) |
| `/expenses/[id]` | `WorkflowDetailView` | Replace bespoke panel gradually |
| `/budgets/[id]` | `WorkflowDetailView` | Replace inline buttons |
| `/grants/[id]` | `WorkflowDetailView` | Activate/close as workflow |
| Header / nav | Link to `/approvals` | Badge count from inbox |
| Dashboard | `PendingApprovalsWidget` | Phase 08 spec |
| Notifications | `workflow` category | Approval requested, overdue |
| Documents | `AttachmentList` | Required docs before submit |
| Activity | `WorkflowTimeline` | Replaces synthetic audit where API exists |

---

## 10. Security & Permissions

- Approve/reject/delegate buttons gated by `PermissionGate` + server `canAct` flag on current step
- Inbox returns only items user may act on or has visibility to
- Never show approver actions when `instance.status` is terminal
- Delegation UI only when policy allows and user is assignee

Authorization model: Phase 09 [AUTHORIZATION_MODEL.md](../phase-09/AUTHORIZATION_MODEL.md).

---

## 11. Related Documents

| Document | Contents |
|----------|----------|
| [APPROVAL_INBOX.md](./APPROVAL_INBOX.md) | Inbox UI, filters, bulk actions |
| [WORKFLOW_DIAGRAMS.md](./WORKFLOW_DIAGRAMS.md) | Step visualization, strategies |
| [WORKFLOW_STATUSES.md](./WORKFLOW_STATUSES.md) | Status enum, badges, colors |
| [SLA_AND_ESCALATION.md](./SLA_AND_ESCALATION.md) | SLA indicators, escalation rules |
| [APPROVAL_UI_GUIDELINES.md](./APPROVAL_UI_GUIDELINES.md) | Detail view, comments, actions |
| Phase 10 [NOTIFICATION_LIFECYCLE.md](../phase-10/NOTIFICATION_LIFECYCLE.md) | Workflow notifications |
| Phase 11 [ATTACHMENT_FRAMEWORK.md](../phase-11/ATTACHMENT_FRAMEWORK.md) | Required attachments |
| `docs/WORKFLOWS.md` | Business workflow definitions (repo root) |

---

## 12. Acceptance Criteria

- [x] Workflow architecture documented
- [x] Approval strategies defined
- [x] Inbox specified
- [x] Status model documented
- [x] SLA/escalation documented
- [x] UI guidelines documented
- [x] `lib/api/workflow.ts` implemented
- [x] `/approvals` inbox page
- [x] `WorkflowDetailView` on expense, budget, grant
- [x] `WorkflowDiagram` component
- [x] Comment panel with audit integration
- [x] Delegation dialog
- [x] SLA indicator
- [x] Mock workflow handlers
- [ ] Pending approvals dashboard widget

---

## 13. Governance

Do not proceed to Phase 13 until this framework is reviewed and approved.

Modules submit and display workflows via shared hooks and components — no module-specific approval button rows.
