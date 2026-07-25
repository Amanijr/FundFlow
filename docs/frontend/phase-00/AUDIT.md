# Phase 00 — Project Audit

**Date:** 2026-06-30  
**Scope:** FundFlow ERP frontend (`frontend/`) and Material + shadcn template (`material-shadcn-1.0.0/`)  
**Status:** Complete — no application code modified

---

## Executive Summary

FundFlow ERP is a production Next.js 15 App Router application with domain-organized routes, client-side auth guards, three persisted Zustand stores, a fetch-based API layer, and TanStack Query for server state. The Material + shadcn template is a Vite + Express demo with a richer shadcn/ui primitive library (47 components vs 14 in ERP) and a distinctive Material Design visual language built on stone gradients and hardcoded palette overrides.

The migration goal is to adopt the template's visual design system while preserving all ERP backend contracts, authentication, Zustand stores, routing, and business logic.

---

## 1. Existing ERP Audit

### 1.1 Folder Structure

```
daisyFoDonation/
├── frontend/                    # FundFlow ERP (Next.js 15)
│   ├── src/
│   │   ├── app/                 # App Router pages & layouts
│   │   │   ├── (auth)/          # Login, register
│   │   │   ├── (app)/           # Authenticated org workspace
│   │   │   └── platform/        # SUPER_ADMIN platform console
│   │   ├── components/          # UI, layout, domain modules (~101 files)
│   │   ├── hooks/               # Auth, API context, navigation, analytics
│   │   ├── lib/
│   │   │   ├── api/             # Typed API modules per domain
│   │   │   ├── mock/            # In-browser mock API
│   │   │   ├── navigation/      # Sidebar config, permissions
│   │   │   └── utils/           # Formatting, CSV export
│   │   ├── stores/              # Zustand (auth, platform, sidebar)
│   │   └── types/               # Domain TypeScript types
│   ├── next.config.ts           # API proxy rewrite
│   └── package.json
├── src/main/java/               # Spring Boot backend (out of scope)
└── material-shadcn-1.0.0/       # Design template (out of scope for runtime)
```

**Key observation:** Pages live under `app/(app)/` with domain components in `components/<module>/`. There is no `features/` folder despite references in older docs.

### 1.2 Routing

| Layer | Implementation |
|-------|----------------|
| Framework | Next.js 15 App Router with route groups |
| Auth routes | `(auth)/` — `/login`, `/register` |
| App routes | `(app)/` — all org workspace pages |
| Platform routes | `platform/` — SUPER_ADMIN console |
| Protection | Client-side guards only (no `middleware.ts`) |

**Route groups and guards:**

| Layout | Guard | Scope |
|--------|-------|-------|
| `(auth)/layout.tsx` | `GuestGuard` | Public auth pages |
| `(app)/layout.tsx` | `AuthGuard` → `AppShell` | Org workspace |
| `(app)/admin/layout.tsx` | `AdminGuard` | ORG_ADMIN only |
| `platform/dashboard/layout.tsx` | `PlatformAuthGuard` → `PlatformShell` | SUPER_ADMIN |

**Business route modules:** dashboards, donors, campaigns, donations, funds, budgets, expenses, accounting, reports, admin, programs, grants, beneficiaries, church, school, platform, dev showcase.

### 1.3 Authentication Flow

```
/login → LoginForm → POST /api/v1/auth/login
  → setSession() in auth-store (localStorage: fundflow-auth)
  → redirect via getDefaultDashboardPath(role)

/register → RegisterForm → POST /api/v1/auth/register
  → setSession() → redirect /admin/setup

Logout → clearSession() → /login
```

| Concern | Implementation |
|---------|----------------|
| Token storage | Zustand persist → localStorage |
| Token type | Bearer JWT (`accessToken`) |
| Refresh token | Not implemented |
| Server session | None (pure client JWT) |
| SUPER_ADMIN tenant | `platform-store` + `X-Organization-Id` header |
| Mock auth | `NEXT_PUBLIC_MOCK_API=true` → `lib/mock/handlers.ts` |

**Guard components:** `AuthGuard`, `GuestGuard`, `AdminGuard`, `PlatformAuthGuard`, `DashboardGuard`, `RoleGuard`, `PermissionGate`.

### 1.4 API Layer

**Client:** `frontend/src/lib/api/client.ts` — native `fetch`, no Axios, no global interceptors.

| Header | When |
|--------|------|
| `Authorization: Bearer {token}` | When token provided per call |
| `X-Organization-Id` | SUPER_ADMIN tenant context |
| `Content-Type: application/json` | Request bodies |

**Response envelope:** `ApiResponse<T>` — `{ success, message, data }`  
**Errors:** throws `ApiError` with HTTP status  
**Proxy:** `next.config.ts` rewrites `/api/*` → backend (default `localhost:8080`)  
**Mock mode:** short-circuits to `mockApiRequest()` before network

**API modules (18):** auth, organization, users, donors, campaigns, donations, funds, budgets, expenses, accounting, reports, analytics, programs, grants, beneficiaries, church, school, platform.

**Data fetching:** TanStack Query in pages/hooks; `useApiContext()` supplies `token` + `organizationId`.

### 1.5 Zustand Stores

| Store | Persist Key | State |
|-------|-------------|-------|
| `auth-store` | `fundflow-auth` | `accessToken`, `user`, `_hasHydrated` |
| `platform-store` | `fundflow-platform` | `selectedOrganizationId`, `selectedOrganizationName` |
| `sidebar-store` | `fundflow-sidebar` | `collapsed` (persisted), `mobileOpen` (ephemeral) |

Server/async state is handled exclusively by TanStack Query.

### 1.6 Providers

`AppProviders` (`components/providers/app-providers.tsx`) wraps root layout:

| Provider | Library | Config |
|----------|---------|--------|
| `ThemeProvider` | next-themes | `attribute="class"`, system default |
| `QueryClientProvider` | @tanstack/react-query | staleTime 60s, retry 1 |
| `Toaster` | sonner | top-right, rich colors |
| `MockModeBanner` | custom | visible when mock API enabled |

No React Context for auth — Zustand is used directly.

### 1.7 Shared Components

| Category | Location | Count / Notes |
|----------|----------|---------------|
| UI primitives | `components/ui/` | 14 shadcn components |
| Layout | `components/layout/` | AppShell, sidebar, top nav, breadcrumbs |
| Tables | `components/tables/` | DataTable (TanStack Table), FilterBar |
| Forms | `components/forms/` | FormField, CurrencyInput, EntitySelector, etc. |
| Feedback | `components/feedback/` | Loading, skeleton, alerts, confirm dialog |
| Display | `components/display/` | EmptyState, DetailCard, StatusBadge |
| Charts | `components/charts/` | MetricCard, TrendChart, KPI widgets |
| Workflow | `components/workflow/` | Approval workflow, audit trail |
| Security | `components/security/` | RoleGuard, PermissionGate |
| Navigation | `components/navigation/` | Command palette (Cmd+K) |

### 1.8 Business Modules

| Module | Routes | API | Components |
|--------|--------|-----|------------|
| Dashboards | `/dashboard/*` | analytics | `dashboard/*-dashboard-view` |
| Fundraising | donors, campaigns, donations | donors, campaigns, donations | domain forms + lists |
| Finance | funds, budgets, expenses | funds, budgets, expenses | workflow panels |
| Accounting | chart-of-accounts, journals, GL | accounting | accounting-nav, forms |
| Reporting | `/reports/*` | reports, analytics | filters, export |
| Administration | `/admin/*` | users, organization | invite form, settings |
| Programs & verticals | programs, grants, church, school | programs, grants, church, school | vertical forms |
| Platform | `/platform/dashboard/*` | platform | tenant switcher, org mgmt |

---

## 2. Material Template Audit

### 2.1 Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 18.3, TypeScript 5.6 |
| Bundler | Vite 5.4 |
| Styling | Tailwind CSS 3.4 + tailwindcss-animate |
| Components | shadcn/ui (new-york style), 47 primitives |
| Routing | react-router-dom 7 (HashRouter) |
| Charts | Recharts 2.15 + shadcn chart wrapper |
| Icons | lucide-react (primary) |
| Backend | Express + Drizzle (stub, not used by UI) |

### 2.2 Design System

#### Typography

| Aspect | Template |
|--------|----------|
| Named font | Inter (CSS var `--theme-font-family`, not loaded) |
| Body | `font-sans antialiased` |
| Scale | Ad-hoc: `text-xs` through `text-3xl` |
| CardTitle | `text-2xl font-semibold` |
| Page titles | `text-xl font-semibold` |
| **Gap** | Theme configurator sets font vars but body does not consume them |

#### Colors

**shadcn tokens (light):** `--background` hsl(0,0%,97%), `--primary` black, `--radius` 0.75rem  
**Dark mode:** class-based `.dark`, radius shrinks to 0.5rem  
**Material overrides:** hardcoded `stone-*` palette dominates pages — `bg-stone-50` shell, `bg-stone-800` active nav, gradient buttons  
**Chart colors:** `#22c55e` (green), `#0c0a09` (stone-950) — hardcoded, not token-driven  
**Gap:** `--chart-1`…`--chart-5` referenced in Tailwind config but undefined in CSS

#### Spacing

Standard Tailwind 4px base. Recurring patterns:

| Pattern | Value |
|---------|-------|
| Main content padding | `p-3 lg:p-6` |
| Card padding | `p-6` / `pt-6 px-3 lg:px-6` |
| Grid gaps | `gap-6` |
| Sidebar width | `w-60` (240px) |
| Nav item padding | `px-3 py-2` |

#### Cards

`rounded-lg border border-stone-200 bg-card` — stone border override on shadcn Card. Used as main content wrapper in Layout.

#### Buttons

Material 3D gradient default variant: `bg-gradient-to-b from-stone-700 to-stone-800` with inset highlight pseudo-element. Secondary is transparent with stone border. Sizes: h-9/h-10/h-11.

#### Inputs

`h-10 rounded-md border-input ring-2 ring-ring ring-offset-2`. Companion: textarea, select, checkbox, switch, slider, input-otp.

#### Dialogs

Radix Dialog with fade/zoom animations (`duration-200`). **Not used in pages** — theme configurator uses custom modal. `alert-dialog`, `sheet`, `drawer` also available.

#### Tables

shadcn `Table` primitives exist but **pages use raw HTML tables** with `thead bg-stone-50`, uppercase `text-xs` headers, `divide-y divide-stone-200`.

#### Sidebar

Custom `components/layout/sidebar.tsx` (w-60, Lucide icons, Material gradient active state). Full shadcn `ui/sidebar.tsx` (~770 lines) exists but is **unused**.

#### Header

No persistent desktop header. Mobile hamburger only. Page title inside main Card via Layout `title` prop.

#### Charts

Recharts via `ChartContainer` wrapper with theme-aware CSS vars. Dashboard: area, line, pie, bar charts + sparkline `MiniChart` in stat cards.

#### Icons

lucide-react exclusively in use. `react-icons` installed but unused.

#### Animations

| Source | Usage |
|--------|-------|
| tailwindcss-animate | Dialog/dropdown fade, zoom, slide |
| Component transitions | Sidebar slide 300ms, button 300ms, table row hover |
| Skeleton | `animate-pulse` |
| **Unused** | framer-motion, tw-animate-css |

### 2.3 Template Gaps

| Issue | Severity |
|-------|----------|
| Dual color systems (tokens vs stone-*) | High |
| Theme configurator unwired (no UI trigger) | Medium |
| Typography tokens not applied globally | Medium |
| Inter font referenced but not loaded | Medium |
| shadcn Table/Dialog unused in pages | Low |
| Missing `/images/*` assets | Medium |
| Dark mode partial coverage | Medium |

---

## 3. Comparative Summary

| Dimension | ERP | Template |
|-----------|-----|----------|
| Framework | Next.js 15 App Router | Vite + react-router HashRouter |
| React | 19.1 | 18.3 |
| Tailwind | v4 | v3.4 |
| shadcn primitives | 14 | 47 |
| DataTable | TanStack Table composite | Raw HTML tables |
| Auth | Full JWT flow + guards | Scaffold only |
| API | 18 domain modules + mock | Static mock data |
| State | Zustand (3) + TanStack Query | TanStack Query only |
| Theme | next-themes integrated | Manual class toggle |
| Visual style | Token-driven, minimal | Material stone gradients |

---

## 4. Risk Analysis

| Risk | Description | Mitigation |
|------|-------------|------------|
| Tailwind version conflict | ERP uses Tailwind 4; template uses Tailwind 3.4 with different config format | Port template tokens to Tailwind 4 `@theme` syntax; do not downgrade ERP |
| Theme conflicts | ERP uses semantic tokens; template hardcodes `stone-*` | Map Material stone palette to ERP CSS variables; eliminate hardcoded colors in adopted components |
| CSS variable collisions | Both define `--primary`, `--radius`, `--sidebar-*` with different values | Single source of truth in ERP `globals.css`; template values become overrides |
| Provider duplication | Both use TanStack Query + ThemeProvider | Keep ERP providers; do not import template provider stack |
| Icon inconsistencies | Both use lucide-react but different versions (1.21 vs 0.453) | Standardize on ERP's lucide-react version |
| Component API drift | Template Button uses `forwardRef`; ERP Button does not | Adopt template styling into ERP components; preserve ERP prop interfaces |
| Routing paradigm mismatch | Next.js file-based vs react-router | Extract visual patterns only; never port template routing |
| Zustand store collision | Template has no Zustand | No risk — stores remain untouched |
| Mock vs real API | Template is fully static | Never import template data layer |
| Font loading | ERP loads Roboto/Lato/Montserrat; template names Inter | Align on brand fonts per `docs/CROSSLIFE_BRAND.md` |

---

## 5. Frontend Standards (Proposed)

### Naming Conventions

- Components: PascalCase (`DataTable`, `PageHeader`)
- Files: kebab-case matching component (`data-table.tsx`)
- Hooks: `use-` prefix (`use-auth.ts`, `use-api-context.ts`)
- Stores: `*-store.ts` with `use*Store` export
- API modules: domain noun (`donors.ts`, `expenses.ts`)

### Folder Conventions

```
components/
  ui/           # shadcn primitives only
  layout/       # App shell, nav, headers
  tables/       # DataTable and table utilities
  forms/        # Reusable form building blocks
  feedback/     # Loading, alerts, dialogs
  display/      # Empty states, badges, cards
  charts/       # Chart composites
  workflow/     # Approval, audit trail
  security/     # Guards and gates
  <domain>/     # Business-specific components
```

### Import Ordering

1. React / Next.js
2. Third-party libraries
3. `@/components/*`
4. `@/hooks/*`
5. `@/lib/*`
6. `@/stores/*`
7. `@/types/*`
8. Relative imports

### Accessibility Standards

- All interactive elements keyboard-focusable with visible focus ring
- Radix primitives provide ARIA; preserve `aria-*` when restyling
- Form fields require associated `<Label>` via `htmlFor`
- Color contrast: WCAG AA minimum on all text/background pairs
- Loading states announced via `aria-live` or skeleton patterns
- Command palette supports keyboard navigation (already implemented)

### Error Handling

- API errors: catch `ApiError`, display via `ErrorAlert` or Sonner toast
- Form errors: React Hook Form + Zod validation at field level
- Page-level: TanStack Query `isError` + `ErrorAlert` with retry
- Never swallow errors silently; log to console in dev

### Animation Guidelines

- Use `transition-colors duration-200` for hover states
- Sidebar mobile slide: `transition-transform duration-300 ease-in-out`
- Dialog open/close: tailwindcss-animate fade + zoom (200ms)
- Avoid framer-motion unless a specific interaction requires it
- Respect `prefers-reduced-motion`: disable non-essential animations

---

## 6. Constraints (Immutable)

The following must not change during migration:

- Backend API contracts and endpoint paths
- Authentication logic and JWT flow
- Zustand store schemas and persist keys
- Database and server-side business logic
- RBAC permission matrix
- TanStack Query data fetching patterns

---

## 7. Acceptance Criteria Checklist

- [x] Existing ERP architecture documented
- [x] Material template design system documented
- [x] Component inventory completed (see `COMPONENT_INVENTORY.md`)
- [x] Migration strategy completed (see `MIGRATION_PLAN.md`)
- [x] Risk analysis included
- [x] Frontend standards defined
- [x] No application code modified
