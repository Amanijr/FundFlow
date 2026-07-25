# SLA & Escalation

**Phase:** 12 — Workflow & Approval System

---

## 1. Purpose

Approvals must not stall indefinitely. SLA indicators surface urgency; escalation rules (backend-driven) trigger reminders and supervisor notifications when thresholds are exceeded.

Frontend **displays** SLA state and escalation events — rules are configured server-side.

---

## 2. SLA Model

```ts
interface WorkflowSLA {
  stepId: string;
  dueAt: string;              // ISO 8601 deadline
  warningAt?: string;           // e.g. 24h before due
  breachedAt?: string;          // set when past due
  percentElapsed?: number;      // 0–100 for progress ring
  status: "on_track" | "warning" | "breached";
}

interface EscalationEvent {
  id: string;
  workflowInstanceId: string;
  stepId: string;
  type: "reminder" | "escalation" | "supervisor_notify";
  triggeredAt: string;
  message: string;
  escalatedTo?: { id: number; name: string };
}
```

---

## 3. Component: `SLAIndicator`

```tsx
interface SLAIndicatorProps {
  sla: WorkflowSLA;
  compact?: boolean;
  className?: string;
}
```

### Display modes

| `sla.status` | UI |
|--------------|-----|
| `on_track` | Muted text: "Due in 2 days" |
| `warning` | Amber badge: "Due in 4 hours" |
| `breached` | Red badge: "Overdue by 1 day" |

**Compact** (inbox card): pill badge only.

**Full** (detail view): badge + thin progress bar (`percentElapsed`).

```tsx
<span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", styles)}>
  {label}
</span>
```

---

## 4. Default SLA Thresholds (backend reference)

| Event | Typical threshold |
|-------|-------------------|
| Reminder | 24 hours before due |
| Warning UI | 4 hours before due |
| Escalation | 72 hours pending on step |
| Supervisor notify | 5 business days |
| Expire workflow | Policy-specific (optional) |

Document for API team — frontend consumes `sla.status` and `EscalationEvent[]` on timeline.

---

## 5. Escalation on Timeline

Append escalation events to `WorkflowTimeline`:

```
● Escalated to Finance Director
  SLA exceeded on Manager step · Mar 3, 2026 9:00 AM
  System
```

Map `EscalationEvent.type` to timeline `ActivityAction` variant `escalated` (extend `ActivityAction` in `types/workflow.ts`).

---

## 6. Notifications

| Event | Channel | Severity |
|-------|---------|----------|
| Reminder | In-app + optional email | `info` |
| Escalation | In-app + email | `warning` |
| Supervisor notify | In-app | `warning` |
| SLA breached (critical) | In-app + bell live region | `critical` |

Integrate with Phase 10 `useNotificationRealtime` — invalidate inbox on escalation push.

Category: `workflow`. Deep link to `/approvals` or entity detail.

---

## 7. Inbox Sorting by SLA

`InboxFilters.sort = "sla"`:

1. `breached` items first (oldest breach first)
2. `warning` items next
3. `on_track` by `dueAt` asc

Visual: breached rows get `border-l-red-600`.

---

## 8. Delegation & SLA

When approver delegates:

- SLA may pause, reset, or continue — **backend decides**
- UI shows `delegatedUntil` on assignee chip
- Timeline event: "Delegated to Jane Doe until Mar 15"

See [APPROVAL_UI_GUIDELINES.md](./APPROVAL_UI_GUIDELINES.md) § Delegation.

---

## 9. API Contracts (target)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `GET /api/v1/workflow/instances/{id}/sla` | GET | Current step SLA |
| `GET /api/v1/workflow/instances/{id}/escalations` | GET | Escalation history |

SLA often embedded in instance payload:

```json
{
  "currentStep": {
    "id": "finance",
    "sla": {
      "dueAt": "2026-03-05T17:00:00Z",
      "status": "warning",
      "percentElapsed": 85
    }
  }
}
```

---

## 10. Business Hours (future)

Backend may compute SLA in business hours only. Frontend displays absolute `dueAt` in user timezone — optional subtitle "Business hours only" when `sla.businessHoursOnly: true`.

---

## 11. Mock Behavior

In mock mode:

- Inbox item `inbox-1`: `sla.status: "warning"`, due in 4h
- Inbox item `inbox-2`: `sla.status: "breached"`
- Timeline includes sample escalation event

---

## 12. Accessibility

- SLA badge: `aria-label="Due in 4 hours, warning status"`
- Breached: `role="status"` on indicator
- Do not rely on color alone — include text ("Overdue")

---

## 13. Checklist

- [ ] `WorkflowSLA` + `EscalationEvent` types
- [ ] `SLAIndicator` component
- [ ] SLA on `WorkflowCard` and detail view
- [ ] Inbox sort by SLA
- [ ] Timeline escalation events
- [ ] Workflow notifications for breach
- [ ] Mock SLA fixtures
