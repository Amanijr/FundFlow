# Phase 10 Implementation — Advanced Analytics

**Status:** Implemented

## Objectives Delivered

| Feature | Status |
|---------|--------|
| Executive dashboard KPIs | Done |
| Trend analysis (donations, expenses, sources, campaigns) | Done |
| Forecasting (linear projection) | Done |
| AI insights (rule-based executive intelligence) | Done |

## API — `/api/v1/analytics`

| Method | Path | Description |
|--------|------|-------------|
| GET | `/dashboard` | Executive KPIs: donations, expenses, net position, cash, fund balances, growth, donors, campaigns, budget utilization |
| GET | `/trends` | Monthly donation/expense trends, source breakdown, campaign performance |
| GET | `/forecast` | Projected donations/expenses for upcoming months (`?months=3`) |
| GET | `/insights` | Rule-based alerts for fundraising, budget, liquidity, campaigns, and operations |

## Executive Dashboard KPIs

- Total donations and expenses for the period
- Net position (donations minus expenses)
- Cash balance (ledger account `1000`)
- Total fund operational balances
- Period-over-period donation and expense growth %
- Donor count and average donation
- Active campaign count
- Budget utilization % (when an active organization budget exists)
- Pending expense approval count

## Trend Analysis

- Monthly time series for donations and expenses
- Donation source breakdown (by `source` field or donation type)
- Campaign performance with goal % achievement

## Forecasting

Uses a linear trend projection from the last 6 months of activity. Returns projected donations, expenses, and net for each future month.

## Insights Engine

Rule-based heuristics (no external AI dependency):

| Category | Triggers |
|----------|----------|
| Fundraising | Donation growth decline > 10% or growth > 15% |
| Budget | Utilization ≥ 90% or under-spending mid-year |
| Liquidity | Cash below one month of recent expenses |
| Campaign | Active campaign below 50% of goal near end date |
| Operations | Pending expense approvals |

## Data Sources

Aggregates existing modules — no new persistence layer:

- `donation/` — completed donations by period
- `expense/` — paid/reconciled expenses by period
- `fund/` — operational fund balances
- `accounting/` — cash ledger balance
- `budget/` — active organization budget variance
- `campaign/` — campaign goals and status

## Migration

None required — analytics are computed from existing transactional data.

## ROADMAP Exit Criteria

**Executive intelligence available** — satisfied via dashboard, trends, forecast, and insights endpoints.

## Swagger / OpenAPI

Full API documentation is available for all modules. See [SWAGGER.md](./SWAGGER.md) for setup and tag reference.

| Resource | URL |
|----------|-----|
| Swagger UI | `http://localhost:8080/swagger-ui.html` |
| OpenAPI JSON | `http://localhost:8080/v3/api-docs` |

