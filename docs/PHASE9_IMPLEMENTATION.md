# Phase 9 Implementation — Organization-Specific Modules

**Status:** Historical implementation record — Church portions superseded by permanent removal and Flyway V21

> The church endpoints, entities, and organization-type gates described below no longer exist. This phase record is retained for audit history; see [Church CMS Extraction](./architecture/CHURCH_CMS_EXTRACTION.md) for current state.

## Objectives Delivered

| Vertical | Features | Status |
|----------|----------|--------|
| NGO | Beneficiaries, Impact tracking | Done |
| School | Student beneficiaries, Sponsorships | Done |

Church ministries/attendance/partnerships were delivered in this phase historically and later **removed** from FundFlow (see extraction doc). Pledges remain in the shared `pledge/` financial module.

## Vertical Access Control

`VerticalAccess` guards features by `OrganizationType`:

| Feature | Allowed types |
|---------|---------------|
| NGO modules | `NGO`, `FOUNDATION`, `CHARITY`, `COMMUNITY_ORGANIZATION` |
| School modules | `SCHOOL` |
| Student beneficiaries | `SCHOOL` (type `STUDENT` only) |

## NGO — `/api/v1/beneficiaries`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Register beneficiary |
| GET | `/` | List beneficiaries |
| GET | `/dashboard` | Beneficiary and impact counts |
| POST | `/impact` | Record impact outcome |
| GET | `/impact` | List all impact records |
| GET | `/{id}/impact` | Impact records for beneficiary |

## School — `/api/v1/school/sponsorships`

| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create student sponsorship (links donor + student beneficiary) |
| GET | `/` | List sponsorships |
| GET | `/{id}` | Sponsorship detail |

Student beneficiaries are created via `/api/v1/beneficiaries` with `beneficiaryType: STUDENT`.

## Migration

`V9__organization_modules.sql`

## Next: Phase 10 — Advanced Analytics

Forecasting, trend analysis, and executive intelligence dashboards.
