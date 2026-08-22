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

Seeded **names** follow `OrganizationType` (church, school, foundation, NGO). System **codes** stay stable for posting.

| Code | Default role | Type |
|------|--------------|------|
| 1000 | Cash / cash on hand | ASSET |
| 1010 | Bank account (optional detail) | ASSET |
| 1020 | Mobile money / Lipa (optional detail) | ASSET |
| 1200 | In-kind contributions | ASSET |
| 4000 | Contribution / donation revenue (auto-posted) | REVENUE |
| 4010–4030 | Church detail: tithes / offerings / building | REVENUE |
| 5100–5900 | Expense categories (labels by org type) | EXPENSE |

Initialize via `POST /api/v1/accounting/initialize` (also auto-initializes on first posting).

## Automatic Journal Entries

Accounts are chosen from the org chart based on the entry (not a single hardcoded pair):

| Event | Debit (how money arrived / left) | Credit |
|-------|----------------------------------|--------|
| Gift paid in cash | Cash on hand `1000` | Tithe / offering / gifts (`4010` / `4020` / `4000` from fund or source) |
| Gift via M-Pesa / Lipa | Mobile money `1020` (fallback cash) | Same income mapping |
| Gift via bank / cheque | Bank `1010` (fallback cash) | Same income mapping |
| In-kind | In-kind `1200` | Contribution income |
| Expense paid | Expense `5xxx` by category | Cash / bank / Lipa from payment method |

Income mapping (Tanzanian church language): zaka/tithe → `4010`, sadaka/offering/collection → `4020`, building/kanisa → `4030`, else `4000`. If an optional code is missing on that org’s chart, posting falls back to cash and contribution income.

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
