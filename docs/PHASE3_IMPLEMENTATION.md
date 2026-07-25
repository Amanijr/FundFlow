# Phase 3 Implementation — Financial Operations

**Status:** Implemented

## Objectives Delivered

| Deliverable | Status |
|-------------|--------|
| Fund management (CRUD, types, balances) | Done |
| Fund transfers between funds | Done |
| Expense requests | Done |
| Expense approval workflow | Done |
| Expense payment (manual/hybrid) | Done |
| Expense reconciliation | Done |
| Expense reporting by category | Done |

## Fund Types

`RESTRICTED`, `UNRESTRICTED`, `PROJECT`, `ENDOWMENT`

## Fund Balance (derived)

```
currentBalance = openingBalance + transfersIn - transfersOut - paidExpenses
```

Balances are calculated, not stored directly (aligned with accounting principles).

## Expense Workflow

```
DRAFT → SUBMITTED → APPROVED → PAID → RECONCILED
                  ↘ REJECTED → (edit & resubmit)
```

| Status | Who acts |
|--------|----------|
| DRAFT | Staff creates/edits |
| SUBMITTED | Staff submits for approval |
| APPROVED / REJECTED | Finance Manager / Org Admin |
| PAID | Finance Manager records payment |
| RECONCILED | Finance Manager confirms reconciliation |

## API Endpoints

### Funds — `/api/v1/funds`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | Finance Manager+ | Create fund |
| GET | `/` | Authenticated | List funds with balances |
| GET | `/{id}` | Authenticated | Fund detail + balance |
| PUT | `/{id}` | Finance Manager+ | Update fund |
| POST | `/transfers` | Finance Manager+ | Transfer between funds |
| GET | `/transfers` | Authenticated | List transfers |

### Expenses — `/api/v1/expenses`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | Staff+ | Create expense request |
| GET | `/` | Authenticated | List expenses |
| GET | `/report` | Authenticated | Expense summary report |
| GET | `/{id}` | Authenticated | Expense detail |
| PUT | `/{id}` | Staff+ | Update draft/rejected |
| POST | `/{id}/submit` | Staff+ | Submit for approval |
| POST | `/{id}/approve` | Finance Manager+ | Approve |
| POST | `/{id}/reject` | Finance Manager+ | Reject with reason |
| POST | `/{id}/pay` | Finance Manager+ | Record payment |
| POST | `/{id}/reconcile` | Finance Manager+ | Mark reconciled |

## Example Flow

```bash
# Create fund with opening balance
POST /api/v1/funds
{"name":"General Fund","code":"GEN-001","type":"UNRESTRICTED","openingBalance":10000}

# Create expense linked to fund
POST /api/v1/expenses
{"title":"Office Supplies","amount":250,"category":"OPERATIONS","expenseType":"REQUEST","fundId":1}

# Workflow
POST /api/v1/expenses/1/submit
POST /api/v1/expenses/1/approve
POST /api/v1/expenses/1/pay
  {"paymentMethod":"BANK_TRANSFER","paymentReference":"EXP-001","paidAt":"..."}
POST /api/v1/expenses/1/reconcile

# Check fund balance (10000 - 250 = 9750)
GET /api/v1/funds/1

# Expense report
GET /api/v1/expenses/report
```

## Database

Migration: `V4__financial_operations.sql`

## Next: Phase 4 — Accounting

Double-entry journal entries on donations and expenses.
