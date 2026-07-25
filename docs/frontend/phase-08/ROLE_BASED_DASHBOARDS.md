# Role-Based Dashboards

**Phase:** 08 — Dashboard & Analytics Framework  
**Permissions:** `frontend/src/lib/navigation/permissions.ts`  
**Guard:** `frontend/src/components/auth/dashboard-guard.tsx`

---

## 1. Strategy

Dashboard content is **configuration-driven by role**, not separate component trees per role.

```
Role → Default dashboard route → Widget config filter → Rendered layout
```

Same widget components, different registry entries. A Finance Manager sees cash KPIs; an Executive sees net position — both use `KPIWidget`.

---

## 2. Role → Dashboard Mapping

**Current implementation (`permissions.ts`):**

| Role | Default path | Dashboard view |
|------|--------------|----------------|
| `SUPER_ADMIN` | `/platform/dashboard` | Platform (separate) |
| `ORG_ADMIN` | `/dashboard/executive` | Executive |
| `FINANCE_MANAGER` | `/dashboard/finance` | Finance |
| `FUNDRAISING_MANAGER` | `/dashboard/fundraising` | Fundraising |
| `PROJECT_MANAGER` | `/dashboard/executive` | Executive (shared) |
| `AUDITOR` | `/dashboard/executive` | Executive (read-only) |
| `VIEWER` | `/dashboard/executive` | Executive (limited) |

`DashboardGuard` redirects unauthorized users to `getDefaultDashboardPath(role)`.

---

## 3. Access Control Layers

| Layer | Mechanism |
|-------|-----------|
| Route | `DashboardGuard` + `canAccessDashboard(path, role)` |
| Widget | `requiredPermission` / `requiredRole` on `WidgetDefinition` |
| Quick action | `PermissionGate` or `hasPermission` filter |
| Data | API enforces org + role scope |

**Never rely on hiding widgets alone for security** — API must reject unauthorized metrics.

---

## 4. Dashboard Configs by Role

### Executive (`ORG_ADMIN`, `PROJECT_MANAGER`, `AUDITOR`, `VIEWER`)

**Questions answered:** Overall health, trends, high-level KPIs.

| Zone | Widgets |
|------|---------|
| Welcome | User + org + fiscal period |
| KPI | Total donations, expenses, net position, cash, fund balance, donors, avg gift, campaigns |
| Alerts | Insights from `useInsights` |
| Analytics | Donation trend, expense trend |
| Activity | Cross-module feed (future) |
| Actions | New donation, expense, report links (permission-gated) |

**Viewer differences:** No quick actions requiring write permission; alerts read-only.

**Auditor differences:** Emphasize audit timeline widget; de-emphasize quick actions.

---

### Finance Manager

**Questions answered:** Cash, expenses, budget health, reconciliation status.

| Zone | Widgets |
|------|---------|
| Welcome | ✓ |
| KPI | Expenses, cash balance, budget utilization, pending journals, payables |
| Alerts | Budget exceeded, unreconciled transactions, failed payments |
| Analytics | Expense trend, budget vs actual (future) |
| Tasks | Pending journal approvals, expense approvals |
| Actions | Record expense, journal entry, trial balance |

**Current view:** `finance-dashboard-view.tsx` — uses `MetricCard` for budget utilization severity.

---

### Fundraising Manager

**Questions answered:** Donations, donors, campaigns, pipeline.

| Zone | Widgets |
|------|---------|
| Welcome | ✓ |
| KPI | Period donations, donor count, avg gift, active campaigns, pledge fulfillment |
| Alerts | Expiring campaigns, large gift anomalies |
| Analytics | Donation trend, campaign performance (future) |
| Activity | Recent donations |
| Actions | New donation, new donor, new campaign |

**Current view:** `fundraising-dashboard-view.tsx`

---

### Project Manager (future refinement)

| Zone | Widgets |
|------|---------|
| KPI | Project budgets, campaign progress, pending requests |
| Analytics | Project spend vs budget |
| Tasks | Assigned reviews |

Shares executive config until project-specific APIs exist.

---

## 5. Widget Config Example

```ts
// features/dashboard/config/finance.dashboard.ts
import type { WidgetDefinition } from "../types/widget";

export const financeDashboardWidgets: WidgetDefinition[] = [
  {
    id: "welcome",
    type: "welcome",
    zone: "welcome",
    title: "Welcome",
  },
  {
    id: "total-expenses",
    type: "kpi",
    zone: "kpi",
    title: "Total expenses",
    props: { metric: "totalExpenses", showTrend: true, invertTrend: true },
    requiredPermission: "expenses:read",
  },
  {
    id: "budget-utilization",
    type: "kpi",
    zone: "kpi",
    title: "Budget utilization",
    props: { metric: "budgetUtilizationPercent", variant: "threshold" },
    requiredPermission: "budgets:read",
  },
  {
    id: "expense-trend",
    type: "chart",
    zone: "analytics",
    title: "Expense trend",
    props: { chartType: "line", series: "expenseTrend" },
  },
  {
    id: "pending-approvals",
    type: "table",
    zone: "tasks",
    title: "Pending approvals",
    props: { resource: "expenses", status: "PENDING" },
    requiredPermission: "expenses:approve",
  },
  {
    id: "quick-actions",
    type: "quick-actions",
    zone: "actions",
    title: "Quick actions",
    props: {
      actions: ["new-expense", "new-journal", "trial-balance"],
    },
  },
];
```

---

## 6. Default Landing Behaviour

After login, redirect to `getDefaultDashboardPath(user.role)`:

```ts
export function getDefaultDashboardPath(role: Role) {
  switch (role) {
    case "FINANCE_MANAGER":
      return "/dashboard/finance";
    case "FUNDRAISING_MANAGER":
      return "/dashboard/fundraising";
    default:
      return "/dashboard/executive";
  }
}
```

Sidebar "Dashboard" link points to same default — not a generic `/dashboard` redirect loop.

---

## 7. Multi-Organization Context

Widgets scope data to active organization from `useApiContext()`:

```ts
queryKey: ["analytics", "dashboard", organizationId, from, to]
```

When user switches org via `OrganizationSwitcher`:

1. Invalidate all analytics query keys
2. Welcome banner updates org name
3. Widgets refetch independently

---

## 8. Platform vs Tenant Dashboards

| Context | Route | Notes |
|---------|-------|-------|
| Tenant ERP | `/dashboard/*` | This framework |
| Platform admin | `/platform/dashboard` | Separate widget set — org count, system health |

Do not mix platform widgets into tenant `DashboardLayout` config.

---

## 9. Personalization per User

Within a role, users may customize (future):

| Preference | Storage |
|------------|---------|
| Hidden widgets | `localStorage` or user settings API |
| Collapsed widgets | `localStorage` |
| Default date range | user settings API |
| Widget order | user settings API (Phase 09+) |

Role config provides **defaults**; user prefs overlay:

```ts
function resolveWidgets(roleConfig: WidgetDefinition[], userPrefs: UserDashboardPrefs) {
  return roleConfig
    .filter((w) => !userPrefs.hidden?.includes(w.id))
    .sort((a, b) => (userPrefs.order?.[a.id] ?? 0) - (userPrefs.order?.[b.id] ?? 0));
}
```

---

## 10. Adding a New Role Dashboard

1. Add role to `getDefaultDashboardPath` and `canAccessDashboard`
2. Create `config/{role}.dashboard.ts` widget array
3. Add route `app/(app)/dashboard/{role}/page.tsx` with `DashboardGuard`
4. Register sidebar nav item with permission check
5. **Do not** copy-paste an existing `*-dashboard-view.tsx` — compose from widgets

---

## 11. Migration Plan

| Step | Action |
|------|--------|
| 1 | Extract widgets from `executive-dashboard-view.tsx` |
| 2 | Create `DashboardLayout` + `WidgetContainer` |
| 3 | Create `DashboardPage` reading config |
| 4 | Migrate finance + fundraising to configs |
| 5 | Delete monolithic view files |
| 6 | Add per-widget loading states |

---

## 12. Anti-Patterns

| Avoid | Use instead |
|-------|-------------|
| `if (role === "FINANCE")` in widget JSX | Widget registry `requiredRole` |
| Separate `FinanceKPIWidget` + `ExecutiveKPIWidget` | One `KPIWidget` + `metric` prop |
| New dashboard route without `DashboardGuard` | Always guard |
| Hardcoded quick actions | Permission-filtered config |
| Role check only in frontend | API authorization |

---

## 13. Checklist

- [ ] Role mapped to default route
- [ ] `canAccessDashboard` updated for new routes
- [ ] Widget config file created per dashboard
- [ ] Widgets declare `requiredPermission` where needed
- [ ] Quick actions permission-filtered
- [ ] Org switch invalidates analytics queries
- [ ] No duplicate view components per role
