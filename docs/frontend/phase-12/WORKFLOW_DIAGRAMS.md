# Workflow Diagrams

**Phase:** 12 — Workflow & Approval System

---

## 1. Purpose

Users must immediately see **where a request sits** in the approval process: completed steps, current step, and what comes next.

`WorkflowDiagram` renders backend-driven step definitions — not hardcoded module flows.

---

## 2. Component: `WorkflowDiagram`

```tsx
interface WorkflowDiagramProps {
  steps: WorkflowStep[];
  currentStepId: string;
  variant?: "horizontal" | "vertical";
  compact?: boolean;
  className?: string;
}

interface WorkflowStep {
  id: string;
  label: string;
  strategy: "single" | "sequential" | "parallel" | "conditional";
  status: "pending" | "active" | "completed" | "skipped" | "rejected";
  assignees?: WorkflowAssignee[];
  completedAt?: string;
  completedBy?: string;
  parallelGroup?: string;      // same group = parallel lane
  conditionLabel?: string;     // e.g. "Amount ≥ TZS 1M"
}
```

---

## 3. Visual Spec

### Horizontal (default on desktop)

```
[✓ Submitted] — [✓ Manager] — [● Finance] — [○ Director] — [○ Complete]
```

### Vertical (mobile / sidebar)

```
✓ Submitted
│
✓ Manager approved · Sarah · Mar 1
│
● Finance review · David (current)
│
○ Director
│
○ Complete
```

| Step status | Icon | Style |
|-------------|------|-------|
| `completed` | Check circle | `text-success`, filled connector |
| `active` | Circle dot | `border-primary`, bold label |
| `pending` | Empty circle | `text-muted-foreground` |
| `skipped` | Dash | Muted, "(skipped)" |
| `rejected` | X circle | `text-danger` |

Reuse styling from `WorkflowStepper` (`components/workflow/workflow-stepper.tsx`) — diagram adds assignees and parallel lanes.

---

## 4. Approval Strategies (rendering)

### Single approver

One step node between submit and complete.

### Sequential

Linear chain — each step unlocks the next.

```
Step 1 → Step 2 → Step 3 → Complete
```

### Parallel

Split lanes merge before next sequential step:

```
        ┌─ Finance ────┐
Submit ─┤              ├─ Director → Complete
        └─ Legal ──────┘
```

Render parallel group as stacked cards with shared parent connector.

### Conditional

Show branch label on connector; only **active path** steps are `pending`/`active`; inactive branch steps `skipped` or hidden per API flag `visible: false`.

Example API payload:

```json
{
  "steps": [
    { "id": "manager", "label": "Manager", "status": "completed" },
    { "id": "finance", "label": "Finance Director", "status": "active", "conditionLabel": "Amount ≥ 1,000,000" }
  ]
}
```

Frontend does not evaluate conditions — displays what backend sends.

---

## 5. Assignee Display

On active step show:

```
Finance review
Assigned to: David Mwangi
Delegated from: Grace Admin (until Mar 15)
```

`WorkflowAssignee`:

```ts
interface WorkflowAssignee {
  userId: number;
  name: string;
  role?: string;
  delegatedFrom?: { userId: number; name: string; until?: string };
}
```

---

## 6. Integration with `WorkflowDetailView`

```
┌─ Request summary ─────────────────────┐
│ Amount, requestor, dates              │
├───────────────────────────────────────┤
│ WorkflowDiagram (horizontal)          │
├───────────────────────────────────────┤
│ ApprovalActions                       │
│ CommentPanel                          │
│ WorkflowTimeline                      │
└───────────────────────────────────────┘
```

On mobile: diagram `variant="vertical"` above fold; collapse to summary chip when `compact`.

---

## 7. Relationship to `WorkflowStepper`

| Component | Use |
|-----------|-----|
| `WorkflowStepper` | Simple linear status (expense DRAFT→PAID) — **entity lifecycle** |
| `WorkflowDiagram` | Multi-actor approval definition — **workflow instance** |

Expense detail may show **both**: stepper for payment lifecycle, diagram for approval routing when backend exposes `WorkflowInstance`.

Migration: `ExpenseWorkflowPanel` keeps stepper; add diagram when workflow API available.

---

## 8. Accessibility

- Root: `<nav aria-label="Approval progress">` with `<ol>` of steps
- Each step: `aria-current="step"` when active
- Parallel groups: `aria-describedby` explaining "Finance and Legal review in parallel"
- Textual summary for screen readers:

```tsx
<p className="sr-only">
  Step 3 of 5: Finance review, assigned to David Mwangi
</p>
```

---

## 9. API Data

`GET /api/v1/workflow/instances/{id}` or embedded in entity workflow response:

```json
{
  "instance": {
    "id": "wf-1042",
    "status": "in_review",
    "currentStepId": "finance",
    "steps": [ WorkflowStep[] ]
  }
}
```

---

## 10. Mock Examples

| Workflow type | Steps |
|---------------|-------|
| Expense &lt; 1M | Manager → Complete |
| Expense ≥ 1M | Manager → Finance → Director → Complete |
| Budget | Program Manager → Finance → ORG_ADMIN |
| Parallel PO | Procurement ∥ Legal → Finance |

Store in `lib/mock/workflow-store.ts` keyed by `workflowType`.

---

## 11. Checklist

- [ ] `WorkflowStep` type
- [ ] `WorkflowDiagram` component (horizontal + vertical)
- [ ] Parallel lane layout
- [ ] Assignee + delegation labels
- [ ] Accessible step list
- [ ] Integrate into `WorkflowDetailView`
- [ ] Mock step definitions per workflow type
