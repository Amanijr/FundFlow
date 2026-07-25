# Phase 02 — Conventions

**Date:** 2026-06-30  
**Covers:** Import order, naming, file patterns, constants

---

## 1. Import Order

Imports are grouped in this order with a blank line between groups:

```ts
// 1. React / Next.js
import { useState } from "react";
import Link from "next/link";

// 2. External packages
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// 3. Internal aliases (@/)
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/data-table/data-table";
import { useApiContext } from "@/hooks/use-api-context";
import { listDonors } from "@/services/donors";

// 4. Relative imports (within same feature)
import { DonorForm } from "../components/donor-form";
import { donorKeys } from "../api/query-keys";
import type { Donor } from "../types/donor";

// 5. Styles (if any)
import "./donors-list.css";
```

### Import rules

| Rule | Example |
|------|---------|
| Use `@/` alias for cross-folder imports | `@/components/ui/button` |
| Use relative imports within a feature | `../hooks/use-donors` |
| Import feature pages only from barrel | `@/features/donors` — not deep paths |
| Type-only imports use `import type` | `import type { Donor } from "../types/donor"` |
| No default exports except Next.js pages | Named exports everywhere else |
| Sort within groups alphabetically | ESLint `import/order` recommended |

### Forbidden imports

```ts
// Cross-feature internals
import { useDonors } from "@/features/donors/hooks/use-donors";

// Direct fetch in components
import { apiRequest } from "@/services/client";  // in a .tsx component

// Template code
import { Button } from "material-shadcn-1.0.0/...";
```

---

## 2. Naming Conventions

### Files and folders

| Artifact | Convention | Example |
|----------|------------|---------|
| Folders | kebab-case | `features/donors/`, `components/data-table/` |
| React components | PascalCase file | `donor-form.tsx` → `DonorForm` |
| Hooks | camelCase with `use-` prefix | `use-donors.ts` → `useDonors()` |
| Services | kebab-case domain noun | `services/donors.ts` |
| Stores | kebab-case with `-store` suffix | `store/auth-store.ts` |
| Types | kebab-case domain noun | `types/donor.ts` |
| Schemas | kebab-case with `-schema` suffix | `schemas/donor-schema.ts` |
| Utils | kebab-case verb/noun | `utils/format.ts` |
| Query keys | kebab-case | `api/query-keys.ts` |
| Page components | kebab-case with `-page` suffix | `pages/donors-list-page.tsx` |
| Constants file | kebab-case or `.constants.ts` | `donor-status.ts` |

### Code identifiers

| Artifact | Convention | Example |
|----------|------------|---------|
| Components | PascalCase | `DonorForm`, `DataTable` |
| Hooks | camelCase, `use` prefix | `useDonors`, `useAuth` |
| Functions | camelCase | `listDonors`, `formatCurrency` |
| Variables | camelCase | `donorId`, `isLoading` |
| Types / Interfaces | PascalCase | `Donor`, `CreateDonorRequest` |
| Enums | PascalCase | `ExpenseStatus` |
| Zod schemas | camelCase + `Schema` suffix | `donorSchema` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE`, `DEFAULT_PAGE_SIZE` |
| Query key factories | camelCase + `Keys` suffix | `donorKeys` |
| CSS classes | Tailwind utilities | No custom BEM |

### Route and URL naming

| Item | Convention | Example |
|------|------------|---------|
| URL segments | kebab-case, plural nouns | `/donors`, `/chart-of-accounts` |
| Route params | `[id]` | `/donors/[id]` |
| Route groups | `(app)`, `(auth)` | Parentheses — not in URL |
| Page file | always `page.tsx` | Next.js convention |

---

## 3. Component Naming Patterns

| Pattern | Usage | Example |
|---------|-------|---------|
| `{Entity}Form` | Create/edit forms | `DonorForm`, `BudgetForm` |
| `{Entities}ListPage` | List page wrapper | `DonorsListPage` |
| `{Entity}DetailPage` | Detail page wrapper | `DonorDetailPage` |
| `{Entity}CreatePage` | Create page wrapper | `DonorCreatePage` |
| `{Entity}EditPage` | Edit page wrapper | `DonorEditPage` |
| `{entities}-columns` | DataTable column defs | `donors-columns.tsx` |
| `{Entity}StatusBadge` | Domain status chip | `DonorStatusBadge` |
| `{Domain}Nav` | Sub-module tab nav | `AccountingNav`, `ReportsNav` |
| `{Domain}DashboardView` | Dashboard composite | `FinanceDashboardView` |
| `use{Entities}` | List query hook | `useDonors()` |
| `use{Entity}` | Detail query hook | `useDonor(id)` |
| `use{Entity}Mutations` | Create/update/delete hooks | `useDonorMutations()` |

---

## 4. Constants

```ts
// features/donors/constants.ts
export const DONOR_STATUSES = ["active", "inactive", "lapsed"] as const;
export const DEFAULT_DONOR_PAGE_SIZE = 25;
export const MAX_DONOR_NOTES_LENGTH = 2000;
```

| Rule | Detail |
|------|--------|
| Format | `SCREAMING_SNAKE_CASE` |
| Location | `features/{name}/constants.ts` or inline in schema file |
| Shared constants | `utils/constants.ts` or `types/` |
| Magic numbers | Never inline — extract to named constant |

---

## 5. TypeScript Conventions

```ts
// Prefer interfaces for object shapes
interface Donor {
  id: string;
  name: string;
  email: string;
}

// Prefer type for unions, utilities, Zod inference
type DonorStatus = "active" | "inactive" | "lapsed";
type CreateDonorRequest = z.infer<typeof donorSchema>;

// Explicit return types on exported hooks and services
export function useDonors(filters: DonorFilters): UseQueryResult<Donor[]> { ... }
export async function listDonors(token: string): Promise<ApiResponse<Donor[]>> { ... }
```

| Rule | Detail |
|------|--------|
| `strict: true` | Required |
| No `any` | Use `unknown` and narrow |
| API responses | Always typed with `ApiResponse<T>` |
| Props | `interface {Entity}FormProps` |
| Event handlers | Inline or named — no `Function` type |

---

## 6. React Query Conventions

### Query key factories (required)

```ts
// features/donors/api/query-keys.ts
export const donorKeys = {
  all: ["donors"] as const,
  lists: () => [...donorKeys.all, "list"] as const,
  list: (filters: DonorFilters) => [...donorKeys.lists(), filters] as const,
  details: () => [...donorKeys.all, "detail"] as const,
  detail: (id: string) => [...donorKeys.details(), id] as const,
};
```

### Hook patterns

```ts
// List
export function useDonors(filters: DonorFilters) {
  const { token } = useApiContext();
  return useQuery({
    queryKey: donorKeys.list(filters),
    queryFn: () => listDonors(token, filters).then((r) => r.data),
    enabled: Boolean(token),
  });
}

// Mutation with invalidation
export function useCreateDonor() {
  const { token } = useApiContext();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateDonorRequest) => createDonor(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
  });
}
```

| Rule | Detail |
|------|--------|
| Query keys | Always via factory — never inline strings in components |
| `enabled` | `Boolean(token)` on all authenticated queries |
| Error handling | Toast via Sonner in mutation `onError` |
| Stale time | Global 60s in QueryClient — override per hook if needed |

---

## 7. Service Layer Conventions

```ts
// services/donors.ts
import { apiRequest } from "./client";
import type { ApiResponse } from "@/types/api";
import type { Donor, CreateDonorRequest } from "@/features/donors/types/donor";

export function listDonors(token: string, orgId?: string) {
  return apiRequest<ApiResponse<Donor[]>>({
  url: "/api/v1/donors",
  token,
  organizationId: orgId,
  });
}
```

| Rule | Detail |
|------|--------|
| One file per domain | `services/donors.ts` |
| Plain async functions | No classes, no React |
| Token as first param | `token: string` always explicit |
| Return full `ApiResponse<T>` | Hooks extract `.data` |
| URL pattern | `/api/v1/{domain}[/{id}][/{action}]` |

---

## 8. Zustand Store Conventions

```ts
// store/auth-store.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setSession: (session) => set({ ...session }),
      clearSession: () => set({ accessToken: null, user: null }),
    }),
    { name: "fundflow-auth" },
  ),
);
```

| Rule | Detail |
|------|--------|
| File suffix | `-store.ts` |
| Hook export | `useAuthStore` |
| Persist keys | `fundflow-{name}` — immutable |
| Selectors | Use shallow compare for object selections |

---

## 9. Export Conventions

| Scope | Default export? | Barrel? |
|-------|----------------|---------|
| Next.js `page.tsx` | **Yes** (required) | No |
| React components | No — named export | No |
| Feature public API | No | **Yes** — `index.ts` |
| Services | No — named exports | No |
| Hooks | No — named exports | No |
| Types | No — named exports | No |

---

## 10. Comment Conventions

```ts
// Good — explains non-obvious business rule
// SUPER_ADMIN sends X-Organization-Id to impersonate tenant
organizationId: isSuperAdmin ? selectedOrgId : undefined,

// Bad — narrates the code
// Set the token
setToken(token);
```

Comments explain **why**, not **what**. No JSDoc required unless public library API.

---

## 11. ESLint Alignment

Current config: `eslint-config-next`. Recommended additions (future):

```json
{
  "rules": {
    "import/order": ["error", {
      "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
      "pathGroups": [
        { "pattern": "react", "group": "builtin", "position": "before" },
        { "pattern": "next/**", "group": "builtin", "position": "before" },
        { "pattern": "@/**", "group": "internal" }
      ],
      "newlines-between": "always"
    }]
  }
}
```

Not enforced in Phase 02 — documented for Phase 03+ implementation.
