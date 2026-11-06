# TASK 01 — Backend Architecture and Database Audit

**Status:** Historical audit — superseded by permanent Church CMS removal and Flyway V21
**Date:** 2026-11-06  
**Related:** [TASK 00 Product Scope](./TASK_00_PRODUCT_SCOPE_REDEFINITION.md)

---

> **Superseded:** This is a point-in-time inventory of the schema before extraction. Its church package, API, entity, feature-gate, and “do not drop” statements no longer describe the application. `V21__remove_church_cms_domain.sql` migrates members to donors and removes the CMS schema. See [TASK 02](./TASK_02_BACKEND_DOMAIN_REFACTORING.md) and [Church CMS Extraction](./CHURCH_CMS_EXTRACTION.md).

## 1. Backend architecture map

### Stack

| Layer | Choice |
|-------|--------|
| Runtime | Java 17 |
| Framework | Spring Boot **3.4.4** (`daisyDonation` artifact) |
| Persistence | Spring Data JPA + PostgreSQL |
| Migrations | Flyway (`V1`–`V20` under `src/main/resources/db/migration/`) |
| Security | Spring Security + JWT (jjwt 0.12.6), BCrypt, method security |
| API docs | springdoc-openapi 2.8.5 |
| Validation | `spring-boot-starter-validation` (Bean Validation on DTOs) |

Entry: `com.project.daisyDonation.DaisyDonationApplication`.

### Module map (package → responsibility)

```text
common/          security, TenantEntity, VerticalAccess, exceptions, OpenAPI
auth/            login/register, users, roles
organization/    tenant org CRUD/profile
platform/        SUPER_ADMIN bootstrap, dashboard, system_log
donation/        gift lifecycle
payment/         gateway + manual payments on donations
donor/           financial stakeholders (non-church)
collection/      bulk cash sessions → Donation+Payment
fund/            funds, transfers, FundBalanceService
expense/         expense workflow + pay
budget/          budgets + variance
accounting/      CoA, journals, posting, GL/TB
campaign/        fundraising campaigns
pledge/          donor pledges
recurring/       recurring donations
program/         programs
grant/           grants
beneficiary/     beneficiaries + impact
reporting/       financial / donation / campaign / budget reports
analytics/       executive dashboards, trends
workflow/        approval inbox
audit/           domain_audit events
communication/   receipts / comms log
document/        org documents
notification/    notifications, announcements, activity
church/          members, ministries, attendance, partnerships (CMS)
school/          student sponsorships (school vertical)
```

### Request path (typical)

```text
HTTP → JwtAuthenticationFilter → TenantContext(orgId)
     → Controller (@PreAuthorize / service checks)
     → Service (VerticalAccess + org-scoped repos)
     → JPA entity (TenantEntity.organization_id)
     → optional AccountingPostingService / DomainAuditService
```

### API surface (prefixes)

| Prefix | Domain |
|--------|--------|
| `/api/v1/auth`, `/api/v1/users`, `/api/v1/organizations` | Auth / org admin |
| `/api/v1/platform/**` | Platform owner |
| `/api/v1/donors`, `/api/v1/donations`, `/api/v1/donations/{id}/payments` | Income |
| `/api/v1/collection-sessions` | Bulk intake |
| `/api/v1/funds`, `/api/v1/expenses`, `/api/v1/budgets` | Finance ops |
| `/api/v1/accounting`, `/api/v1/reports`, `/api/v1/analytics` | Books / reports |
| `/api/v1/campaigns`, `/api/v1/pledges`, `/api/v1/recurring-donations` | Fundraising |
| `/api/v1/programs`, `/api/v1/grants`, `/api/v1/beneficiaries` | CSO programs |
| `/api/v1/workflow`, `/api/v1/documents`, `/api/v1/notifications`, `/api/v1/activity`, `/api/v1/communications` | Governance / ops |
| `/api/v1/church`, `/api/v1/members`, `/api/v1/church/partnerships` | Church CMS |
| `/api/v1/school/sponsorships` | School vertical |

---

## 2. Entity classification inventory

### 1. Financial core

| Entity | Table | Notes |
|--------|-------|-------|
| `Donation` | `donation` | Status lifecycle; optional fund, campaign, member, partnership, collection_session |
| `Payment` | `payment` | 1:1 with donation; channel GATEWAY/MANUAL |
| `Fund` | `fund` | `opening_balance`; `default_for_collections` (V17) |
| `FundTransfer` | `fund_transfer` | COMPLETED transfers in/out |
| `Expense` | `expense` | DRAFT→…→PAID/RECONCILED |
| `Budget` / `BudgetLine` | `budget` / `budget_line` | Variance vs paid expenses |
| `ChartOfAccount` | `chart_of_account` | |
| `JournalEntry` / `JournalLine` | `journal_entry` / `journal_line` | Polymorphic `source_type` + `source_id` |
| `FiscalPeriod` | `fiscal_period` | |
| `CollectionSession` | `collection_session` | Posts Donation+Payment on verify |

### 2. Organizational administration

| Entity | Table |
|--------|-------|
| `Organization` | `organizations` |
| `User` | `users` |
| `StoredDocument` / content | `org_document`, `org_document_content` |

### 3. Financial stakeholders

| Entity | Table | Notes |
|--------|-------|-------|
| `Donor` | `donor` | Primary CSO giver; churches blocked via `VerticalAccess.requireNotChurch` |
| `Member` | `church_member` | Church giver identity (CMS) — not FundFlow core |
| Campaign / Pledge / RecurringDonation | `campaign`, `pledge`, `recurring_donation` | Stakeholder-linked fundraising |

### 4. Projects and programs

| Entity | Table |
|--------|-------|
| `Program` | `program` |
| `Grant` | `grant_record` |
| `Beneficiary` / `ImpactRecord` | `beneficiary`, `impact_record` |
| `StudentSponsorship` | `student_sponsorship` | School vertical |

### 5. Governance and reporting

| Entity / service | Table / mechanism |
|------------------|-------------------|
| `DomainAuditEvent` | `domain_audit` |
| `SystemLog` | `system_log` |
| `CommunicationLog` | `communication_log` |
| Workflow inbox | Service over expenses/approvals (no dedicated table emphasis) |
| Reporting / Analytics | Read models over repos (no separate report tables) |

### 6. Church-specific

| Entity | Table | Money coupling |
|--------|-------|----------------|
| `Member` | `church_member` | `donation.member_id` |
| `Ministry` | `ministry` | None |
| `MemberMinistry` | `member_ministry` | None |
| `ServiceEvent` | `service_event` | None |
| `AttendanceRecord` | `attendance_record` | None |
| `Partnership` | `church_partnership` | `donation.partnership_id`, optional `fund_id` |

### 7. Generic shared functionality

| Concept | Implementation |
|---------|----------------|
| Soft delete | `deleted` on most tenant tables |
| Auditing timestamps | `Abstract` + `@EnableJpaAuditing` |
| Tenant base | `TenantEntity.organization` |
| Vertical gating | `VerticalAccess` |
| API envelope | `ApiResponse<T>` |

### 8. Obsolete or duplicated functionality

| Item | Assessment |
|------|------------|
| Dual giver models (`donor` vs `church_member`) | Product duplication; FundFlow should standardize on Donor |
| `donor.membership_status` / `joined_at` (V13) | Church-era columns on donor; leftover after V18 split |
| Church CoA seed labels / tithes language | Product noise for CSO; data still valid |
| Empty `service/` package | Unused |
| Frontend org “primaryCurrency / fiscalYear / timezone” | **Not present** on backend `Organization` entity — display-layer / mock drift risk |
| Workflow inbox hardcodes currency `"TZS"` | Currency not first-class on org |

---

## 3. Entity relationship inventory (financial spine)

```text
organizations ─┬─ users
               ├─ donor ──────────────┐
               ├─ church_member ──────┤ (church only)
               │                      ▼
               ├─ donation ◄── campaign / fund / collection_session
               │     │         │
               │     │         └─ optional partnership_id → church_partnership → fund
               │     └── payment (1:1)
               │            └── journal_entry (DONATION_PAYMENT | COLLECTION_PAYMENT | voids)
               ├─ fund ◄── fund_transfer (from/to)
               ├─ expense → fund ──► journal (EXPENSE_PAYMENT)
               ├─ budget / budget_line → expense actuals (paid)
               ├─ program / grant_record
               └─ domain_audit / communication_log / org_document
```

**Isolation:** Nearly all money entities extend `TenantEntity` and repositories filter `organizationId` (+ `deleted = false`).

---

## 4. Database dependency map

### Migration timeline

| Version | Theme |
|---------|-------|
| V1 | orgs, users, donor, donation, payment |
| V2 | campaign, pledge, recurring |
| V3 | collection_session |
| V4 | fund, fund_transfer, expense |
| V5 | accounting (CoA, journals, fiscal) |
| V6 | budgeting |
| V7 | programs, grants |
| V8–V12 | communications, modules, platform logs, documents, donation.fund |
| V13–V15 | member fields, member_ministry, service_event |
| V16 | domain_audit |
| V17 | fund.default_for_collections |
| V18–V20 | church_member split, member_number, church_partnership |

### Critical FK chains (do not break)

1. `payment.donation_id` → `donation` → journals via source ids  
2. `donation.fund_id` → fund balance giving term  
3. `expense.fund_id` → fund balance expense term  
4. `fund_transfer.from_fund_id` / `to_fund_id`  
5. `donation.member_id` / `partnership_id` (legacy church)  
6. `collection_session` ↔ `donation` bidirectional link  

### Safe to park (no money FKs)

`ministry`, `member_ministry`, `service_event`, `attendance_record`.

---

## 5. Financial workflow assessment

### Fund balance rule (verified)

**Specified:**  
`opening + transfers in + completed fund-tagged contributions − transfers out − paid fund-tagged expenses`

**Implemented in** `FundBalanceService.calculateBalance`:

```text
openingBalance
+ sumIncomingTransfers (COMPLETED, toFund)
+ sumCompletedAmountByFund (DonationStatus.COMPLETED, fund_id)
− sumOutgoingTransfers (COMPLETED, fromFund)
− sumPaidAmountByFund (ExpenseStatus PAID | RECONCILED, fund_id)
```

**Verdict:** Matches the established rule. Contributions must be `COMPLETED` (not PENDING). Expenses must be `PAID` or `RECONCILED`. Transfers must be `COMPLETED`. Soft-deleted rows excluded.

**Also enforced:** `ensureSufficientBalance` before fund transfer out and before expense pay paths.

### Income lifecycle

```text
Create Donation (PENDING | IN_KIND→COMPLETED)
  → Payment gateway/manual (PENDING only)
  → Donation COMPLETED | FAILED
  → AccountingPostingService.postDonationPayment
  → optional receipt / pledge apply
Cancel: PENDING only
Void: COMPLETED → VOIDED + reversing journal
Collection: session verify creates COLLECTION donation + payment + journal
```

### Expense lifecycle

```text
DRAFT → SUBMITTED → APPROVED → PAID → RECONCILED
         ↘ REJECTED
```

Paid/reconciled amounts hit fund balance and budget actuals.

### Budget utilization

`BudgetService` variance: line amount vs `sumPaidAmountInPeriod` (paid/reconciled expenses); utilization %.

### Accounting

Double-entry journals keyed by `(organization_id, source_type, source_id)` uniqueness — prevents duplicate posts. Sources include donation/collection/expense payments and voids.

### Currency handling — gap

- Amounts are `NUMERIC(19,2)` with **no currency column** on donation/expense/fund.  
- `Organization` JPA entity has **no** `primaryCurrency` / fiscalYear / timezone fields (frontend profile may show mock/membership fields).  
- Workflow inbox hardcodes `"TZS"`.  
**Implication:** Single implicit currency per deployment/tenant assumption; multi-currency not implemented. Not a calculation bug today if all amounts share one currency, but a product integrity risk for multi-country CSOs.

### Closing balances

No separate “closing balance” table. Closing is **derived** via `calculateBalance` (and reporting balance sheet uses operational fund balances). Fiscal periods exist for accounting periods, not a stored fund closing snapshot.

---

## 6. Church-specific backend dependency map

| Dependency | Impact if CMS removed from product |
|------------|-------------------------------------|
| Controllers `/church`, `/members`, `/church/partnerships` | Can gate off; tables park |
| `VerticalAccess.requireChurch` / `requireNotChurch` | Blocks donors for churches; must reverse for FundFlow-only giver model |
| `Donation.member` / `partnership` | Historical FKs; keep nullable; stop writing for CSO |
| `PartnershipService.attachToDonation` | Church money UX |
| `ChurchDashboardService` → `FundBalanceService` | UI only; fund math stays |
| Receipt/comms resolve member name | Fall back to donor |
| Collection `SERVICE_OFFERING` enum | Rename later; session table stays financial |
| V18 data migration history | Church donors → members; do not reverse casually |

**Ministries / attendance / services:** Zero money FKs — pure CMS.

---

## 7. Security and authorization assessment

### Strengths

- Stateless JWT; passwords BCrypt.  
- `@EnableMethodSecurity` + role checks on many controllers.  
- Tenant context from JWT `organizationId`; SUPER_ADMIN may set `X-Organization-Id`.  
- Repository methods consistently scope by `organizationId`.  
- Platform routes separated (`/api/v1/platform/**`).  
- Public auth + swagger + health only.

### Roles

`SUPER_ADMIN`, `ORG_ADMIN`, `FINANCE_MANAGER`, `ACCOUNTANT`, `FUNDRAISING_MANAGER`, `PROGRAM_MANAGER`, `STAFF`, `VOLUNTEER`, `AUDITOR`, `DONOR`, `VIEW_ONLY`.

### Risks / gaps

| Risk | Detail |
|------|--------|
| Filter swallows JWT errors | Invalid tokens may fall through as unauthenticated rather than 401 explicitly in all cases |
| CSRF disabled | Acceptable for pure JWT API; document assumption |
| Tenant isolation is application-enforced | No DB RLS; a buggy query without org filter would leak — audit new repos carefully |
| SUPER_ADMIN header org switch | Powerful; ensure all services honor `TenantContext` |
| Church vertical in security model | Product policy, not crypto flaw — `requireNotChurch` couples authZ to org type |

---

## 8. Data integrity risks

| Risk | Severity | Notes |
|------|----------|-------|
| Untagged donations (`fund_id` null) | Medium | Do not affect any fund balance; income invisible to fund math |
| VOIDED still excluded correctly | OK | Only COMPLETED summed |
| Soft-delete vs hard money history | Low | Soft delete used; journals remain |
| Dual giver model | High (product) | Confusion + church-only APIs |
| No multi-currency | Medium | Implicit TZS/single currency |
| Org profile fields missing in backend | Medium | Frontend/mock may invent currency/fiscal metadata |
| Polymorphic journal sources | Medium | Orphan source ids if rows deleted hard |
| Dropping `church_member` cold | Critical | Breaks `donation.member_id` |
| Treating collections as CMS | High | Would destroy financial intake path |
| Budget actuals vs fund expenses | Low | Both use paid expenses; alignment OK if same fund/period filters |

---

## 9. Recommended backend refactoring plan

Aligned with TASK 00; **await approval** before implementation.

### Phase B1 — Product surface (non-destructive)

1. Document FundFlow API set excluding church controllers.  
2. Feature-flag or config-disable church endpoints in FundFlow builds.  
3. Change seed/default org away from CHURCH.  
4. Allow donors for all FundFlow orgs (`requireNotChurch` retirement plan).

### Phase B2 — Giver model cleanup (data-safe)

1. New gifts: donor-only.  
2. Optional migration script: church_member → donor for orgs converting to CSO.  
3. Keep `member_id` / `partnership_id` nullable columns; stop writes.  
4. **No DROP** of church tables.

### Phase B3 — Financial clarity

1. Require `fund_id` on completed contributions (or explicit “unallocated income” fund).  
2. Persist org `primaryCurrency` (and optionally fiscal year / timezone) on `organizations` to match product UX.  
3. Remove hardcoded `"TZS"` in workflow once org currency exists.  
4. Keep `FundBalanceService` formula unchanged; add tests asserting the rule.  
5. Keep `collection_session` as optional bulk intake API.

### Phase B4 — CMS extraction (later program)

1. Move church package to CMS service or module.  
2. Only then design table moves/drops with FK migration.

### Explicit non-goals for this audit follow-up

- No schema drops in FundFlow TASK series without TASK 00 Stage D approval.  
- No rewrite of journal posting semantics.  
- No multi-currency FX engine in v1 — only org currency field if approved.

---

## Approval gate

This document is **read-only**. Please approve before:

1. Disabling church APIs / changing `VerticalAccess` giver rules.  
2. Adding organization currency (schema migration).  
3. Any data backfill donor←member.  
4. Any `DROP TABLE` / column removal.

**Financial integrity finding:** Fund balance calculation **correctly implements** the stated rule today.
