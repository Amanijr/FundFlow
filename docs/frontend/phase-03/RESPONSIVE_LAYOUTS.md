# Phase 03 — Responsive Layouts

**Date:** 2026-06-30  
**Framework:** Tailwind CSS 4 breakpoints

---

## 1. Breakpoint Strategy

| Breakpoint | Tailwind | Shell behavior |
|------------|----------|----------------|
| Mobile | default – sm (<640px) | Drawer nav, compact header, full-width content |
| Tablet | sm – lg (640–1023px) | Drawer nav, optional collapsed sidebar hidden |
| Laptop | lg – xl (1024–1279px) | Sidebar visible, collapsible |
| Desktop | xl+ (≥1280px) | Sidebar expanded default, fluid content |

Primary breakpoint for sidebar visibility: lg (1024px).

---

## 2. Desktop (≥1024px)

```
+----------+--------------------------------+
| Sidebar  | Header (sticky)                |
| w-60     +--------------------------------+
| fixed    | Content (fluid)                |
| height   |                                |
+----------+--------------------------------+
```

- Sidebar: sticky, full viewport height
- Collapse toggle reduces to icon-only w-[3.25rem]
- Header: all zones visible
- Content: p-4 lg:p-6
- Command palette: centered dialog

---

## 3. Laptop (1024px, collapsed preference)

- User may collapse sidebar to icon rail
- Persisted via sidebar-store
- Content gains horizontal space
- Nav labels hidden; icons only with title tooltip

---

## 4. Tablet (640–1023px)

- Sidebar hidden (lg:flex not active)
- Hamburger in header opens MobileSidebar sheet
- Sheet overlays content (z-50)
- Backdrop click closes drawer
- Content padding: px-4 py-4

---

## 5. Mobile (<640px)

```
+---------------------------+
| [≡] Workspace    [🔍][👤] |
+---------------------------+
|                           |
|   Page content            |
|   (full width)            |
|                           |
+---------------------------+
```

- Sticky header h-12
- Mobile menu button required
- Search via header icon (not inline SearchBar)
- PageHeader stacks: title above actions
- DataTable: horizontal scroll within container
- Floating actions: use sticky bottom bars in features (not shell)

---

## 6. Component Responsive Rules

### Sidebar
| Viewport | Behavior |
|----------|----------|
| ≥lg | Fixed column, collapse supported |
| <lg | display:none; use MobileSidebar |

### Header
| Viewport | Left | Center | Right |
|----------|------|--------|-------|
| ≥md | Menu hidden | SearchBar visible | Full actions |
| <md | Menu visible | Hidden | Icons only |

### PageHeader
| Viewport | Layout |
|----------|--------|
| ≥sm | flex-row, actions right |
| <sm | flex-col, actions below title |

### ContentContainer
| Viewport | Padding |
|----------|---------|
| default | px-4 py-4 |
| sm | px-5 |
| lg | px-6 |

---

## 7. Touch Targets

Minimum interactive size: 44×44px on mobile (h-11 w-11 or padding).

Shell controls: header buttons h-8 w-8 minimum; increase to h-10 on mobile if audit fails.

---

## 8. Overflow Handling

| Element | Strategy |
|---------|----------|
| Sidebar nav | overflow-y-auto scrollbar-thin |
| Main content | overflow-auto on main |
| Header | truncate workspace label |
| Breadcrumbs | flex-wrap on narrow screens |
| Tables | Feature-level horizontal scroll |

---

## 9. Print (future)

Shell sidebar and header hidden via @media print. Content full width.

---

## 10. Testing Matrix

| Scenario | Verify |
|----------|--------|
| iPhone SE (375px) | Drawer opens/closes, content readable |
| iPad (768px) | Drawer only, no desktop sidebar |
| Laptop (1280px) | Sidebar expanded, collapse works |
| Ultra-wide (1920px) | Content fluid, no max-width lock |
| Rotate portrait/landscape | Drawer state preserved |
| Keyboard open (mobile) | Header stays visible |

---

## 11. Animation & Motion

| Transition | Duration |
|------------|----------|
| Sidebar width | 300ms ease-in-out |
| Mobile drawer | Sheet slide (Radix) |
| Content reveal | 350ms on route change |

Respect prefers-reduced-motion (globals.css).

---

## 12. TenantContextBanner

Full-width above header on all breakpoints when SUPER_ADMIN impersonating tenant.

Stack order: Banner → Header → Content (never inside sidebar).
