# Phase 04 — Responsive Breakpoints

**Date:** 2026-06-30  
**Framework:** Tailwind CSS 4  
**Consumer:** Application shell, layout primitives, feature pages

---

## 1. Breakpoint Tokens

Tailwind default breakpoints are the FundFlow standard. No custom breakpoints without design review.

| Token | Min width | Tailwind prefix | Device category |
|-------|-----------|-----------------|-----------------|
| `breakpoint-mobile` | 0 | (default) | Phones |
| `breakpoint-sm` | 640px | `sm:` | Large phones, small tablets |
| `breakpoint-md` | 768px | `md:` | Tablets |
| `breakpoint-lg` | 1024px | `lg:` | Laptops — **sidebar threshold** |
| `breakpoint-xl` | 1280px | `xl:` | Desktops |
| `breakpoint-2xl` | 1536px | `2xl:` | Wide desktops |

### Named device mapping

| Category | Range | Shell behaviour |
|----------|-------|-----------------|
| Mobile | < 640px | Drawer nav, compact header, icon-only actions |
| Tablet | 640px – 1023px | Drawer nav, SearchBar hidden (icon trigger) |
| Laptop | 1024px – 1279px | Sidebar visible, collapsible |
| Desktop | 1280px – 1535px | Sidebar expanded default, full header |
| Wide desktop | ≥ 1536px | Fluid content, max-width optional in features |

**Primary shell breakpoint:** `lg` (1024px) — sidebar visibility toggles here.

---

## 2. Shell Responsive Behaviour

Aligned with Phase 03 [RESPONSIVE_LAYOUTS.md](../phase-03/RESPONSIVE_LAYOUTS.md).

### Mobile (< 640px)

```
+---------------------------+
| [≡] Workspace    [🔍][👤] |
+---------------------------+
|   Page content            |
+---------------------------+
| Footer                    |
+---------------------------+
```

| Element | Behaviour |
|---------|-----------|
| Sidebar | Hidden — `MobileSidebar` drawer |
| Header | `h-12`, hamburger visible |
| SearchBar | Hidden — `MobileSearchButton` |
| Breadcrumbs | Hidden — workspace label shown |
| Content padding | `px-4 py-4` |
| PageHeader | Stacks title above actions |

### Tablet (640px – 1023px)

| Element | Behaviour |
|---------|-----------|
| Sidebar | Hidden (`lg:hidden` / drawer) |
| SearchBar | Hidden below `md` — visible `md:flex` in header |
| Content padding | `px-4 sm:px-5` |
| DataTable | Horizontal scroll in container |

### Laptop (≥ 1024px)

| Element | Behaviour |
|---------|-----------|
| Sidebar | `lg:flex`, `w-60` or collapsed `w-[3.25rem]` |
| Header | Full zones — breadcrumbs, search, actions |
| Content padding | `lg:px-6` |
| Collapse state | Persisted in `sidebar-store` |

### Desktop / Wide (≥ 1280px)

| Element | Behaviour |
|---------|-----------|
| Sidebar | Expanded by default |
| Content | Fluid — features may use `max-w-*` internally |
| SearchBar | `max-w-md` centered in header |

---

## 3. Layout Token Reference

| Property | Mobile | Tablet | Laptop+ |
|----------|--------|--------|---------|
| Sidebar width | — (drawer) | — | `w-60` / `w-[3.25rem]` |
| Header height | `h-12` | `h-12` | `h-12` |
| Content padding X | `px-4` | `px-5` | `px-6` |
| Content padding Y | `py-4` | `py-4` | `py-4` |
| Page title size | `text-xl` | `text-xl` | `text-xl` |

---

## 4. Component Breakpoint Patterns

### Show / hide

```tsx
// Desktop only
className="hidden lg:block"

// Mobile only
className="lg:hidden"

// Tablet and up
className="hidden md:flex"
```

### Responsive grid

```tsx
// Dashboard cards
className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"

// Form two-column
className="grid gap-4 md:grid-cols-2"
```

### Responsive flex direction

```tsx
// PageHeader actions
className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
```

---

## 5. Data Table Breakpoints

| Breakpoint | Behaviour |
|------------|-----------|
| Mobile | Horizontal scroll; hide non-essential columns via feature logic |
| Tablet | Show more columns; sticky first column optional |
| Laptop+ | Full column set |

Shell does not own table responsiveness — features follow this contract.

---

## 6. Typography Breakpoints

| Context | Mobile | Desktop |
|---------|--------|---------|
| Body | 14px (`text-sm`) | 14px (`text-sm`) |
| Page title | 20px (`text-xl`) | 20px (`text-xl`) |
| Auth heading | 30px (`text-3xl`) | 30px (`text-3xl`) |

No responsive font scaling in ERP modules — density is constant.

---

## 7. Touch Targets

| Element | Minimum size | Breakpoint |
|---------|--------------|------------|
| Icon button | 32×32px (`h-8 w-8`) | All |
| Nav item | 40px height (`py-2`) | Mobile drawer |
| Form input | 36px (`h-9`) | All |

---

## 8. Container Strategy

FundFlow does not use a global `container` class in the shell. Content is fluid within `ContentContainer`.

Features may apply:

```tsx
className="mx-auto max-w-4xl"   // Forms
className="mx-auto max-w-7xl"   // Wide reports
```

---

## 9. Testing Matrix

| Viewport | Width | Verify |
|----------|-------|--------|
| iPhone SE | 375px | Drawer, mobile header, scroll tables |
| iPad | 768px | Search icon/bar, drawer |
| Laptop | 1024px | Sidebar appears, collapse works |
| Desktop | 1440px | Full header, breadcrumbs |
| Wide | 1920px | No layout breakage |

Use browser DevTools responsive mode and manual resize testing before phase approval.

---

## 10. Target `breakpoints.ts` Export Shape

```ts
export const breakpointTokens = {
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
} as const;

export type Breakpoint = keyof typeof breakpointTokens;

export const deviceCategories = {
  mobile: { max: "639px" },
  tablet: { min: "640px", max: "1023px" },
  laptop: { min: "1024px", max: "1279px" },
  desktop: { min: "1280px", max: "1535px" },
  wide: { min: "1536px" },
} as const;
```

---

## 11. Related Documents

- Phase 03 [RESPONSIVE_LAYOUTS.md](../phase-03/RESPONSIVE_LAYOUTS.md) — shell layout diagrams
- [DESIGN_TOKENS_AND_THEME.md](./DESIGN_TOKENS_AND_THEME.md) — spacing at breakpoints
- [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) — theme persistence across viewports
