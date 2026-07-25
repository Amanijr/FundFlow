# CrossLife ERP — Notus Template Frontend Phase Plan

**Version:** 1.0  
**Status:** Planning  
**Target app:** `frontend-notus/`  
**Template source:** `Notus-Next.js-1.0.0/` (Creative Tim, MIT)  
**Backend reference:** Existing Spring Boot APIs (same as `frontend/`)

**Related docs:** [FRONTEND_PHASE_PLAN.md](./FRONTEND_PHASE_PLAN.md) · [SCREEN_INVENTORY.md](./SCREEN_INVENTORY.md) · [WORKFLOWS.md](./WORKFLOWS.md) · [RBAC_MATRIX.md](./RBAC_MATRIX.md)

---

## Design rule (non-negotiable)

> **Do not change the Notus template design.**  
> Port the template’s look, layout, and components faithfully. Wire real data behind them — do not restyle.

### What stays exactly as Notus

| Element | Notus standard | Do NOT substitute |
|---------|----------------|-------------------|
| **Palette** | `blueGray-*`, `lightBlue-500` active, `emerald`/`red` trends | CrossLife orange, custom CSS tokens, shadcn theme |
| **Icons** | Font Awesome (`fas`, `far`) | Lucide, Heroicons |
| **Cards** | `shadow-lg`, `rounded-lg`, white surface | Flat border-only panels |
| **Admin layout** | White sidebar `md:w-64`, `HeaderStats` dark band, content `-m-24` overlap | Dark sidebar, full-width ERP chrome |
| **Auth layout** | Full-bleed `bg-blueGray-800` + background image, centered card | Sliding auth panel, custom gradients |
| **Typography** | Uppercase `text-xs font-bold` labels, `text-blueGray-*` hierarchy | Compact 14px ERP density |
| **Tables** | `CardTable` inside shadow card, `blueGray-50` header row | Bare `DataTable` without card wrapper |
| **Charts** | Chart.js in `CardLineChart` / `CardBarChart` | Recharts (unless wrapped in identical Notus card chrome) |
| **Buttons** | `bg-blueGray-800` / `bg-lightBlue-500`, uppercase, shadow | shadcn `Button` variants |
| **Forms** | Notus input classes (`border-0`, `shadow`, `py-3`) | shadcn `Input` / `FormField` styling |

### Allowed technical upgrades (invisible to users)

- Next.js **App Router** + **TypeScript** (template uses Pages Router + JS)
- **TanStack Query** + **Zustand** for data/auth (template has no data layer)
- **React Hook Form + Zod** for validation (keep Notus visual markup)
- Share API clients from `../frontend/src` via path aliases
- Mock API mode for offline development

### Fidelity checklist (every PR)

- [ ] Screenshot matches Notus template for the same screen type
- [ ] No new colors outside `blueGray` / `lightBlue` / semantic greens & reds
- [ ] Font Awesome icons used for nav and stat cards
- [ ] Cards use `shadow-lg`
- [ ] Admin pages use `Admin` layout pattern (sidebar + header stats + overlapping content)

---

## Repository layout

```
daisyFoDonation/
├── Notus-Next.js-1.0.0/     ← Design reference (read-only)
├── frontend/                ← ERP edition (shadcn) — keep for comparison
├── frontend-notus/            ← THIS PLAN — Notus template edition
│   ├── src/
│   │   ├── app/               ← App Router routes
│   │   ├── components/
│   │   │   └── notus/         ← Ported template components (TSX)
│   │   └── lib/               ← Notus-specific utils only
│   └── package.json
└── docs/
    └── FRONTEND_NOTUS_PHASE_PLAN.md
```

**Shared business logic** (import from `frontend/src`, do not duplicate):

- `lib/api/*`, `lib/mock/*`, `types/*`, `stores/*`, `hooks/*`, `lib/navigation/*`

---

## Phase overview

| Phase | Name | Focus | Template anchors |
|-------|------|-------|------------------|
| **N0** | Design lock & template port | Restore pure Notus theme; component inventory | `styles/`, all `components/` |
| **N1** | Foundation & shell | App Router, layouts, API, auth guards | `layouts/Admin.js`, `layouts/Auth.js` |
| **N2** | Auth screens | Login, register, org onboarding | `pages/auth/*`, `AuthNavbar` |
| **N3** | Navigation & role routing | Sidebar groups, dashboards redirect | `Sidebar.js`, `AdminNavbar` |
| **N4** | Role dashboards | Executive, Finance, Fundraising home | `HeaderStats`, `CardStats`, charts |
| **N5** | Fundraising | Donors, campaigns, donations | `CardTable`, `CardProfile` |
| **N6** | Finance | Funds, budgets, expenses | `CardTable`, `CardSettings` |
| **N7** | Accounting | COA, journals, GL, trial balance | `admin/tables` patterns |
| **N8** | Reporting | Report hub + exports | `CardTable`, chart cards |
| **N9** | Administration | Users, org settings, setup | `admin/settings`, `CardSettings` |
| **N10** | Programs & verticals | Grants, church, school, NGO | New nav sections in Sidebar style |
| **N11** | Platform owner | Super-admin area | Separate layout; same Notus tokens |
| **N12** | Polish & production | Loading, errors, a11y, performance | `PageChange.js` |

---

## N0 — Design lock & template port

**Goal:** `frontend-notus` visually matches the template before feature work continues.

### Deliverables

1. **Revert custom theming** — remove CrossLife orange / warm stone overrides; restore Notus `blueGray` + `lightBlue` in `globals.css` or Tailwind config
2. **Add Font Awesome** — `@fortawesome/fontawesome-free` (same version as template)
3. **Copy reference assets** — `public/img/register_bg_2.png`, github/google svgs from template
4. **Port core components to TSX** (visual parity, no logic changes):

   | Template file | Target |
   |---------------|--------|
   | `layouts/Admin.js` | `components/notus/layouts/admin-layout.tsx` |
   | `layouts/Auth.js` | `components/notus/layouts/auth-layout.tsx` |
   | `components/Sidebar/Sidebar.js` | `components/notus/sidebar.tsx` |
   | `components/Navbars/AdminNavbar.js` | `components/notus/admin-navbar.tsx` |
   | `components/Navbars/AuthNavbar.js` | `components/notus/auth-navbar.tsx` |
   | `components/Headers/HeaderStats.js` | `components/notus/header-stats.tsx` |
   | `components/Cards/CardStats.js` | `components/notus/card-stats.tsx` |
   | `components/Cards/CardTable.js` | `components/notus/card-table.tsx` |
   | `components/Cards/CardLineChart.js` | `components/notus/card-line-chart.tsx` |
   | `components/Cards/CardBarChart.js` | `components/notus/card-bar-chart.tsx` |
   | `components/Cards/CardSettings.js` | `components/notus/card-settings.tsx` |
   | `components/Dropdowns/UserDropdown.js` | `components/notus/user-dropdown.tsx` |
   | `components/Footers/FooterAdmin.js` | `components/notus/footer-admin.tsx` |

5. **Side-by-side page** — `/dev/notus-reference` showing template components with static data

### Exit criteria

- [ ] Admin dashboard screenshot indistinguishable from template `admin/dashboard`
- [ ] Login screenshot matches template `auth/login`
- [ ] No Lucide icons in Notus shell components

---

## N1 — Foundation & application shell

**Goal:** Runnable App Router app with Notus `Admin` + `Auth` layouts and API layer.

### Deliverables

- Next.js 15 + TS in `frontend-notus/`
- `experimental.externalDir` — import shared API from `frontend/src`
- `AppProviders` — TanStack Query, toast (Sonner OK if styled minimally)
- `AuthGuard` / `GuestGuard` — same behavior as main frontend
- Route groups: `(auth)`, `(admin)`
- Mock API banner (dev only)
- `.env.local.example` with `NEXT_PUBLIC_MOCK_API`

### Routes (shell only)

| Route | Layout |
|-------|--------|
| `/login` | Auth |
| `/register` | Auth |
| `/dashboard` | Admin (placeholder) |

### Exit criteria

- [ ] `npm run dev` on port 3001
- [ ] Login works with mock API (`admin@demo.local` / `demo`)
- [ ] Authenticated user sees full Notus admin chrome

---

## N2 — Auth screens

**Goal:** Production auth flows using **unchanged** Notus auth markup.

### Screens

| Screen | Template reference | API |
|--------|-------------------|-----|
| Login | `pages/auth/login.js` | `POST /api/v1/auth/login` |
| Register | `pages/auth/register.js` | `POST /api/v1/auth/register` |
| Post-register setup | `CardSettings` form sections | org profile APIs |

### Rules

- Keep social button row markup (GitHub/Google) — can be disabled or wired later
- Keep `Remember me` checkbox styling
- Register uses same card on `bg-blueGray-200` as template
- **Do not** use the sliding auth panel from main `frontend/`

### Exit criteria

- [ ] Register → session → redirect to setup/dashboard
- [ ] Guest routes redirect when authenticated

---

## N3 — Navigation & role routing

**Goal:** ERP navigation in Notus sidebar format.

### Sidebar structure (Notus style)

Use template patterns: `h6` section headings, `uppercase text-xs font-bold`, FA icons, `lightBlue-500` active.

```
ADMIN LAYOUT PAGES
  Dashboard (role-specific)
  ...

FUNDRAISING
  Donors · Campaigns · Donations

FINANCE
  Funds · Budgets · Expenses

ACCOUNTING
  Chart of Accounts · Journal Entries · General Ledger · Trial Balance

REPORTS
  Report center

PROGRAMS          (org-type gated)
  Programs · Grants · Beneficiaries

CHURCH            (org-type gated)
  Ministries · Attendance

SCHOOL            (org-type gated)
  Sponsorships

ADMINISTRATION
  Users · Settings
```

### Components to port

- `NotificationDropdown` (optional, can show activity feed later)
- Mobile sidebar collapse (template toggler pattern)

### Exit criteria

- [ ] Nav items filtered by role + org type (reuse `navigation.ts`)
- [ ] Active state uses `lightBlue-500` exactly like template
- [ ] Home `/` redirects to role dashboard

---

## N4 — Role dashboards

**Goal:** Three tenant dashboards using **HeaderStats + chart cards**.

### Screens

| Dashboard | Route | Template composition |
|-----------|-------|---------------------|
| Executive | `/dashboard/executive` | 4× `CardStats` + 2× `CardLineChart` + `CardPageVisits` table |
| Finance | `/dashboard/finance` | KPI row + expense trend chart + fund table |
| Fundraising | `/dashboard/fundraising` | KPI row + donation chart + campaign table |

### Data

- `GET /api/v1/analytics/dashboard`
- `GET /api/v1/analytics/trends`
- `GET /api/v1/analytics/insights` → optional callout card

### Rules

- **HeaderStats** stays `bg-blueGray-800` with 4 stat cards — replace labels/values with real KPIs
- Chart cards keep Chart.js config colors from template (`#4c51bf`, white dataset)
- Content section keeps `-m-24` overlap

### Exit criteria

- [ ] All three dashboards render with live/mock data
- [ ] Layout matches `admin/dashboard.js` grid (`xl:w-8/12` + `xl:w-4/12`)

---

## N5 — Fundraising module

**Goal:** Donors, campaigns, donations — list/detail/form using Notus cards.

### Screens (per SCREEN_INVENTORY)

| Module | List | Detail | Create | Edit |
|--------|------|--------|--------|------|
| Donors | `CardTable` | `CardProfile` + donation table | Notus form card | Same |
| Campaigns | `CardTable` | progress in `CardStats` + table | form card | Same |
| Donations | `CardTable` | detail card + receipt | form card | — |

### Template mapping

- **List pages** → `admin/tables.js` style (`CardTable color="light"`)
- **Detail pages** → `profile.js` + `CardProfile` + stat row
- **Forms** → `CardSettings` or auth form field classes
- **Validation** → RHF + Zod behind Notus markup

### APIs

`lib/api/donors.ts`, `campaigns.ts`, `donations.ts` (shared)

### Exit criteria

- [ ] Full CRUD donors & campaigns
- [ ] Record donation flow complete
- [ ] Receipt view on donation detail

---

## N6 — Finance module

**Goal:** Funds, budgets, expenses with approval workflow UI in Notus style.

### Screens

| Module | List | Detail | Notes |
|--------|------|--------|-------|
| Funds | `CardTable` | `CardStats` balance + transfer history | |
| Budgets | `CardTable` | lines table + variance `CardStats` | |
| Expenses | `CardTable` | workflow steps in card sections | submit/approve/reject/pay |

### Expense workflow UI

Use stacked Notus cards (not custom stepper) — each status as a bordered card section with action buttons styled as template buttons.

### Exit criteria

- [ ] Expense approval flow end-to-end
- [ ] Fund transfers list + create

---

## N7 — Accounting module

**Goal:** Ledger screens using table-heavy Notus patterns.

### Screens

| Screen | Template pattern |
|--------|------------------|
| Chart of Accounts | `CardTable` |
| Journal entries | `CardTable` → detail with line items table |
| General ledger | `CardTable` with date/account filters in navbar search area |
| Trial balance | `CardTable`, monospace numbers |
| Initialize COA | `CardSettings` confirmation card |

### Exit criteria

- [ ] All accounting list/report screens functional
- [ ] Tabular numbers aligned (template uses default; add `tabular-nums` only if invisible)

---

## N8 — Reporting center

**Goal:** Report hub and report viewers.

### Screens

| Route | Content |
|-------|---------|
| `/reports` | Grid of Notus cards linking to each report (like `index.js` component cards) |
| `/reports/financial` | `CardTable` + export button (Notus button style) |
| `/reports/donations` | Chart card + table |
| `/reports/campaigns` | Campaign performance table |
| `/reports/budgets` | Variance table |

### Exit criteria

- [ ] Date range filters in card header strip
- [ ] CSV/export actions on each report

---

## N9 — Administration

**Goal:** Org admin screens.

### Screens

| Screen | Template |
|--------|----------|
| Users list | `CardTable` |
| User detail / invite | `CardSettings` form |
| Org settings | `admin/settings.js` → `CardSettings` |
| Onboarding setup | Multi-section `CardSettings` |

### Exit criteria

- [ ] ORG_ADMIN can invite users and edit org profile
- [ ] Settings page matches `admin/settings.js` layout

---

## N10 — Programs & verticals

**Goal:** Org-type-gated modules, same Notus chrome.

### Modules

| Org types | Routes |
|-----------|--------|
| NGO, Foundation, etc. | `/programs`, `/grants`, `/beneficiaries` |
| Church | `/church/ministries`, `/church/attendance` |
| School | `/school/sponsorships` |

### Rules

- Add new sidebar `h6` sections — do not collapse into a different nav pattern
- Grant utilization → `CardStats` row on detail page

### Exit criteria

- [ ] Navigation gates by `organization.type`
- [ ] All vertical CRUD screens complete

---

## N11 — Platform owner dashboard

**Goal:** Super-admin area with Notus design (not a separate visual system).

### Approach

- Use same `blueGray` / `lightBlue` tokens
- Layout: Admin shell with platform-specific sidebar items
- Screens: overview `HeaderStats`, organizations `CardTable`, users, logs

### Routes

`/platform/dashboard/*` (mirror main frontend routes)

### Exit criteria

- [ ] SUPER_ADMIN login → platform area
- [ ] Tenant switcher in `AdminNavbar` search/user area

---

## N12 — Polish & production

**Goal:** Production-ready Notus edition.

### Deliverables

- Port `PageChange` loading bar for route transitions
- Error pages: `404.js`, `_error.js` patterns
- Empty states inside `CardTable` (template has no empty state — add muted row, same typography)
- Responsive: verify template mobile sidebar toggler on all pages
- Performance: Chart.js lazy load, query stale times
- E2E smoke: login → dashboard → donor list → create donation

### Exit criteria

- [ ] `npm run build` passes
- [ ] Lighthouse acceptable on dashboard
- [ ] Design fidelity review sign-off

---

## Component reuse map (template → ERP)

| Notus component | ERP usage |
|-----------------|-----------|
| `CardStats` | KPI metrics everywhere |
| `CardTable` | All list pages |
| `CardLineChart` | Donation/expense trends |
| `CardBarChart` | Campaign comparisons |
| `CardPageVisits` | Recent activity / audit feed |
| `CardSocialTraffic` | Source breakdown (donation channels) |
| `CardProfile` | Donor, beneficiary, user profile header |
| `CardSettings` | All create/edit forms |
| `HeaderStats` | Top of every dashboard |
| `UserDropdown` | Session menu in admin navbar |
| `NotificationDropdown` | System notifications (future) |
| `MapExample` | Skip unless geo features needed |

---

## What we are NOT building in this track

- shadcn/ui components in the Notus app
- CrossLife / custom brand palette overrides
- Sliding auth panel from main `frontend/`
- Flat ERP density from `DESIGN_SYSTEM.md` (that applies to `frontend/` only)
- Replacing Font Awesome with Lucide in shell components

---

## Suggested build order (sprints)

| Sprint | Phases | Demo milestone |
|--------|--------|----------------|
| 1 | N0, N1 | “Looks exactly like Notus” shell |
| 2 | N2, N3 | Login + full sidebar |
| 3 | N4 | Live dashboards |
| 4 | N5 | Fundraising complete |
| 5 | N6 | Finance + expenses |
| 6 | N7, N8 | Accounting + reports |
| 7 | N9, N10 | Admin + verticals |
| 8 | N11, N12 | Platform + polish |

---

## Current status

| Phase | Status | Notes |
|-------|--------|-------|
| N0 | ✅ Complete | Pure Notus theme, FA icons, layouts, chart cards, `/dev/notus-reference` |
| N1 | ✅ Complete | `(app)` route group, auth guards, shared API, live/mock |
| N2 | 🔶 Partial | Login + register (Notus markup); org setup placeholder |
| N3 | ✅ Complete | Full sidebar mirroring main `navigation.ts` with role/org-type filter |
| N4 | 🔶 Partial | Three dashboards with live KPIs + Notus charts |
| N5 | ✅ Complete | Donors/campaigns/donations full CRUD — lists, detail, create/edit forms, receipt preview |
| N6–N12 | 🔶 Scaffolded | All routes exist; module pages use `ModulePlaceholder` |

---

## Reference links

- Template demo: https://themewagon.github.io/Notus-Next.js/
- Local reference: `Notus-Next.js-1.0.0/`
- Main ERP (separate design track): `frontend/`
