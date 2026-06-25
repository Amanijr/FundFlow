# Phase 7 Implementation — Grants & Programs

**Status:** Implemented

## Objectives Delivered

| Deliverable | Status |
|-------------|--------|
| Program tracking | Done |
| Grant registration | Done |
| Grant restrictions | Done |
| Grant utilization | Done |
| Compliance tracking | Done |
| Program budgets | Done |
| Expense attribution | Done |

## Data Model

Migration: `V7__grants_and_programs.sql`

| Table | Purpose |
|-------|---------|
| `program` | Operational program with optional dedicated fund |
| `grant_record` | Grant award with restrictions, compliance, and links to program/fund |
| `budget.program_id` | Program-scoped budgets |
| `expense.program_id` / `expense.grant_id` | Expense attribution |

## Program Module — `/api/v1/programs`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create program |
| GET | `/` | List programs |
| GET | `/{id}` | Program detail |
| GET | `/{id}/dashboard` | Grants, spending, and active budget summary |
| PUT | `/{id}` | Update program |

### Program Statuses
`PLANNED`, `ACTIVE`, `COMPLETED`, `ON_HOLD`

## Grant Module — `/api/v1/grants`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Register grant |
| GET | `/` | List grants |
| GET | `/{id}` | Grant detail |
| PUT | `/{id}` | Update draft grant |
| POST | `/{id}/activate` | Activate grant |
| POST | `/{id}/close` | Close active grant |
| POST | `/{id}/compliance` | Record compliance notes |
| GET | `/{id}/utilization` | Usage %, remaining balance, expiry alert |

### Grant Restriction Types
`UNRESTRICTED`, `PURPOSE_RESTRICTED`, `TIME_RESTRICTED`, `FULLY_RESTRICTED`

### Compliance Statuses
`PENDING`, `COMPLIANT`, `AT_RISK`, `NON_COMPLIANT`

Compliance is evaluated automatically from:
- Spend vs awarded amount
- Grant period restrictions
- Utilization threshold (90%+ → at risk)

### Utilization KPIs
- **Usage %** — spent / awarded
- **Remaining balance** — awarded − spent
- **Expiring soon** — active grant within 30 days of end date

## Program Budgets

Budget scope type `PROGRAM` links a budget to a program. Variance analysis filters paid expenses by `program_id`.

## Expense Integration

Expenses accept optional `programId` and `grantId` for grant-funded spend tracking.

## Next: Phase 8 — Communications

Email, SMS, WhatsApp, and automated receipts.
