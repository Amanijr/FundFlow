# Phase 08 — Dashboard & Analytics Framework

**Date:** 2026-06-30  
**Status:** Approved (documentation)  
**Dependencies:** Phase 00–07  
**Stack:** React 19, Next.js 15, TanStack Query, Recharts, Tailwind 4

---

## 1. Executive Summary

The dashboard is FundFlow ERP's operational command center. Every authenticated user lands on a role-aware dashboard that answers three questions within five seconds:

1. **What needs my attention?**
2. **What has changed recently?**
3. **What is the current financial and operational status?**

This phase defines a **reusable dashboard platform** — not the content of individual module dashboards. Modules register widgets; the framework handles layout, loading, errors, refresh, and permissions.

---

## 2. Design Vision

| Principle | Application |
|-----------|-------------|
| **Widget independence** | Each widget loads, fails, and refreshes on its own |
| **Role configuration** | Content varies by role — not by hardcoded page forks |
| **Separation of concerns** | Widgets render; hooks fetch; services own business rules |
| **Progressive disclosure** | KPIs first, charts second, tables and drill-down on demand |
| **Consistent analytics** | One chart library, one KPI format, one color system |

---

## 3. Dashboard Zones

```
DashboardPage
    │
    ├── Zone 1 — Welcome Banner
    ├── Zone 2 — KPI Grid
    ├── Zone 3 — Operational Alerts
    ├── Zone 4 — Recent Activity
    ├── Zone 5 — Analytics (Charts)
    ├── Zone 6 — Tasks & Approvals
    └── Zone 7 — Quick Actions
```

See [DASHBOARD_LAYOUTS.md](./DASHBOARD_LAYOUTS.md) for zone layout and responsive grids.

---

## 4. Architecture

```
Route (app/dashboard/*/page.tsx)
    │
    ▼
DashboardGuard (permission check)
    │
    ▼
DashboardPage (config-driven)
    │
    ▼
DashboardLayout (zones + grid)
    │
    ├── WidgetContainer (loading / error / empty shell)
    │       └── Widget (KPI | Chart | Table | Alert | …)
    │
    └── Widget data via React Query hooks (per widget)
```

**Data flow:**

```
Widget → useWidgetQuery hook → API service → TanStack Query cache
```

Widgets never call APIs directly. Pages compose widgets; hooks own data fetching.

---

## 5. Current vs Target

### Implemented today

| Piece | Path | Status |
|-------|------|--------|
| Executive dashboard | `components/dashboard/executive-dashboard-view.tsx` | ✅ Monolithic view |
| Finance dashboard | `components/dashboard/finance-dashboard-view.tsx` | ✅ Monolithic view |
| Fundraising dashboard | `components/dashboard/fundraising-dashboard-view.tsx` | ✅ Monolithic view |
| KPIWidget | `components/charts/kpi-widget.tsx` | ✅ |
| MetricCard | `components/charts/metric-card.tsx` | ✅ Variant KPI |
| TrendChart | `components/charts/trend-chart.tsx` | ✅ Line chart (Recharts) |
| RecentActivityFeed | `components/charts/recent-activity-feed.tsx` | ✅ |
| DashboardInsights | `components/dashboard/dashboard-insights.tsx` | ✅ Alert-style |
| Analytics hooks | `hooks/use-analytics.ts` | ✅ React Query |
| DashboardGuard | `components/auth/dashboard-guard.tsx` | ✅ Role routing |
| Role permissions | `lib/navigation/permissions.ts` | ✅ |

### Target structure

```
features/dashboard/
├── components/
│   ├── layouts/
│   │   ├── dashboard-layout.tsx
│   │   └── welcome-banner.tsx
│   └── widgets/
│       ├── widget-container.tsx
│       ├── kpi-widget.tsx          # migrate from charts/
│       ├── chart-widget.tsx
│       ├── table-widget.tsx
│       ├── alert-widget.tsx
│       ├── timeline-widget.tsx
│       ├── progress-widget.tsx
│       ├── quick-action-card.tsx
│       └── recent-activity-card.tsx
├── config/
│   ├── executive.dashboard.ts
│   ├── finance.dashboard.ts
│   └── fundraising.dashboard.ts
├── hooks/
│   └── use-widget-query.ts
├── types/
│   └── widget.ts
└── pages/
    └── dashboard-page.tsx
```

---

## 6. Widget Types

| Type | Purpose | Current component |
|------|---------|-------------------|
| KPI | Metric + trend | `KPIWidget`, `MetricCard` |
| Chart | Line, bar, pie, area | `TrendChart` |
| Table | Recent records | Phase 06 `DataTable` (compact) |
| Alert | Prioritized notifications | `DashboardInsights` |
| Timeline | Chronological activity | `RecentActivityFeed`, `ActivityTimeline` |
| Progress | Goals, budgets, campaigns | Target `ProgressWidget` |
| Quick Action | Permission-gated shortcuts | Target `QuickActionCard` |

See [WIDGET_ARCHITECTURE.md](./WIDGET_ARCHITECTURE.md).

---

## 7. Widget Lifecycle

```
Mount → Loading (skeleton) → Success | Empty | Error
                ↓
         Refresh (manual / interval)
                ↓
         Update (stale-while-revalidate)
                ↓
         Dispose (unmount / cancel query)
```

Each widget wraps content in `WidgetContainer` with `status: loading | success | empty | error`.

---

## 8. Refresh Strategy

| Mode | Implementation |
|------|----------------|
| Manual | Refresh button in widget header → `queryClient.invalidateQueries` |
| Automatic | `refetchInterval` on React Query (e.g. 60s for KPIs) |
| Background | `refetchOnWindowFocus` + stale time per widget type |
| On org switch | Invalidate `["analytics", …, organizationId]` keys |

Default stale times: KPIs 30s, charts 5m, activity 1m. See widget config.

---

## 9. Personalization (future)

| Feature | Phase |
|---------|-------|
| Collapse widget | 08 target API (`collapsed` prop) |
| Hide widget | User prefs in localStorage |
| Reorder widgets | 09+ drag-and-drop grid |
| Save layout | Server-side user preferences |

Widget registry must support `id`, `defaultVisible`, `defaultOrder` from day one.

---

## 10. Performance

- Lazy-load chart widgets (`dynamic(() => import(...))` — Recharts is heavy)
- Skeleton per widget — never block entire dashboard on one slow query
- `React.memo` on presentational widgets
- TanStack Query deduplication — shared KPI queries across widgets
- Avoid waterfall: parallel `useQuery` per widget, not sequential fetches in parent

---

## 11. Accessibility

- KPI values: `aria-label` with full context ("Total donations: $125,000, up 12%")
- Charts: `aria-describedby` linking to text summary; Recharts `accessibilityLayer`
- Alert list: `role="list"`, severity in accessible name
- Keyboard: quick actions focusable; skip link to main dashboard content (Phase 03 shell)
- Color: never rely on color alone for trend direction — use icons (already in `KPIWidget`)

---

## 12. Security & Permissions

- `DashboardGuard` gates route access by role
- Widget registry filters by `requiredPermission` or `requiredRole`
- Quick actions use `PermissionGate` before render
- No sensitive KPI data in widget titles or query keys logged to console
- API enforces org scope — widgets pass `organizationId` from context

---

## 13. Related Documents

| Document | Contents |
|----------|----------|
| [WIDGET_ARCHITECTURE.md](./WIDGET_ARCHITECTURE.md) | Widget API, registry, container |
| [KPI_STANDARDS.md](./KPI_STANDARDS.md) | Formatting, trends, comparisons |
| [ANALYTICS_GUIDELINES.md](./ANALYTICS_GUIDELINES.md) | Charts, colors, export |
| [DASHBOARD_LAYOUTS.md](./DASHBOARD_LAYOUTS.md) | Zones, grids, responsive |
| [ROLE_BASED_DASHBOARDS.md](./ROLE_BASED_DASHBOARDS.md) | Role configs, routing |
| Phase 06 [ENTERPRISE_DATA_EXPERIENCE.md](../phase-06/ENTERPRISE_DATA_EXPERIENCE.md) | Table widgets |
| Phase 04 [DESIGN_TOKENS.md](../phase-04/DESIGN_TOKENS.md) | Chart colors (`--chart-1`…) |

---

## 14. Acceptance Criteria

- [x] Dashboard architecture documented
- [x] Widget types and lifecycle defined
- [x] KPI standards documented
- [x] Analytics guidelines documented
- [x] Layout zones defined
- [x] Role-based strategy documented
- [ ] `DashboardLayout` + `WidgetContainer` implemented
- [ ] Config-driven `DashboardPage`
- [ ] Widget registry per role
- [ ] Migrate executive/finance/fundraising views to widget config
- [ ] Per-widget loading/error/empty states
- [ ] Lazy-loaded chart widgets

---

## 15. Governance

Do not proceed to Phase 09 until this framework is reviewed and approved.

New dashboard content must register as widgets — no new monolithic `*-dashboard-view.tsx` files without framework approval.
