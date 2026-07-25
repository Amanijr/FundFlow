# Phase 03 — Layout Specification

**Date:** 2026-06-30  
**Design reference:** docs/frontend/phase-01/DESIGN_SYSTEM.md

---

## 1. Shell Diagram

```
+------------------------------------------------------------------+
| TenantContextBanner (SUPER_ADMIN only)                              |
+----------+--------------------------------------------------------+
| Sidebar  | Header (h-12 sticky)                                   |
| w-60     | [Menu] | Search | Theme | Notifications | User        |
|          +--------------------------------------------------------+
|          | ContentContainer (p-4 lg:p-6)                          |
|          |   PageHeader: Breadcrumbs, Title, Actions              |
|          |   Feature content                                      |
|          +--------------------------------------------------------+
|          | Footer (version, env, copyright)                       |
+----------+--------------------------------------------------------+
```

---

## 2. AppLayout (AppShell)

| Property | Value |
|----------|-------|
| File | components/layout/app-shell.tsx |
| Layout | flex min-h-screen bg-stone-50 |
| Rules | No API calls; memoize command actions |

---

## 3. Sidebar

| Property | Value |
|----------|-------|
| File | components/layout/sidebar.tsx |
| Desktop | hidden lg:flex, sticky, h-screen |
| Width | w-60 expanded, w-[3.25rem] collapsed |
| Style | bg-white border-r border-stone-200 |
| State | sidebar-store (persist collapsed) |

Sections: brand header (h-12), SidebarNav, user footer.

---

## 4. SidebarNav / SidebarItem / SidebarGroup

| Property | Value |
|----------|-------|
| File | components/layout/sidebar-nav.tsx |
| Data | useNavigation() filtered groups |
| Active | Material stone gradient |
| Inactive | text-stone-700 hover:bg-stone-100 |
| Group label | text-xs uppercase text-stone-500 |

Target refactor: extract SidebarGroup and SidebarItem components.

Nested menus: future — extend NavItem with optional children.

---

## 5. Header (TopNavigation)

| Property | Value |
|----------|-------|
| File | components/layout/top-navigation.tsx |
| Height | h-12, sticky z-40 |
| Style | bg-white border-b border-stone-200 |

### Zones

| Zone | Current | Target |
|------|---------|--------|
| Left | Mobile menu, org name | + breadcrumbs on desktop |
| Center | — | SearchBar opens CommandPalette |
| Right | Search mobile, theme, avatar | + notifications, expanded user menu |

---

## 6. PageHeader

| Property | Value |
|----------|-------|
| File | components/layout/page-header.tsx |
| Title | text-xl font-bold font-heading |
| Description | text-xs text-muted-foreground |
| Actions | Optional right slot |

---

## 7. ContentContainer

| Property | Value |
|----------|-------|
| File | components/layout/content-container.tsx |
| Padding | px-4 py-4 sm:px-5 lg:px-6 |
| Animation | content-reveal on pathname change |

---

## 8. Breadcrumb

| Property | Value |
|----------|-------|
| File | components/layout/breadcrumbs.tsx |
| Rule | Pass items from page or route builder — never hardcode in shell |
| Target | lib/navigation/breadcrumbs.ts helper |

---

## 9. SearchBar (target)

Placeholder input in header; click opens CommandPalette. Cmd/Ctrl+K global.

---

## 10. NotificationDropdown (target)

Bell + badge; popover with placeholder categories (donations, budgets, expenses, users).

---

## 11. OrganizationSwitcher

| User | Behavior |
|------|----------|
| Regular | OrgBadge read-only from useOrganization() |
| SUPER_ADMIN | TenantSwitcher on platform routes only |

---

## 12. UserMenu

Avatar dropdown. Current: Sign out. Target: Profile, Preferences, Appearance, Security, Logout.

---

## 13. Footer (target)

Minimal: version, environment badge, copyright. border-t border-stone-200 py-3.

---

## 14. MobileSidebar

Sheet from left, min(18rem, 88vw), closes on navigate. Trigger below lg.

---

## 15. Spacing & Z-Index

Content padding p-4 lg:p-6. Header h-12. Sidebar z-10, header z-40, overlays z-50.

---

## 16. Implementation Priority

P0: Footer, Header consolidation with SearchBar placeholder  
P1: SidebarItem/SidebarGroup extraction, buildBreadcrumbs helper  
P2: NotificationDropdown placeholder
