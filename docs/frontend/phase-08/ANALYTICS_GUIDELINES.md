# Analytics Guidelines

**Phase:** 08 — Dashboard & Analytics Framework  
**Chart library:** Recharts 2.x  
**Current component:** `frontend/src/components/charts/trend-chart.tsx`

---

## 1. Purpose

Analytics widgets visualize trends, breakdowns, and comparisons. This document defines chart types, styling, interaction, export, responsiveness, and accessibility — so every module uses the same analytics vocabulary.

---

## 2. Chart Type Selection

| Question | Chart type |
|----------|------------|
| How did X change over time? | **Line** or **Area** |
| How does X compare across categories? | **Bar** |
| What is the composition of X? | **Pie** or **Stacked bar** |
| How do actual vs budget compare over time? | **Grouped bar** or **Line (dual series)** |
| What is the running total? | **Area** |

Default dashboard chart: **Line** (`TrendChart`) for time series.

---

## 3. Color System

Use CSS variables from Phase 04 design tokens — never hardcode hex in chart components.

| Token | Usage |
|-------|-------|
| `--chart-1` | Primary series (donations, revenue) |
| `--chart-2` | Secondary series (expenses) |
| `--chart-3` | Tertiary / comparison |
| `--chart-4` | Additional series |
| `--chart-5` | Additional series |
| `--border` | Grid lines, axes |
| `--muted-foreground` | Axis labels, legend text |

```tsx
<Line stroke="var(--chart-1)" />
<CartesianGrid className="stroke-border" />
```

**Semantic colors for dual metrics:**

- Positive / income → `--chart-1`
- Negative / expense → `--chart-2`
- Budget line → dashed `--chart-3`

Max **5 series** per chart — split into multiple charts if more needed.

---

## 4. Chart Container

All charts wrap in `Panel` (consistent with `TrendChart`):

```tsx
<Panel>
  <PanelHeader>
    <PanelTitle>{title}</PanelTitle>
    {exportable && <ExportChartButton />}
  </PanelHeader>
  <PanelContent className="h-52 p-2">
    <ResponsiveContainer width="100%" height="100%">
      {/* Recharts */}
    </ResponsiveContainer>
  </PanelContent>
</Panel>
```

### Standard heights

| Context | Height |
|---------|--------|
| Dashboard widget | `h-52` (208px) |
| Report page | `h-72` (288px) |
| Full-width analysis | `h-96` (384px) |

---

## 5. Axes & Labels

| Rule | Detail |
|------|--------|
| X-axis | Category or time; `tick={{ fontSize: 11 }}` |
| Y-axis | `width={48}` minimum; format large numbers (`$10K`) |
| Grid | `strokeDasharray="3 3"`, `vertical={false}` |
| Axis lines | Hidden (`axisLine={false}`, `tickLine={false}`) |
| Rotation | Rotate X labels only when > 8 categories |

Y-axis formatter:

```tsx
<YAxis tickFormatter={(v) => formatCurrency(v, { compact: true })} />
```

---

## 6. Tooltips

```tsx
<Tooltip
  contentStyle={{ fontSize: 12, borderRadius: 6 }}
  formatter={(value: number) => formatCurrency(value)}
  labelFormatter={(label) => label}
/>
```

- Show formatted values (currency, percent)
- Include series name for multi-line charts
- Tooltip must work on touch (Recharts default)

---

## 7. Legends

- Show legend when **2+ series**
- Position: bottom for dashboard, right for wide report charts
- Use human labels ("Donations", "Expenses") — not API field names

---

## 8. Data Shape

Normalize API data to chart-friendly arrays in the hook layer — not in the chart component.

```ts
interface TrendPoint {
  label: string;   // x-axis: "Jan", "2026-Q1", "Week 12"
  value: number;   // single series
}

interface MultiSeriesPoint {
  label: string;
  [seriesKey: string]: string | number;
}
```

**Current executive dashboard pattern:**

```tsx
const donationTrend = trends.donationTrend.map((point) => ({
  label: point.period,
  value: toNumber(point.amount),
}));
```

---

## 9. Chart Widget API (target)

```tsx
interface ChartWidgetProps {
  title: string;
  chartType: "line" | "bar" | "area" | "pie" | "stacked-bar";
  data: Record<string, unknown>[];
  xKey: string;
  series: ChartSeriesConfig[];
  height?: number;
  formatValue?: (value: number) => string;
  exportable?: boolean;
  emptyMessage?: string;
}

interface ChartSeriesConfig {
  key: string;
  label: string;
  color?: string; // defaults to --chart-N
  type?: "line" | "bar" | "area";
}
```

---

## 10. Export

| Format | Method |
|--------|--------|
| CSV | Reuse Phase 06 `table-export` for underlying data |
| PNG | `html-to-image` or Recharts wrapper (future) |
| PDF | Report page print stylesheet |

Dashboard widgets: export icon in `PanelHeader` exports **underlying data** as CSV by default.

---

## 11. Responsive Behaviour

```tsx
<ResponsiveContainer width="100%" height="100%">
```

| Viewport | Behaviour |
|----------|-----------|
| Mobile | Full width; reduce tick count; `h-44` |
| Tablet | Side-by-side charts stack to single column |
| Desktop | `lg:grid-cols-2` for chart pairs |

Hide legend on very narrow screens if clutter; keep tooltip.

---

## 12. Performance

- **Lazy load** Recharts: `dynamic(..., { ssr: false })`
- Limit data points: aggregate to 12–24 periods for dashboard line charts
- `React.memo` on chart components
- Do not re-render charts when unrelated widgets update — isolate query subscriptions

---

## 13. Empty & Error States

| State | Display |
|-------|---------|
| Loading | Skeleton rectangle at chart height |
| Empty (< 2 points) | "Not enough data to display a trend." |
| Error | Widget-level retry — not broken chart frame |
| Zero values | Show chart with zero line — valid data |

---

## 14. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Text summary | `aria-describedby` pointing to sr-only summary |
| Recharts a11y | `accessibilityLayer` on chart (Recharts 2.10+) |
| Keyboard | Focus chart container; tooltip on focus |
| Color independence | Different stroke patterns for print/colorblind (future) |

**Screen reader summary example:**

```tsx
<p id="donation-trend-summary" className="sr-only">
  Donation trend from January to June. Highest month: March at $45,000.
  Lowest: February at $28,000.
</p>
```

Generate summary from data in hook — do not hand-write.

---

## 15. Standard Dashboard Charts

| Chart | Role dashboards | Data source |
|-------|-----------------|-------------|
| Donation trend | Executive, Fundraising | `useTrendAnalysis` |
| Expense trend | Executive, Finance | `useTrendAnalysis` |
| Budget vs actual | Finance | Budget API (future) |
| Cash flow | Finance | GL API (future) |
| Fund allocation | Executive | Funds API (future) |
| Campaign performance | Fundraising | Campaigns API (future) |

Register in widget config — chart component stays generic.

---

## 16. Anti-Patterns

| Avoid | Use instead |
|-------|-------------|
| New chart library per module | Recharts only |
| Inline Recharts in page files | `ChartWidget` |
| Hardcoded `#8884d8` colors | `--chart-N` tokens |
| 100+ point line charts on dashboard | Aggregate periods |
| Chart without Panel wrapper | `Panel` + `PanelHeader` |
| Synchronous Recharts import on page | `dynamic` lazy load |

---

## 17. Checklist

- [ ] Uses `--chart-N` color tokens
- [ ] Data normalized in hook before chart
- [ ] Tooltip shows formatted values
- [ ] ResponsiveContainer with fixed height parent
- [ ] Empty state for insufficient data
- [ ] Lazy-loaded on dashboard routes
- [ ] Accessible summary provided
- [ ] Legend when multiple series
