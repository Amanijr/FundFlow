# Notification Lifecycle

**Phase:** 10 — Notification & Activity Center

---

## 1. Lifecycle States

```
created → delivered → displayed → read → archived → (deleted)
                              ↘ acknowledged (critical only)
```

| State | Meaning | UI |
|-------|---------|-----|
| `created` | Server recorded event | — |
| `delivered` | Available to client (API or push) | — |
| `displayed` | Rendered in center or toast | Visible in list |
| `read` | User opened or dismissed | Muted styling, no dot |
| `acknowledged` | Critical item confirmed | Required for `critical` |
| `archived` | Hidden from default list | Accessible via filter |
| `deleted` | Soft-delete (retention policy) | Not shown |

---

## 2. Notification Model

```ts
type NotificationSeverity = "info" | "success" | "warning" | "critical";
type NotificationCategory =
  | "financial"
  | "donations"
  | "campaigns"
  | "budgets"
  | "expenses"
  | "users"
  | "security"
  | "workflow"
  | "reports"
  | "system";

type NotificationStatus = "unread" | "read" | "acknowledged" | "archived";

interface Notification {
  id: string;
  title: string;
  body?: string;
  severity: NotificationSeverity;
  category: NotificationCategory;
  status: NotificationStatus;
  createdAt: string;          // ISO 8601
  readAt?: string;
  acknowledgedAt?: string;
  actor?: {
    id: number;
    name: string;
  };
  link?: {
    href: string;
    entityType: string;
    entityId: string | number;
  };
  organizationId: number;
  metadata?: Record<string, unknown>;
}
```

---

## 3. API Contracts (target)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/notifications` | GET | List (paginated, filterable) |
| `/api/v1/notifications/unread-count` | GET | Badge count |
| `/api/v1/notifications/{id}` | GET | Single notification detail |
| `/api/v1/notifications/{id}/read` | POST | Mark read |
| `/api/v1/notifications/read-all` | POST | Mark all read |
| `/api/v1/notifications/{id}/acknowledge` | POST | Critical acknowledgment |
| `/api/v1/notifications/{id}/archive` | POST | Archive |
| `/api/v1/notifications/preferences` | GET/PUT | User preferences |

**List query params:** `status`, `category`, `severity`, `from`, `to`, `q`, `page`, `size`

**Headers:** `Authorization`, `X-Organization-Id`

---

## 4. Notification Card

**Target component:** `NotificationCard`

```
┌────────────────────────────────────────────┐
│ [icon]  Expense approved            ●      │
│         Expense #1042 was approved         │
│         Expenses · 2 hours ago             │
└────────────────────────────────────────────┘
```

| Element | Rule |
|---------|------|
| Icon | By `severity` + `category` (lucide) |
| Title | One line, `font-medium` when unread |
| Body | Optional, truncated to 2 lines in list |
| Timestamp | Relative (`2h ago`) + absolute on hover |
| Category | Muted label |
| Read indicator | Dot or bold weight |
| Priority | `critical` → left border `border-danger` |

### Severity styling

| Severity | Icon color | Border |
|----------|------------|--------|
| `info` | `text-muted-foreground` | none |
| `success` | `text-success` | none |
| `warning` | `text-warning` | `border-l-warning` |
| `critical` | `text-danger` | `border-l-danger` |

---

## 5. Notification Center UI

**Current:** `NotificationDropdown` — dropdown with placeholder items.

**Target:** `NotificationCenter` — same header entry, enhanced panel:

```
┌─ Notifications ──────────── Mark all read ─┐
│ [All] [Unread] [Financial] [Donations] ...   │  ← filters
├──────────────────────────────────────────────┤
│ NotificationCard                             │
│ NotificationCard                             │
│ NotificationCard                             │
├──────────────────────────────────────────────┤
│ View all notifications                       │
└──────────────────────────────────────────────┘
```

| Feature | Behaviour |
|---------|-----------|
| Unread badge | On bell — max display `9+` |
| Mark all read | Optimistic + API |
| Click item | Navigate + mark read |
| Empty state | "No notifications yet." |
| Loading | Skeleton rows (3–5) |
| Error | Inline retry, bell shows warning dot |
| Mobile | Full-screen `Sheet` / drawer |

---

## 6. Notification Bell

```tsx
interface NotificationBellProps {
  unreadCount: number;
  connectionStatus?: "connected" | "polling" | "disconnected";
  onOpen?: () => void;
}
```

- `aria-label`: `Notifications, ${unreadCount} unread`
- Disconnected: subtle amber dot on bell icon
- Opens center on click

---

## 7. Mark Read Behaviour

| Action | Scope | API |
|--------|-------|-----|
| Click notification | Single | `POST .../read` |
| Mark all read | All visible unread | `POST .../read-all` |
| View detail page | Single | Auto-read on navigation |
| Archive | Single | `POST .../archive` |

**Optimistic update:**

```ts
queryClient.setQueryData(["notifications"], (old) =>
  old?.map((n) => (n.id === id ? { ...n, status: "read" } : n)),
);
```

Revert on API failure.

---

## 8. Critical Acknowledgment

Critical notifications (`severity: critical`) remain highlighted until acknowledged:

```tsx
<AlertDialog>
  <AlertDialogTitle>{notification.title}</AlertDialogTitle>
  <AlertDialogAction onClick={() => acknowledge(id)}>
    Acknowledge
  </AlertDialogAction>
</AlertDialog>
```

Or inline "Acknowledge" button on card — blocks dismiss without action.

---

## 9. Publishing from Modules (backend)

Modules do not call frontend APIs. Backend services emit:

```json
{
  "eventType": "EXPENSE_APPROVED",
  "userId": 42,
  "organizationId": 1,
  "title": "Expense approved",
  "body": "Expense #1042 for $250 was approved.",
  "severity": "success",
  "category": "expenses",
  "link": { "entityType": "expense", "entityId": 1042 }
}
```

Notification service fan-out to subscribed users per role and preferences.

---

## 10. Mapping Placeholder → Target

Current `NotificationDropdown` fields:

| Placeholder | Target field |
|-------------|--------------|
| `id` | `id` |
| `title` | `title` |
| `category` | `category` (enum) |
| `time` | `createdAt` (formatted) |
| `read` | `status !== "unread"` |

Migrate to `useNotifications()` hook — remove `PLACEHOLDER_NOTIFICATIONS`.

---

## 11. Search & Filter

```ts
interface NotificationFilters {
  status?: "unread" | "read" | "archived" | "all";
  category?: NotificationCategory;
  severity?: NotificationSeverity;
  from?: string;
  to?: string;
  q?: string;
}
```

`NotificationFilters` component — chip bar above list (reuse Phase 06 `FilterChip` pattern).

---

## 12. Checklist

- [ ] `Notification` type defined in `types/notification.ts`
- [ ] API client functions implemented
- [ ] `useNotifications` hook with pagination
- [ ] `NotificationCard` component
- [ ] Center replaces placeholder dropdown
- [ ] Mark read / mark all read wired
- [ ] Deep link on click
- [ ] Critical acknowledgment flow
- [ ] Empty, loading, error states
- [ ] Accessible live region for new items
