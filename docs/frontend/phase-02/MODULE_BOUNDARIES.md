# Phase 02 — Module Boundaries & Ownership

**Date:** 2026-06-30

---

## 1. Feature Module Standard

Every feature under `features/{name}/` follows this structure:

```text
features/{name}/
├── index.ts                 # Public API barrel — only export pages and stable hooks
├── api/                     # Optional: query key factories (not HTTP — that's services/)
├── components/              # Domain-specific UI components
├── hooks/                   # Feature data hooks (useQuery/useMutation wrappers)
├── pages/                   # Page-level components (imported by app/ routes)
├── schemas/                 # Zod validation schemas
├── services/                # Optional: feature-specific service composition
├── store/                   # Optional: feature-local Zustand (rare — prefer React Query)
├── types/                   # Feature TypeScript types
└── utils/                   # Feature-specific pure helpers
```

### Required subfolders (minimum viable feature)

| Subfolder | Required? | Contents |
|-----------|-----------|----------|
| `index.ts` | **Yes** | Public exports only |
| `pages/` | **Yes** | At least one page component |
| `components/` | If UI > 1 file | Forms, lists, panels |
| `hooks/` | If data fetching | Query/mutation hooks |
| `schemas/` | If forms | Zod schemas |
| `types/` | If types exist | Domain interfaces |
| `api/` | Optional | Query key factories |
| `services/` | Optional | Re-exports or compositions of global services |
| `store/` | Rare | Only for complex client-only wizard state |
| `utils/` | Optional | Domain formatters, link builders |

---

## 2. Example — `features/donors/`

```text
features/donors/
├── index.ts
├── components/
│   ├── donor-form.tsx
│   ├── donors-columns.tsx
│   └── donor-status-badge.tsx
├── hooks/
│   ├── use-donors.ts
│   ├── use-donor.ts
│   └── use-donor-mutations.ts
├── pages/
│   ├── donors-list-page.tsx
│   ├── donor-detail-page.tsx
│   ├── donor-create-page.tsx
│   └── donor-edit-page.tsx
├── schemas/
│   └── donor-schema.ts
├── types/
│   └── donor.ts
└── api/
    └── query-keys.ts
```

### `index.ts` (public API)

```ts
export { DonorsListPage } from "./pages/donors-list-page";
export { DonorDetailPage } from "./pages/donor-detail-page";
export { DonorCreatePage } from "./pages/donor-create-page";
export { DonorEditPage } from "./pages/donor-edit-page";
```

### `api/query-keys.ts`

```ts
export const donorKeys = {
  all: ["donors"] as const,
  lists: () => [...donorKeys.all, "list"] as const,
  list: (filters: DonorFilters) => [...donorKeys.lists(), filters] as const,
  details: () => [...donorKeys.all, "detail"] as const,
  detail: (id: string) => [...donorKeys.details(), id] as const,
};
```

### `hooks/use-donors.ts`

```ts
export function useDonors(filters: DonorFilters) {
  const { token } = useApiContext();
  return useQuery({
    queryKey: donorKeys.list(filters),
    queryFn: () => listDonors(token, filters),
    enabled: Boolean(token),
  });
}
```

---

## 3. Ownership Rules

### Rule 1 — Shared components live in `components/shared/`

**Belongs in shared:**
- FormField, DateInput, CurrencyInput (generic form building blocks)
- EmptyState, DetailCard, EntityHeader (generic display)
- DataTable, FilterBar (generic table infrastructure)
- LoadingState, ErrorAlert, PageSkeleton (generic feedback)
- AuditTrail, ApprovalWorkflow (generic workflow UI)

**Does NOT belong in shared:**
- DonorForm, ExpenseWorkflowPanel, ChartOfAccountForm
- FinanceStatusBadge (domain-specific status mapping)
- AccountingNav, ReportsNav (domain sub-navigation)

### Rule 2 — Business components stay inside their feature

| Component | Owner |
|-----------|-------|
| `DonorForm` | `features/donors/components/` |
| `ExpenseWorkflowPanel` | `features/expenses/components/` |
| `ExecutiveDashboardView` | `features/dashboard/components/` |
| `LoginForm` | `features/authentication/components/` |
| `TenantSwitcher` | `features/platform/components/` |

### Rule 3 — API clients belong in `services/`

| Layer | Location | Example |
|-------|----------|---------|
| HTTP transport | `services/client.ts` | `apiRequest()`, `ApiError` |
| Domain API | `services/{domain}.ts` | `listDonors()`, `createDonor()` |
| Query hooks | `features/{domain}/hooks/` | `useDonors()` wraps service + React Query |
| Query keys | `features/{domain}/api/` | `donorKeys.list()` |

**Pages and components never import `services/client.ts` directly** — they use feature hooks.

### Rule 4 — Feature state stays inside the feature when possible

| State type | Location |
|------------|----------|
| Server data (lists, details) | TanStack Query via feature hooks |
| Auth session | `store/auth-store.ts` (global — immutable) |
| Sidebar collapsed | `store/sidebar-store.ts` (global) |
| SUPER_ADMIN tenant | `store/platform-store.ts` (global) |
| Form draft / wizard step | Feature component state or `features/{name}/store/` |
| URL-driven filters | `useSearchParams()` in feature page |

### Rule 5 — Types are owned by their feature

| Type | Owner |
|------|-------|
| `Donor`, `CreateDonorRequest` | `features/donors/types/` |
| `Expense`, `ExpenseStatus` | `features/expenses/types/` |
| `Role`, `ApiResponse<T>`, `SessionUser` | `types/api.ts` (shared) |
| `NavItem`, `NavGroup` | `types/navigation.ts` (shared) |

### Rule 6 — Guards and permissions

| Item | Owner |
|------|-------|
| `AuthGuard`, `GuestGuard`, `LoginForm` | `features/authentication/` |
| `AdminGuard`, `DashboardGuard` | `features/authentication/components/` |
| `PermissionGate`, `RoleGuard` | `features/authentication/components/` |
| `permissions.ts`, `getDefaultDashboardPath()` | `lib/navigation/` (cross-cutting) |

### Rule 7 — Navigation config is platform-owned

`lib/navigation/navigation.ts` remains a central registry. Features do not own route metadata directly — they register via the navigation config. This avoids circular imports between features.

### Rule 8 — No cross-feature internal imports

```ts
// FORBIDDEN
import { useDonors } from "@/features/donors/hooks/use-donors";
import { DonorForm } from "@/features/donors/components/donor-form";

// ALLOWED
import { DonorsListPage } from "@/features/donors";
import type { Donor } from "@/features/donors";  // only if exported from index.ts
```

If two features need shared logic, extract to `components/shared/`, `utils/`, or `types/` — not cross-feature imports.

---

## 4. Boundary Matrix

| Artifact | Shared (`components/`, `hooks/`, `utils/`) | Feature (`features/`) | Platform (`lib/`, `store/`, `providers/`) |
|----------|-------------------------------------------|----------------------|-------------------------------------------|
| Button, Input, Dialog | `components/ui/` | — | — |
| DataTable | `components/data-table/` | — | — |
| DonorForm | — | `features/donors/` | — |
| listDonors() | — | — | `services/donors.ts` |
| useDonors() | — | `features/donors/hooks/` | — |
| donorKeys | — | `features/donors/api/` | — |
| AuthGuard | — | `features/authentication/` | — |
| permissions.ts | — | — | `lib/navigation/` |
| auth-store | — | — | `store/auth-store.ts` |
| ApiResponse<T> | — | — | `types/api.ts` |
| cn() | — | — | `utils/cn.ts` |

---

## 5. Presentation vs Business Logic Separation

### Presentation (what the user sees)

- JSX layout and styling
- Event handlers that call feature hooks
- Conditional rendering based on hook data
- `components/ui/` primitives

### Business logic (what the app does)

- API call orchestration (`services/`)
- Data transformation and validation (`schemas/`, `utils/`)
- Query/mutation lifecycle (`hooks/`)
- Permission checks (`lib/navigation/permissions.ts`)
- Workflow state machines (`features/expenses/components/expense-workflow-panel.tsx`)

### Anti-patterns to eliminate during migration

| Anti-pattern | Current example | Target |
|--------------|----------------|--------|
| Fat page with 200+ lines | `app/(app)/donors/page.tsx` | `features/donors/pages/donors-list-page.tsx` |
| Inline column definitions in route file | Most list pages | `features/{domain}/components/{domain}-columns.tsx` |
| Inline query keys | `["donors"]` in page | `donorKeys.list()` in feature |
| Direct API import in page | `import { listDonors } from "@/lib/api/donors"` | `import { useDonors } from "../hooks/use-donors"` (internal) |
| Duplicate filter components | `accounting/report-filters` + `reports/report-filters` | Single feature-owned or shared abstraction |

---

## 6. Platform Feature Exception

`features/platform/` and `features/authentication/` are infrastructure features but follow the same module standard. They are features because they have domain-specific UI and API surfaces, not because they represent business entities.

---

## 7. Dev / Mock Boundaries

| Item | Owner | Rule |
|------|-------|------|
| `lib/mock/handlers.ts` | Platform | Intercepts all services via `client.ts` |
| `lib/mock/fixtures.ts` | Platform | Demo data — not feature-owned |
| `components/dev/mock-mode-banner` | Platform | `components/shared/` or `lib/dev/` |
| Feature-specific mock overrides | Forbidden | All mock data goes through central handlers |

---

## 8. Testing Boundaries (Future)

When tests are added:

| Test type | Location |
|-----------|----------|
| Unit tests for utils/schemas | Adjacent `__tests__/` or `*.test.ts` next to file |
| Hook tests | `features/{name}/hooks/__tests__/` |
| Component tests | `features/{name}/components/__tests__/` |
| E2E tests | `frontend/e2e/` (outside `src/`) |

Not in scope for Phase 02 — documented for future consistency.
