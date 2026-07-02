# Phase 05 — Component API Reference

**Date:** 2026-06-30  
**Convention:** Named exports, TypeScript interfaces, `className?` on all public components, CVA for variants.

---

## 1. API Conventions

### Shared patterns

```ts
// Base props present on nearly all components
interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Variant components use CVA + VariantProps
interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}
```

### Naming rules

| Pattern | Example |
|---------|---------|
| Component files | kebab-case: `currency-display.tsx` |
| Component names | PascalCase: `CurrencyDisplay` |
| Props interfaces | `ComponentNameProps` |
| Event handlers | `onAction`, `onValueChange`, `onOpenChange` |
| Boolean props | `isLoading`, `disabled`, `enableSelection` |
| Data props | Nouns: `value`, `label`, `columns`, `data` |

### Import path

```ts
// Primitives
import { Button } from "@/components/ui/button";

// Enterprise / display
import { EmptyState } from "@/components/display/empty-state";
import { DataTable } from "@/components/tables/data-table";

// Target barrel (future)
import { Button, Input, Card } from "@/components/ui";
```

---

## 2. Form Components

### Button

```ts
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
  asChild?: boolean;
  loading?: boolean;  // target — shows spinner, aria-busy
}
```

| Event | Signature | Notes |
|-------|-----------|-------|
| `onClick` | `(e: MouseEvent) => void` | Standard |
| Submit | `type="submit"` | Form submission |

**Responsive:** Full width on mobile when `className="w-full sm:w-auto"`.

---

### Input

```ts
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}
```

| Type attribute | Usage |
|----------------|-------|
| `text` | Default |
| `email` | Auth, contact |
| `password` | Auth |
| `number` | Quantities (prefer NumberInput target) |
| `search` | Filter bars |
| `tel`, `url` | Contact fields |

**Composition:** Always wrapped in `FormField` with `Label`.

---

### Label

```ts
interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}
```

Must pair with control `id` via `htmlFor`.

---

### Checkbox

```ts
interface CheckboxProps extends React.ComponentProps<typeof CheckboxPrimitive.Root> {
  checked?: boolean | "indeterminate";
  onCheckedChange?: (checked: boolean) => void;
}
```

---

### Select (target)

```ts
// Radix composition
<Select value={value} onValueChange={setValue}>
  <SelectTrigger />
  <SelectContent>
    <SelectItem value="..." />
  </SelectContent>
</Select>
```

---

### FormField

```ts
interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}
```

Links error via `aria-describedby`. Sets `aria-invalid` on child when `error` present.

---

### FormSection

```ts
interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}
```

Renders `h2` section title per typography tokens.

---

### DateInput

```ts
interface DateInputProps {
  value?: string;
  onChange?: (value: string) => void;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
}
```

---

## 3. Display Components

### Card

```ts
// Composable parts — no single props interface
Card: React.HTMLAttributes<HTMLDivElement>
CardHeader: React.HTMLAttributes<HTMLDivElement>
CardTitle: React.HTMLAttributes<HTMLHeadingElement>   // renders h3
CardDescription: React.HTMLAttributes<HTMLParagraphElement>
CardContent: React.HTMLAttributes<HTMLDivElement>
CardFooter: React.HTMLAttributes<HTMLDivElement>      // target — add if missing
```

---

### Badge

```ts
interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "success" | "warning" | "danger";
}
```

---

### Avatar

```ts
interface AvatarProps extends React.ComponentProps<typeof AvatarPrimitive.Root> {
  size?: "sm" | "default" | "lg";  // target
}

AvatarImage: { src?: string; alt: string }
AvatarFallback: React.HTMLAttributes<HTMLSpanElement>
```

---

### EmptyState

```ts
interface EmptyStateProps {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: LucideIcon;       // target — default Inbox
  className?: string;
}
```

---

### ErrorState (target)

```ts
interface ErrorStateProps {
  title?: string;          // default: "Something went wrong"
  description?: string;
  onRetry?: () => void;
  onRefresh?: () => void;
  supportHref?: string;
  className?: string;
}
```

---

### StatusBadge

```ts
type WorkflowStatusValue =
  | "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "REJECTED" | "COMPLETED" | "ARCHIVED";

interface StatusBadgeProps {
  status: WorkflowStatusValue;
  className?: string;
}
```

---

### CurrencyDisplay (target)

```ts
interface CurrencyDisplayProps {
  value: number | null | undefined;
  currency?: string;       // ISO 4217 — default "USD"
  locale?: string;         // default "en-US"
  variant?: "default" | "positive" | "negative" | "muted";
  showSign?: boolean;
  className?: string;
}
```

---

### PercentageDisplay (target)

```ts
interface PercentageDisplayProps {
  value: number | null | undefined;
  decimals?: number;       // default 1
  showSign?: boolean;
  variant?: "default" | "positive" | "negative";
  className?: string;
}
```

---

### DetailCard / KeyValueList

```ts
interface DetailCardProps {
  title?: string;
  fields: Array<{ label: string; value: React.ReactNode }>;
  className?: string;
}
```

---

## 4. Enterprise Components

### KpiCard (target — from KPIWidget)

```ts
interface KpiCardProps {
  label: string;
  value: string;
  changePercent?: number;
  icon?: LucideIcon;
  variant?: "neutral" | "success" | "warning" | "danger";
  className?: string;
}
```

**Responsive:** `grid gap-3 sm:grid-cols-2 lg:grid-cols-4` in parent.

---

### StatisticCard (target — from MetricCard)

```ts
interface StatisticCardProps {
  label: string;
  value: string;
  variant?: "neutral" | "success" | "warning" | "danger";
  className?: string;
}
```

---

### Timeline (target — from ActivityTimeline)

```ts
interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  actor?: string;
}

interface TimelineProps {
  events: TimelineEvent[];
  emptyMessage?: string;
  className?: string;
}
```

---

## 5. Data Components

### Table (primitive)

```ts
Table, TableHeader, TableBody, TableFooter, TableRow,
TableHead, TableCell, TableCaption
// All extend React.HTMLAttributes<HTMLElement>
```

---

### DataTable

```ts
interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  globalFilter?: string;
  enableSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  onExport?: () => void;
  bulkActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}
```

| Event | Source | Notes |
|-------|--------|-------|
| Row selection | TanStack internal | Checkbox column when `enableSelection` |
| Sort | Column header click | Built-in |
| Export | `onExport` callback | Parent provides logic |

**Responsive:** Horizontal scroll wrapper `overflow-x-auto` on mobile.

---

### FilterBar

```ts
interface FilterBarProps {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}
```

**Responsive:** Stacks vertically on mobile (`flex-col sm:flex-row`).

---

## 6. Overlay Components

### Dialog

```ts
Dialog, DialogTrigger, DialogContent, DialogHeader,
DialogTitle, DialogDescription, DialogFooter, DialogClose
```

| Event | Signature |
|-------|-----------|
| `onOpenChange` | `(open: boolean) => void` |

Focus trapped inside content. Escape closes.

---

### Sheet

```ts
Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose
```

| Prop | Values | Usage |
|------|--------|-------|
| `side` | `top` \| `right` \| `bottom` \| `left` | Mobile sidebar: `left` |

---

### Popover

```ts
Popover, PopoverTrigger, PopoverContent
```

---

### DropdownMenu

```ts
DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator
```

---

## 7. Feedback Components

### PageSkeleton

```ts
interface PageSkeletonProps {
  layout?: "list" | "detail" | "dashboard";
  className?: string;
}
```

---

### Alert (target)

```ts
interface AlertProps {
  variant?: "default" | "destructive" | "success" | "warning";
  children: React.ReactNode;
  className?: string;
}

AlertTitle, AlertDescription
```

---

### Toast (target)

```ts
interface ToastProps {
  title: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
  duration?: number;
}

// Imperative API via useToast()
toast({ title: "Donor saved", variant: "success" });
```

---

### Spinner (target)

```ts
interface SpinnerProps {
  size?: "sm" | "default" | "lg";
  label?: string;          // sr-only loading text
  className?: string;
}
```

---

## 8. Navigation Components

### CommandPalette

```ts
interface CommandAction {
  id: string;
  label: string;
  href?: string;
  onSelect?: () => void;
  keywords?: string[];
  group?: string;
}

interface CommandPaletteProps {
  actions: CommandAction[];
}
```

Opened via `Cmd+K` or `fundflow:open-command-palette` event.

---

### Tabs (target)

```ts
Tabs, TabsList, TabsTrigger, TabsContent
// value + onValueChange on Tabs root
```

---

### Pagination (target)

```ts
interface PaginationProps {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
}
```

---

## 9. Responsive API Rules

Every component documents behaviour at three breakpoints:

| Breakpoint | Tailwind | Rule |
|------------|----------|------|
| Mobile | default – `sm` | Stack, full-width actions, icon-only where noted |
| Tablet | `sm` – `lg` | Mixed layouts, horizontal scroll for tables |
| Desktop | `lg+` | Full layout, inline actions |

### Common responsive class patterns

```tsx
// Action row
className="flex flex-col gap-2 sm:flex-row sm:items-center"

// Full-width mobile button
className="w-full sm:w-auto"

// Grid KPI row
className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"

// Hidden/shown
className="hidden md:flex"
className="md:hidden"
```

---

## 10. Event Naming Standard

| Pattern | Usage | Example |
|---------|-------|---------|
| `onValueChange` | Controlled value | Select, Tabs, Switch |
| `onCheckedChange` | Boolean toggle | Checkbox, Switch |
| `onOpenChange` | Overlay state | Dialog, Sheet, Popover |
| `onSelect` | Item picked | Command, DropdownMenuItem |
| `onAction` | Generic CTA | EmptyState, ErrorState |
| `onRetry` / `onRefresh` | Error recovery | ErrorState |

Avoid `onClick` on non-button elements without keyboard equivalent.

---

## 11. Formatting Utilities (not components)

Used by display components — live in `lib/utils/format.ts`:

```ts
formatCurrency(value, currency?, locale?): string
formatPercent(value, decimals?): string
toNumber(value): number
```

Target: display components wrap these — features should not call formatters inline in JSX when a display component exists.

---

## 12. Related Documents

- [COMPONENT_VARIANTS.md](./COMPONENT_VARIANTS.md) — visual variant matrix
- [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) — ARIA and keyboard
- [CORE_UI_COMPONENTS.md](./CORE_UI_COMPONENTS.md) — full catalog
- Phase 01 [COMPONENT_SPECIFICATIONS.md](../phase-01/COMPONENT_SPECIFICATIONS.md) — detailed per-component specs
