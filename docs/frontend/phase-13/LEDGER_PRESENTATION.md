# Ledger Presentation

**Phase:** 13 — Financial UX & Data Standards

---

## 1. Purpose

Accounting screens must be readable for finance users and auditors. Journal entries, general ledger, and trial balance views should follow one ledger presentation standard.

Current pages:

| Route | File |
|-------|------|
| Chart of accounts | `accounting/chart-of-accounts/page.tsx` |
| Journal entries | `accounting/journal-entries/page.tsx`, `[id]/page.tsx` |
| General ledger | `accounting/general-ledger/page.tsx` |
| Trial balance | `accounting/trial-balance/page.tsx` |

---

## 2. Ledger Table Model

Each ledger row should expose:

```ts
interface LedgerRow {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  balance?: number;
  description?: string;
  reference?: string;
  costCentre?: string;
  fundName?: string;
  transactionDate: string;
  postingDate?: string;
}
```

---

## 3. Column Standards

| Column | Alignment | Formatter |
|--------|-----------|-----------|
| Account code | Left | Monospace / `tabular-nums` |
| Account name | Left | Normal text |
| Debit | Right | `MoneyDisplay` |
| Credit | Right | `MoneyDisplay` |
| Balance | Right | `MoneyDisplay` |
| Description | Left | Truncate with tooltip |
| Reference | Left | `TransactionReference` |
| Cost centre | Left | Optional |
| Fund | Left | Optional |
| Date | Left | `formatDate` |

Debit and credit columns must always remain separate. Do not use signed amount columns in accounting ledgers unless the screen is explicitly a summary view.

---

## 4. `LedgerTable` Component (Target)

```tsx
interface LedgerTableProps {
  rows: LedgerRow[];
  showBalance?: boolean;
  showTotals?: boolean;
  stickyTotals?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  onReferenceClick?: (reference: string) => void;
}
```

Visual rules:

- Header row uses muted background.
- Numeric columns use `tabular-nums`.
- Totals row is bold with top border.
- Sticky totals remain visible during scroll on long ledgers.
- Zero debit/credit cells may show `—` or `TZS 0.00` consistently per screen, but not mixed.

---

## 5. Journal Entry Detail

Journal entry detail should show:

```
Journal Entry JRN-2026-002451
Posted · Mar 15, 2026
Fiscal period: FY 2026 · Q1

Account          Debit         Credit
------------------------------------
1000 Cash        TZS 500,000.00   —
4100 Revenue     —              TZS 500,000.00
------------------------------------
Totals           TZS 500,000.00 TZS 500,000.00
```

Required elements:

- Reference number
- Status badge (`draft`, `posted`, `reversed`)
- Transaction date and posting date
- Fiscal period label
- Source link to donation/expense when available (`journal-source-link.tsx`)
- Balanced totals row

If debits and credits do not balance, show an error state and disable post action.

---

## 6. General Ledger

General ledger screens should support:

- Account selector
- Date range or fiscal period filter
- Opening balance
- Running balance column
- Closing balance summary

Layout:

```
[Account selector] [Fiscal period / date range]
------------------------------------------------
Opening balance                     TZS 1,200,000.00
Ledger rows...
Closing balance                     TZS 1,450,000.00
```

Use `ReportFilters` or target `FiscalPeriodSelector` above the table.

---

## 7. Trial Balance

Trial balance must show:

| Column | Required |
|--------|----------|
| Account code | Yes |
| Account name | Yes |
| Debit total | Yes |
| Credit total | Yes |
| Net balance | Optional |

Footer totals:

- Total debits
- Total credits
- Difference (should be zero)

If difference is non-zero, show danger styling and explanatory message.

---

## 8. Totals and Subtotals

Financial tables support:

| Feature | Rule |
|---------|------|
| Row totals | Bold text |
| Section subtotals | Muted background |
| Sticky footer totals | Preferred on long reports |
| Export totals | Must match on-screen totals exactly |

Never recalculate totals differently in export than in UI.

---

## 9. Empty States

Examples:

| Screen | Message |
|--------|---------|
| General ledger | `No transactions have been recorded for this fiscal period.` |
| Journal list | `No journal entries yet.` |
| Trial balance | `No balances available for the selected period.` |

Include a next action when possible, such as `Record donation` or `Create journal entry`.

---

## 10. Loading States

- Use skeleton rows for ledger tables.
- Do not render partial totals while rows are still loading.
- Disable export until the full result set is available.

---

## 11. Accessibility

- Ledger tables use semantic `<table>` where possible.
- Column headers use `scope="col"`.
- Totals row uses `scope="row"` for the label cell.
- Reference links have descriptive text, not icon-only.
- Negative balances include text and are not indicated by color alone.

---

## 12. API Contracts (Target)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/accounting/journal-entries` | List |
| `GET /api/v1/accounting/journal-entries/{id}` | Detail with lines |
| `GET /api/v1/accounting/general-ledger` | Account ledger |
| `GET /api/v1/accounting/trial-balance` | Trial balance |
| `GET /api/v1/fiscal-periods` | Period metadata for filters |

Journal responses should include:

- `referenceNumber`
- `transactionDate`
- `postingDate`
- `fiscalPeriodName`
- `status`
- `lines[]` with debit/credit amounts

---

## 13. Checklist

- [ ] Add `LedgerRow` type
- [ ] Add `LedgerTable` component
- [ ] Standardize journal entry detail layout
- [ ] Add sticky totals to trial balance and ledger views
- [ ] Use `TransactionReference` in ledger rows
- [ ] Show fiscal period on accounting screens
- [ ] Add balanced-entry validation UI on journal detail
