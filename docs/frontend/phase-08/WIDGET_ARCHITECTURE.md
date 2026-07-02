# Widget Architecture

**Phase:** 08 — Dashboard & Analytics Framework  
**Target location:** `frontend/src/features/dashboard/components/widgets/`

---

## 1. Design Principles

| Rule | Rationale |
|------|-----------|
| **Independent** | Widget A failure must not break Widget B |
| **Self-contained** | Data fetching in widget hook, not parent |
| **Configurable** | Size, title, refresh interval from registry |
| **Presentational separation** | Widget shell vs widget content |
| **No cross-widget imports** | Share via hooks/services only |

---

## 2. Core Components

### WidgetContainer

Universal shell for every widget:

```tsx
interface WidgetContainerProps {
  id: string;
  title?: string;
  description?: string;
  status: "loading" | "success" | "empty" | "error";
  errorMessage?: string;
  emptyMessage?: string;
  onRefresh?: () => void;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
  children: React.ReactNode;
}
```

**Behaviour:**

| Status | Renders |
|--------|---------|
| `loading` | `Skeleton` matching widget height |
| `error` | Inline `ErrorAlert` + retry button |
| `empty` | Centered message from `emptyMessage` |
| `success` | `children` |

Header: title, optional refresh icon, collapse toggle.

Styling: `rounded-md border border-border bg-surface` — matches `KPIWidget` / `Panel`.

---

### Widget Registry

Declarative config per dashboard role:

```ts
interface WidgetDefinition {
  id: string;
  type: WidgetType;
  zone: DashboardZone;
  title: string;
  description?: string;
  span?: { sm?: number; lg?: number; xl?: number }; // grid columns
  requiredPermission?: Permission;
  requiredRole?: Role[];
  refreshIntervalMs?: number;
  props?: Record<string, unknown>; // widget-specific config
}

type WidgetType =
  | "kpi"
  | "kpi-grid"
  | "chart"
  | "table"
  | "alert"
  | "timeline"
  | "progress"
  | "quick-actions"
  | "welcome";
```

**Example entry:**

```ts
{
  id: "total-donations",
  type: "kpi",
  zone: "kpi",
  title: "Total donations",
  span: { sm: 1, xl: 1 },
  props: { metric: "totalDonations", showTrend: true },
}
```

`DashboardPage` maps `WidgetDefinition[]` → React components via `widgetRegistry[type]`.

---

## 3. Widget Type Specifications

### KPI Widget

**Current:** `components/charts/kpi-widget.tsx`

```tsx
interface KPIWidgetProps {
  label: string;
  value: string;           // pre-formatted
  changePercent?: number;
  comparisonLabel?: string; // default: "vs prior"
  href?: string;           // drill-down link
}
```

**Data hook pattern:**

```tsx
function DonationsKPIWidget() {
  const { data, isLoading, isError, refetch } = useExecutiveDashboard();
  return (
    <WidgetContainer
      id="total-donations"
      status={resolveStatus({ isLoading, isError, data })}
      onRefresh={refetch}
    >
      <KPIWidget
        label="Total donations"
        value={formatCurrency(data.totalDonations)}
        changePercent={data.donationGrowthPercent}
      />
    </WidgetContainer>
  );
}
```

`MetricCard` is a variant KPI with severity (`neutral` | `success` | `warning` | `danger`) — use for threshold-based metrics (budget utilization).

---

### Chart Widget

**Current:** `TrendChart` — line only.

**Target `ChartWidget`:**

```tsx
interface ChartWidgetProps {
  title: string;
  chartType: "line" | "bar" | "area" | "pie" | "stacked-bar";
  data: ChartSeries[];
  xKey: string;
  yKeys: string[];
  formatY?: (value: number) => string;
  height?: number;
  exportable?: boolean;
}
```

Wraps Recharts inside `Panel` + `WidgetContainer`. Lazy-load:

```tsx
const ChartWidget = dynamic(() => import("./chart-widget"), {
  loading: () => <WidgetSkeleton height={208} />,
  ssr: false,
});
```

---

### Table Widget

Compact recent-records table using Phase 06 patterns:

```tsx
interface TableWidgetProps<T> {
  title: string;
  columns: ColumnDef<T>[];
  data: T[];
  pageSize?: number;
  viewAllHref?: string;
}
```

- Max 5 rows on dashboard; "View all" links to full list page
- Use `CurrencyCell`, `DateCell`, `StatusCell` from `@/components/data`
- No inline editing on dashboard tables

---

### Alert Widget

**Current:** `DashboardInsights` — severity-styled list.

**Target `AlertWidget`:**

```tsx
interface AlertItem {
  id: string;
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  href?: string;
  actionLabel?: string;
}

interface AlertWidgetProps {
  alerts: AlertItem[];
  maxVisible?: number;
}
```

Sort: `CRITICAL` → `WARNING` → `INFO`. Truncate with "View all alerts" link.

---

### Timeline Widget

**Current:** `RecentActivityFeed`, `ActivityTimeline` (workflow).

```tsx
interface TimelineWidgetProps {
  items: FeedItem[];
  filterOptions?: { label: string; value: string }[];
  onFilterChange?: (value: string) => void;
}
```

Chronological, newest first. Filterable by activity type (donations, expenses, audit).

---

### Progress Widget

**Target:**

```tsx
interface ProgressWidgetProps {
  label: string;
  current: number;
  target: number;
  formatValue?: (n: number) => string;
  variant?: "default" | "warning" | "danger"; // auto when > 90% / > 100%
}
```

Uses `ui/progress`. Examples: campaign goal, budget utilization, fund allocation.

---

### Quick Action Card

```tsx
interface QuickAction {
  label: string;
  href: string;
  icon: LucideIcon;
  permission?: Permission;
}

interface QuickActionCardProps {
  actions: QuickAction[];
}
```

Grid of linked buttons. Filter actions with `hasPermission(user, action.permission)`.

---

### Welcome Banner

```tsx
interface WelcomeBannerProps {
  userName: string;
  organizationName: string;
  fiscalPeriod?: string;
  date?: Date;
}
```

Zone 1 only. Greeting by time of day ("Good morning, Jane").

---

## 4. Widget Data Hooks

### Pattern

```tsx
// features/dashboard/hooks/use-kpi-metric.ts
export function useKPIMetric(metric: KPIMetricKey, range?: DateRange) {
  const { token, organizationId } = useApiContext();
  return useQuery({
    queryKey: ["dashboard", "kpi", metric, organizationId, range],
    queryFn: () => fetchKPIMetric(token!, metric, range, organizationId),
    enabled: Boolean(token),
    staleTime: 30_000,
  });
}
```

### Status resolver (shared utility)

```tsx
function resolveWidgetStatus<T>({
  isLoading,
  isError,
  data,
  isEmpty,
}: {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
  isEmpty?: (data: T) => boolean;
}): WidgetStatus {
  if (isLoading) return "loading";
  if (isError) return "error";
  if (!data || isEmpty?.(data)) return "empty";
  return "success";
}
```

---

## 5. Widget Renderer

```tsx
// features/dashboard/components/widget-renderer.tsx
const widgetComponents: Record<WidgetType, React.ComponentType<WidgetDefinition>> = {
  kpi: KPIDashboardWidget,
  chart: ChartDashboardWidget,
  table: TableDashboardWidget,
  alert: AlertDashboardWidget,
  timeline: TimelineDashboardWidget,
  progress: ProgressDashboardWidget,
  "quick-actions": QuickActionsDashboardWidget,
  welcome: WelcomeDashboardWidget,
};

export function WidgetRenderer({ definition }: { definition: WidgetDefinition }) {
  const Component = widgetComponents[definition.type];
  if (!Component) return null;
  return <Component {...definition} />;
}
```

Permission check before render:

```tsx
if (definition.requiredPermission && !hasPermission(user, definition.requiredPermission)) {
  return null;
}
```

---

## 6. Error Isolation

**Anti-pattern (current executive view):**

```tsx
if (dashboardQuery.isLoading || trendsQuery.isLoading) {
  return <LoadingState layout="dashboard" />; // blocks entire page
}
```

**Target:**

```tsx
<DashboardLayout config={executiveConfig}>
  {/* each widget handles its own loading */}
</DashboardLayout>
```

One slow chart must not block KPI tiles.

---

## 7. Empty State Messages

| Widget | Empty message |
|--------|---------------|
| Donations KPI | "No donations recorded in this period." |
| Activity timeline | "No recent activity." |
| Alerts | "No operational alerts." |
| Chart | "Not enough data to display a trend." |
| Tasks | "You're all caught up." |

Never use generic "No data."

---

## 8. Migration from Current Views

| Current file | Migration |
|--------------|-----------|
| `executive-dashboard-view.tsx` | Split into widget config + individual widgets |
| `finance-dashboard-view.tsx` | Reuse shared KPI/chart widgets with different config |
| `fundraising-dashboard-view.tsx` | Same |
| `charts/kpi-widget.tsx` | Move to `features/dashboard/widgets/` |
| `charts/trend-chart.tsx` | Wrap in `ChartWidget` |

Keep re-exports from `components/charts/` during transition.

---

## 9. Checklist for New Widgets

- [ ] Extends `WidgetContainer` with all four states
- [ ] Data fetching in dedicated hook
- [ ] Registered in widget type map
- [ ] Added to role config with permission
- [ ] KPI values pre-formatted via `lib/utils/format`
- [ ] Empty and error messages are specific
- [ ] Chart widgets lazy-loaded
- [ ] Accessible label or summary provided
