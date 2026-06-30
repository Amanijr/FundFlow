# Phase 00 — Architecture Report

**Date:** 2026-06-30  
**Systems:** FundFlow ERP Frontend · Material Shadcn Template

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        daisyFoDonation Monorepo                      │
├─────────────────────────────┬───────────────────────────────────────┤
│   FundFlow ERP Frontend     │   Material Shadcn Template            │
│   frontend/                 │   material-shadcn-1.0.0/              │
│   Next.js 15 · React 19     │   Vite 5 · React 18                   │
│   Production application    │   Design reference / component source │
├─────────────────────────────┴───────────────────────────────────────┤
│   Spring Boot Backend (src/main/java/) — unchanged                  │
└─────────────────────────────────────────────────────────────────────┘
```

The ERP frontend is the runtime target. The template is a visual and component library reference. Migration ports design tokens and UI primitives into the ERP without altering business logic, API contracts, or state management.

---

## 2. ERP Frontend Architecture

### 2.1 Layer Diagram

```
┌──────────────────────────────────────────────────────────┐
│  Pages (app/(app)/**/page.tsx)                           │
│  Server components + client components per route           │
├──────────────────────────────────────────────────────────┤
│  Domain Components (components/<module>/)                │
│  Forms, lists, workflow panels, dashboard views           │
├──────────────────────────────────────────────────────────┤
│  Shared Components                                         │
│  layout · tables · forms · feedback · display · charts    │
├──────────────────────────────────────────────────────────┤
│  UI Primitives (components/ui/)                          │
│  shadcn/Radix wrappers — 14 components                   │
├──────────────────────────────────────────────────────────┤
│  Hooks & Stores                                            │
│  useAuth · useApiContext · useNavigation                 │
│  auth-store · platform-store · sidebar-store             │
├──────────────────────────────────────────────────────────┤
│  API Layer (lib/api/)                                    │
│  fetch client · 18 domain modules · mock handlers        │
├──────────────────────────────────────────────────────────┤
│  Backend (Spring Boot via /api proxy)                    │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Application Bootstrap

```
app/layout.tsx
  └── AppProviders
        ├── ThemeProvider (next-themes)
        ├── QueryClientProvider (TanStack Query)
        ├── Toaster (sonner)
        └── MockModeBanner
              └── {children}
```

### 2.3 Route Architecture

```
/                           → redirect to role default dashboard
├── (auth)/
│   ├── /login              GuestGuard
│   └── /register           GuestGuard
├── (app)/                  AuthGuard → AppShell
│   ├── /dashboard/*        DashboardGuard (per-role)
│   ├── /donors/*           PermissionGate (actions)
│   ├── /campaigns/*
│   ├── /donations/*
│   ├── /funds/*
│   ├── /budgets/*
│   ├── /expenses/*
│   ├── /accounting/*
│   ├── /reports/*
│   ├── /programs/*
│   ├── /grants/*
│   ├── /beneficiaries/*
│   ├── /church/*
│   ├── /school/*
│   ├── /admin/*            AdminGuard (ORG_ADMIN)
│   └── /dev/*
└── platform/
    ├── /platform/login
    ├── /platform/bootstrap
    └── /platform/dashboard/* PlatformAuthGuard → PlatformShell
```

**Protection model:** Three layers — layout guards (route access), navigation filtering (sidebar visibility), and `PermissionGate` (action-level UI). No Next.js middleware; all guards are client-side `useEffect` redirects.

### 2.4 Authentication Architecture

```
┌──────────┐    POST /api/v1/auth/login    ┌──────────────┐
│ LoginForm│ ──────────────────────────────→ │  auth-store  │
└──────────┘                                │  (Zustand)   │
                                            │  persist:    │
┌──────────┐    useApiContext()             │  fundflow-   │
│ API calls│ ←── token + orgId ────────────│  auth        │
└──────────┘                                └──────────────┘
       │
       │  Authorization: Bearer {token}
       │  X-Organization-Id: {orgId}  (SUPER_ADMIN only)
       ▼
┌──────────────┐
│ fetch client │ → /api/v1/* → Spring Boot
└──────────────┘
```

**Session lifecycle:**
1. Login → `setSession({ accessToken, user })` → localStorage persist
2. Hydration → `_hasHydrated` flag gates guard rendering
3. API calls → explicit token pass via `useApiContext()`
4. Logout → `clearSession()` → redirect `/login`

### 2.5 Data Flow Architecture

```
Page Component
  ├── useApiContext() → { token, organizationId }
  ├── useQuery({ queryKey, queryFn: () => api.getX(token, orgId) })
  └── Render with loading/error/empty states

Mutations:
  ├── useMutation({ mutationFn, onSuccess: invalidateQueries })
  └── Toast feedback via sonner
```

**State ownership:**

| Concern | Owner |
|---------|-------|
| Auth session | Zustand `auth-store` |
| SUPER_ADMIN tenant | Zustand `platform-store` |
| Sidebar UI state | Zustand `sidebar-store` |
| Server data | TanStack Query cache |
| Form state | React Hook Form (local) |
| Theme preference | next-themes (localStorage) |

### 2.6 API Architecture

**Endpoint convention:** `/api/v1/<domain>[/<id>][/<action>]`

**Response envelope:**
```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
```

**Proxy chain:**
```
Browser → /api/v1/donors → next.config.ts rewrite → http://localhost:8080/api/v1/donors
```

**Mock mode:** When `NEXT_PUBLIC_MOCK_API=true`, `apiRequest()` delegates to `mockApiRequest()` with in-memory fixtures. No network call is made.

### 2.7 Component Architecture

```
AppShell
├── Sidebar (desktop) / MobileSidebar (drawer)
│   └── SidebarNav → navigationGroups filtered by role + org type
├── TopNavigation
│   ├── Breadcrumbs
│   ├── Theme toggle
│   ├── Command palette trigger
│   └── Logout
└── ContentContainer
    └── Page content
        ├── PageHeader / SectionHeader
        ├── FilterBar (list pages)
        ├── DataTable (list pages)
        └── Domain forms / detail views
```

### 2.8 RBAC Architecture

```
permissions.ts
  ├── canAccessNavItem(role, orgType, item)  → sidebar filtering
  ├── getDefaultDashboardPath(role)           → post-login redirect
  └── canAccessDashboard(role, path)          → DashboardGuard

Guards (layout level):
  ├── AuthGuard        → any authenticated user
  ├── AdminGuard       → ORG_ADMIN
  ├── PlatformAuthGuard → SUPER_ADMIN
  └── DashboardGuard   → per-dashboard role set

Gates (component level):
  ├── RoleGuard        → conditional render
  └── PermissionGate   → hide action buttons
```

### 2.9 Key File Index

| Concern | Path |
|---------|------|
| Root layout | `frontend/src/app/layout.tsx` |
| App providers | `frontend/src/components/providers/app-providers.tsx` |
| App shell | `frontend/src/components/layout/app-shell.tsx` |
| API client | `frontend/src/lib/api/client.ts` |
| Auth store | `frontend/src/stores/auth-store.ts` |
| Auth hook | `frontend/src/hooks/use-auth.ts` |
| API context | `frontend/src/hooks/use-api-context.ts` |
| Navigation | `frontend/src/lib/navigation/navigation.ts` |
| Permissions | `frontend/src/lib/navigation/permissions.ts` |
| DataTable | `frontend/src/components/tables/data-table.tsx` |
| API proxy | `frontend/next.config.ts` |

---

## 3. Template Architecture

### 3.1 Layer Diagram

```
┌──────────────────────────────────────────────────────────┐
│  Pages (client/src/pages/)                               │
│  Route-level views composing layout + features             │
├──────────────────────────────────────────────────────────┤
│  Feature Components (components/dashboard/, layout/)     │
│  Stats grid, charts, projects table, sidebar, footer     │
├──────────────────────────────────────────────────────────┤
│  UI Primitives (components/ui/)                          │
│  47 shadcn/Radix components                              │
├──────────────────────────────────────────────────────────┤
│  Lib (lib/)                                              │
│  utils · data.ts (mock) · queryClient · types            │
├──────────────────────────────────────────────────────────┤
│  Express Server (server/) — stub, unused by UI           │
└──────────────────────────────────────────────────────────┘
```

### 3.2 Application Bootstrap

```
main.tsx
  └── App.tsx
        ├── QueryClientProvider
        ├── HashRouter
        │     ├── Layout (sidebar + card wrapper + footer)
        │     │     └── Route pages
        │     └── Auth pages (standalone, no sidebar)
        └── ThemeConfigurator (unwired — state always false)
```

### 3.3 Layout Architecture

```
Layout (App.tsx)
├── Sidebar (w-60, fixed desktop / slide mobile)
│   ├── Brand: "Material Shadcn"
│   ├── Nav: Dashboard, Profile, Tables, Notifications, Subscriptions
│   ├── Auth: Sign In, Sign Up
│   └── Footer: Documentation link
├── Main (flex-1 overflow-y-auto)
│   ├── Mobile hamburger (lg:hidden)
│   ├── Card wrapper
│   │   ├── Page title (optional)
│   │   └── {children}
│   └── Footer (attribution)
└── grain-texture overlay (CSS ::before)
```

### 3.4 Design Token Architecture

```
index.css (:root)
  ├── shadcn semantic tokens (--background, --primary, --radius, etc.)
  ├── sidebar tokens (--sidebar-background, --sidebar-primary, etc.)
  └── theme configurator vars (--theme-font-*, --theme-font-size-base)

tailwind.config.ts
  └── Maps tokens to Tailwind color/radius utilities

Component layer
  └── Hardcoded stone-* overrides (dominant visual layer)
```

**Dual-system problem:** Semantic tokens exist but pages/components predominantly use `stone-*` Tailwind classes, creating a disconnect between the token system and actual rendered styles.

### 3.5 Chart Architecture

```
ChartContainer (ui/chart.tsx)
  ├── ResponsiveContainer (Recharts)
  ├── ChartStyle → injects --color-{key} per theme
  ├── ChartTooltip / ChartTooltipContent
  └── ChartLegend / ChartLegendContent

Dashboard usage:
  ├── charts-showcase.tsx → Area, Line, Pie, Bar (2×2 grid)
  ├── mini-chart.tsx → Sparkline bars in stat cards
  └── stats-grid.tsx → Composes MiniChart with mock data
```

### 3.6 Template Key File Index

| Concern | Path |
|---------|------|
| Design tokens | `material-shadcn-1.0.0/client/src/index.css` |
| Tailwind config | `material-shadcn-1.0.0/tailwind.config.ts` |
| shadcn config | `material-shadcn-1.0.0/components.json` |
| App shell | `material-shadcn-1.0.0/client/src/App.tsx` |
| Sidebar | `material-shadcn-1.0.0/client/src/components/layout/sidebar.tsx` |
| Button (Material style) | `material-shadcn-1.0.0/client/src/components/ui/button.tsx` |
| Card | `material-shadcn-1.0.0/client/src/components/ui/card.tsx` |
| Chart wrapper | `material-shadcn-1.0.0/client/src/components/ui/chart.tsx` |
| Theme editor | `material-shadcn-1.0.0/client/src/components/theme-configurator.tsx` |
| Mock data | `material-shadcn-1.0.0/client/src/lib/data.ts` |

---

## 4. Architecture Comparison

| Aspect | ERP | Template | Migration Impact |
|--------|-----|----------|------------------|
| Framework | Next.js App Router | Vite SPA + HashRouter | Keep ERP routing |
| Rendering | RSC + client components | Client-only | No change |
| Auth | JWT + Zustand + guards | None | Keep ERP auth |
| API | 18 modules + mock | Static data.ts | Keep ERP API |
| State | Zustand + TanStack Query | TanStack Query only | Keep ERP stores |
| UI primitives | 14 components | 47 components | Adopt missing primitives |
| Tables | TanStack DataTable | Raw HTML | Keep ERP DataTable, restyle |
| Sidebar | Custom with RBAC nav | Material gradient nav | Replace visual, keep nav logic |
| Theme | next-themes | Manual class toggle | Keep next-themes |
| Charts | Basic Recharts | ChartContainer wrapper | Adopt chart wrapper |
| Tailwind | v4 | v3.4 | Port tokens to v4 |

---

## 5. Integration Points

These are the only surfaces where template design touches ERP code:

```
┌─────────────────────────────────────────────────────────┐
│  INTEGRATION SURFACE MAP                                 │
├──────────────────────┬──────────────────────────────────┤
│  globals.css /       │  Port Material color tokens,     │
│  tailwind config     │  radius, font vars to Tailwind 4 │
├──────────────────────┼──────────────────────────────────┤
│  components/ui/*     │  Replace/restyle 14 primitives;  │
│                      │  add 33 missing primitives       │
├──────────────────────┼──────────────────────────────────┤
│  components/layout/  │  Restyle AppShell, sidebar,      │
│                      │  top nav with Material patterns  │
├──────────────────────┼──────────────────────────────────┤
│  components/charts/  │  Adopt ChartContainer wrapper    │
├──────────────────────┼──────────────────────────────────┤
│  index.css utilities │  grain-texture, animations       │
├──────────────────────┼──────────────────────────────────┤
│  DO NOT TOUCH        │  stores/, lib/api/, hooks/use-   │
│                      │  auth, guards, permissions,      │
│                      │  app/ routes, types/             │
└──────────────────────┴──────────────────────────────────┘
```

---

## 6. Observations & Technical Debt

### ERP

| Item | Severity | Detail |
|------|----------|--------|
| Client-only route guards | Medium | No middleware; deep URLs may flash shell before redirect |
| JWT in localStorage | Medium | XSS exposure; no httpOnly cookies |
| No token refresh | Low | Session expires without silent renewal |
| Docs drift | Low | `FRONTEND_ARCHITECTURE.md` references nonexistent `features/` folder |
| Branding inconsistency | Low | Metadata says "CrossLife ERP"; README says "FundFlow ERP" |
| Limited UI primitives | Medium | 14 shadcn components vs 47 in template |

### Template

| Item | Severity | Detail |
|------|----------|--------|
| Dual color systems | High | Tokens defined but stone-* hardcoded in components |
| Unwired theme configurator | Medium | Component exists, no trigger in UI |
| Unused shadcn sidebar | Low | 770-line component not integrated |
| Dead dependencies | Low | framer-motion, next-themes, react-icons, wouter |
| Missing image assets | Medium | `/images/*` referenced but absent |
| Backend stub | Info | Express routes empty; all data from `data.ts` |

---

## 7. Recommended Migration Phases

| Phase | Focus | Architecture Impact |
|-------|-------|---------------------|
| 01 | Design tokens & Tailwind config | CSS variable alignment |
| 02 | UI primitives (button, card, input, etc.) | Component library expansion |
| 03 | Layout shell (sidebar, header, app shell) | Visual restyle, same structure |
| 04 | Data display (tables, charts, badges) | Restyle + ChartContainer adoption |
| 05 | Feedback & workflow components | Dialog, toast, skeleton restyle |
| 06 | Auth pages visual refresh | Login/register Material styling |
| 07 | Page-by-page domain module restyle | Incremental, per business module |
| 08 | QA, accessibility audit, dark mode | Polish and verification |

Detailed task breakdown in `MIGRATION_PLAN.md`.
