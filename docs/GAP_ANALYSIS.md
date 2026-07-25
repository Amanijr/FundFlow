# Gap Analysis Report

**Product:** FundFlow ERP  
**Scope:** Donation / Donor / Payment domain vs. PRD  
**Date:** June 24, 2026  
**Codebase version:** `0.0.1-SNAPSHOT`

---

## Executive Summary

The current codebase provides a **minimal donation-management skeleton**: three JPA entities (`Donor`, `Donation`, `Payment`), basic DTOs, one partial service (`DonationServiceImpl`), and incomplete payment processing. It aligns with the PRD's direction to **reuse existing entities and evolve incrementally**, but falls significantly short of PRD requirements for Donor CRM (Module 3), Donation Management (Module 4), and the cross-cutting foundations (multi-tenancy, security, accounting, audit) that those modules depend on.

| Area | PRD Alignment | Gap Severity |
|------|---------------|--------------|
| Donor CRM (Module 3) | ~15% | High |
| Donation Management (Module 4) | ~25% | High |
| Payment Processing | ~10% | Critical |
| Multi-Tenancy (`organization_id`) | 0% | Critical |
| Accounting Integration (Module 9) | 0% | Critical |
| Audit & Compliance (Module 15) | 0% | High |
| API / Security / NFRs | ~5% | Critical |

**Bottom line:** The domain model is a usable starting point for one-time cash/card donations with basic donor profiles, but the application is not runnable end-to-end (no REST layer, broken payment service, likely compile issues) and lacks nearly all ERP-grade capabilities defined in the PRD.

---

## Methodology

This report compares:

1. **PRD requirements** — Modules 3 (Donor CRM), 4 (Donation Management), payment methods, KPIs, multi-tenancy, accounting hooks, and non-functional requirements affecting these domains.
2. **Current implementation** — Entities, DTOs, repositories, services under `src/main/java/com/project/daisyDonation/`.

Status labels used throughout:

| Status | Meaning |
|--------|---------|
| **Implemented** | Present and functional |
| **Partial** | Present but incomplete or non-functional |
| **Missing** | Not in codebase |
| **Non-compliant** | Present but conflicts with PRD |

---

## Current State Inventory

### Entities

| Entity | Fields / Relationships | Notes |
|--------|------------------------|-------|
| `Donor` | `firstName`, `lastName`, `email`, `phone`, `address`, `city`, `state`, `country`; `OneToMany` → `Donation` | Basic profile only |
| `Donation` | `amount`, `donationTime`, `status` (`DonationStatus` enum); `ManyToOne` → `Donor` | One-time donation shape |
| `Payment` | `paymentMethod` (String), `transactionId`, `successful`, `processedAt`; `OneToOne` → `Donation` | Unfinished integration |
| `Abstract` | `id` only | No audit, soft-delete, or tenant fields |

### Services & Repositories

| Component | Status |
|-----------|--------|
| `DonationService` / `DonationServiceImpl` | Partial — `createDonation()` only; sets `PENDING` status and timestamp |
| `PaymentService` (interface) | Partial — declares `createpPayment()` (typo) |
| `PaymentService` (impl class) | **Broken** — incomplete method, undefined `paymentGateway`, no `@Service`, naming collision with interface |
| `DonationRepository` | Partial — `findByStatus`, `findbyDonorId` (invalid Spring Data naming) |
| `PaymentRepository` | Stub — extends `JpaRepository`, no custom queries |
| `DonorRepository` | **Missing** |
| `DonorService` | **Missing** |
| REST Controllers | **Missing** |

### DTOs

| DTO | Status |
|-----|--------|
| `DonorDto` | Partial — leaks `List<Donation>` entity references |
| `DonationDto` | Partial — create shape only, no response mapping |
| `PaymentDto` | Partial — mirrors entity, no validation |
| `DonationResponse` | Partial — success wrapper only |

### Infrastructure (PRD-relevant)

| Requirement | Current |
|-------------|---------|
| Database | MySQL connector in `pom.xml` (PRD specifies PostgreSQL) |
| Migrations | None (PRD requires Flyway) |
| Security | None (PRD requires Spring Security + JWT) |
| DTO mapping | Manual / none (PRD specifies MapStruct) |
| Caching | None (PRD specifies Redis) |

---

## Module 3: Donor CRM — Gap Analysis

### PRD Requirements vs. Current State

| PRD Requirement | Status | Gap Detail |
|-----------------|--------|------------|
| Donor profiles | **Partial** | Entity has name, contact, location fields. No service, repository, or API to manage profiles. |
| Donation history | **Partial** | `Donor.donations` relationship exists. No query service, no history endpoint, no pagination/filtering. |
| Donor segmentation | **Missing** | No tags, tiers, categories, or segment model. |
| Donor lifecycle tracking | **Missing** | No lifecycle stage (prospect, active, lapsed, etc.). |
| Communication logs | **Missing** | No communication entity or integration with Communication Center (Module 14). |
| KPI: Lifetime Value | **Missing** | No aggregation queries or reporting. |
| KPI: Retention Rate | **Missing** | No time-series donor activity tracking. |
| KPI: Average Donation | **Missing** | No analytics layer. |
| KPI: Donation Frequency | **Missing** | No recurring-donation or frequency model. |
| `organization_id` on Donor | **Missing** | Donor is global; email/phone uniqueness is platform-wide, not per-tenant. |
| Reuse existing Donor entity | **Implemented** | Entity exists and can be extended per PRD constraint. |

### Donor-Specific Risks

1. **Global uniqueness constraints** — `@Column(unique = true)` on `email` and `phone` will break in a multi-tenant system where two organizations may share donor contact patterns. Should be unique per `organization_id`.
2. **DTO leaks persistence model** — `DonorDto` exposes `List<Donation>` entities, violating layering and making API contracts unstable.
3. **No donor CRUD path** — Cannot register, update, or deactivate donors through any service or API.

---

## Module 4: Donation Management — Gap Analysis

### PRD Requirements vs. Current State

| PRD Requirement | Status | Gap Detail |
|-----------------|--------|------------|
| One-time donations | **Partial** | Entity and `createDonation()` support basic flow; no API, no payment completion path. |
| Recurring donations | **Missing** | No schedule, frequency, or subscription model. |
| Pledges | **Missing** | No pledge entity, fulfillment tracking, or partial-payment support. |
| Anonymous donations | **Missing** | `donor_id` is `nullable = false`; no anonymous flag or nullable donor pattern. |
| In-kind donations | **Missing** | `amount` is monetary only; no item description, fair-market value, or goods tracking. |
| Payment: Cash | **Partial** | `paymentMethod` is a free-text `String`; no enum or validation. |
| Payment: Bank Transfer | **Partial** | Same as above. |
| Payment: Mobile Money | **Partial** | Same as above. |
| Payment: Card | **Partial** | Same as above; no gateway integration. |
| Payment: Cheque | **Partial** | Same as above. |
| KPI: Total Donations | **Missing** | No reporting queries. |
| KPI: Donation Growth | **Missing** | No period-over-period analytics. |
| KPI: Donation Sources | **Missing** | No source/channel field on donation. |
| KPI: Campaign Contribution | **Missing** | No `Campaign` entity or foreign key. |
| `organization_id` on Donation | **Missing** | No tenant scoping. |
| Link to Campaign (Module 5) | **Missing** | No campaign relationship. |
| Link to Fund (Module 6) | **Missing** | No fund allocation on donation. |
| Reuse existing Donation entity | **Implemented** | Entity exists; `DonationStatus` enum is a good foundation. |
| Preserve existing donation functionality | **At risk** | Only `createDonation()` exists; payment flow is broken; no backward-compatible API. |

### Donation Status Enum — Positive Finding

`DonationStatus` (`PENDING`, `COMPLETED`, `FAILED`, `CANCELLED`, `REFUNDED`) aligns well with PRD payment lifecycle needs and should be retained and extended (e.g., `PLEDGED`, `PARTIALLY_PAID` for pledge support).

---

## Payment Processing — Gap Analysis

| PRD / Expected Behavior | Status | Gap Detail |
|---------------------------|--------|------------|
| Payment linked to donation | **Partial** | `OneToOne` relationship defined; never persisted in working code. |
| Payment method enumeration | **Non-compliant** | PRD lists five methods; code uses unconstrained `String`. |
| Payment success → donation status update | **Missing** | `processPayment()` does not update `Donation.status`. |
| Transaction ID tracking | **Partial** | Field exists; never populated. |
| Processed timestamp | **Partial** | Field exists; `DonationServiceImpl` sets time on donation, not payment. |
| Payment gateway integration | **Missing** | Reference to undefined `paymentGateway` in incomplete impl. |
| Accounting entry on payment (Module 9) | **Missing** | No `JournalEntry` creation on successful payment. |
| Idempotent payment processing | **Missing** | No duplicate-transaction guards. |
| Refund handling | **Missing** | `REFUNDED` status exists but no refund service or payment reversal. |

### Critical Code Issues

1. **Class naming collision** — `service.PaymentService` (interface) and `service.Impl.PaymentService` (class) share the same name; impl is not annotated `@Service` and does not implement the interface.
2. **Incomplete method** — `processPayment()` has no return statement, no save call, and references an undefined gateway.
3. **Repository query bug** — `findbyDonorId` should be `findByDonorId` for Spring Data JPA convention.

---

## Cross-Cutting Gaps (Affecting Donor / Donation / Payment)

### Multi-Tenancy (PRD § Multi-Tenancy)

| Requirement | Status |
|-------------|--------|
| `organization_id` on Donor | Missing |
| `organization_id` on Donation | Missing |
| `organization_id` on Payment | Missing |
| Data isolation | Not possible without tenant key |
| Organization entity | Missing |

**Impact:** Every donation/donor/payment record is implicitly global. This blocks SaaS deployment and violates a mandatory PRD requirement.

### Accounting Integration (PRD Module 9)

| Requirement | Status |
|-------------|--------|
| Auto journal entry on donation received | Missing |
| Debit Cash / Credit Donation Revenue | Missing |
| `JournalEntry`, `JournalLine`, `ChartOfAccount` | Missing |
| Payment → accounting link (per ERD) | Missing |

**Impact:** Donations cannot flow into financial reporting, trial balance, or statements of activities as required by the PRD.

### Audit & Compliance (PRD Module 15)

| Requirement | Status |
|-------------|--------|
| Full audit trail | Missing |
| Immutable financial history | Missing — JPA allows hard deletes |
| Activity logs / change tracking | Missing |
| Soft deletes | Missing — `Abstract` has no `deletedAt` / `isDeleted` |
| `createdAt` / `updatedAt` / `createdBy` | Missing on base entity |

### Security & API (PRD Modules 2, NFRs)

| Requirement | Status |
|-------------|--------|
| REST API (API-first) | Missing — no controllers |
| JWT authentication | Missing |
| RBAC (roles like `FUNDRAISING_MANAGER`, `DONOR`) | Missing |
| Input validation | Missing — no `@Valid`, no Bean Validation on DTOs |
| Tenant-scoped authorization | Missing |

### Technology Stack Alignment

| PRD Stack Item | Current | Gap |
|----------------|---------|-----|
| PostgreSQL | MySQL | Database mismatch |
| Flyway | None | No versioned schema |
| Spring Security | None | No auth |
| MapStruct | None | No structured DTO mapping |
| Redis | None | No caching layer |
| Docker / Compose | None | No deployment config |

---

## Entity Model Comparison (Current vs. PRD Target)

```
CURRENT                          PRD TARGET (Donor/Donation/Payment scope)
───────                          ─────────────────────────────────────────

Donor                            Organization
  │                                │
  └── Donation                     ├── Donor (+ organization_id)
         │                         │     │
         └── Payment                │     └── Donation (+ organization_id,
                                                      campaign_id, fund_id,
                                                      type, is_anonymous)
                                    │           │
                                    │           └── Payment (+ organization_id)
                                    │                     │
                                    └── Campaign            └── JournalEntry
```

### Recommended Field Additions (incremental, per PRD constraints)

**Donor** (extend, do not replace):
- `organizationId` (FK)
- `lifecycleStage`, `segment`, `tags`
- `isAnonymousCapable` or handle anonymity at donation level
- Audit fields via enhanced `Abstract`

**Donation** (extend):
- `organizationId`, `campaignId`, `fundId`
- `donationType` enum: `ONE_TIME`, `RECURRING`, `PLEDGE`, `IN_KIND`
- `isAnonymous`, `source`, `notes`
- `pledgeId` / `recurringScheduleId` (when those modules are added)
- In-kind fields: `itemDescription`, `estimatedValue`

**Payment** (extend):
- `organizationId`
- `paymentMethod` enum: `CASH`, `BANK_TRANSFER`, `MOBILE_MONEY`, `CARD`, `CHEQUE`
- `status` enum separate from donation status
- `externalReference`, `failureReason`
- Link to `JournalEntry`

---

## PRD Constraint Compliance

| PRD Constraint | Assessment |
|----------------|------------|
| Reuse existing entities | **Compliant** — entities are minimal but reusable |
| Refactor incrementally | **Opportunity** — no migrations yet; good time to add columns via Flyway |
| Avoid duplicate domain models | **Compliant** — single entity per concept |
| Maintain backward compatibility | **At risk** — no API contract exists yet; schema changes should be additive |
| Use database migrations | **Non-compliant** — no Flyway; relying on Hibernate auto-DDL risk |
| Preserve existing donation functionality | **At risk** — `createDonation()` works in isolation; payment path is broken |

---

## Gap Priority Matrix

### P0 — Blockers (must fix before any production use)

1. Fix `PaymentService` implementation (naming, completion, donation status sync).
2. Add `DonorRepository` and basic donor CRUD service.
3. Add REST controllers for donor, donation, and payment endpoints.
4. Introduce `organization_id` on Donor, Donation, Payment.
5. Add Flyway migrations for schema versioning.
6. Fix `DonationRepository.findByDonorId` naming.

### P1 — Core PRD donation module features

1. Payment method enum and validation.
2. Anonymous donation support.
3. Campaign and Fund foreign keys on Donation.
4. Donation type enum (one-time, recurring, pledge, in-kind).
5. Payment → `DonationStatus.COMPLETED` workflow.
6. MapStruct mappers; remove entity references from DTOs.

### P2 — CRM and analytics

1. Donor segmentation and lifecycle.
2. Donation history API with filters.
3. KPI query services (LTV, retention, average, frequency).
4. Communication log integration.

### P3 — ERP integration

1. Auto journal entries on completed payments.
2. Audit fields, soft deletes, activity logging.
3. Spring Security + JWT + tenant-scoped RBAC.
4. Recurring donations and pledge fulfillment.
5. Dashboard data feeds (Fundraising Dashboard KPIs).

---

## Summary Scorecard

| Category | Implemented | Partial | Missing | Score |
|----------|-------------|---------|---------|-------|
| Donor CRM features | 1 | 2 | 7 | 15% |
| Donation types & methods | 0 | 6 | 4 | 25% |
| Payment processing | 0 | 3 | 7 | 10% |
| Data model foundations | 2 | 1 | 5 | 20% |
| Services & repositories | 1 | 3 | 3 | 30% |
| API layer | 0 | 0 | 1 | 0% |
| Multi-tenancy | 0 | 0 | 1 | 0% |
| Accounting hooks | 0 | 0 | 1 | 0% |
| Audit / compliance | 0 | 0 | 1 | 0% |
| Security | 0 | 0 | 1 | 0% |

**Overall Donor/Donation/Payment readiness vs. PRD: ~18%**

---

## Recommended Next Steps

1. **Stabilize the foundation** — Fix compile/runtime issues in payment service; add repositories, controllers, and Flyway baseline migration from current entities.
2. **Add tenant scoping** — Introduce `Organization` entity and `organization_id` on all three domain tables before building new features.
3. **Complete the donation happy path** — Create donor → create donation → process payment → mark `COMPLETED` → return `DonationResponse`.
4. **Harden the domain model** — Replace free-text `paymentMethod` with enum; add `donationType`; support anonymous donations.
5. **Plan accounting hook** — Define `JournalEntry` creation contract now (even as a no-op event) so donation completion does not require a later breaking refactor.
6. **Produce follow-on deliverables** (per PRD § Deliverables) — Database evolution strategy, module dependency map, phased roadmap, ERD updates, and migration plan before broad feature implementation.

---

## Appendix: File Reference

| File | Role |
|------|------|
| `Entity/Donor.java` | Donor profile persistence |
| `Entity/Donation.java` | Donation persistence |
| `Entity/Payment.java` | Payment persistence |
| `Entity/Abstract/Abstract.java` | Shared ID base (needs audit/tenant extension) |
| `Entity/Abstract/DonationStatus.java` | Donation lifecycle states |
| `Dto/DonorDto.java` | Donor API shape (needs cleanup) |
| `Dto/DonationDto.java` | Donation create shape |
| `Dto/PaymentDto.java` | Payment shape |
| `Dto/DonationResponse.java` | Operation result wrapper |
| `service/DonationService.java` | Donation service contract |
| `service/Impl/DonationServiceImpl.java` | Donation creation logic |
| `service/PaymentService.java` | Payment interface (typo in method name) |
| `service/Impl/PaymentService.java` | Incomplete payment impl |
| `repository/DonationRepository.java` | Donation queries |
| `repository/PaymentRepository.java` | Payment persistence |

---

*This document should be reviewed alongside `docs/PRD.md`, `docs/ERD.md`, and `docs/MODULES.md` before implementation planning begins.*
