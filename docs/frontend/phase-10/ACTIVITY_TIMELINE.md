# Activity Timeline

**Phase:** 10 — Notification & Activity Center

---

## 1. Purpose

Activity timelines provide a **chronological, auditable history** of events on an entity, user, or organization. They complement the notification center:

| Feature | Notifications | Activity timeline |
|---------|---------------|-------------------|
| **Audience** | Action required / awareness | Audit & context |
| **Persistence** | Inbox with read state | Immutable log |
| **Scope** | User's relevant events | Entity- or org-scoped |
| **Real-time** | Push to bell | Append on page or stream |

---

## 2. Existing Components

| Component | Path | Use case |
|-----------|------|----------|
| `ActivityTimeline` | `components/workflow/activity-timeline.tsx` | Entity detail pages |
| `AuditTrail` | `components/workflow/audit-trail.tsx` | Compliance-style audit list |
| `RecentActivityFeed` | `components/charts/recent-activity-feed.tsx` | Dashboard summary |
| `DashboardInsights` | `components/dashboard/dashboard-insights.tsx` | Operational alerts (not timeline) |

---

## 3. Activity Event Model

**Current** (`types/workflow.ts`):

```ts
interface ActivityEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}
```

**Target extension:**

```ts
interface ActivityEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: {
    id: number;
    name: string;
    avatarUrl?: string;
  };
  action: ActivityAction;       // e.g. "created", "approved", "updated"
  entityType: string;           // e.g. "donation", "expense"
  entityId?: string | number;
  entityLabel?: string;         // e.g. "Donation #4521"
  organizationId?: number;
  status?: "success" | "warning" | "error" | "neutral";
  link?: string;
}

type ActivityAction =
  | "created"
  | "updated"
  | "deleted"
  | "approved"
  | "rejected"
  | "submitted"
  | "commented"
  | "assigned"
  | "login"
  | "exported";
```

---

## 4. Timeline vs Audit Trail

| | Activity timeline | Audit trail |
|---|-------------------|-------------|
| **Tone** | User-friendly narrative | Formal compliance record |
| **Fields** | Title, description, actor | User, action, details |
| **Audience** | All authorized users | Admins, auditors |
| **Component** | `ActivityTimeline` | `AuditTrail` |
| **API** | `/api/v1/activity` | `/api/v1/audit` (target) |

Use timeline on donation/expense/grant detail pages. Use audit trail on admin and platform logs.

---

## 5. TimelineEvent Component (target)

Enhancement to `ActivityTimeline` — extract `TimelineEvent` row:

```tsx
interface TimelineEventProps {
  event: ActivityEvent;
  isLast?: boolean;
  showConnector?: boolean;
}
```

### Visual spec (matches current)

- Vertical connector line between events
- Dot: `border-2 border-primary bg-surface`
- Status variants: success dot `border-success`, error `border-danger`
- Timestamp: `MMM d, yyyy h:mm a` via `date-fns`
- Actor suffix: ` · Jane Admin`

### Rich events (target)

```
● Expense approved
  Expense #1042 for $250.00 was approved by Finance Manager.
  Mar 15, 2026 2:30 PM · Sarah Chen
  [View expense]
```

Link when `event.link` present.

---

## 6. Page Placement

| Page | Timeline source |
|------|-----------------|
| `/donations/[id]` | Donation activity API |
| `/expenses/[id]` | Expense workflow + comments |
| `/grants/[id]` | Grant milestones |
| `/donors/[id]` | Donor interactions |
| `/admin/users/[id]` | User admin actions |
| `/platform/dashboard/logs/[id]` | Platform audit |

Pattern:

```tsx
<Panel>
  <PanelHeader><PanelTitle>Activity</PanelTitle></PanelHeader>
  <PanelContent>
    {isLoading ? <TimelineSkeleton /> : <ActivityTimeline events={data} />}
  </PanelContent>
</Panel>
```

---

## 7. Activity Feed API (target)

```
GET /api/v1/activity?entityType=expense&entityId=1042&page=0&size=20
GET /api/v1/activity/feed          # org-wide recent (dashboard)
```

Response:

```json
{
  "success": true,
  "data": {
    "items": [ ActivityEvent[] ],
    "page": 0,
    "totalPages": 3,
    "totalElements": 42
  }
}
```

Hook:

```ts
export function useActivityFeed(entityType: string, entityId: string) {
  return useQuery({
    queryKey: ["activity", entityType, entityId, organizationId],
    queryFn: () => fetchActivity(entityType, entityId),
    enabled: Boolean(token && entityId),
  });
}
```

---

## 8. Dashboard Recent Activity

`RecentActivityFeed` shows last N org events — subset of activity feed:

```ts
interface FeedItem {
  id: string;
  title: string;
  subtitle?: string;
  timestamp: string;
  link?: string;
}
```

Map `ActivityEvent` → `FeedItem` in hook layer. Max 5 items on dashboard; "View all" → `/activity` page (target).

---

## 9. Relationship to Notifications

Same backend event may produce:

1. **Notification** — if user should be alerted (inbox)
2. **Activity record** — always logged for audit

Example: Expense approved

- Notification to submitter: "Your expense was approved"
- Activity on expense record: "Approved by Sarah Chen"

Do not duplicate notification UI inside timeline — cross-link when relevant.

---

## 10. Empty & Loading States

| State | Message |
|-------|---------|
| Empty | "No activity yet." (current) |
| Loading | 3 skeleton rows with dot + lines |
| Error | "Unable to load activity." + retry |

---

## 11. Accessibility

- Timeline: `<ol>` with `<li>` per event (current)
- Each event: `aria-label` summarizing action + time
- New live events (real-time): `aria-live="polite"` on container when appending

---

## 12. Mobile

- Full-width timeline on detail pages
- Reduced padding; connector line remains
- Tap event row → navigate if `link` set

---

## 13. Checklist

- [ ] Extended `ActivityEvent` type
- [ ] `useActivityFeed` hook
- [ ] `TimelineEvent` sub-component
- [ ] Skeleton loading state
- [ ] Deep links on events
- [ ] Dashboard feed wired to API
- [ ] Distinguish timeline vs audit trail usage in docs per page
