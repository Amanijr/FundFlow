# Phase 4 Implementation — Accounting

**Status:** Implemented

## Objectives Delivered

| Deliverable | Status |
|-------------|--------|
| Chart of Accounts | Done |
| Fiscal periods | Done |
| Journal entries + lines | Done |
| Double-entry posting engine | Done |
| Auto-post on donation payment | Done |
| Auto-post on in-kind donation | Done |
| Auto-post on collection verify | Done |
| Auto-post on expense payment | Done |
| Trial balance report | Done |
| General ledger report | Done |

## Default Chart of Accounts

| Code | Name | Type |
|------|------|------|
| 1000 | Cash | ASSET |
| 1200 | In-Kind Contributions | ASSET |
| 4000 | Donation Revenue | REVENUE |
| 5100 | Operations Expense | EXPENSE |
| 5200 | Program Expense | EXPENSE |
| 5300 | Administrative Expense | EXPENSE |
| 5400 | Fundraising Expense | EXPENSE |
| 5900 | Miscellaneous Expense | EXPENSE |

Initialize via `POST /api/v1/accounting/initialize` (also auto-initializes on first posting).

## Automatic Journal Entries

| Event | Debit | Credit |
|-------|-------|--------|
| Donation received | Cash (1000) | Donation Revenue (4000) |
| In-kind donation | In-Kind Contributions (1200) | Donation Revenue (4000) |
| Collection verified | Cash (1000) | Donation Revenue (4000) |
| Expense paid | Expense account (5xxx) | Cash (1000) |

Posting is idempotent — duplicate source events do not create duplicate entries.

## API Endpoints — `/api/v1/accounting`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/initialize` | Finance Manager+ | Seed COA + fiscal period |
| GET | `/chart-of-accounts` | Authenticated | List accounts |
| POST | `/chart-of-accounts` | Accountant+ | Add custom account |
| GET | `/journal-entries` | Authenticated | List journal entries |
| GET | `/journal-entries/{id}` | Authenticated | Entry detail with lines |
| GET | `/trial-balance` | Authenticated | Trial balance report |
| GET | `/general-ledger/{accountId}` | Authenticated | Ledger for account |

## Principles

- Every financial transaction creates balanced journal entries (debits = credits)
- Account balances are derived from journal lines, never stored
- Accounting module is independent — donation/expense modules call into it, not vice versa

## Database

Migration: `V5__accounting.sql`

## Next: Phase 5 — Financial Reporting

Income & expenditure, balance sheet, cash flow statements from ledger data.
