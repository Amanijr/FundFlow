# TASK 00 — FundFlow Product Scope Redefinition

**Status:** Historical planning record — superseded by permanent Church CMS removal and Flyway V21
**Date:** 2026-11-06  
**Principle:** FundFlow = financial management for civil society institutions. Church management = separate product (CMS). Do not build CMS in this task.

---

> **Superseded:** This document records the pre-extraction analysis and uses proposed language such as “park,” “hide,” and “feature-flag.” That transitional approach is no longer current. Church CMS has been permanently removed, legacy members are migrated to donors, and CMS tables are dropped by `V21__remove_church_cms_domain.sql`. See [TASK 02](./TASK_02_BACKEND_DOMAIN_REFACTORING.md) and [Church CMS Extraction](./CHURCH_CMS_EXTRACTION.md).

## Executive verdict

FundFlow already has a strong **financial core** (donations → payments → funds → expenses/budgets → accounting → reports) plus CSO modules (programs, grants, beneficiaries). Church influence is concentrated in a **vertical overlay**: members, ministries, services, attendance, Sunday collections UI, partnerships, and dual donor/member terminology—not in the ledger itself.

**Safe product direction:** Hide/remove church vertical from FundFlow UX and APIs; keep money paths; park CMS-bound tables without dropping them until a CMS migration plan exists.

---

## 1. Existing product functionality inventory

| Area | What exists today |
|------|-------------------|
| Platform / multi-tenant | Organizations, users, roles, platform owner dashboard, documents, notifications, activity, workflow inbox |
| Auth | Register, login, MFA hooks, `/auth/me`, org settings |
| Fundraising (generic) | Donors, campaigns, donations, payments, receive-gift wizard, pledges, recurring donations |
| Finance | Funds, fund transfers, expenses, spend-money wizard, budgets |
| Accounting | Chart of accounts, journal entries, general ledger, trial balance, fiscal periods |
| CSO / programs | Programs, grants, beneficiaries |
| Church vertical | Members, ministries, services, attendance, partnerships, Sunday collections, church hub/home, church reports |
| School vertical | Student sponsorships |
| Reporting | Financial, donations, campaigns, budgets (+ church: members, attendance) |
| Governance | Approvals/workflow, domain audit, communication/receipts |

---

## 2. Church-specific functionality inventory

### Frontend (remove from FundFlow product surface)

| Item | Location |
|------|----------|
| Congregation nav | Members, Ministries, Services, Attendance |
| Giving-as-church nav | Sunday collections, Partnerships, Gifts (donation alias) |
| Routes | `/church/*`, `/members/*`, `/reports/members`, `/reports/attendance` |
| Components | `frontend/src/components/church/**`, `church-home-snapshot`, church branches in people/donations/reports/home |
| Copy | Gifts, congregation, zaka/sadaka, Sunday offering, member gift |
| Demo default | Mock org type `CHURCH` (CrossLife pilot) |

### Backend APIs (CMS boundary — stop exposing in FundFlow)

| Prefix | Domain |
|--------|--------|
| `/api/v1/church` | Ministries, services, attendance, church dashboard, membership report |
| `/api/v1/church/partnerships` | Monthly member partnerships |
| `/api/v1/members` | Church members |

### Database tables (CMS-owned; do not drop yet)

| Table | Money FK? |
|-------|-----------|
| `ministry` | No |
| `member_ministry` | No |
| `service_event` | No |
| `attendance_record` | No |
| `church_member` | Yes → `donation.member_id`, `church_partnership` |
| `church_partnership` | Yes → `donation.partnership_id`, optional `fund_id` |

---

## 3. Generic functionality inventory (keep in FundFlow)

| Module | Status |
|--------|--------|
| Organizations, users, roles, settings | Keep |
| Donors (financial stakeholders) | Keep — primary giver model for CSO |
| Donations + payments | Keep — single money path |
| Campaigns | Keep (fundraising CSOs) |
| Funds + transfers | Keep |
| Expenses + budgets | Keep |
| Programs, grants, beneficiaries | Keep (CSO-facing) |
| Accounting + financial reports | Keep |
| Approvals, audit, documents, notifications | Keep |
| Multi-org SaaS isolation | Keep |

**School sponsorships:** Ambiguous vertical—not church CMS. Recommend **defer** (flag/hide) unless schools remain an explicit FundFlow segment.

---

## 4. Financial functionality inventory (must preserve)

| Capability | Implementation notes |
|------------|----------------------|
| Contribution intake | Donation create → Payment → COMPLETED |
| Manual + gateway payments | Payment domain |
| Fund assignment | Donation/expense → fund; fund balances |
| Fund transfers | `fund_transfer` |
| Bulk cash intake | `collection_session` → anonymous Donation + Payment + journal (`COLLECTION_*`) — **financial**, not CMS |
| Budgets / variance | budget + budget_line + expenses |
| Grants / programs | `grant_record`, `program` |
| Ledger integrity | journal_entry / journal_line; polymorphic `source_type`/`source_id` |
| Auditability | domain_audit, workflow approvals, receipts |

**Do not compromise:** fund balance rules, posting paths, void/cancel, tenant isolation.

---

## 5. Proposed FundFlow module structure (CSO)

Simplified IA (matches non-church nav, minus church/school noise):

1. **Home** — role dashboards (executive / finance / fundraising)  
2. **Income** — Donors · Campaigns · Donations · Receive a gift  
3. **Finance** — Funds · Expenses · Budgets · Accounting  
4. **Programs** *(optional / collapsed)* — Programs · Grants · Beneficiaries  
5. **Governance** — Approvals · Reports · Activity · Documents  
6. **Administration** — Users · Organization settings · Profile / preferences  

**Terminology defaults**

| Avoid (church) | Prefer (FundFlow) |
|----------------|-------------------|
| Members / Congregation | Donors / Funding partners |
| Gifts / Offerings | Donations / Contributions |
| Ministries | *(CMS)* — use Programs for CSO work |
| Sunday collections | Batch cash intake *(optional later)* or hide |
| Partnerships (church pledges) | Pledges / recurring *(existing generic)* |

---

## 6. Proposed CMS domain boundary (Product B — out of scope to build)

CMS owns (separate product later):

- Church membership lifecycle  
- Ministries / departments / congregation structure  
- Services, attendance, events  
- Church-specific dashboards and membership reports  
- Church partnership UX (if retained as membership+giving hybrid, decide ownership later)

**Integration stance (future):** CMS may call FundFlow APIs for gifts/funds; FundFlow must not embed CMS modules.

---

## 7. Entities requiring generalization

| Entity / concept | Action |
|------------------|--------|
| `Donor` vs `Member` | FundFlow: **Donor only** for named givers. Church tenants historically used `church_member` + `donation.member_id`. |
| `donation.member_id` / `partnership_id` | Nullable legacy; migrate/null for FundFlow tenants; do not make member a core financial entity. |
| `CollectionSession` | Keep as **optional financial bulk intake**; strip church-only copy (`SERVICE_OFFERING` → generic types over time). |
| `Fund.defaultForCollections` | Soft church convenience; rename/remove later without breaking funds. |
| `OrganizationType` CHURCH / RELIGIOUS_INSTITUTION | Stop shipping as FundFlow product vertical; may remain in enum for legacy tenants until migrated. |
| Accounting church CoA seed labels | Prefer neutral CSO chart seeds for new orgs. |
| People module dual routes `/members`↔`/donors` | Collapse to `/donors` in FundFlow. |

---

## 8. Database migration implications

### Must not drop

`organizations`, `users`, `donation`, `payment`, `donor`, `fund`, `fund_transfer`, `expense`, `budget`, `budget_line`, `fiscal_period`, `chart_of_account`, `journal_entry`, `journal_line`, `campaign`, `pledge`, `recurring_donation`, `program`, `grant_record`, `collection_session` (if any verified sessions / linked donations exist).

### Safe to park (feature-flag / stop writing; soft-deprecate)

`ministry`, `member_ministry`, `service_event`, `attendance_record` — no money FKs.

### Do not hard-drop without rewrite

`church_member`, `church_partnership` — still referenced by donations for church-seeded data.

### Recommended migration policy

1. **No DROP TABLE in Stage D v1.**  
2. Disable church vertical in FundFlow (nav, APIs, route guards).  
3. Change demo/seed default org to `FOUNDATION` or `COMMUNITY_ORGANIZATION`.  
4. For legacy church tenants: leave data read-only or migrate givers `church_member` → `donor` before any drop.  
5. Preserve all journals and payments.

---

## 9. API and frontend refactoring implications

### Frontend (Stage D sequence)

1. Remove Congregation + church Giving from `navigation.ts`.  
2. Stop church default home (`permissions.getRoleOverviewPath` → `/church`).  
3. Hide `/church/*`, `/members`, church reports behind removed vertical (or 404).  
4. Delete or quarantine `components/church/**` from FundFlow app shell.  
5. Unify people copy to donors/donations.  
6. Retarget mock fixtures to CSO org.  
7. Simplify reports nav to financial set only.  
8. Optional: hide school sponsorships until product decision.

### Backend

1. Keep church controllers temporarily but **exclude from FundFlow product docs** and optionally disable via config/`VerticalAccess` returning forbidden for all FundFlow product builds.  
2. Prefer: `VerticalAccess` treats CHURCH types as unsupported product tenants *or* migrate org types.  
3. Ensure `/api/v1/donors` works for all FundFlow orgs (remove `requireNotChurch` once members path is retired).  
4. Leave `/api/v1/collection-sessions` available as financial API if needed; remove church-only UI.  
5. No schema drops until CMS extraction plan.

### Tests / seeds

- Update `DevDataSeeder` away from CHURCH as primary demo.  
- Adjust integration tests that assume church vertical.  
- Retain church API tests only if code remains for CMS fork; otherwise quarantine.

---

## 10. Recommended implementation sequence

| Stage | Work | Destructive? |
|-------|------|--------------|
| **A** | Domain audit (this document) | No |
| **B** | Product boundary definition (this document) | No |
| **C** | Refactoring plan (this document) | No |
| **D1** | UX/nav/copy: CSO FundFlow surface; hide church modules | Low risk |
| **D2** | Demo/seed/mock → Foundation/CSO; update PRODUCT.md brand positioning | Low risk |
| **D3** | API product policy: donors for all FundFlow orgs; church APIs gated off | Medium |
| **D4** | Decouple UI from `member_id` for new gifts; optional data backfill donor from member | Medium |
| **D5** | Soft-deprecate CMS tables (docs + no writes); **no DROP** | Low |
| **E** | Validate fund balances, donation/payment posting, permissions, reports | — |
| **Later** | CMS product extraction / optional table move | High — separate program |

**Wait for approval before D3+ schema or irreversible data changes.** D1–D2 may proceed after explicit go-ahead.

---

## 11. Risks and dependencies

| Risk | Mitigation |
|------|------------|
| Destroying gift history if `church_member` dropped | Never drop until FKs migrated/nulled |
| Treating `collection_session` as church-only and removing it | Keep as financial bulk intake |
| Breaking church pilot tenants (CrossLife) | Migrate org type + givers, or keep read-only legacy mode |
| Over-simplifying accounting | Keep ledger + approvals; only remove non-financial modules |
| Dual giver models confusing CSO users | One model: Donor |
| School vertical left half-live | Explicit park or keep decision |
| Workspace rules still mention church public giving / CrossLife | Update product rules after approval |
| Public hosted giving (parked) | Remains out of scope; still Donation+Payment path |

**Dependencies:** Product approval of module IA; decision on school vertical; decision on collection sessions in CSO UX; CMS ownership of parked tables.

---

## Approval gates

Please approve before implementation:

1. **D1–D2 (UX + demo):** Hide church modules; CSO nav + Foundation demo — recommended first.  
2. **D3 (API gating):** Church APIs off for FundFlow product builds.  
3. **D4 (giver model):** Unify on Donor for new records.  
4. **Any DROP / rename of DB tables:** Explicit second approval after migration design.

**No code or schema destruction has been performed in this task.**
