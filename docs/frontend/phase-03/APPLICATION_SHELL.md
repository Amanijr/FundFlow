# Phase 03 — Enterprise Application Shell

**Date:** 2026-06-30  
**Status:** Approved (documentation)  
**Dependencies:** Phase 00, Phase 01, Phase 02  
**Scope:** Layout framework only — no business modules, routing, or backend changes

---

## 1. Executive Summary

The Application Shell is the permanent structural framework of FundFlow ERP. Every authenticated tenant page renders inside a single shell that provides navigation, spacing, global services, and responsive behavior.

Features plug content into the shell — they never recreate navigation or layout chrome.

---

## 2. Shell Responsibilities

| Responsibility | Owner | Status |
|----------------|-------|--------|
| Primary navigation | Sidebar + SidebarNav | Implemented |
| Mobile navigation | MobileSidebar | Implemented |
| Top chrome | TopNavigation → Header | Partial |
| Page structure | PageHeader + ContentContainer | Implemented |
| Global search | CommandPalette (Cmd+K) | Implemented |
| Theme toggle | TopNavigation | Implemented |
| User menu | TopNavigation dropdown | Partial |
| Organization display | useOrganization | Read-only |
| SUPER_ADMIN tenant | TenantSwitcher + banner | Platform only |
| Notifications | — | Planned |
| Footer | — | Planned |

---

## 3. Layout Hierarchy

RootLayout → AppProviders → (app)/layout → AuthGuard → AppShell

- Sidebar (desktop)
- MobileSidebar (drawer)
- Main column: TenantContextBanner, Header, main/ContentContainer, Footer (target)
- CommandPalette (portal)

Current: components/layout/app-shell.tsx; auth-guard.tsx wraps shell.

---

## 4. Single Layout Principle

Every authenticated route uses AuthGuard → AppShell → children.

Forbidden: feature-specific layouts with their own sidebar/header.

Exception: PlatformShell for /platform/dashboard/*.

---

## 5. Separation of Concerns

Shell arranges chrome only — no business API calls. Navigation config defines routes/RBAC. Page layout handles title/breadcrumbs. Features own business UI.

---

## 6. Visual Design

Material + shadcn template: bg-stone-50, white sidebar w-60, stone gradient active nav. See docs/frontend/phase-01/DESIGN_SYSTEM.md.

---

## 7. Page Integration Contract

Pages use PageHeader + feature content. ContentContainer is applied by AppShell.

---

## 8. Related Documents

- LAYOUT_SPECIFICATION.md
- NAVIGATION_SYSTEM.md
- RESPONSIVE_LAYOUTS.md
- COMPONENT_HIERARCHY.md

---

## 9. Definition of Done

New modules require only PageHeader + feature content inside the existing shell.
