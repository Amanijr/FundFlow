# Phase 5 Implementation — Financial Reporting

**Status:** Implemented

## Objectives Delivered

| Deliverable | Status |
|-------------|--------|
| Income & Expenditure Statement | Done |
| Balance Sheet (Statement of Financial Position) | Done |
| Cash Flow Statement | Done |
| Fund Reports | Done |
| Budget Reports (actuals baseline) | Done |

## Report Sources

All reports are derived from posted journal entries (Phase 4 ledger). No balances are stored separately — amounts are computed at query time from debits and credits.

## API Endpoints — `/api/v1/reports`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/income-expenditure` | Revenue and expense activity for a period (`from`, `to`) |
| GET | `/balance-sheet` | Assets, liabilities, and net assets as of a date (`asOf`) |
| GET | `/cash-flow` | Cash inflows/outflows for a period (`from`, `to`) |
| GET | `/funds` | Per-fund revenue, expenses, and operational balance (`fundId` optional) |
| GET | `/budget` | Expense actuals vs zero budget baseline (`from`, `to`) |

Date parameters are optional. When omitted, reports default to the current fiscal year through today.

## Report Logic

### Income & Expenditure
- **Revenue:** credit-normal balances on `REVENUE` accounts in the period
- **Expenses:** debit-normal balances on `EXPENSE` accounts in the period
- **Net surplus:** total revenue minus total expenses

### Balance Sheet
- **Assets:** debit-normal balances on `ASSET` accounts through `asOf`
- **Liabilities:** credit-normal balances on `LIABILITY` accounts
- **Net assets:** equity accounts plus accumulated surplus (cumulative revenue minus expenses)

### Cash Flow
- **Inflows:** debits to the Cash account (1000) in the period
- **Outflows:** credits to the Cash account in the period
- **Opening/closing cash:** derived from cumulative Cash ledger activity

### Fund Report
- Journal lines tagged with `fund_id` are rolled up per fund
- **Operational balance** comes from the fund module (opening + transfers − paid expenses)
- Donation revenue is organization-wide unless journal lines are fund-tagged

### Budget Report
- Shows expense actuals by account for the period
- Budget amounts default to zero until Phase 6 budgeting is implemented
- Includes a note directing users to Phase 6 for variance analysis

## Principles

- Reports are read-only and tenant-scoped
- All authenticated users can view reports
- PDF/Excel/CSV export is planned for a future enhancement (PRD Module 10)

## Next: Phase 6 — Budgeting

Annual budgets, department budgets, and true budget variance analysis.
