# Phase 02 — Current to Target Mapping

**Date:** 2026-06-30  
**Purpose:** File-by-file guide for incremental migration from layer-based to feature-first architecture.

---

## 1. Top-Level Directory Renames

| Current | Target | Action |
|---------|--------|--------|
| `src/stores/` | `src/store/` | Rename + re-export shim |
| `src/lib/api/` | `src/services/` | Move + re-export shim |
| `src/lib/utils/` | `src/utils/` | Move + re-export shim |
| `src/components/providers/` | `src/providers/` | Move |
| `src/components/tables/` | `src/components/data-table/` | Rename |
| `src/components/forms/` | `src/components/shared/forms/` | Move |
| `src/components/feedback/` | `src/components/shared/feedback/` | Move |
| `src/components/display/` | `src/components/shared/display/` | Move |
| `src/components/workflow/` | `src/components/shared/workflow/` | Move |
| — | `src/features/` | **Create new** |
| — | `src/components/shared/` | **Create new** |

---

## 2. Global Files

| Current path | Target path | Notes |
|--------------|-------------|-------|
| `lib/api/client.ts` | `services/client.ts` | HTTP transport |
| `lib/utils.ts` | `utils/cn.ts` | `cn()` helper |
| `lib/utils/format.ts` | `utils/format.ts` | |
| `lib/utils/dates.ts` | `utils/dates.ts` | |
| `lib/utils/csv-export.ts` | `utils/csv-export.ts` | |
| `lib/navigation/*` | `lib/navigation/*` | Unchanged |
| `lib/mock/*` | `lib/mock/*` | Unchanged |
| `lib/onboarding.ts` | `features/settings/utils/onboarding.ts` | |
| `lib/accounting/journal-links.ts` | `features/accounting/utils/journal-links.ts` | |
| `stores/auth-store.ts` | `store/auth-store.ts` | Schema immutable |
| `stores/platform-store.ts` | `store/platform-store.ts` | Schema immutable |
| `stores/sidebar-store.ts` | `store/sidebar-store.ts` | Schema immutable |
| `components/providers/app-providers.tsx` | `providers/app-providers.tsx` | |
| `app/globals.css` | `app/globals.css` or `styles/globals.css` | Optional move |
| `types/api.ts` | `types/api.ts` | Stays shared |
| `types/navigation.ts` | `types/navigation.ts` | Stays shared |

---

## 3. Hooks Migration

| Current | Target | Action |
|---------|--------|--------|
| `hooks/use-auth.ts` | `hooks/use-auth.ts` | Keep global |
| `hooks/use-api-context.ts` | `hooks/use-api-context.ts` | Keep global |
| `hooks/use-navigation.ts` | `hooks/use-navigation.ts` | Keep global |
| `hooks/use-organization.ts` | `features/settings/hooks/use-organization.ts` | Move to feature |
| `hooks/use-analytics.ts` | `features/dashboard/hooks/use-analytics.ts` | Move to feature |

---

## 4. Types Migration

| Current | Target |
|---------|--------|
| `types/api.ts` | `types/api.ts` (shared) |
| `types/navigation.ts` | `types/navigation.ts` (shared) |
| `types/workflow.ts` | `types/workflow.ts` or `components/shared/workflow/types.ts` |
| `types/fundraising.ts` | Split → `features/donors/types/`, `features/campaigns/types/`, `features/donations/types/` |
| `types/finance.ts` | Split → `features/funds/types/`, `features/budgets/types/`, `features/expenses/types/` |
| `types/accounting.ts` | `features/accounting/types/` |
| `types/reports.ts` | `features/reports/types/` |
| `types/analytics.ts` | `features/dashboard/types/` |
| `types/admin.ts` | `features/users/types/` + `features/settings/types/` |
| `types/platform.ts` | `features/platform/types/` |
| `types/verticals.ts` | Split → `features/church/types/`, `features/school/types/`, `features/beneficiaries/types/` |

---

## 5. Services Migration (`lib/api/` → `services/`)

| Current | Target |
|---------|--------|
| `lib/api/client.ts` | `services/client.ts` |
| `lib/api/auth.ts` | `services/auth.ts` |
| `lib/api/organization.ts` | `services/organization.ts` |
| `lib/api/users.ts` | `services/users.ts` |
| `lib/api/donors.ts` | `services/donors.ts` |
| `lib/api/campaigns.ts` | `services/campaigns.ts` |
| `lib/api/donations.ts` | `services/donations.ts` |
| `lib/api/funds.ts` | `services/funds.ts` |
| `lib/api/budgets.ts` | `services/budgets.ts` |
| `lib/api/expenses.ts` | `services/expenses.ts` |
| `lib/api/accounting.ts` | `services/accounting.ts` |
| `lib/api/reports.ts` | `services/reports.ts` |
| `lib/api/analytics.ts` | `services/analytics.ts` |
| `lib/api/programs.ts` | `services/programs.ts` |
| `lib/api/grants.ts` | `services/grants.ts` |
| `lib/api/beneficiaries.ts` | `services/beneficiaries.ts` |
| `lib/api/church.ts` | `services/church.ts` |
| `lib/api/school.ts` | `services/school.ts` |
| `lib/api/platform.ts` | `services/platform.ts` |

**Shim pattern (temporary):**

```ts
// lib/api/donors.ts — delete after all imports updated
export * from "@/services/donors";
```

---

## 6. Feature Migration — Authentication

| Current | Target |
|---------|--------|
| `components/auth/auth-guard.tsx` | `features/authentication/components/auth-guard.tsx` |
| `components/auth/guest-guard.tsx` | `features/authentication/components/guest-guard.tsx` |
| `components/auth/admin-guard.tsx` | `features/authentication/components/admin-guard.tsx` |
| `components/auth/platform-auth-guard.tsx` | `features/authentication/components/platform-auth-guard.tsx` |
| `components/auth/dashboard-guard.tsx` | `features/authentication/components/dashboard-guard.tsx` |
| `components/auth/login-form.tsx` | `features/authentication/components/login-form.tsx` |
| `components/auth/register-form.tsx` | `features/authentication/components/register-form.tsx` |
| `components/auth/auth-slider.tsx` | `features/authentication/components/auth-slider.tsx` |
| `components/security/permission-gate.tsx` | `features/authentication/components/permission-gate.tsx` |
| `components/security/role-guard.tsx` | `features/authentication/components/role-guard.tsx` |
| `stores/auth-store.ts` | `store/auth-store.ts` (global — not in feature) |
| `hooks/use-auth.ts` | `hooks/use-auth.ts` (global) |
| `lib/api/auth.ts` | `services/auth.ts` |
| `app/(auth)/login/page.tsx` | Thin delegate → `features/authentication/pages/login-page.tsx` |
| `app/(auth)/register/page.tsx` | Thin delegate → `features/authentication/pages/register-page.tsx` |

---

## 7. Feature Migration — Donors (Reference Feature)

First feature to migrate end-to-end as the template for all others.

| Current | Target |
|---------|--------|
| `app/(app)/donors/page.tsx` (fat) | `app/(app)/donors/page.tsx` (thin) → `features/donors/pages/donors-list-page.tsx` |
| `app/(app)/donors/[id]/page.tsx` (fat) | `features/donors/pages/donor-detail-page.tsx` |
| `app/(app)/donors/new/page.tsx` (thin) | `features/donors/pages/donor-create-page.tsx` |
| `app/(app)/donors/[id]/edit/page.tsx` (thin) | `features/donors/pages/donor-edit-page.tsx` |
| `components/donors/donor-form.tsx` | `features/donors/components/donor-form.tsx` |
| `lib/api/donors.ts` | `services/donors.ts` |
| Types from `types/fundraising.ts` | `features/donors/types/donor.ts` |
| Inline `useQuery` in page | `features/donors/hooks/use-donors.ts` |
| Inline column defs in page | `features/donors/components/donors-columns.tsx` |
| Inline `["donors"]` query key | `features/donors/api/query-keys.ts` |

---

## 8. Feature Migration — All Domain Components

| Current `components/{domain}/` | Target `features/{domain}/components/` |
|-------------------------------|----------------------------------------|
| `accounting/` (4 files) | `features/accounting/components/` |
| `admin/` (3 files) | `features/users/components/` + `features/settings/components/` |
| `beneficiaries/` | `features/beneficiaries/components/` |
| `budgets/` | `features/budgets/components/` |
| `campaigns/` | `features/campaigns/components/` |
| `church/` | `features/church/components/` |
| `dashboard/` (4 files) | `features/dashboard/components/` |
| `donations/` | `features/donations/components/` |
| `donors/` | `features/donors/components/` |
| `expenses/` (2 files) | `features/expenses/components/` |
| `funds/` | `features/funds/components/` |
| `grants/` | `features/grants/components/` |
| `platform/` (7 files) | `features/platform/components/` |
| `programs/` | `features/programs/components/` |
| `reports/` (4 files) | `features/reports/components/` |
| `school/` | `features/school/components/` |

### Status badge consolidation

| Current | Target |
|---------|--------|
| `components/finance/finance-status-badge.tsx` | `features/funds/components/` or `components/shared/status-badge.tsx` with props |
| `components/fundraising/fundraising-status-badge.tsx` | Split to respective features |
| `components/verticals/vertical-status-badge.tsx` | Split to `features/church/`, `features/school/` |

---

## 9. Shared Components Migration

| Current | Target |
|---------|--------|
| `components/forms/form-field.tsx` | `components/shared/forms/form-field.tsx` |
| `components/forms/form-section.tsx` | `components/shared/forms/form-section.tsx` |
| `components/forms/date-input.tsx` | `components/shared/forms/date-input.tsx` |
| `components/forms/currency-input.tsx` | `components/shared/forms/currency-input.tsx` |
| `components/forms/entity-selector.tsx` | `components/shared/forms/entity-selector.tsx` |
| `components/forms/file-uploader.tsx` | `components/shared/forms/file-uploader.tsx` |
| `components/tables/data-table.tsx` | `components/data-table/data-table.tsx` |
| `components/tables/filter-bar.tsx` | `components/data-table/filter-bar.tsx` |
| `components/feedback/*` (7 files) | `components/shared/feedback/*` |
| `components/display/*` (4 files) | `components/shared/display/*` |
| `components/workflow/*` (5 files) | `components/shared/workflow/*` |
| `components/charts/*` (4 files) | `components/charts/*` (unchanged) |
| `components/navigation/command-palette.tsx` | `components/shared/navigation/command-palette.tsx` |
| `components/dev/mock-mode-banner.tsx` | `components/shared/dev/mock-mode-banner.tsx` |
| `components/ui/*` (14 files) | `components/ui/*` (unchanged) |
| `components/layout/*` (9 files) | `components/layout/*` (unchanged) |

---

## 10. Page Migration Priority

Migrate fat pages to feature pages in this order:

| Priority | Feature | Fat pages | Reason |
|----------|---------|-----------|--------|
| P0 | `donors` | 2 (list + detail) | Reference implementation |
| P1 | `expenses` | 2 | Workflow complexity |
| P1 | `campaigns` | 2 | High traffic |
| P2 | `funds`, `budgets`, `donations` | 2 each | Finance core |
| P2 | `accounting` | 4 | Sub-nav module |
| P2 | `reports` | 5 | Sub-nav module |
| P3 | `programs`, `grants`, `beneficiaries` | 2 each | Programs |
| P3 | `church`, `school` | 2–3 each | Verticals |
| P3 | `users`, `settings` | 3 | Admin |
| P4 | `platform` | 5 | Super-admin |
| Done | `dashboard` | 0 (already thin) | Views extracted |
| Done | `authentication` | 0 (thin) | Forms extracted |
| Done | `*/new`, `*/edit` | 0 (thin) | Forms extracted |

**Total fat pages to extract:** ~35

---

## 11. Migration Checklist Per Feature

When migrating a feature, complete all steps:

- [ ] Create `features/{name}/` folder structure
- [ ] Move components from `components/{name}/`
- [ ] Move types from `types/` to `features/{name}/types/`
- [ ] Create `features/{name}/api/query-keys.ts`
- [ ] Create hooks wrapping `services/{name}.ts`
- [ ] Extract page logic into `features/{name}/pages/`
- [ ] Create `features/{name}/schemas/` if forms exist
- [ ] Create `features/{name}/index.ts` barrel
- [ ] Update `app/` routes to thin delegates
- [ ] Verify all imports use new paths
- [ ] Remove empty `components/{name}/` folder
- [ ] Run `npm run build` — zero errors

---

## 12. What Stays Untouched During Migration

| Item | Reason |
|------|--------|
| `app/` URL structure | Routing constraint |
| `lib/navigation/navigation.ts` | Central registry — update entries only |
| `lib/navigation/permissions.ts` | RBAC matrix — immutable logic |
| `lib/mock/handlers.ts` | Mock infra — update paths only |
| `store/*` schemas | Phase constraint |
| `services/*.ts` function signatures | API contract constraint |
| Backend | Out of scope |
