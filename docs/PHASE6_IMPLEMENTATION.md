# Phase 6 Implementation — Budgeting

**Status:** Implemented

## Objectives Delivered

| Deliverable | Status |
|-------------|--------|
| Annual budgets | Done |
| Department budgets | Done |
| Fund-scoped budgets | Done |
| Campaign-scoped budgets | Done |
| Budget variance analysis | Done |
| Budget utilization % | Done |
| Reporting integration | Done |

## Data Model

Migration: `V6__budgeting.sql`

| Table | Purpose |
|-------|---------|
| `budget` | Budget header (fiscal year, scope, status, dates) |
| `budget_line` | Allocations by expense category |
| `expense.department` | Optional department tag for variance matching |

### Budget Scope Types

| Scope | Use case |
|-------|----------|
| `ORGANIZATION` | Annual org-wide budget |
| `DEPARTMENT` | Department-specific budget |
| `FUND` | Fund-restricted budget |
| `CAMPAIGN` | Campaign-linked budget |

### Budget Workflow

`DRAFT` → `APPROVED` → `ACTIVE` → `CLOSED`

Only one active budget per fiscal year per overlapping scope.

## API Endpoints — `/api/v1/budgets`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | Finance Manager+ | Create budget |
| GET | `/` | Authenticated | List budgets |
| GET | `/{id}` | Authenticated | Budget with lines |
| PUT | `/{id}` | Finance Manager+ | Update draft budget |
| POST | `/{id}/lines` | Finance Manager+ | Add budget line |
| PUT | `/{id}/lines/{lineId}` | Finance Manager+ | Update line |
| DELETE | `/{id}/lines/{lineId}` | Finance Manager+ | Remove line |
| POST | `/{id}/approve` | Finance Manager+ | Approve budget |
| POST | `/{id}/activate` | Finance Manager+ | Activate budget |
| POST | `/{id}/close` | Finance Manager+ | Close active budget |
| GET | `/{id}/variance` | Authenticated | Variance analysis (`from`, `to`) |

## Variance Logic

- **Budget amount:** sum of budget lines by category (and optional fund/department)
- **Actual amount:** paid/reconciled expenses in the period matching category, department, and fund filters
- **Variance:** budget minus actual
- **Utilization:** actual as % of budget

`GET /api/v1/reports/budget` uses the active organization budget when one exists; otherwise falls back to actuals-only with a guidance note.

## Expense Enhancement

Expenses now accept an optional `department` field for department-level budget tracking.

## Next: Phase 7 — Grants & Programs

Grant registration, restrictions, utilization, and compliance tracking.
