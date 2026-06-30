# Phase 02 — Frontend Architecture

**Date:** 2026-06-30  
**Status:** Approved  
**Scope:** Architecture and project structure — no UI implementation, no routing changes, no business logic changes

---

## 1. Purpose

Define the long-term frontend architecture for FundFlow ERP before module implementation and visual migration continue. The goal is a **feature-first, layer-separated** structure that:

- Scales to new ERP modules without restructuring
- Separates business logic from presentation
- Remains independent of the Material template (visual layer is swappable)
- Preserves all existing application behavior during incremental migration

---

## 2. Current State vs Target State

### Current (layer-based)

```
src/
├── app/              ← routes + fat page logic (lists, details)
├── components/       ← shared + domain UI mixed
├── hooks/            ← 5 global hooks only
├── lib/api/          ← 19 API modules
├── stores/           ← 3 global Zustand stores
└── types/            ← 11 global type files
```

**Problem:** Domain code for a single feature (e.g. donors) is scattered across 4–5 directories. List/detail logic lives inline in `app/` pages. No co-located feature ownership.

### Target (feature-first + thin routing)

```
src/
├── app/                    ← Next.js routes only (thin delegates)
├── components/             ← shared presentation (ui, layout, tables, …)
├── features/               ← business modules (primary organization)
├── hooks/                  ← cross-cutting hooks only
├── lib/                    ← infrastructure utilities
├── providers/              ← app-level React providers
├── services/               ← HTTP client + API boundary
├── store/                  ← global Zustand stores
├── styles/                 ← global CSS, tokens
├── types/                  ← shared/cross-cutting types only
└── utils/                  ← pure utility functions
```

**Key rule:** `app/` stays because Next.js App Router requires file-based routes. Pages become **one-line delegates** to feature entry points.

---

## 3. Architectural Principles

| # | Principle | Implementation |
|---|-----------|----------------|
| 1 | Feature-first organization | Business domains live under `features/{name}/` |
| 2 | Reusable shared components | Generic UI in `components/` — never business-specific |
| 3 | UI separated from business logic | Pages/views render; hooks/services fetch and transform |
| 4 | API isolated behind services | All HTTP via `services/` — no `fetch` in components |
| 5 | State isolated behind stores | Global UI/auth in `store/`; server state in React Query; feature-local state in feature |
| 6 | Domain-driven module boundaries | One feature per business capability; explicit public API per feature |

---

## 4. Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│  PRESENTATION LAYER                                          │
│  app/**/page.tsx  ·  components/ui  ·  components/layout   │
│  components/shared  ·  components/charts  ·  components/data-table │
│  Responsibility: render UI, handle user events, no API calls │
├─────────────────────────────────────────────────────────────┤
│  FEATURE LAYER                                               │
│  features/{domain}/components  ·  hooks  ·  pages  ·  schemas │
│  Responsibility: domain UI, feature hooks, validation, types  │
├─────────────────────────────────────────────────────────────┤
│  APPLICATION LAYER                                           │
│  features/{domain}/services  ·  store/  ·  providers/        │
│  hooks/ (cross-cutting)  ·  lib/navigation/                  │
│  Responsibility: orchestration, auth context, navigation     │
├─────────────────────────────────────────────────────────────┤
│  INFRASTRUCTURE LAYER                                        │
│  services/client.ts  ·  lib/mock/  ·  utils/  ·  types/api  │
│  Responsibility: HTTP transport, mock mode, pure utilities   │
└─────────────────────────────────────────────────────────────┘
```

### Layer dependency rules

| Layer | May import from | Must NOT import |
|-------|----------------|-----------------|
| Presentation | Feature (public API), Application, Infrastructure | Other features' internals |
| Feature | Application, Infrastructure, shared `components/` | Other features' internals |
| Application | Infrastructure | Feature components, Presentation |
| Infrastructure | Nothing above | Any React, any feature |

---

## 5. Next.js App Router Integration

Next.js requires routes in `app/`. The feature-first pattern adapts as follows:

```tsx
// app/(app)/donors/page.tsx — THIN ROUTE (target pattern)
import { DonorsListPage } from "@/features/donors";

export default function Page() {
  return <DonorsListPage />;
}
```

| Concern | Owner |
|---------|-------|
| URL structure, layouts, guards | `app/` |
| Page UI, data fetching, mutations | `features/{domain}/` |
| Route groups `(app)`, `(auth)` | `app/` — unchanged |
| `layout.tsx` guards | `app/` — imports guards from `features/authentication` |

**Layouts remain in `app/`** because they are routing concerns. Shell components (`AppShell`) stay in `components/layout/` as shared presentation.

---

## 6. Feature Module Catalog

| Feature | Routes | Current locations to consolidate |
|---------|--------|----------------------------------|
| `authentication` | `/login`, `/register` | `components/auth/`, `lib/api/auth.ts`, `store/auth-store` |
| `dashboard` | `/dashboard/*` | `components/dashboard/`, `hooks/use-analytics.ts`, `lib/api/analytics.ts` |
| `donors` | `/donors/*` | `app/(app)/donors/`, `components/donors/`, `lib/api/donors.ts` |
| `campaigns` | `/campaigns/*` | `components/campaigns/`, `lib/api/campaigns.ts` |
| `donations` | `/donations/*` | `components/donations/`, `lib/api/donations.ts` |
| `funds` | `/funds/*` | `components/funds/`, `lib/api/funds.ts` |
| `budgets` | `/budgets/*` | `components/budgets/`, `lib/api/budgets.ts` |
| `expenses` | `/expenses/*` | `components/expenses/`, `lib/api/expenses.ts` |
| `accounting` | `/accounting/*` | `components/accounting/`, `lib/api/accounting.ts` |
| `reports` | `/reports/*` | `components/reports/`, `lib/api/reports.ts` |
| `programs` | `/programs/*` | `components/programs/`, `lib/api/programs.ts` |
| `grants` | `/grants/*` | `components/grants/`, `lib/api/grants.ts` |
| `beneficiaries` | `/beneficiaries/*` | `components/beneficiaries/`, `lib/api/beneficiaries.ts` |
| `church` | `/church/*` | `components/church/`, `lib/api/church.ts` |
| `school` | `/school/*` | `components/school/`, `lib/api/school.ts` |
| `settings` | `/admin/settings`, `/admin/setup` | `components/admin/`, `lib/api/organization.ts` |
| `users` | `/admin/users/*` | `components/admin/`, `lib/api/users.ts` |
| `platform` | `/platform/*` | `components/platform/`, `lib/api/platform.ts`, `store/platform-store` |

**Shared fundraising types** (`donors`, `campaigns`, `donations`) each get their own feature but may import from `features/fundraising/types` if a shared submodule is needed — prefer duplication over premature abstraction.

---

## 7. Public Feature API Pattern

Each feature exports a barrel `index.ts` with only public entry points:

```ts
// features/donors/index.ts
export { DonorsListPage } from "./pages/donors-list-page";
export { DonorDetailPage } from "./pages/donor-detail-page";
export { DonorCreatePage } from "./pages/donor-create-page";
export { DonorEditPage } from "./pages/donor-edit-page";
// Do NOT export internal hooks, services, or components
```

External code (including `app/` routes) imports **only** from `@/features/{name}`.

---

## 8. Cross-Cutting Concerns

These stay outside features because they span all modules:

| Concern | Location | Notes |
|---------|----------|-------|
| Auth session | `store/auth-store.ts` | Immutable during migration |
| Platform tenant | `store/platform-store.ts` | SUPER_ADMIN only |
| Sidebar UI | `store/sidebar-store.ts` | Layout state |
| Navigation config | `lib/navigation/` | RBAC-filtered sidebar |
| Permissions | `lib/navigation/permissions.ts` | Role checks |
| HTTP client | `services/client.ts` | Moved from `lib/api/client.ts` |
| Mock API | `lib/mock/` | Dev-only infrastructure |
| App providers | `providers/app-providers.tsx` | Theme, Query, Toast |
| UI primitives | `components/ui/` | shadcn components |
| DataTable | `components/data-table/` | Shared table composite |
| Workflow UI | `components/shared/workflow/` | Audit trail, approval — used by multiple features |

---

## 9. Migration Strategy (Incremental)

Architecture migration is **documentation-first, code-incremental**. No big-bang refactor.

| Step | Action | Risk |
|------|--------|------|
| 1 | Create `features/` scaffold with `index.ts` barrels | None |
| 2 | Extract one reference feature (donors) end-to-end | Low |
| 3 | Move `lib/api/` → `services/` with re-export aliases | Low |
| 4 | Move `stores/` → `store/` with re-export aliases | Low |
| 5 | Move `components/providers/` → `providers/` | Low |
| 6 | Migrate remaining features one module at a time | Medium |
| 7 | Delete empty legacy folders when last consumer moves | Low |

**During migration:** re-export from old paths to avoid breaking imports:

```ts
// lib/api/donors.ts (temporary shim)
export * from "@/services/donors";
```

---

## 10. What Does Not Change

| Item | Reason |
|------|--------|
| Backend API contracts | Phase constraint |
| Zustand store schemas | Phase constraint |
| Auth flow and guards behavior | Phase constraint |
| URL paths | Routing constraint |
| `app/` directory | Next.js requirement |
| React Query patterns | Working server-state layer |
| Mock API infrastructure | Dev workflow |

---

## 11. Adding a New Module (Developer Guide)

To add a new ERP module (e.g. `vendors`):

1. Create `features/vendors/` with standard subfolders (see `MODULE_BOUNDARIES.md`)
2. Add `services/vendors.ts` API client
3. Add route stubs in `app/(app)/vendors/`
4. Register nav item in `lib/navigation/navigation.ts`
5. Add permissions in `lib/navigation/permissions.ts`
6. Export public pages from `features/vendors/index.ts`
7. Add types in `features/vendors/types/`

No changes to `components/ui/`, `store/`, or `providers/` required.

---

## 12. Related Documents

| Document | Contents |
|----------|----------|
| [FOLDER_STRUCTURE.md](./FOLDER_STRUCTURE.md) | Every top-level directory defined |
| [MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md) | Ownership rules, feature module standard |
| [CONVENTIONS.md](./CONVENTIONS.md) | Naming, imports, file patterns |
| [CURRENT_TO_TARGET_MAP.md](./CURRENT_TO_TARGET_MAP.md) | File-by-file migration mapping |

---

## 13. Acceptance Criteria

- [x] Folder structure finalized
- [x] Module boundaries documented
- [x] Naming conventions approved
- [x] Import conventions documented
- [x] Layer model defined
- [x] Next.js routing integration defined
- [x] Incremental migration path documented
- [x] No application code modified
