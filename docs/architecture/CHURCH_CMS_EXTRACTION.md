# Church CMS Extraction

**Status:** Completed permanently in Flyway V21
**Migration:** `V21__remove_church_cms_domain.sql`

Church membership management is no longer part of FundFlow. The application has no Church CMS package, routes, APIs, or feature flag; FundFlow uses donors as its only named giver model.

## Data preservation

Before removing the CMS schema, V21 converts legacy `church_member` rows into donors. Existing donors are matched within the organization by the migration email key; missing email or phone values receive deterministic migration placeholders. Donations that reference a resolvable member are reassigned to that donor.

Donation amounts, funds, payments, collection records, and accounting journals remain intact. Donations with unresolved member links become unattributed rather than receiving an invented giver. Church partnership attribution is cleared because it belongs to the removed CMS domain.

V21 also maps:

- `CHURCH` and `RELIGIOUS_INSTITUTION` organizations to `COMMUNITY_ORGANIZATION`
- `SERVICE_OFFERING` and `DEPARTMENT` collection types to `GENERAL`

## Removed schema

V21 drops the donation columns `member_id`, `partnership_id`, and `partnership_month`, then drops:

- `attendance_record`
- `member_ministry`
- `service_event`
- `church_partnership`
- `ministry`
- `church_member`

## Before applying V21

V21 is intentionally destructive for CMS-only data. If membership, ministry, attendance, service, or partnership history may be needed by an external CMS or for archival obligations, take and verify a database dump before migration. At minimum, archive the tables listed above and the pre-migration donation member/partnership columns.

Apply V21 only after the archive has been stored according to the organization’s retention and access-control policy.
