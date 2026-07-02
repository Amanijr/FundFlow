# Dashboard Layouts

**Phase:** 08 — Dashboard & Analytics Framework  
**Shell:** Phase 03 `PageLayout`, `PageHeader`, `ContentContainer`

---

## 1. Page Structure

Every dashboard route follows:

```
App Shell (sidebar + header)
    └── PageLayout
            └── PageHeader (title, breadcrumbs, date range — future)
            └── DashboardLayout (zones)
```

Dashboard pages do not use `FormCard` or data table page patterns — they use zone-based grids.

---

## 2. DashboardLayout

Target component composing zones from widget registry:

```tsx
interface DashboardLayoutProps {
  config: DashboardConfig;
  widgets: WidgetDefinition[];
}

interface DashboardConfig {
  id: string;
  title: string;
  description?: string;
  zones: DashboardZoneConfig[];
}
```

Renders zones in order; each zone filters widgets by `zone` field.

---

## 3. Zone Definitions

| Zone ID | Name | Priority | Typical widgets |
|---------|------|----------|-----------------|
| `welcome` | Welcome | 1 | WelcomeBanner |
| `kpi` | KPI Overview | 2 | KPIWidget grid |
| `alerts` | Operational Alerts | 3 | AlertWidget |
| `activity` | Recent Activity | 4 | TimelineWidget |
| `analytics` | Charts | 5 | ChartWidget grid |
| `tasks` | Tasks & Approvals | 6 | TableWidget (compact) |
| `actions` | Quick Actions | 7 | QuickActionCard |

Zones are optional per role — omit empty zones entirely (no placeholder gaps).

---

## 4. Zone Layout Specs

### Zone 1 — Welcome

```
┌────────────────────────────────────────────────────────────┐
│  Good morning, Jane                    Acme Foundation      │
│  Tuesday, June 30, 2026                FY 2026 · Q2        │
└────────────────────────────────────────────────────────────┘
```

- Full width (`col-span-full`)
- `rounded-md border border-border bg-surface px-4 py-3`
- No loading skeleton longer than 200ms — static content from auth context

---

### Zone 2 — KPI Grid

```
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ KPI      │ │ KPI      │ │ KPI      │ │ KPI      │
└──────────┘ └──────────┘ └──────────┘ └──────────┘
```

```tsx
<section aria-label="Key metrics" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
```

- Max 2 rows above fold on desktop (8 KPIs)
- Additional KPI groups in separate grid sections with `SectionHeader`

**Current pattern (executive view):** Two consecutive 4-column grids — migrate to single config-driven grid with optional grouping.

---

### Zone 3 — Alerts

```
┌─ Insights ────────────────────────────────────────────────┐
│ ▌ Budget utilization above 90%                            │
│ ▌ 3 expenses awaiting approval                            │
└───────────────────────────────────────────────────────────┘
```

- Full width
- Max 5 visible; link to alerts center
- `DashboardInsights` styling: left border by severity

---

### Zone 4 — Recent Activity

```
┌─ Recent Activity ─────────────┐ ┌─ Tasks ──────────────────┐
│ • Donation $500 — Jane        │ │ Approve expense #1042    │
│ • Expense recorded            │ │ Review budget amendment  │
└───────────────────────────────┘ └──────────────────────────┘
```

Desktop: activity + tasks side by side (`lg:grid-cols-2`).  
Mobile: stacked.

---

### Zone 5 — Analytics

```
┌─ Donation Trend ──────────────┐ ┌─ Expense Trend ───────────┐
│  [line chart]                 │ │  [line chart]             │
└───────────────────────────────┘ └───────────────────────────────┘
```

```tsx
<section aria-label="Analytics" className="grid gap-3 lg:grid-cols-2">
```

- 1 or 2 charts per row on desktop
- Full-width for complex charts (cash flow, fund allocation)

---

### Zone 6 — Tasks

Compact table or checklist:

- Max 5 rows
- Row action: "Review" → navigates to approval
- Empty: "You're all caught up."

---

### Zone 7 — Quick Actions

```
┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
│ + Donation │ │ + Expense  │ │ + Donor    │ │ + Campaign │
└────────────┘ └────────────┘ └────────────┘ └────────────┘
```

```tsx
<div className="grid gap-3 grid-cols-2 sm:grid-cols-4">
```

- Icon + label buttons
- Permission-filtered
- Placed at bottom on mobile (after KPIs); optional top placement for power users (future pref)

---

## 5. Full Page Wireframe (Executive)

```
┌─────────────────────────────────────────────────────────────┐
│ PageHeader: Executive dashboard                             │
├─────────────────────────────────────────────────────────────┤
│ [Welcome Banner]                                            │
├─────────────────────────────────────────────────────────────┤
│ [KPI] [KPI] [KPI] [KPI]                                     │
│ [KPI] [KPI] [KPI] [KPI]                                     │
├─────────────────────────────────────────────────────────────┤
│ [Alerts — full width]                                       │
├──────────────────────────────┬──────────────────────────────┤
│ [Donation Trend Chart]       │ [Expense Trend Chart]        │
├──────────────────────────────┴──────────────────────────────┤
│ [Recent Activity]            │ [Quick Actions]              │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. Responsive Breakpoints

| Breakpoint | Layout changes |
|------------|----------------|
| `< 640px` | Single column; KPIs stack; charts full width; quick actions 2-col |
| `640–1024px` | KPI 2-col; charts stack |
| `≥ 1024px` | KPI 4-col; charts 2-col; activity split |
| `≥ 1280px` | Full wireframe as designed |

Spacing between zones: `space-y-5` (current executive view pattern).

---

## 7. Mobile Strategy

| Concern | Solution |
|---------|----------|
| KPI overload | Show top 4 KPIs; "View all metrics" expands |
| Chart height | `h-44` on mobile |
| Quick actions | Sticky bottom bar (optional, matches form pattern) |
| Touch targets | Quick actions min `h-11` |
| Alerts | Dismissible cards; swipe (future) |

---

## 8. Section Headers

Use `SectionHeader` between major zone groups when zone title is not inside the widget:

```tsx
<SectionHeader title="Analytics" description="Trends for the selected period" />
```

Do not duplicate titles in both `SectionHeader` and every chart widget.

---

## 9. Date Range (future)

Global dashboard filter in `PageHeader` actions:

```tsx
<PageHeader
  action={<DateRangePicker value={range} onChange={setRange} />}
/>
```

Changing range invalidates all `["analytics", …, from, to]` queries.

---

## 10. Collapse & Personalization Layout

Widget container collapse reduces zone height:

```tsx
<WidgetContainer collapsible defaultCollapsed={userPrefs[id]?.collapsed}>
```

Hidden widgets removed from layout flow — grid reflows automatically.

Future drag-and-drop: zones become CSS grid with `grid-area` per widget id.

---

## 11. Loading Layout

**Target:** Per-widget skeletons preserve layout shape.

**Anti-pattern:** Full-page `<LoadingState layout="dashboard" />` until all queries resolve.

```tsx
// Target skeleton preserves grid
<section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  {Array.from({ length: 4 }).map((_, i) => (
    <KPISkeleton key={i} />
  ))}
</section>
```

---

## 12. Spacing & Tokens

| Element | Class |
|---------|-------|
| Zone gap | `space-y-5` |
| Widget grid gap | `gap-3` |
| Panel padding | `p-4` (charts `p-2` in content) |
| Background | `bg-surface` |
| Border | `border-border` |

---

## 13. Route Map

| Route | Layout config |
|-------|---------------|
| `/dashboard/executive` | `executive.dashboard.ts` |
| `/dashboard/finance` | `finance.dashboard.ts` |
| `/dashboard/fundraising` | `fundraising.dashboard.ts` |

Each route:

```tsx
export default function ExecutiveDashboardPage() {
  return (
    <DashboardGuard path="/dashboard/executive">
      <DashboardPage configId="executive" />
    </DashboardGuard>
  );
}
```

---

## 14. Checklist

- [ ] All widgets assigned to a zone
- [ ] Responsive grid at each breakpoint
- [ ] No full-page block on partial load
- [ ] Zone order matches priority (KPIs before charts)
- [ ] `aria-label` on grid sections
- [ ] Quick actions respect permissions
- [ ] PageHeader shows period context
