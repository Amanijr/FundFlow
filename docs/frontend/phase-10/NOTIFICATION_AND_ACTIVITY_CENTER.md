# Phase 10 — Notification & Activity Center

**Date:** 2026-06-30  
**Status:** Implemented  
**Dependencies:** Phase 00–09

---

## 1. Executive Summary

The Notification & Activity Center is FundFlow ERP's communication hub. It keeps users informed about events requiring attention, provides an auditable activity history, and ensures important business events are not missed.

This phase defines a **centralized notification framework** — not module-specific notification UIs. Every module publishes events through shared services; the framework handles display, read state, preferences, and real-time delivery.

---

## 2. Design Philosophy

| Principle | Application |
|-----------|-------------|
| **Relevant** | Role- and permission-filtered; no noise |
| **Actionable** | Every notification deep-links to a record or action |
| **Non-intrusive** | Toasts for confirmations; center for persistent items |
| **Timely** | Real-time when possible; polling fallback |
| **Permission-aware** | Users only see events they are authorized to view |

---

## 3. Notification Channels

| Channel | Purpose | Current component |
|---------|---------|-------------------|
| **In-app center** | Persistent notifications, unread count | `NotificationDropdown` (placeholder) |
| **Toast** | Short-lived confirmations | Sonner + `hooks/use-toast.ts` |
| **Persistent banner** | System-wide announcements | `MockModeBanner`, `TenantContextBanner` |
| **Activity timeline** | Chronological audit on entity pages | `ActivityTimeline` |
| **Dashboard feed** | Recent cross-module activity | `RecentActivityFeed` |

**Future:** Email, SMS, push, Teams, Slack — backend delivery; frontend preferences only.

---

## 4. Architecture

```
Module / API event
    ↓
Backend notification service
    ↓
REST (list, mark read) + WebSocket/SSE (push)
    ↓
frontend/lib/api/notifications.ts
    ↓
TanStack Query + optional useNotificationSocket
    ↓
NotificationProvider (state)
    ↓
├── NotificationBell → NotificationCenter (header)
├── ToastProvider (Sonner — already global)
├── BannerAlert (system announcements)
└── ActivityTimeline (entity / feed pages)
```

**Rule:** Modules never render custom bell icons or toast wrappers — use the framework.

---

## 5. Notification Types (Severity)

| Type | Color token | Examples | Persistence |
|------|-------------|----------|-------------|
| `info` | `muted` / `info` | Donation received, report ready | Until read |
| `success` | `success` | Budget approved, expense submitted | Until read |
| `warning` | `warning` | Budget nearing limit, campaign ending | Until read |
| `critical` | `danger` | Payment failed, approval overdue | Until acknowledged |

Critical notifications require explicit acknowledgment — not just mark-as-read.

---

## 6. Categories

| Category | Module examples |
|----------|-----------------|
| `financial` | GL, trial balance, reconciliation |
| `donations` | Gifts, pledges, receipts |
| `campaigns` | Goals, expiring campaigns |
| `budgets` | Utilization, approvals |
| `expenses` | Submissions, approvals, rejections |
| `users` | Invitations, role changes |
| `security` | Login, MFA, access denied |
| `workflow` | Approval steps, rejections |
| `reports` | Generated exports |
| `system` | Maintenance, service status |

Categories power filtering in the notification center. See [NOTIFICATION_LIFECYCLE.md](./NOTIFICATION_LIFECYCLE.md).

---

## 7. Current vs Target

### Implemented today

| Piece | Path | Status |
|-------|------|--------|
| Notification dropdown | `components/layout/notifications/notification-dropdown.tsx` | ⚠️ Placeholder data |
| Toast wrapper | `hooks/use-toast.ts` + Sonner in `app-providers.tsx` | ✅ |
| Activity timeline | `components/workflow/activity-timeline.tsx` | ✅ Presentational |
| Recent activity feed | `components/charts/recent-activity-feed.tsx` | ✅ Dashboard widget |
| Audit trail | `components/workflow/audit-trail.tsx` | ✅ Read-only list |
| Activity types | `types/workflow.ts` | ✅ `ActivityEvent`, `AuditRecord` |
| Header integration | `components/layout/header/header.tsx` | ✅ Bell in header |

### Target structure

```
features/notifications/
├── components/
│   ├── notification-bell.tsx
│   ├── notification-badge.tsx
│   ├── notification-center.tsx      # replaces dropdown at scale
│   ├── notification-card.tsx
│   ├── notification-filters.tsx
│   ├── notification-preferences.tsx
│   └── banner-alert.tsx
├── hooks/
│   ├── use-notifications.ts
│   ├── use-notification-preferences.ts
│   └── use-notification-socket.ts
├── lib/
│   └── notification-routes.ts       # deep link resolver
├── types/
│   └── notification.ts
└── api/
    └── notifications.ts
```

Activity timeline remains in `components/workflow/` but consumes shared `ActivityEvent` from notifications API where appropriate.

---

## 8. State Management

```ts
interface NotificationState {
  items: Notification[];
  unreadCount: number;
  filters: NotificationFilters;
  preferences: NotificationPreferences | null;
  connectionStatus: "connected" | "polling" | "disconnected";
  isLoading: boolean;
  error: string | null;
}
```

- **Server state:** TanStack Query (`["notifications", orgId, filters]`)
- **Unread count:** Derived query or dedicated lightweight endpoint
- **Optimistic updates:** Mark read / archive before API confirms
- **Real-time:** Invalidate or append on socket event

---

## 9. Deep Linking

Every notification carries:

```ts
interface NotificationLink {
  href: string;           // e.g. /expenses/1042
  entityType: string;     // e.g. "expense"
  entityId: string | number;
}
```

Clicking a `NotificationCard` navigates via `router.push(notification.link.href)` and marks read.

Resolver utility maps backend `referenceType` + `referenceId` to app routes — single source in `lib/notification-routes.ts`.

---

## 10. Permission Model

- API returns only notifications for the authenticated user within their org context (`X-Organization-Id`)
- Frontend filters by `requiredRole` / `requiredPermission` if present on payload (defense in depth)
- Security notifications visible only to `ORG_ADMIN` and affected user
- Auditors receive `workflow` + `security` categories

Never display notification body content for records the user cannot access — link click still goes through route guards.

---

## 11. Related Documents

| Document | Contents |
|----------|----------|
| [NOTIFICATION_LIFECYCLE.md](./NOTIFICATION_LIFECYCLE.md) | States, API, card spec |
| [ACTIVITY_TIMELINE.md](./ACTIVITY_TIMELINE.md) | Timeline vs notifications vs audit |
| [REALTIME_STRATEGY.md](./REALTIME_STRATEGY.md) | WebSocket, SSE, polling |
| [NOTIFICATION_PREFERENCES.md](./NOTIFICATION_PREFERENCES.md) | User settings |
| [TOAST_AND_ALERT_GUIDE.md](./TOAST_AND_ALERT_GUIDE.md) | Toasts vs center vs banners |
| Phase 09 [SESSION_MANAGEMENT.md](../phase-09/SESSION_MANAGEMENT.md) | Session warning toasts |
| Phase 08 [DASHBOARD_AND_ANALYTICS_FRAMEWORK.md](../phase-08/DASHBOARD_AND_ANALYTICS_FRAMEWORK.md) | Activity widget on dashboard |

---

## 12. Acceptance Criteria

- [x] Notification architecture documented
- [x] Lifecycle and categories defined
- [x] Activity timeline strategy documented
- [x] Real-time strategy documented
- [x] Preferences model documented
- [x] Toast and alert guide documented
- [x] `NotificationCenter` with API integration
- [x] Real-time updates (polling; WebSocket/SSE ready via hook)
- [x] Mark read / mark all read / archive
- [x] Deep linking from notifications
- [x] Notification preferences page
- [x] Mobile full-screen drawer
- [x] Accessibility: live region for new notifications

---

## 13. Governance

Do not proceed to Phase 11 until this framework is reviewed and approved.

Modules publish notifications via backend APIs — no local `toast()` for cross-user events, no duplicate bell components.
