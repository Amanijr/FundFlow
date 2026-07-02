# Phase 06 — Data Formatting Guide

**Date:** 2026-06-30  
**Rule:** Never manually format values in table cells. Use shared formatters and cell components.

---

## 1. Purpose

Financial ERP data requires consistent formatting for currency, percentages, dates, statuses, and references. This guide defines the single formatting layer used in tables, cards, exports, and detail views.

---

## 2. Formatter Layer

```
API response (raw)
    ↓
toNumber() / parseApiDate()     (type coercion)
    ↓
formatCurrency() / formatDate() / formatPercent()   (display formatters)
    ↓
CurrencyCell / DateCell / StatusCell   (table components)
    ↓
Rendered UI + export rows
```

### Current utilities

| File | Functions |
|------|-----------|
| `lib/utils/format.ts` | `formatCurrency`, `formatPercent`, `toNumber` |
| `lib/utils/dates.ts` | `formatDate`, `formatDateTime`, `toApiDate`, `parseApiDate` |

### Target utilities

| File | Functions |
|------|-----------|
| `lib/utils/format.ts` | + `formatCurrency(value, currency?, locale?)` |
| `lib/utils/format.ts` | + `formatReference(id, prefix?)` |
| `lib/utils/format.ts` | + `formatUserName(first, last)` |
| `lib/utils/format.ts` | + `formatCompactNumber(n)` for KPIs |

---

## 3. Currency

### Formatter

```ts
formatCurrency(value: number | null | undefined, currency = "USD", locale = "en-US"): string
```

| Input | Output |
|-------|--------|
| `1250` | `$1,250` |
| `null` | `—` |
| `NaN` | `—` |

**Current:** USD only, 0 decimal places. **Target:** ISO 4217 currency param for TZS, EUR.

### CurrencyCell (target)

```tsx
<CurrencyCell value={row.original.amount} currency="USD" variant="default" />
```

| Variant | Colour token |
|---------|--------------|
| `default` | `text-foreground` |
| `positive` | `text-success` |
| `negative` | `text-destructive` |
| `muted` | `text-muted-foreground` |

### Table usage

```tsx
{
  accessorKey: "amount",
  header: "Amount",
  cell: ({ row }) => (
    <span className="tabular-nums">
      {formatCurrency(toNumber(row.original.amount))}
    </span>
  ),
  meta: { type: "currency", align: "right" },
}
```

**Always:** `tabular-nums` on numeric columns.

---

## 4. Percentage

### Formatter

```ts
formatPercent(value: number | null | undefined, decimals = 1): string
```

| Input | Output |
|-------|--------|
| `10` | `10.0%` |
| `23.456` | `23.5%` |
| `-3` | `-3.0%` |
| `null` | `—` |

### PercentageCell (target)

```tsx
<PercentageCell value={utilization} showSign variant="negative" />
```

Negative values auto-apply `text-destructive` when `variant="auto"`.

---

## 5. Date & Time

### Formatters

| Function | Pattern | Example |
|----------|---------|---------|
| `formatDate` | `MMM d, yyyy` | `Jun 30, 2026` |
| `formatDateTime` | `MMM d, yyyy h:mm a` | `Jun 30, 2026 2:30 PM` |
| `toApiDate` | `yyyy-MM-dd` | API request bodies |
| `parseApiDate` | ISO parse | Filter date inputs |

Empty/null → `—` (em dash).

### DateCell (target)

```tsx
<DateCell value={row.original.createdAt} format="date" />
<DateCell value={row.original.postedAt} format="datetime" />
```

---

## 6. Status

### StatusBadge

Workflow statuses map to Badge variants via `display/status-badge.tsx`:

| Status | Variant |
|--------|-------|
| DRAFT | secondary |
| PENDING_REVIEW | warning |
| APPROVED | success |
| REJECTED | danger |
| COMPLETED | success |
| ARCHIVED | outline |

### StatusCell (target)

```tsx
<StatusCell status={row.original.status} />
// wraps StatusBadge
```

Domain-specific badges (`finance-status-badge`, `vertical-status-badge`) must delegate to `StatusBadge` or `Badge` — not duplicate colour maps.

---

## 7. User Display

### Formatter (target)

```ts
formatUserName(firstName?: string, lastName?: string): string
// "Jane Doe" or "—"
```

### UserCell (target)

```tsx
<UserCell
  name={formatUserName(user.firstName, user.lastName)}
  email={user.email}
  avatarUrl={user.avatarUrl}
/>
```

Renders Avatar + name stack for table rows; name only for compact mode.

---

## 8. Reference Numbers

Journal entries, donations, and expenses use reference IDs.

```ts
formatReference(id: number | string, prefix = "REF"): string
// "JE-1042", "DON-5891"
```

Display in monospace or `tabular-nums` for alignment (target).

---

## 9. Null & Empty Convention

| Situation | Display |
|-----------|---------|
| `null` / `undefined` | `—` |
| Empty string | `—` |
| Zero currency | `$0` (not `—`) |
| Zero percent | `0.0%` |

Never show `null`, `undefined`, or raw ISO date strings in UI.

---

## 10. Alignment Rules

| Type | Alignment | Class |
|------|-----------|-------|
| Text, name, status | Left | default |
| Currency, number, percent | Right | `text-right tabular-nums` |
| Date | Left | default |
| Actions | Right | `text-right` |

Apply via column `meta.align` and cell wrapper (target: DataTable auto-aligns from meta).

---

## 11. Chart & KPI Formatting

Dashboard widgets use same formatters:

```tsx
<KpiCard value={formatCurrency(toNumber(total))} />
<MetricCard value={formatPercent(utilization)} />
```

TrendChart axis labels: `formatCurrency` for financial series.

---

## 12. Export Formatting

Export rows must use identical formatters as display:

```ts
rows = filtered.map((d) => [
  `${d.firstName} ${d.lastName}`,
  formatCurrency(toNumber(d.lifetimeValue)),  // not d.lifetimeValue raw
  formatDate(d.createdAt),
]);
```

Exception: raw numbers acceptable in Excel export for re-import (document per entity).

---

## 13. Internationalization (future)

| Concern | Approach |
|---------|----------|
| Currency | `Intl.NumberFormat` with org `defaultCurrency` |
| Dates | `date-fns` with org `locale` |
| Numbers | Locale decimal separator |

Org settings will supply `currency` and `locale` — formatters accept overrides now to avoid refactor later.

---

## 14. Target Cell Components

```
components/data/cells/
├── currency-cell.tsx
├── percentage-cell.tsx
├── date-cell.tsx
├── status-cell.tsx
├── user-cell.tsx
├── link-cell.tsx
└── index.ts
```

### Factory helper (target)

```ts
function createFormattedCell<T>(type: ColumnMeta["type"]) {
  // returns cell renderer for common types
}
```

---

## 15. Do / Don't

### Do

```tsx
cell: ({ row }) => formatCurrency(toNumber(row.original.amount))
className="tabular-nums text-right"
```

### Don't

```tsx
cell: ({ row }) => `$${row.original.amount}`}
cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString()}
cell: ({ row }) => <span className="text-green-500">${amount}</span>
```

---

## 16. Related Documents

- Phase 04 [COLOR_SYSTEM.md](../phase-04/COLOR_SYSTEM.md) — financial colour tokens
- Phase 05 [COMPONENT_API.md](../phase-05/COMPONENT_API.md) — CurrencyDisplay, PercentageDisplay
- [DATATABLE_SPECIFICATION.md](./DATATABLE_SPECIFICATION.md) — column meta types
- [EXPORT_IMPORT_GUIDE.md](./EXPORT_IMPORT_GUIDE.md) — export row formatting
