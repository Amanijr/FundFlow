# Phase 02 — Folder Structure

**Date:** 2026-06-30  
**Base path:** `frontend/src/`

Every top-level directory is defined below with ownership, contents, and import rules.

---

## Target Structure Overview

```text
src/
├── app/                        # Next.js App Router (routing only)
├── components/                 # Shared presentation components
│   ├── ui/                     # shadcn primitives
│   ├── layout/                 # App shell, sidebar, headers
│   ├── shared/                 # Cross-feature reusable components
│   ├── charts/                 # Chart composites
│   └── data-table/             # DataTable + FilterBar
├── features/                   # Business modules (primary organization)
│   ├── authentication/
│   ├── dashboard/
│   ├── donors/
│   ├── campaigns/
│   ├── donations/
│   ├── funds/
│   ├── budgets/
│   ├── expenses/
│   ├── accounting/
│   ├── reports/
│   ├── programs/
│   ├── grants/
│   ├── beneficiaries/
│   ├── church/
│   ├── school/
│   ├── settings/
│   ├── users/
│   └── platform/
├── hooks/                      # Cross-cutting React hooks
├── lib/                        # Infrastructure libraries
├── providers/                  # App-level React providers
├── services/                   # API service layer
├── store/                      # Global Zustand stores
├── styles/                     # Global styles and tokens
├── types/                      # Shared cross-cutting types
└── utils/                      # Pure utility functions
```

---

## `app/` — Routing Layer

**Owner:** Platform / routing  
**Purpose:** Next.js file-based routes, layouts, route groups, loading states  
**May contain:** `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, `globals.css`  
**Must NOT contain:** Business logic, API calls, column definitions, form schemas

### Subdirectories

| Path | URL prefix | Guard |
|------|------------|-------|
| `app/(auth)/` | `/login`, `/register` | GuestGuard |
| `app/(app)/` | All tenant workspace routes | AuthGuard → AppShell |
| `app/(app)/admin/` | `/admin/*` | AdminGuard |
| `app/platform/` | `/platform/*` | PlatformAuthGuard |

### Target page pattern

```tsx
// Maximum 5 lines — delegate to feature
import { DonorsListPage } from "@/features/donors";
export default function Page() {
  return <DonorsListPage />;
}
```

### Current state

73 page files. ~50 are "fat pages" with inline `useQuery`, columns, and filters. Migration extracts these into `features/{domain}/pages/`.

---

## `components/` — Shared Presentation

**Owner:** Design system / platform  
**Purpose:** Reusable UI with no business domain knowledge  
**Rule:** If a component references a specific entity (Donor, Expense, JournalEntry), it belongs in `features/`, not here.

### Subdirectories

| Folder | Purpose | Examples |
|--------|---------|----------|
| `ui/` | shadcn/Radix primitives | Button, Input, Dialog, Table |
| `layout/` | Application chrome | AppShell, Sidebar, PageHeader, Breadcrumbs |
| `shared/` | Generic composites used by 2+ features | FormField, EmptyState, ConfirmDialog, workflow UI |
| `charts/` | Recharts wrappers | ChartContainer, MetricCard, TrendChart |
| `data-table/` | TanStack Table composite | DataTable, FilterBar, column helpers |

### Migration from current `components/`

| Current folder | Target |
|----------------|--------|
| `components/ui/` | `components/ui/` (unchanged) |
| `components/layout/` | `components/layout/` (unchanged) |
| `components/forms/` | `components/shared/forms/` |
| `components/tables/` | `components/data-table/` |
| `components/feedback/` | `components/shared/feedback/` |
| `components/display/` | `components/shared/display/` |
| `components/workflow/` | `components/shared/workflow/` |
| `components/security/` | `features/authentication/components/` |
| `components/auth/` | `features/authentication/components/` |
| `components/{domain}/` | `features/{domain}/components/` |
| `components/providers/` | `providers/` (move out) |

---

## `features/` — Business Modules

**Owner:** Feature team / domain  
**Purpose:** All code for a single business capability  
**Rule:** Features communicate only via public `index.ts` exports

See [MODULE_BOUNDARIES.md](./MODULE_BOUNDARIES.md) for the standard internal structure.

### Feature list

| Feature | Primary routes | API service |
|---------|---------------|-------------|
| `authentication` | `/login`, `/register` | `services/auth.ts` |
| `dashboard` | `/dashboard/*` | `services/analytics.ts` |
| `donors` | `/donors/*` | `services/donors.ts` |
| `campaigns` | `/campaigns/*` | `services/campaigns.ts` |
| `donations` | `/donations/*` | `services/donations.ts` |
| `funds` | `/funds/*` | `services/funds.ts` |
| `budgets` | `/budgets/*` | `services/budgets.ts` |
| `expenses` | `/expenses/*` | `services/expenses.ts` |
| `accounting` | `/accounting/*` | `services/accounting.ts` |
| `reports` | `/reports/*` | `services/reports.ts` |
| `programs` | `/programs/*` | `services/programs.ts` |
| `grants` | `/grants/*` | `services/grants.ts` |
| `beneficiaries` | `/beneficiaries/*` | `services/beneficiaries.ts` |
| `church` | `/church/*` | `services/church.ts` |
| `school` | `/school/*` | `services/school.ts` |
| `settings` | `/admin/settings`, `/admin/setup` | `services/organization.ts` |
| `users` | `/admin/users/*` | `services/users.ts` |
| `platform` | `/platform/dashboard/*` | `services/platform.ts` |

---

## `hooks/` — Cross-Cutting Hooks

**Owner:** Platform  
**Purpose:** Hooks used by multiple features that are not domain-specific  
**Must NOT contain:** Feature-specific data fetching (belongs in `features/{name}/hooks/`)

| Hook (current) | Target | Stays global? |
|----------------|--------|---------------|
| `use-auth.ts` | `hooks/use-auth.ts` | Yes — wraps auth store |
| `use-api-context.ts` | `hooks/use-api-context.ts` | Yes — token + org context |
| `use-navigation.ts` | `hooks/use-navigation.ts` | Yes — sidebar filtering |
| `use-organization.ts` | `features/settings/hooks/` or global | Review during migration |
| `use-analytics.ts` | `features/dashboard/hooks/` | Move to feature |

### Target contents

```
hooks/
├── use-auth.ts
├── use-api-context.ts
├── use-navigation.ts
└── use-media-query.ts          # future shared hooks only
```

---

## `lib/` — Infrastructure Libraries

**Owner:** Platform  
**Purpose:** Non-React infrastructure code  
**Must NOT contain:** React components, API domain modules (moved to `services/`)

```
lib/
├── navigation/
│   ├── navigation.ts           # Sidebar nav config
│   ├── permissions.ts          # RBAC helpers
│   └── command-actions.ts      # Command palette actions
├── mock/
│   ├── config.ts
│   ├── fixtures.ts
│   └── handlers.ts
├── accounting/
│   └── journal-links.ts        # Move to features/accounting/utils/
├── onboarding.ts               # Move to features/settings/utils/
├── dev/
│   └── mock-data.ts
└── utils.ts                    # Move cn() to utils/cn.ts
```

---

## `providers/` — App Providers

**Owner:** Platform  
**Purpose:** Top-level React context providers  
**Current:** `components/providers/app-providers.tsx`  
**Target:** `providers/app-providers.tsx`

```
providers/
├── app-providers.tsx           # ThemeProvider, QueryClient, Toaster
└── query-client.ts             # QueryClient config (extracted)
```

Wired once in `app/layout.tsx`.

---

## `services/` — API Service Layer

**Owner:** Platform (client) + feature teams (domain modules)  
**Purpose:** All HTTP communication with the backend  
**Rule:** Components and pages never call `fetch` directly

```
services/
├── client.ts                   # apiRequest(), ApiError (from lib/api/client.ts)
├── auth.ts
├── organization.ts
├── users.ts
├── donors.ts
├── campaigns.ts
├── donations.ts
├── funds.ts
├── budgets.ts
├── expenses.ts
├── accounting.ts
├── reports.ts
├── analytics.ts
├── programs.ts
├── grants.ts
├── beneficiaries.ts
├── church.ts
├── school.ts
└── platform.ts
```

**Migration:** Rename `lib/api/` → `services/`. Keep `lib/api/` as re-export shim until all imports updated.

---

## `store/` — Global State

**Owner:** Platform  
**Purpose:** Client-side global state (Zustand)  
**Rule:** Server/async state uses TanStack Query — not Zustand

```
store/
├── auth-store.ts               # Session token + user
├── platform-store.ts           # SUPER_ADMIN tenant context
└── sidebar-store.ts            # Sidebar collapsed/mobile
```

**Migration:** Rename `stores/` → `store/`. Store schemas are immutable per phase constraints.

Feature-local UI state (filter panels, wizard steps) lives in `features/{name}/store/` only when needed — prefer React state or URL search params.

---

## `styles/` — Global Styles

**Owner:** Design system  
**Purpose:** CSS tokens, global utilities, animations

```
styles/
├── globals.css                 # Moved from app/globals.css
├── tokens.css                  # CSS variables (optional split)
└── animations.css              # Keyframes (optional split)
```

**Note:** Next.js traditionally keeps `globals.css` in `app/`. Either location works; import from `app/layout.tsx`. Extraction to `styles/` is optional and can happen during visual migration phase.

---

## `types/` — Shared Types

**Owner:** Platform  
**Purpose:** Cross-cutting TypeScript types used by multiple features  
**Rule:** Feature-specific types live in `features/{name}/types/`

```
types/
├── api.ts                      # ApiResponse, Role, OrganizationType, SessionUser
├── navigation.ts               # NavItem, NavGroup
└── workflow.ts                 # Shared workflow enums (if used cross-feature)
```

**Migration:** Domain types (`fundraising.ts`, `finance.ts`, etc.) move into their respective features.

---

## `utils/` — Pure Utilities

**Owner:** Platform  
**Purpose:** Pure functions with no React, no side effects

```
utils/
├── cn.ts                       # clsx + tailwind-merge
├── format.ts                   # Currency, number formatting
├── dates.ts                    # Date formatting helpers
└── csv-export.ts               # CSV download utility
```

**Migration:** Move from `lib/utils/` to `utils/`.

---

## Path Aliases (tsconfig)

```json
{
  "paths": {
    "@/*": ["./src/*"],
    "@/features/*": ["./src/features/*"],
    "@/components/*": ["./src/components/*"],
    "@/services/*": ["./src/services/*"],
    "@/store/*": ["./src/store/*"],
    "@/hooks/*": ["./src/hooks/*"],
    "@/utils/*": ["./src/utils/*"],
    "@/types/*": ["./src/types/*"]
  }
}
```

`@/*` already covers all aliases via `src/`. Explicit aliases are optional documentation.

---

## Directory Decision Tree

```
Is it a Next.js route or layout?
  └─ YES → app/

Is it a shadcn primitive or app chrome?
  └─ YES → components/ui/ or components/layout/

Is it reusable across 2+ business domains?
  └─ YES → components/shared/ or components/data-table/

Is it specific to one business domain?
  └─ YES → features/{domain}/

Is it an HTTP API call?
  └─ YES → services/

Is it global client state (auth, sidebar)?
  └─ YES → store/

Is it a React hook used by 2+ features?
  └─ YES → hooks/

Is it a pure function with no React?
  └─ YES → utils/

Is it infrastructure (mock, navigation config)?
  └─ YES → lib/
```
