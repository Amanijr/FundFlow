# TASK 02 — Backend Church CMS Extraction

**Status:** Completed — permanent removal
**Reference:** [Church CMS Extraction](./CHURCH_CMS_EXTRACTION.md), [TASK 00](./TASK_00_PRODUCT_SCOPE_REDEFINITION.md), [TASK 01](./TASK_01_BACKEND_DATABASE_AUDIT.md)
**Date:** 2026-11-06

---

## Outcome

Church CMS is no longer a FundFlow module. Its Java package, APIs, frontend routes, module configuration, and database domain have been removed. This is a permanent product boundary, not a feature flag or dormant module.

FundFlow now uses **Donor** as the only named giver model. Donations no longer accept or retain member or church-partnership attribution.

## Application extraction

- Deleted the backend `church` Java package and its member, ministry, service, attendance, partnership, and church-report APIs.
- Removed `FundFlowModuleProperties`, the `church-enabled` configuration, and church-specific access gates.
- Removed frontend church and member routes and navigation.
- Retained the financial domains: organizations, donors, donations, payments, campaigns, pledges, recurring donations, collections, funds, expenses, budgets, accounting, programs, grants, reporting, audit, and governance.
- Kept neutral nonprofit chart-of-accounts behavior and non-church development seed data.

There is no supported configuration that restores Church CMS inside FundFlow. A future CMS would be a separate product and integration.

## Database extraction: Flyway V21

`V21__remove_church_cms_domain.sql` completes the schema and data migration:

1. Maps `CHURCH` and `RELIGIOUS_INSTITUTION` organizations to `COMMUNITY_ORGANIZATION`.
2. Creates donor records from legacy `church_member` records, using deterministic placeholder email or phone values when required.
3. Rewires donations with a resolvable member to the corresponding donor and clears all remaining member pointers.
4. Clears church partnership attribution while preserving donation amounts, funds, payments, and journals.
5. Drops `donation.member_id`, `donation.partnership_id`, and `donation.partnership_month`.
6. Drops the CMS tables: `attendance_record`, `member_ministry`, `service_event`, `church_partnership`, `ministry`, and `church_member`.
7. Maps historical collection types `SERVICE_OFFERING` and `DEPARTMENT` to `GENERAL`.

See [CHURCH_CMS_EXTRACTION.md](./CHURCH_CMS_EXTRACTION.md) for the operator archive recommendation and preservation details.

## Financial integrity

The extraction does not change the donation/payment lifecycle, accounting journals, or fund-balance rule:

```text
opening + transfers in + COMPLETED fund donations
− transfers out − PAID/RECONCILED expenses
```

V21 preserves donation amounts, donor-resolvable giver history, payment records, fund assignments, collection records, and accounting entries. Church CMS records and partnership attribution are intentionally outside the retained FundFlow domain.

## Superseded approach

The earlier quarantine approach—keeping Church CMS behind `fundflow.modules.church-enabled` and parking its tables—was transitional and is superseded by this completed extraction and V21. Do not reintroduce the flag or describe Church CMS as an optional FundFlow module.
