# DECISIONS.md

## ADR-001

Decision:
Use Modular Monolith Architecture

Reason:
Current team size and project maturity do not justify microservices.

Date:
2026-06-24

Status:
Accepted

---

## ADR-002

Decision:
Use PostgreSQL as primary database.

Reason:
Strong relational support and reporting capabilities.

Date:
2026-06-24

Status:
Accepted

---

## ADR-003

Decision:
All financial operations must use double-entry accounting.

Reason:
Supports accountability and financial reporting.

Date:
2026-06-24

Status:
Accepted

---

## ADR-004

Decision:
Use organization-based multi-tenancy.

Reason:
Allows multiple nonprofits to share infrastructure while isolating data.

Date:
2026-06-24

Status:
Accepted

---

## ADR-005

Decision:
Financial records are immutable.

Reason:
Auditability and compliance.

Implementation:
Soft delete only.

Date:
2026-06-24

Status:
Accepted

---

## ADR-006

Decision:
Accounting is a core domain.

Reason:
The platform's primary value is financial accountability, not attendance tracking.

Date:
2026-06-24

Status:
Accepted

---

## ADR-007

Decision:
FundFlow is a hybrid manual-and-automation fundraising system.

Reason:
Many nonprofits (especially churches) receive cash, cheques, and group plate collections alongside card and mobile money. A single electronic-only flow does not match real operations.

Implementation:

* Introduce a payment channel distinction: `MANUAL` vs `GATEWAY`
* `GATEWAY` — card, mobile money, automated bank flows
* `MANUAL` — cash, cheque, and in-person payments recorded by authorized staff
* Both channels use the same `Donation` and `Payment` domain model
* Manual recording requires audit fields: `recordedBy`, `receiptNumber`, `collectionDate`, optional `notes`

Date:
2026-06-24

Status:
Accepted

---

## ADR-008

Decision:
Group physical collections produce one consolidated donation per collection session.

Reason:
A single church offering or department collection is one counted total, not hundreds of individual anonymous donation rows. Consolidation keeps reporting, accounting, and dashboards accurate.

Implementation:

* Introduce a `CollectionSession` entity for group collections
* When a session is verified, the system creates **one** `Donation` linked to that session
* Optional named envelope lines may be added later as a separate enhancement; the default remains one donation per session
* Anonymous group cash is represented with `isAnonymous = true` and no donor

Date:
2026-06-24

Status:
Accepted

---

## ADR-009

Decision:
Use a `CollectionSession` model for church and group physical collections.

Reason:
Plate offerings, event collections, and ministry collections need a batch workflow: count → verify → record.

Implementation:

* `CollectionSession` fields include: `collectionType`, `totalAmount`, `paymentMethod` (or mixed breakdown), `collectedAt`, `location`, `collectedBy`, `verifiedBy`, `status`
* `collectionType` is the **primary reporting dimension** (see ADR-012)
* Session statuses: `DRAFT` → `COUNTED` → `VERIFIED` → (optional) `DEPOSITED`
* Verified session generates one consolidated donation + manual payment record

Date:
2026-06-24

Status:
Accepted

---

## ADR-010

Decision:
Only `FINANCE_MANAGER` (and `ORG_ADMIN`) may record manual payments and verify collection sessions.

Reason:
Cash and group collections require financial accountability. Recording must be restricted to trusted finance roles, not all staff or volunteers.

Implementation:

* Manual payment recording: `@PreAuthorize` for `FINANCE_MANAGER`, `ORG_ADMIN`
* Collection session verification: same roles
* `STAFF` and `FUNDRAISING_MANAGER` may create draft sessions or individual donations but cannot finalize cash verification without finance authority
* All manual actions write to the audit trail (Phase 15)

Date:
2026-06-24

Status:
Accepted

---

## ADR-011

Decision:
Revenue is recognized at collection count (session `VERIFIED`), not at bank deposit.

Reason:
The organization treats the offering as received when it is counted and verified by finance, even if bank deposit happens later.

Implementation:

* Donation status becomes `COMPLETED` when a collection session is `VERIFIED`
* Phase 4 accounting journal entries post at verification: Debit Cash, Credit Donation Revenue
* Bank deposit is a separate future operational step (does not re-recognize revenue)
* Individual manual payments follow the same rule: `COMPLETED` when finance records the payment

Date:
2026-06-24

Status:
Accepted

---

## ADR-012

Decision:
`collectionType` is the primary reporting dimension for group collections.

Reason:
Churches and nonprofits report by collection context (Sunday service offering, event, department, project) more naturally than by campaign alone.

Implementation:

* `CollectionType` enum examples: `SERVICE_OFFERING`, `EVENT`, `DEPARTMENT`, `PROJECT`, `SPECIAL_APPEAL`
* Reports and dashboards group by `collectionType` first
* `campaignId` remains an optional secondary link, not the primary classifier
* Fund allocation (Phase 3/6) may split a verified session across funds as a follow-on enhancement

Date:
2026-06-24

Status:
Accepted

---

## ADR-013

Decision:
Anonymous physical payments use strict privacy rules.

Reason:
Anonymous givers must not appear in donor CRM or public reports.

Implementation:

* `isAnonymous = true` with no `donor_id` for fully anonymous gifts
* Privacy level `FULLY_ANONYMOUS` hides donor identity in all standard reports
* Optional future `INTERNAL` level for staff-only donor linkage (not in initial implementation)
* Group anonymous collections use consolidated anonymous donations per ADR-008

Date:
2026-06-24

Status:
Accepted
