# Phase 00 — Migration Plan

**Date:** 2026-06-30  
**Objective:** Migrate FundFlow ERP frontend to the Material + shadcn visual design system while preserving all backend contracts, authentication, Zustand stores, routing, and business logic.

---

## 1. Migration Principles

1. **Visual-only migration** — Change appearance, not behavior.
2. **ERP is the runtime** — Template is a design reference, never deployed alongside ERP.
3. **Incremental phases** — Each phase is independently deployable and testable.
4. **Preserve contracts** — API paths, auth flow, store schemas, and RBAC are immutable.
5. **Expand, don't replace** — Add template primitives to ERP's `components/ui/`; don't delete ERP composites.
6. **Token-first** — Establish design tokens before touching components.

---

## 2. Classification Framework

Every item in the migration is classified as:

| Class | Definition | Example |
|-------|-----------|---------|
| **Reuse** | Keep as-is; may receive minor className updates | `auth-store`, `AuthGuard`, `DataTable` logic |
| **Replace** | Swap visual implementation; preserve props/API | `Button` styling, `Sidebar` appearance |
| **Refactor** | Merge ERP logic with template patterns | `ConfirmDialog` → shadcn `AlertDialog` |
| **Delete** | Remove template-only artifacts not needed | Template `ui/sidebar.tsx`, `wouter` dep |
| **Create** | Build new using template as reference | `grain-texture` utility, `MiniChart` |
| **Adopt** | Import template primitive not yet in ERP | `Select`, `Tabs`, `Chart`, `Skeleton` |

---

## 3. Phase Breakdown

### Phase 01 — Design Tokens & Foundation

**Goal:** Establish a single source of truth for colors, typography, spacing, and radius.

| Task | Class | Detail |
|------|-------|--------|
| Map template CSS variables to ERP `globals.css` | Replace | Port `--primary`, `--radius`, `--sidebar-*` values |
| Convert tokens to Tailwind 4 `@theme` syntax | Refactor | ERP uses Tailwind 4; template uses v3 config |
| Define Material stone palette as semantic tokens | Create | `--stone-50` through `--stone-900` as CSS vars |
| Add `--chart-1` through `--chart-5` variables | Create | Fix undefined chart token references |
| Load brand fonts per `CROSSLIFE_BRAND.md` | Refactor | Roboto, Lato, Montserrat (ERP) over Inter (template) |
| Add `tailwindcss-animate` plugin | Adopt | Required for dialog/dropdown animations |
| Add `grain-texture` utility class | Create | Port from template `index.css` |
| Verify dark mode token pairs | Refactor | Ensure all tokens have `.dark` counterparts |

**Files touched:**
- `frontend/src/app/globals.css`
- `frontend/tailwind.config.ts` (or CSS `@theme` block)
- `frontend/package.json` (add `tailwindcss-animate`)

**Do not touch:** Any component files, stores, API, routes.

**Verification:** Storybook or `/dev/components` page renders token swatches in light and dark mode.

---

### Phase 02 — UI Primitives (P0)

**Goal:** Replace core shadcn primitives with Material-styled versions.

| Component | Class | Source | Notes |
|-----------|-------|--------|-------|
| Button | Replace | `template/ui/button.tsx` | Material gradient default; keep ERP variant names |
| Card | Replace | `template/ui/card.tsx` | Stone border, template padding |
| Input | Replace | `template/ui/input.tsx` | h-10, ring focus |
| Label | Replace | `template/ui/label.tsx` | Minor alignment |
| Badge | Replace | `template/ui/badge.tsx` | Material chip style |
| Separator | Replace | `template/ui/separator.tsx` | Template divider |
| Dialog | Replace | `template/ui/dialog.tsx` | Fade/zoom animations |
| Table | Replace | `template/ui/table.tsx` | Material table base styles |
| Checkbox | Replace | `template/ui/checkbox.tsx` | Template checkbox |

**Approach:**
1. Copy template component into ERP `components/ui/`.
2. Adjust imports (`@/lib/utils` already exists in both).
3. Preserve any ERP-specific variant names or props.
4. Run lint; verify no type errors.

**Do not touch:** Composite components, stores, API, routes.

---

### Phase 03 — UI Primitives (P1 — Adopt Missing)

**Goal:** Add template primitives that ERP lacks.

| Component | Class | Priority |
|-----------|-------|----------|
| Select | Adopt | High — used in forms |
| Tabs | Adopt | High — accounting, reports nav |
| Form | Adopt | High — align with React Hook Form |
| Calendar | Adopt | High — date inputs |
| Popover | Adopt | Medium — already exists, restyle |
| Alert | Adopt | Medium — replace custom alerts |
| AlertDialog | Adopt | Medium — replace ConfirmDialog |
| Skeleton | Adopt | Medium — page loading states |
| Tooltip | Adopt | Medium — icon buttons |
| Progress | Adopt | Medium — campaign/budget bars |
| Switch | Adopt | Low — settings |
| Textarea | Adopt | Low — long-form fields |
| Scroll Area | Adopt | Low — sidebar overflow |
| Pagination | Adopt | Low — DataTable enhancement |
| Chart | Adopt | Medium — ChartContainer wrapper |
| Accordion | Adopt | Low |
| Collapsible | Adopt | Low |
| Slider | Adopt | Low |
| Toggle / Toggle Group | Adopt | Low |
| Radio Group | Adopt | Low |
| Hover Card | Adopt | Low |
| Context Menu | Adopt | Low |
| Drawer | Adopt | Low |

**Approach:** Copy from template, install any missing `@radix-ui/*` deps, verify Tailwind 4 compatibility.

---

### Phase 04 — Layout Shell

**Goal:** Restyle the authenticated app chrome.

| Component | Class | Detail |
|-----------|-------|--------|
| AppShell | Refactor | Apply `bg-stone-50` shell, grain-texture overlay |
| Sidebar | Replace | Material gradient active nav, w-60, stone palette |
| SidebarNav | Reuse | Keep `navigationGroups` config and RBAC filtering |
| MobileSidebar | Replace | Template slide-in transform pattern |
| TopNavigation | Refactor | Restyle header; keep theme toggle, logout, command palette |
| PageHeader | Refactor | Template title block: `text-xl font-semibold` + description |
| ContentContainer | Refactor | Padding `p-3 lg:p-6` |
| Breadcrumbs | Refactor | Optional: migrate to shadcn Breadcrumb |

**Critical constraint:** `sidebar-store` (collapsed, mobileOpen) and `useNavigation()` hook remain unchanged. Only JSX and className change.

**Files touched:**
- `frontend/src/components/layout/app-shell.tsx`
- `frontend/src/components/layout/sidebar.tsx`
- `frontend/src/components/layout/sidebar-nav.tsx`
- `frontend/src/components/layout/mobile-sidebar.tsx`
- `frontend/src/components/layout/top-navigation.tsx`
- `frontend/src/components/layout/page-header.tsx`
- `frontend/src/components/layout/content-container.tsx`

---

### Phase 05 — Data Display & Tables

**Goal:** Restyle data presentation components.

| Component | Class | Detail |
|-----------|-------|--------|
| DataTable | Refactor | Keep TanStack Table logic; apply Material table styles |
| FilterBar | Refactor | Restyle with new Input, Select, Button primitives |
| EmptyState | Refactor | Template typography and spacing |
| DetailCard | Refactor | Material card wrapper |
| EntityHeader | Refactor | Template page title pattern |
| StatusBadge | Refactor | Map to new Badge variants |
| MetricCard | Refactor | Adopt stats-grid layout pattern |
| KPIWidget | Refactor | Integrate MiniChart sparkline pattern |
| TrendChart | Refactor | Wrap with ChartContainer |
| RecentActivityFeed | Refactor | Restyle list items |

---

### Phase 06 — Forms & Feedback

**Goal:** Align form and feedback patterns with template.

| Component | Class | Detail |
|-----------|-------|--------|
| FormField | Refactor | Integrate shadcn Form component |
| FormSection | Refactor | Restyle section headers |
| DateInput | Refactor | Calendar + Popover from template |
| CurrencyInput | Reuse | Restyle wrapper only |
| EntitySelector | Reuse | Restyle dropdown |
| FileUploader | Reuse | Restyle drop zone |
| ErrorAlert / SuccessAlert / WarningAlert | Refactor | Migrate to shadcn Alert |
| ConfirmDialog | Refactor | Migrate to shadcn AlertDialog |
| PageSkeleton | Refactor | Use shadcn Skeleton |
| LoadingState | Reuse | Restyle colors |

---

### Phase 07 — Auth Pages

**Goal:** Material-styled login and registration.

| Component | Class | Detail |
|-----------|-------|--------|
| LoginForm | Replace | Template sign-in layout and styling |
| RegisterForm | Replace | Template sign-up layout and styling |
| AuthSlider | Refactor | Restyle slider panel to match |
| Auth layout `(auth)/layout.tsx` | Refactor | Standalone layout like template auth pages |

**Critical constraint:** `LoginForm` and `RegisterForm` must continue calling the same API functions (`auth.ts`) and `setSession()` from `auth-store`. Only JSX/CSS changes.

---

### Phase 08 — Domain Module Restyle

**Goal:** Page-by-page visual refresh of business modules.

| Module | Pages | Priority |
|--------|-------|----------|
| Dashboards | executive, finance, fundraising | High |
| Fundraising | donors, campaigns, donations | High |
| Finance | funds, budgets, expenses | High |
| Accounting | chart-of-accounts, journals, GL, trial-balance | Medium |
| Reporting | financial, donations, campaigns, budgets | Medium |
| Administration | users, settings, setup | Medium |
| Programs & verticals | programs, grants, beneficiaries, church, school | Low |
| Platform | dashboard, organizations, users, logs | Low |
| Dev showcase | components, reference-list, reference-form | Low |

**Approach per module:**
1. Update page-level layout wrappers (PageHeader, ContentContainer).
2. Restyle list pages (FilterBar + DataTable).
3. Restyle form pages (FormField, FormSection).
4. Restyle detail pages (DetailCard, EntityHeader).
5. Verify RBAC gates still render correctly.
6. Test with mock API enabled.

---

### Phase 09 — Platform Console

**Goal:** Restyle SUPER_ADMIN platform shell.

| Component | Class |
|-----------|-------|
| PlatformShell | Refactor |
| PlatformNav | Refactor |
| TenantSwitcher | Refactor |
| TenantContextBanner | Refactor |
| Platform dashboard pages | Refactor |

---

### Phase 10 — Polish & QA

| Task | Detail |
|------|--------|
| Dark mode audit | Verify all pages in `.dark` class |
| Accessibility audit | Keyboard nav, focus rings, ARIA, contrast |
| Responsive audit | Mobile sidebar, table overflow, form layouts |
| Animation audit | Sidebar slide, dialog transitions, reduced-motion |
| Performance check | No regression in bundle size from new primitives |
| Cross-browser test | Chrome, Firefox, Safari |
| Mock API full walkthrough | All modules with `NEXT_PUBLIC_MOCK_API=true` |
| Lint & type check | `npm run lint`, `npm run build` |

---

## 4. Dependency Changes

### Add to ERP `package.json`

| Package | Reason |
|---------|--------|
| `tailwindcss-animate` | Dialog, dropdown, accordion animations |
| `@radix-ui/react-select` | shadcn Select primitive |
| `@radix-ui/react-tabs` | shadcn Tabs primitive |
| `@radix-ui/react-progress` | Progress bars |
| `@radix-ui/react-switch` | Settings toggles |
| `@radix-ui/react-tooltip` | Tooltip primitive |
| `@radix-ui/react-scroll-area` | Sidebar scroll |
| `react-day-picker` | Calendar primitive |
| `vaul` | Drawer primitive |

### Do NOT add

| Package | Reason |
|---------|--------|
| `framer-motion` | Unused in template; CSS transitions sufficient |
| `react-icons` | ERP uses lucide-react exclusively |
| `wouter` | ERP uses Next.js routing |
| `express`, `drizzle-orm` | Backend deps; ERP has its own backend |

### Version alignment

| Package | ERP Current | Template | Action |
|---------|------------|----------|--------|
| lucide-react | ^1.21.0 | ^0.453.0 | Keep ERP version |
| recharts | ^3.9.0 | ^2.15.2 | Keep ERP version |
| react-hook-form | ^7.80.0 | ^7.55.0 | Keep ERP version |
| zod | ^4.4.3 | ^3.24.2 | Keep ERP version |
| tailwindcss | ^4 | ^3.4.17 | Keep ERP v4; port tokens |

---

## 5. Risk Mitigation Matrix

| Risk | Likelihood | Impact | Mitigation | Phase |
|------|-----------|--------|------------|-------|
| Tailwind 4 incompatibility with template classes | High | High | Test each primitive in isolation on `/dev/components` | 02 |
| CSS variable collision | Medium | Medium | Namespace audit before merging tokens | 01 |
| Breaking DataTable after Table restyle | Medium | High | DataTable tests with mock data before/after | 05 |
| Auth page regression | Low | Critical | Manual login/logout/register test after Phase 07 | 07 |
| Dark mode gaps | Medium | Medium | Token pairs defined in Phase 01; audit in Phase 10 | 01, 10 |
| Bundle size increase | Medium | Low | Tree-shake unused template primitives; adopt incrementally | 03 |
| RBAC visual regression | Low | High | PermissionGate components unchanged; visual-only | 08 |
| Sidebar RBAC nav break | Low | Critical | SidebarNav logic untouched; only wrapper styling | 04 |

---

## 6. Rollback Strategy

Each phase is a discrete set of file changes:

1. **Per-phase git branch** — `feat/phase-0N-<name>` branched from previous phase.
2. **Per-phase PR** — Reviewable, revertible unit of work.
3. **Component-level rollback** — Primitives are independent; a broken Button doesn't block DataTable.
4. **Token rollback** — Phase 01 changes are CSS-only; revert `globals.css` to restore previous theme.

---

## 7. Testing Strategy

| Level | Method | When |
|-------|--------|------|
| Primitive | `/dev/components` showcase page | Phases 02–03 |
| Layout | Visual comparison against template demo | Phase 04 |
| Integration | Mock API walkthrough per module | Phases 05–08 |
| Auth | Login → dashboard → logout flow | Phase 07 |
| RBAC | Test each role's nav + guards | Phase 08 |
| Regression | `npm run build` must pass | Every phase |
| Accessibility | axe-core or manual keyboard audit | Phase 10 |

---

## 8. Timeline Estimate

| Phase | Effort | Dependencies |
|-------|--------|-------------|
| 01 — Tokens | 1–2 days | None |
| 02 — P0 Primitives | 2–3 days | Phase 01 |
| 03 — P1 Primitives | 3–4 days | Phase 01 |
| 04 — Layout Shell | 2–3 days | Phases 02–03 |
| 05 — Data Display | 2–3 days | Phases 02–04 |
| 06 — Forms & Feedback | 2–3 days | Phases 02–03 |
| 07 — Auth Pages | 1–2 days | Phases 02, 04 |
| 08 — Domain Modules | 5–8 days | Phases 04–06 |
| 09 — Platform Console | 1–2 days | Phase 04 |
| 10 — Polish & QA | 2–3 days | All |

**Total estimate:** 21–33 days

---

## 9. Success Criteria

- [ ] All ERP routes render correctly with Material design styling
- [ ] Login, register, logout flow works unchanged
- [ ] All 18 API modules fetch data correctly
- [ ] Zustand stores persist and hydrate without changes
- [ ] RBAC guards and permission gates function identically
- [ ] Dark mode works across all pages
- [ ] `npm run build` passes with zero errors
- [ ] No backend or API contract changes
- [ ] Component inventory actions completed per `COMPONENT_INVENTORY.md`
- [ ] Accessibility: keyboard navigation and focus rings on all interactive elements

---

## 10. Out of Scope

- Backend API changes
- New business features or modules
- Database schema changes
- Authentication mechanism changes (JWT, localStorage)
- Zustand store schema changes
- Next.js middleware implementation
- Token refresh implementation
- Template Express backend integration
- Template database (Drizzle/PostgreSQL) integration
