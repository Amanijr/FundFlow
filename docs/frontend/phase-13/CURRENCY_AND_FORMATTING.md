# Currency & Formatting

**Phase:** 13 — Financial UX & Data Standards

---

## 1. Purpose

FundFlow must render financial amounts consistently across tables, forms, cards, dashboards, reports, exports, and detail views.

The app currently uses `formatCurrency`, `formatPercent`, and `toNumber` in `frontend/src/lib/utils/format.ts`. Phase 13 makes the standard TZS-first and defines the target formatter layer.

---

## 2. Primary Currency

| Setting | Standard |
|---------|----------|
| Primary currency | `TZS` |
| Display name | Tanzanian Shilling |
| Default locale | `en-TZ` preferred; fallback `en-US` if unsupported |
| Default decimals | 2 for accounting displays |
| Compact KPI decimals | 0 or 1 based on widget |

Examples:

```text
TZS 1,250,000.00
TZS 0.00
− TZS 12,000.00
USD 250.50
```

Use ISO code (`TZS`) instead of ambiguous local symbols.

---

## 3. Formatter API (Target)

```ts
interface FormatCurrencyOptions {
  currency?: string;       // default from financial settings, usually TZS
  locale?: string;         // default from financial settings
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  showCode?: boolean;      // true for multi-currency context
  accountingSign?: boolean;
}

function formatCurrency(
  value: number | string | null | undefined,
  options?: FormatCurrencyOptions,
): string;
```

Current implementation:

```ts
formatCurrency(value, currency = "USD", locale = "en-US")
```

Target migration:

- Default currency changes to `TZS`
- Default precision becomes 2 for accounting contexts
- `toNumber()` remains the coercion helper
- Null and invalid values continue to render as `—`

---

## 4. Amount Rules

| Value | Display |
|-------|---------|
| Positive | `TZS 250,000.00` |
| Negative | `− TZS 12,000.00` |
| Zero | `TZS 0.00` |
| Missing | `—` |

Important:

- Missing value is not the same as zero.
- Never hide negative signs.
- Use a real minus sign (`−`) in display where possible; keep numeric values unchanged.
- Use `tabular-nums` for all monetary values.

---

## 5. `MoneyDisplay`

Target non-editable display component:

```tsx
interface MoneyDisplayProps {
  value: number | string | null | undefined;
  currency?: string;
  variant?: "default" | "positive" | "negative" | "muted" | "danger";
  align?: "left" | "right";
  showCode?: boolean;
  className?: string;
}
```

Usage:

```tsx
<MoneyDisplay value={expense.amount} currency="TZS" align="right" />
```

Behavior:

- Applies `tabular-nums`
- Right-aligns when used in tables
- Uses semantic color only when explicitly requested
- Includes accessible text for negative amounts

---

## 6. Table Currency Cells

Current component:

```tsx
<CurrencyCell value={row.original.amount} currency="TZS" />
```

Required column meta:

```ts
{
  accessorKey: "amount",
  header: "Amount",
  cell: ({ row }) => <CurrencyCell value={row.original.amount} currency="TZS" />,
  meta: { type: "currency", align: "right" },
}
```

Rules:

- Amount, debit, credit, balance columns are right-aligned.
- Totals use bold or top border, not color alone.
- Exported values preserve numeric precision and include currency metadata.

---

## 7. `AmountInput`

Target editable amount component:

```tsx
interface AmountInputProps {
  value: number | "";
  onChange: (value: number | "") => void;
  currency?: string;
  locale?: string;
  min?: number;
  max?: number;
  allowNegative?: boolean;
  disabled?: boolean;
}
```

Current `CurrencyInput` is a good base but must remove hardcoded `$`.

Required behavior:

- Currency prefix uses org financial settings.
- Supports copy/paste with commas.
- Prevents invalid decimal precision.
- Supports keyboard entry on desktop and mobile.
- Does not use generic `<input type="number">` for financial values when formatted text is required.

---

## 8. Form Field Standard

Use `CurrencyField` / target `AmountField` in React Hook Form:

```tsx
<CurrencyField
  control={form.control}
  name="amount"
  label="Amount"
  currency="TZS"
  required
/>
```

Validation:

```ts
import { money, positiveAmount, nonNegativeAmount } from "@/lib/validation/financial";
```

Rules:

- Donations and expenses require positive amounts.
- Budget lines generally require non-negative amounts unless adjustment workflow allows negative.
- Journal debit/credit lines must satisfy balanced-entry validation on server.

---

## 9. Percentages & Ratios

Current formatter:

```ts
formatPercent(value, decimals = 1)
```

Standards:

| Context | Precision |
|---------|-----------|
| KPI summary | 1 decimal |
| Budget utilization | 1 decimal |
| Export/report detail | 2 decimals where required |

Display examples:

```text
82.5%
0.0%
−3.2%
```

---

## 10. Compact Formatting

Target formatter:

```ts
formatCompactCurrency(1250000, { currency: "TZS" }) // "TZS 1.25M"
```

Use only in dashboard charts and small KPI cards. Detail pages, ledgers, reports, and exports must show full values.

---

## 11. Null, Empty, and Loading

| State | Display |
|-------|---------|
| Missing amount | `—` |
| Zero amount | `TZS 0.00` |
| Loading balance | Skeleton |
| Calculation error | Error state; do not show partial total |

Avoid displaying partially calculated balances while report data is still loading.

---

## 12. Accessibility

- Use `aria-label` for compact values, e.g. `aria-label="Tanzanian shillings one million two hundred fifty thousand"`.
- Do not rely on red/green alone for positive/negative values.
- Tables use `scope="col"` headers and right-aligned numeric columns.
- Screen-reader text should distinguish missing value from zero.

---

## 13. Checklist

- [ ] Update `formatCurrency` default currency to TZS
- [ ] Add precision options to `formatCurrency`
- [ ] Add `formatCompactCurrency`
- [ ] Add `MoneyDisplay`
- [ ] Replace hardcoded `$` in `CurrencyInput`
- [ ] Adopt `CurrencyCell` in financial tables
- [ ] Use shared financial validators in all money forms
