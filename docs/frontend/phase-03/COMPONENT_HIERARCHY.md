# Phase 03 — Component Hierarchy

**Date:** 2026-06-30

---

## 1. Component Tree

```
AppProviders
└── AuthGuard
    └── AppShell (AppLayout)
        ├── Sidebar
        │   ├── SidebarBrand
        │   ├── SidebarCollapseToggle
        │   └── SidebarNav
        │       └── SidebarGroup[]
        │           └── SidebarItem[]
        ├── MobileSidebar
        │   ├── Sheet
        │   └── SidebarNav
        ├── MainColumn
        │   ├── TenantContextBanner (conditional)
        │   ├── Header
        │   │   ├── HeaderLeft (MobileMenu, Breadcrumbs)
        │   │   ├── SearchBar
        │   │   └── HeaderRight
        │   │       ├── NotificationDropdown
        │   │       ├── OrgBadge
        │   │       └── UserMenu
        │   ├── main
        │   │   └── ContentContainer
        │   │       └── [Page Content]
        │   │           ├── PageHeader
        │   │           │   ├── Breadcrumbs
        │   │           │   ├── PageTitle
        │   │           │   └── PageActions
        │   │           └── FeatureComponents
        │   └── Footer
        └── CommandPalette
```

---

## 2. Current vs Target File Map

| Target | Current path | Status |
|--------|--------------|--------|
| AppLayout | layout/app-shell.tsx | Exists |
| Sidebar | layout/sidebar.tsx | Exists |
| SidebarNav | layout/sidebar-nav.tsx | Exists |
| SidebarItem | inline in sidebar-nav | Extract |
| SidebarGroup | inline in sidebar-nav | Extract |
| Header | layout/top-navigation.tsx | Rename/extend |
| Footer | — | Create |
| PageLayout | pattern only | Optional wrapper |
| PageHeader | layout/page-header.tsx | Exists |
| ContentContainer | layout/content-container.tsx | Exists |
| Breadcrumb | layout/breadcrumbs.tsx | Exists |
| SearchBar | navigation/command-palette.tsx | Partial |
| NotificationDropdown | — | Create |
| OrganizationSwitcher | platform/tenant-switcher.tsx | Platform only |
| OrgBadge | — | Create |
| UserMenu | inline in top-navigation | Extract |
| MobileSidebar | layout/mobile-sidebar.tsx | Exists |

---

## 3. Target Folder Structure

```
components/layout/
├── app-shell.tsx              # AppLayout
├── sidebar/
│   ├── sidebar.tsx
│   ├── sidebar-nav.tsx
│   ├── sidebar-group.tsx
│   └── sidebar-item.tsx
├── header/
│   ├── header.tsx
│   ├── header-left.tsx
│   ├── header-right.tsx
│   ├── search-bar.tsx
│   ├── user-menu.tsx
│   └── org-badge.tsx
├── footer/
│   └── footer.tsx
├── breadcrumb/
│   └── breadcrumbs.tsx        # move from layout/
├── page/
│   ├── page-header.tsx
│   ├── page-layout.tsx
│   ├── section-header.tsx
│   └── content-container.tsx
├── mobile-sidebar.tsx
└── index.ts                   # barrel exports
```

Migration: incremental — re-export from old paths until imports updated.

---

## 4. External Dependencies (allowed in shell)

| Import | Purpose |
|--------|---------|
| @/hooks/use-auth | Display user, guard context |
| @/hooks/use-navigation | Filtered nav groups |
| @/hooks/use-organization | Org name display |
| @/stores/sidebar-store | Collapse/mobile state |
| @/lib/navigation/* | Config only |
| @/components/ui/* | Primitives |
| lucide-react | Icons |

Forbidden in shell: @/lib/api/*, feature hooks, TanStack Query for domain data.

---

## 5. Props Contracts

### AppShell
```ts
interface AppShellProps { children: React.ReactNode }
```

### PageHeader
```ts
interface PageHeaderProps {
  title: string
  description?: string
  breadcrumbs?: BreadcrumbItem[]
  action?: React.ReactNode
}
```

### BreadcrumbItem
```ts
interface BreadcrumbItem { label: string; href?: string }
```

### SidebarItem (target)
```ts
interface SidebarItemProps {
  href: string
  label: string
  icon: LucideIcon
  active?: boolean
  collapsed?: boolean
}
```

---

## 6. Accessibility Landmarks

```html
<div> <!-- AppShell -->
  <aside aria-label="Main navigation">Sidebar</aside>
  <div>
    <header>...</header>
    <main id="main-content">...</main>
    <footer>...</footer>
  </div>
</div>
```

Skip link (target): first focusable element in AppShell
```html
<a href="#main-content" class="sr-only focus:not-sr-only">Skip to content</a>
```

---

## 7. Shell Must Not Import

- Feature pages or components
- Domain API modules
- Feature-specific stores
- Business schemas/types

---

## 8. Platform Shell Hierarchy (separate)

```
PlatformAuthGuard
└── PlatformShell
    ├── PlatformNav
    ├── PlatformTopNavigation
    └── ContentContainer
```

Shares: ui primitives, design tokens, ContentContainer pattern.

---

## 9. Export Barrel (target)

```ts
// components/layout/index.ts
export { AppShell } from "./app-shell"
export { PageHeader } from "./page/page-header"
export { ContentContainer } from "./page/content-container"
export { Breadcrumbs } from "./breadcrumb/breadcrumbs"
export type { BreadcrumbItem } from "./breadcrumb/breadcrumbs"
```

Features import layout primitives from @/components/layout only.

---

## 10. Quality Checklist

- [x] Hierarchy documented
- [x] Current vs target file map
- [x] Folder structure defined
- [x] Props contracts specified
- [x] ARIA landmarks defined
- [x] Import boundaries enforced
- [ ] Skip link implemented
- [ ] Footer implemented
- [ ] Header zones consolidated
