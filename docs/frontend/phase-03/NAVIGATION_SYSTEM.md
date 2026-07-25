# Phase 03 — Navigation System

**Date:** 2026-06-30  
**Config:** frontend/src/lib/navigation/navigation.ts  
**RBAC:** frontend/src/lib/navigation/permissions.ts

---

## 1. Architecture

```
navigationGroups (static config)
        ↓
useNavigation() — filter by role + org type
        ↓
SidebarNav — render groups + items
        ↓
CommandPalette — buildCommandActions() parallel registry
```

Navigation config is platform-owned (lib/navigation/). Features do not own nav metadata.

---

## 2. Target Navigation Hierarchy (Phase 03 Spec)

Mapped to current ERP routes. Items marked (future) have no route yet.

### Main
| Item | Route | Status |
|------|-------|--------|
| Dashboard | /dashboard/executive, /finance, /fundraising | Implemented (role-based) |

### Financial Management
| Item | Route | Status |
|------|-------|--------|
| Chart of Accounts | /accounting/chart-of-accounts | Implemented |
| Funds | /funds | Implemented |
| Budgets | /budgets | Implemented |
| Journal Entries | /accounting/journal-entries | Implemented |
| General Ledger | /accounting/general-ledger | Implemented |

### Donations
| Item | Route | Status |
|------|-------|--------|
| Donors | /donors | Implemented |
| Donations | /donations | Implemented |
| Campaigns | /campaigns | Implemented |
| Receipts | — | Future |

### Operations
| Item | Route | Status |
|------|-------|--------|
| Expenses | /expenses | Implemented |
| Approvals | — | Future (workflow views) |
| Procurement | — | Future |

### Reports
| Item | Route | Status |
|------|-------|--------|
| Financial Reports | /reports/financial | Implemented |
| Analytics | /reports, /dashboard/* | Implemented |
| Audit Logs | /platform/dashboard/logs | Platform only |

### Administration
| Item | Route | Status |
|------|-------|--------|
| Users | /admin/users | Implemented |
| Roles | — | Future (RBAC UI) |
| Organizations | /platform/dashboard/organizations | Platform only |
| Settings | /admin/settings | Implemented |

### Current groups not in Phase 03 spec (retain)
- Programs, Grants, Beneficiaries (org-type gated)
- Church ministries, Attendance, School sponsorships
- Developer showcase (/dev/*)

---

## 3. Current navigationGroups

| Group ID | Label | Items |
|----------|-------|-------|
| dashboard | Dashboard | Executive, Finance, Fundraising |
| fundraising | Fundraising | Donors, Campaigns, Donations |
| finance | Finance | Funds, Budgets, Expenses, Accounting |
| reporting | Reporting | Reports hub |
| programs | Programs | Programs, Grants, Beneficiaries |
| verticals | Verticals | Ministries, Attendance, Sponsorships |
| administration | Administration | Users, Settings |
| developer | Developer | Components, Reference list/form |

---

## 4. RBAC Filtering

useNavigation() applies:
1. canAccessNavItem(role, orgType, item) per item
2. Empty groups are omitted

Route guards (separate layer):
- AuthGuard — authenticated
- AdminGuard — /admin/*
- DashboardGuard — per-dashboard role
- PermissionGate — action-level UI

Nav filtering is not route blocking — deep URLs may still be accessed.

---

## 5. Active State Rules

Active when pathname === href OR pathname.startsWith(href + '/').

Dashboard items use exact role-specific paths. Accounting entry uses /accounting/chart-of-accounts as hub.

---

## 6. Sidebar Behaviour Requirements

| Requirement | Implementation |
|-------------|----------------|
| Expand/collapse | sidebar-store.toggleCollapsed, persisted |
| Nested menus | Not yet — flat groups |
| Active state | Stone gradient on active link |
| Keyboard nav | Native link focus; target: roving tabindex |
| Mobile drawer | MobileSidebar sheet |
| Remember state | collapsed in localStorage fundflow-sidebar |

---

## 7. Breadcrumb System

### Rules
1. Reflect routing hierarchy — never hardcode in shell
2. Last item is current page (not a link)
3. Pass BreadcrumbItem[] to PageHeader from page or helper

### Example: Journal entry create
```
Dashboard → Accounting → Journal Entries → Create Entry
```

### Target helper
```ts
// lib/navigation/breadcrumbs.ts
buildBreadcrumbs(pathname: string): BreadcrumbItem[]
```

Route segment map maintained alongside navigation config.

---

## 8. Global Search (Command Palette)

| Trigger | Cmd/Ctrl+K, mobile search icon, future SearchBar |
| Data | command-actions.ts — mirrors nav + quick actions |
| Future | API search for donors, users, campaigns |

Phase 03: UI architecture ready; entity search deferred.

---

## 9. Command Actions Registry

buildCommandActions(role, orgType) returns CommandAction[] grouped by module.

Keep in sync with navigationGroups when adding routes.

---

## 10. Platform Navigation

Separate: platform-nav.tsx under /platform/dashboard/*.

Do not merge into tenant sidebar.

---

## 11. Adding a New Nav Item

1. Add route in app/(app)/
2. Add NavItem to navigationGroups with roles (+ organizationTypes if vertical)
3. Add command action in command-actions.ts
4. Add breadcrumb segment map entry
5. Add permissions if route-level guard needed

No sidebar code changes required.
