# KPI Standards

**Phase:** 08 — Dashboard & Analytics Framework  
**Formatting utilities:** `frontend/src/lib/utils/format.ts`

---

## 1. Purpose

KPIs are the first thing users see. Inconsistent formatting erodes trust. Every KPI widget must follow these standards for value display, trends, comparisons, and semantic color.

---

## 2. KPI Anatomy

```
┌─────────────────────────────┐
│  TOTAL DONATIONS            │  ← label (uppercase, muted, 11px)
│  $125,430.00                │  ← value (semibold, tabular-nums, lg)
│  ↑ 12.4% vs prior period     │  ← trend (optional)
└─────────────────────────────┘
```

| Element | Rule |
|---------|------|
| Label | Short noun phrase; uppercase tracking in `KPIWidget` |
| Value | Pre-formatted string — never raw numbers in JSX |
| Trend | Optional; icon + percent + comparison label |
| Drill-down | Optional `href` to detail report |

---

## 3. Formatting by Metric Type

Use shared formatters — never inline `toFixed` or `$` prefix in widgets.

| Metric type | Formatter | Example |
|-------------|-----------|---------|
| Currency | `formatCurrency(n)` | `$12,450.00` |
| Percentage | `formatPercent(n)` | `68.5%` |
| Count | `formatNumber(n)` | `1,247` |
| Ratio | `formatNumber(n, { decimals: 1 })` | `3.2` |
| Compact currency | `formatCurrency(n, { compact: true })` | `$1.2M` (large values) |

```ts
// Always normalize API decimals
import { toNumber, formatCurrency } from "@/lib/utils/format";

const value = formatCurrency(toNumber(dashboard.totalDonations));
```

---

## 4. Trend Display

**Current `KPIWidget` behaviour:**

- `changePercent >= 0` → green (`text-success`) + `TrendingUp`
- `changePercent < 0` → red (`text-danger`) + `TrendingDown`
- Label: `{n}% vs prior`

### Extended standard

| Field | Rule |
|-------|------|
| `changePercent` | Rounded to 1 decimal for display |
| `comparisonLabel` | Default `"vs prior period"`; override for `"vs budget"`, `"vs last month"` |
| `invertTrendColor` | Expenses: down is good — use `MetricCard` variant or `invertTrend` prop |
| Missing trend | Omit trend row — do not show "N/A" |

**Inverted metrics (lower is better):**

- Total expenses
- Outstanding payables
- Budget variance (over)

```tsx
<KPIWidget
  label="Total expenses"
  value={formatCurrency(expenses)}
  changePercent={expenseGrowth}
  invertTrendColor
/>
```

---

## 5. MetricCard Variants

Use `MetricCard` when threshold semantics matter:

| Variant | When |
|---------|------|
| `neutral` | Informational counts, balances |
| `success` | On track, under budget, goal met |
| `warning` | Approaching limit (80–99% utilization) |
| `danger` | Over budget, critical low balance, failed SLA |

```tsx
<MetricCard
  label="Budget utilization"
  value={formatPercent(utilization)}
  variant={utilization > 100 ? "danger" : utilization > 80 ? "warning" : "neutral"}
/>
```

---

## 6. Time Period Context

Every KPI grid should communicate the active period:

- **Page header description** — `"Organization overview for Jan 1 – Jun 30, 2026"` (current pattern in executive view)
- **Widget subtitle** — optional `"This month"` when page period differs per widget
- **Date range picker** (future) — updates all KPI query keys consistently

Query key must include period:

```ts
queryKey: ["analytics", "dashboard", organizationId, from, to]
```

---

## 7. KPI Grid Layout

| Viewport | Columns |
|----------|---------|
| Mobile | 1 (`grid-cols-1`) |
| Tablet | 2 (`sm:grid-cols-2`) |
| Desktop | 4 (`xl:grid-cols-4`) |

```tsx
<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
  {kpiWidgets.map((widget) => <WidgetRenderer key={widget.id} definition={widget} />)}
</div>
```

**Ordering priority:** Most actionable KPIs first (pending approvals, cash position), then totals, then counts.

---

## 8. Standard KPI Catalogue

### Executive

| KPI | Format | Trend |
|-----|--------|-------|
| Total donations | Currency | Yes |
| Total expenses | Currency | Yes (inverted) |
| Net position | Currency | No |
| Cash balance | Currency | No |
| Fund balance | Currency | No |
| Active donors | Count | Optional |
| Average donation | Currency | Optional |
| Active campaigns | Count | No |

### Finance

| KPI | Format | Variant |
|-----|--------|---------|
| Total expenses | Currency | Trend inverted |
| Cash balance | Currency | Neutral |
| Budget utilization | Percent | warning/danger thresholds |
| Pending journals | Count | warning if > 0 |
| Outstanding payables | Currency | Neutral |

### Fundraising

| KPI | Format | Trend |
|-----|--------|-------|
| Donations (period) | Currency | Yes |
| Donor count | Count | Yes |
| Campaign progress | Percent | Progress widget |
| Pledge fulfillment | Percent | Neutral |

Modules register additional KPIs via widget config — do not hardcode in layout.

---

## 9. Comparison Types

| Type | Display | Use case |
|------|---------|----------|
| Period-over-period | `+12% vs prior period` | Month/quarter growth |
| vs Budget | `94% of budget` | Budget utilization |
| vs Goal | `$45K of $50K goal` | Campaign progress |
| vs Benchmark | `Above sector avg` | Future analytics |

Only one comparison per KPI tile — avoid clutter.

---

## 10. Loading & Skeleton

KPI skeleton matches final dimensions:

```tsx
<div className="rounded-md border border-border bg-surface px-3 py-2.5">
  <Skeleton className="h-3 w-24" />
  <Skeleton className="mt-2 h-6 w-32" />
  <Skeleton className="mt-2 h-3 w-20" />
</div>
```

Height must not shift when data loads (CLS).

---

## 11. Accessibility

```tsx
<div
  role="group"
  aria-label={`${label}: ${value}${changePercent != null ? `, ${changePercent}% vs prior period` : ""}`}
>
```

- Values announced as full words ("twelve thousand dollars" — let screen reader read formatted string)
- Trend direction in `aria-label`, not color alone
- Drill-down links: `aria-label="View donations report"`

---

## 12. Anti-Patterns

| Avoid | Use instead |
|-------|-------------|
| Raw `dashboard.totalDonations` in JSX | `formatCurrency(toNumber(...))` |
| Mixed `$` and `USD` prefixes | `formatCurrency` only |
| Showing 10+ KPIs above fold | Max 8 per row group; secondary below fold |
| Blocking dashboard for KPI load | Per-widget skeleton |
| Hardcoded KPI set in layout | Widget registry config |

---

## 13. Checklist

- [ ] Value uses shared formatter
- [ ] API decimals normalized via `toNumber`
- [ ] Trend color correct for metric polarity
- [ ] Period shown in page or widget context
- [ ] Skeleton matches final size
- [ ] Accessible group label
- [ ] Registered in role KPI config
