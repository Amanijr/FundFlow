# Phase 05 — Core UI Component Library

**Date:** 2026-06-30  
**Status:** Approved (documentation)  
**Dependencies:** Phase 00–04  
**Rule:** Build once. Compose, don't duplicate. No business logic in primitives.

---

## 1. Executive Summary

This document defines the complete reusable UI component library for FundFlow ERP. Every interface element — from `Button` to `DataTable` — exists exactly once. ERP pages are assembled by composing these components, never by inventing new primitives inside feature folders.

**Scope:** UI primitives, enterprise display components, and composition patterns.  
**Excluded:** Business modules, API calls, feature state, ERP page implementations.

---

## 2. Philosophy

### Build once

| Forbidden | Required |
|-----------|----------|
| `DashboardCard`, `DonationCard`, `ExpenseCard` | `<Card>` + `<CardHeader>` + `<CardContent>` |
| Custom modal per feature | `<Dialog>` |
| Inline table markup | `<DataTable>` or `<Table>` |
| Copy-pasted empty states | `<EmptyState>` |

### Compose, don't duplicate

```
Feature page
    └── PageHeader (layout)
    └── FilterBar (tables)
    └── DataTable (tables)
        └── Badge, Button, Checkbox (ui)
    └── EmptyState (display)
```

### Separation of concerns

```
components/ui/          → Presentation only (no API, no Zustand)
components/display/     → ERP display patterns (formatting, status mapping)
components/tables/      → Data presentation (TanStack Table shell)
components/forms/       → Form layout wrappers (react-hook-form integration)
features/*/components/  → Domain-specific composition
```

Business logic lives in features, hooks, and services — never in `components/ui/`.

---

## 3. Folder Structure

### Target layout

```
frontend/src/components/
├── ui/                    # Radix + CVA primitives (single source)
│   ├── button.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── ...
│   └── index.ts           # barrel export
├── display/               # ERP display composites
│   ├── empty-state.tsx
│   ├── error-state.tsx
│   ├── status-badge.tsx
│   ├── currency-display.tsx
│   ├── percentage-display.tsx
│   └── key-value-list.tsx
├── enterprise/            # Target: promote KPI/stat cards here
│   ├── kpi-card.tsx
│   ├── statistic-card.tsx
│   └── timeline.tsx
├── tables/
│   ├── data-table.tsx
│   └── filter-bar.tsx
├── forms/
│   ├── form-field.tsx
│   ├── form-section.tsx
│   └── date-input.tsx
├── feedback/
│   ├── alert.tsx          # target: move from ui when adopted
│   ├── page-skeleton.tsx
│   ├── spinner.tsx
│   └── toast.tsx
└── navigation/
    └── command-palette.tsx
```

### Current vs target

| Category | Current path | Target | Status |
|----------|--------------|--------|--------|
| Primitives | `components/ui/` (14 files) | `components/ui/` | Partial |
| Enterprise KPI | `charts/kpi-widget.tsx` | `enterprise/kpi-card.tsx` | Rename/promote |
| Enterprise stat | `charts/metric-card.tsx` | `enterprise/statistic-card.tsx` | Rename/promote |
| Status badge | `display/status-badge.tsx` | `display/status-badge.tsx` | Exists |
| Empty state | `display/empty-state.tsx` | `display/empty-state.tsx` | Exists |
| Timeline | `workflow/activity-timeline.tsx` | `enterprise/timeline.tsx` | Move |
| Data table | `tables/data-table.tsx` | `tables/data-table.tsx` | Exists |
| Command palette | `navigation/command-palette.tsx` | `navigation/command-palette.tsx` | Exists |

---

## 4. Component Categories

### 4.1 Forms

| Component | File (target) | Status | Priority |
|-----------|---------------|--------|----------|
| Button | `ui/button.tsx` | ✅ Implemented | P0 |
| Input | `ui/input.tsx` | ✅ Implemented | P0 |
| Label | `ui/label.tsx` | ✅ Implemented | P0 |
| Textarea | `ui/textarea.tsx` | ➕ Adopt | P2 |
| Select | `ui/select.tsx` | ➕ Adopt | P1 |
| Combobox | `ui/combobox.tsx` | ➕ Adopt | P2 |
| Multi Select | `ui/multi-select.tsx` | ➕ Adopt | P3 |
| Checkbox | `ui/checkbox.tsx` | ✅ Implemented | P0 |
| Radio | `ui/radio-group.tsx` | ➕ Adopt | P2 |
| Switch | `ui/switch.tsx` | ➕ Adopt | P2 |
| Slider | `ui/slider.tsx` | ➕ Adopt | P3 |
| Date Picker | `forms/date-input.tsx` | 🔧 Partial | P1 |
| Time Picker | `ui/time-picker.tsx` | ➕ Planned | P3 |
| Currency Input | `forms/currency-input.tsx` | ➕ Planned | P2 |
| Number Input | `ui/number-input.tsx` | ➕ Planned | P2 |
| Password Input | Input `type="password"` | ✅ Via Input | — |
| Search Input | Input `type="search"` | ✅ Via Input | — |

**Form composition:** Always use `FormField` + `FormSection` wrappers — never raw Input without Label.

---

### 4.2 Feedback

| Component | File (target) | Status | Priority |
|-----------|---------------|--------|----------|
| Alert | `ui/alert.tsx` | ➕ Adopt | P1 |
| Toast | `ui/toast.tsx` + provider | ➕ Adopt | P1 |
| Snackbar | Alias of Toast | — | — |
| Progress | `ui/progress.tsx` | ➕ Adopt | P2 |
| Loading (full page) | `feedback/fundflow-loader.tsx` | ✅ Exists | P1 |
| Skeleton | `feedback/page-skeleton.tsx` | ✅ Exists | P0 |
| Spinner | `ui/spinner.tsx` | ➕ Adopt | P1 |

---

### 4.3 Navigation

| Component | File (target) | Status | Priority |
|-----------|---------------|--------|----------|
| Tabs | `ui/tabs.tsx` | ➕ Adopt | P1 |
| Breadcrumb | `layout/breadcrumb/` | ✅ In shell | — |
| Pagination | `ui/pagination.tsx` | ➕ Adopt | P2 |
| Stepper | `workflow/workflow-stepper.tsx` | 🔧 Exists | P2 |
| Dropdown | `ui/dropdown-menu.tsx` | ✅ Implemented | P0 |
| Command Palette | `navigation/command-palette.tsx` | ✅ Implemented | P0 |

---

### 4.4 Overlay

| Component | File (target) | Status | Priority |
|-----------|---------------|--------|----------|
| Dialog | `ui/dialog.tsx` | ✅ Implemented | P0 |
| Drawer | `ui/drawer.tsx` | ➕ Adopt | P2 |
| Sheet | `ui/sheet.tsx` | ✅ Implemented | P0 |
| Popover | `ui/popover.tsx` | ✅ Implemented | P1 |
| Tooltip | `ui/tooltip.tsx` | ➕ Adopt | P1 |

---

### 4.5 Display

| Component | File (target) | Status | Priority |
|-----------|---------------|--------|----------|
| Badge | `ui/badge.tsx` | ✅ Implemented | P0 |
| Avatar | `ui/avatar.tsx` | ✅ Implemented | P0 |
| Card | `ui/card.tsx` | ✅ Implemented | P0 |
| Panel | `ui/panel.tsx` | ✅ Implemented | P1 |
| Separator | `ui/separator.tsx` | ✅ Implemented | P1 |
| Divider | Alias of Separator | — | — |
| Empty State | `display/empty-state.tsx` | ✅ Implemented | P0 |
| Error State | `display/error-state.tsx` | ➕ Planned | P1 |

---

### 4.6 Data

| Component | File (target) | Status | Priority |
|-----------|---------------|--------|----------|
| Table | `ui/table.tsx` | ✅ Implemented | P0 |
| Data Table | `tables/data-table.tsx` | ✅ Implemented | P0 |
| Data List | `display/data-list.tsx` | ➕ Planned | P3 |
| Key Value Display | `display/detail-card.tsx` | 🔧 Exists | P1 |
| Filter Bar | `tables/filter-bar.tsx` | ✅ Implemented | P0 |

---

## 5. Enterprise Components

Reusable ERP patterns built on primitives. No domain API calls — receive formatted data via props.

### KPI Card

**Current:** `charts/kpi-widget.tsx`  
**Target:** `enterprise/kpi-card.tsx`

Shows: value, label, optional trend %, optional icon.

```tsx
<KpiCard
  label="Total donations"
  value={formatCurrency(125000)}
  changePercent={12.4}
  icon={HandCoins}
/>
```

### Statistic Card

**Current:** `charts/metric-card.tsx`  
**Target:** `enterprise/statistic-card.tsx`

Shows: label, value, semantic variant (neutral/success/warning/danger).

```tsx
<StatisticCard label="Total debits" value={formatCurrency(50000)} variant="neutral" />
```

### Status Badge

**File:** `display/status-badge.tsx`  
Maps workflow statuses to `Badge` variants: Draft, Pending, Approved, Rejected, Archived, Completed.

Domain-specific badges (`finance-status-badge`, `vertical-status-badge`) must compose `StatusBadge` or `Badge` — not duplicate styling.

### Currency Display

**Target:** `display/currency-display.tsx`  
Wraps `formatCurrency` from `lib/utils/format.ts` with `tabular-nums` and semantic colour variants.

```tsx
<CurrencyDisplay value={1250} currency="USD" variant="positive" />
```

Supports TZS, USD, EUR via `Intl.NumberFormat` — no component changes for new currencies.

### Percentage Display

**Target:** `display/percentage-display.tsx`

```tsx
<PercentageDisplay value={23.5} />   // "23.5%"
<PercentageDisplay value={-3} />       // "-3.0%" with danger colour
```

### User Avatar

**File:** `ui/avatar.tsx`  
Extend with size variants and optional presence dot (target).

```tsx
<Avatar size="sm">
  <AvatarImage src={url} alt="Jane Doe" />
  <AvatarFallback>JD</AvatarFallback>
</Avatar>
```

### Timeline

**Current:** `workflow/activity-timeline.tsx`  
**Target:** `enterprise/timeline.tsx`

Displays activity, audit logs, approval history. Receives `events[]` prop — no fetch.

### Empty State

**File:** `display/empty-state.tsx`  
Icon, title, description, optional action button.

### Error State

**Target:** `display/error-state.tsx`  
Title, description, Retry / Refresh / Contact support actions.

### Loading State

| Pattern | Component | Usage |
|---------|-----------|-------|
| Full page | `FundflowLoader` | Route transitions |
| Page layout | `PageSkeleton` | list / detail / dashboard layouts |
| Inline | `Spinner` (target) | Button loading, section refresh |
| Table rows | `skeleton-shimmer` utility | DataTable loading |

---

## 6. Component Standards

Every component must define:

| Requirement | Document |
|-------------|----------|
| Props interface (TypeScript) | [COMPONENT_API.md](./COMPONENT_API.md) |
| Variants, sizes, states | [COMPONENT_VARIANTS.md](./COMPONENT_VARIANTS.md) |
| Accessibility | [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) |
| Storybook examples | [STORYBOOK_PREPARATION.md](./STORYBOOK_PREPARATION.md) |
| Responsive behaviour | Per-component in COMPONENT_API.md |

### Documentation template (per component)

```
Purpose
Variants
Sizes
States
Props
Events
Accessibility
Responsive rules
Examples
Do / Don't
Related components
```

---

## 7. Dependency Rules

### Allowed

```
Dialog → Button → Icon
DataTable → Table → Checkbox → Button
FormField → Label → Input
StatusBadge → Badge
KpiCard → Card (optional wrapper)
```

### Forbidden

```
Button → Dialog
Input → DataTable
Badge → CommandPalette
ui/* → features/*
ui/* → lib/api/*
ui/* → stores/*
```

Primitives never import from features, services, or API modules.

---

## 8. Design Token Compliance

All components consume Phase 04 tokens:

| Property | Token source |
|----------|--------------|
| Colours | `text-foreground`, `bg-card`, `border-border`, `text-success` |
| Typography | `text-sm`, `font-heading`, `tabular-nums` |
| Spacing | `p-4`, `gap-2`, `space-y-4` |
| Radius | `rounded-lg`, `rounded-md` |
| Shadow | `shadow-sm`, `shadow-md`, `shadow-lg` |
| Motion | `duration-200`, `transition-colors` |

**Forbidden in components:** `text-blue-500`, `bg-green-500`, `p-[13px]`, inline hex.

---

## 9. Implementation Priority

| Wave | Components | Goal |
|------|------------|------|
| **P0** | Button, Input, Label, Checkbox, Badge, Card, Table, DataTable, EmptyState, Skeleton | Every list page |
| **P1** | Select, Alert, Toast, Tabs, Tooltip, Dialog polish, CurrencyDisplay, ErrorState | Forms + feedback |
| **P2** | Textarea, Radio, Switch, Pagination, Drawer, Combobox, StatisticCard promotion | Detail pages |
| **P3** | Slider, Multi-select, Time picker, Data list | Edge cases |

---

## 10. Acceptance Criteria

- [x] Full component catalog documented
- [x] Current vs target inventory defined
- [x] Enterprise components specified
- [x] Dependency rules documented
- [x] Token compliance rules documented
- [x] API, variants, accessibility, Storybook docs created
- [ ] All ➕ Adopt components copied from template
- [ ] Enterprise components promoted to target paths
- [ ] `components/ui/index.ts` barrel export
- [ ] No duplicate primitives in feature folders

---

## 11. Related Documents

| Document | Contents |
|----------|----------|
| [COMPONENT_API.md](./COMPONENT_API.md) | Props, events, responsive rules |
| [COMPONENT_VARIANTS.md](./COMPONENT_VARIANTS.md) | Variants, sizes, states matrix |
| [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) | Cross-cutting a11y |
| [STORYBOOK_PREPARATION.md](./STORYBOOK_PREPARATION.md) | Story structure |
| Phase 01 [COMPONENT_SPECIFICATIONS.md](../phase-01/COMPONENT_SPECIFICATIONS.md) | Per-primitive detail |
| Phase 01 [UI_PRIMITIVES.md](../phase-01/UI_PRIMITIVES.md) | Adoption inventory |
| Phase 04 [DESIGN_TOKENS_AND_THEME.md](../phase-04/DESIGN_TOKENS_AND_THEME.md) | Token reference |

---

## 12. Governance

1. New primitives require Phase 05 doc update before merge.
2. Features must not add files under `components/ui/`.
3. Do not proceed to Phase 06 until this library is reviewed and approved.
