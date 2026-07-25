# Phase 13 — Financial UX & Data Standards

**Date:** 2026-07-02  
**Status:** Approved (documentation)  
**Dependencies:** Phase 00–12

---

## 1. Executive Summary

Financial information is the core data surface of FundFlow ERP. Every module must display money, dates, fiscal periods, references, statuses, journals, and accounting records consistently.

This phase defines the shared financial presentation framework for accounting, donations, budgets, expenses, funds, grants, dashboards, and reports. No module should define custom financial formatting, badge colors, terminology, or reference display rules.

---

## 2. Design Philosophy

| Principle | Application |
|-----------|-------------|
| **Accurate** | Display raw backend values through shared formatters only |
| **Consistent** | Same currency, status, date, and reference rules everywhere |
| **Readable** | Right-aligned amounts, tabular numbers, clear totals |
| **Auditable** | References are stable, clickable, and visible in ledgers |
| **Professional** | Accounting terminology is standardized |
| **Accessible** | Never rely on color alone for financial meaning |

---

## 3. Existing Foundations

| Area | Current file | Notes |
|------|--------------|-------|
| Currency utilities | `frontend/src/lib/utils/format.ts` | `formatCurrency`, `formatPercent`, `toNumber`; currently USD default and 0 decimals |
| Date utilities | `frontend/src/lib/utils/dates.ts` | `formatDate`, `formatDateTime`, `toApiDate`, `parseApiDate` |
| Finance badges | `frontend/src/components/finance/finance-status-badge.tsx` | Expense and budget status badges |
| Currency table cell | `frontend/src/components/data/cells/currency-cell.tsx` | Exists; underused in financial pages |
| Currency input | `frontend/src/components/forms/currency-input.tsx` | Currently hardcoded `$`; target is configurable currency |
| Currency field | `frontend/src/components/forms/fields/currency-field.tsx` | RHF wrapper; preferred form pattern |
| Financial validation | `frontend/src/lib/validation/financial.ts` | Shared money schemas; not yet adopted everywhere |
| Accounting pages | `frontend/src/app/(app)/accounting/*` | Journal entries, ledger, trial balance |
| Dashboard standards | `docs/frontend/phase-08/KPI_STANDARDS.md` | KPI formatting and trend requirements |
| Data formatting standards | `docs/frontend/phase-06/DATA_FORMATTING_GUIDE.md` | Formatter layer and table cell guidance |

---

## 4. Target Component Inventory

| Component | Purpose | Current / target |
|-----------|---------|------------------|
| `MoneyDisplay` | Non-editable currency display | Target wrapper over `formatCurrency` |
| `AmountInput` | Monetary input with currency prefix | Target replacement for hardcoded `CurrencyInput` |
| `CurrencyField` | Form field wrapper | Exists; extend currency support |
| `FinancialBadge` | Shared status badge registry | Target consolidation of finance statuses |
| `FinancialStatusChip` | Compact status in tables/cards | Target |
| `FiscalPeriodSelector` | Active FY/quarter/month selection | Target |
| `TransactionReference` | Clickable reference display | Target |
| `LedgerTable` | Debit/credit/balance table pattern | Target |
| `FinancialSummaryCard` | KPI/summary card for balances | Target |
| `BalanceIndicator` | Positive/negative/zero balance meaning | Target |

---

## 5. Architecture

```
Backend financial metadata
    ↓
lib/api/financial-settings.ts (target)
    ↓
FinancialPreferencesProvider (target)
    ↓
Shared formatters + validators
    ↓
MoneyDisplay / AmountInput / FinancialBadge / LedgerTable
    ↓
Modules: donations, expenses, budgets, accounting, reports, dashboards
```

Rules:

- Do not call `Intl.NumberFormat` directly in module components.
- Do not use generic number inputs for monetary values.
- Do not define module-specific financial badge colors.
- Do not show raw IDs where a reference number is available.

---

## 6. Shared State

```ts
interface FinancialPreferences {
  primaryCurrency: "TZS" | "USD" | "EUR" | "GBP";
  locale: string;
  decimalPlaces: number;
  activeFiscalYear?: number;
  activeFiscalPeriodId?: string;
  showCurrencyCode: boolean;
}
```

Source of truth should come from backend organization settings. Frontend may cache in TanStack Query:

```ts
["financial-settings", organizationId]
```

---

## 7. Backend Contracts (Target)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/financial-settings` | Currency, locale, fiscal calendar, number precision |
| `GET /api/v1/fiscal-periods` | Fiscal years, quarters, months, closed/open state |
| `GET /api/v1/exchange-rates` | Multi-currency context |
| `GET /api/v1/financial-statuses` | Backend status definitions where configurable |
| `POST /api/v1/references/generate` | Generate module reference numbers |

Frontend consumes metadata; it does not invent fiscal periods, exchange rates, or reference sequences.

---

## 8. Migration Guidance

| Current pattern | Target |
|-----------------|--------|
| Inline `formatCurrency(toNumber(...))` in every table | `CurrencyCell` / `MoneyDisplay` |
| Hardcoded `$` in `CurrencyInput` | Configurable `AmountInput` using org currency |
| Raw `#${id}` references | `TransactionReference` with prefix |
| Status color maps per module | Shared `FinancialBadge` registry |
| Date range filters only | `FiscalPeriodSelector` + date range escape hatch |
| Inline `z.number().positive()` money checks | `money`, `positiveAmount`, period validators |

---

## 9. Related Documents

| Document | Contents |
|----------|----------|
| [CURRENCY_AND_FORMATTING.md](./CURRENCY_AND_FORMATTING.md) | TZS-first currency and number standards |
| [FINANCIAL_STATUS_GUIDE.md](./FINANCIAL_STATUS_GUIDE.md) | Status labels, colors, icons, tooltips |
| [LEDGER_PRESENTATION.md](./LEDGER_PRESENTATION.md) | Journal, ledger, trial balance table standards |
| [TRANSACTION_REFERENCE_STANDARD.md](./TRANSACTION_REFERENCE_STANDARD.md) | Reference number format and links |
| [FISCAL_PERIOD_GUIDE.md](./FISCAL_PERIOD_GUIDE.md) | Fiscal years, periods, closed period UX |
| Phase 06 [DATA_FORMATTING_GUIDE.md](../phase-06/DATA_FORMATTING_GUIDE.md) | General formatter layer |
| Phase 07 [VALIDATION_STRATEGY.md](../phase-07/VALIDATION_STRATEGY.md) | Form validation strategy |
| Phase 08 [KPI_STANDARDS.md](../phase-08/KPI_STANDARDS.md) | Dashboard KPI standards |

---

## 10. Acceptance Criteria

- [x] Currency and amount formatting standards documented
- [x] Financial statuses standardized
- [x] Reference number standards documented
- [x] Ledger presentation documented
- [x] Fiscal period UX documented
- [x] Backend contracts documented
- [ ] `MoneyDisplay` implemented
- [ ] Configurable `AmountInput` / `CurrencyField`
- [ ] `FinancialBadge` shared status registry
- [ ] `TransactionReference` component
- [ ] `FiscalPeriodSelector`
- [ ] `LedgerTable` pattern adopted by accounting pages

---

## 11. Governance

Do not proceed to Phase 14 until these financial UX standards are reviewed and approved.

Every future financial module must use these standards without introducing new formatting, status, or presentation conventions.
