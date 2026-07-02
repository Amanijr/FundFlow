# FundFlow ERP — Unified Design System

**Phase:** 01 — Design System Extraction  
**Date:** 2026-06-30  
**Status:** Approved foundation  
**Sources:** Material + shadcn template (`material-shadcn-1.0.0/client/src/index.css`) — **active palette**  
**Deferred:** CrossLife brand (`docs/CROSSLIFE_BRAND.md`) — not used during template migration

---

## 1. Purpose

This document is the single source of truth for FundFlow ERP visual design. It unifies:

- **Material + shadcn template palette** — stone neutrals, black primary, light sidebar, gradient buttons
- **Material + shadcn patterns** — component structure, elevation, animations, Radix accessibility
- **ERP density standards** — compact 14px base, border-defined surfaces, financial data layouts

> CrossLife brand colours (`#C85716` orange, cream canvas, dark sidebar) are **deferred** — see `COLOR_GUIDE.md` §11.

Any future ERP page must be built from these tokens and primitives. Do not invent new colors, spacing, or component styles.

---

## 2. Design Principles

| Principle | Rule |
|-----------|------|
| **Token-first** | Use CSS variables and Tailwind semantic classes. Never hardcode hex in components. |
| **Border over shadow** | Data surfaces use borders for separation. Shadows reserved for overlays, dropdowns, and primary buttons. |
| **Compact density** | 14px body, `h-9` default controls, tight vertical rhythm for data-heavy screens. |
| **Stone neutrals** | `stone-50` canvas, `stone-200` borders, `stone-700/800` primary gradient. |
| **Accessible by default** | Radix primitives, visible focus rings, WCAG AA contrast minimum. |
| **Dark mode parity** | Every light token has a dark counterpart. Same semantic hues, adjusted surfaces. |

---

## 3. Token Architecture

```
Material template tokens (index.css :root)
        ↓
shadcn semantic aliases (--primary, --muted, --border, --radius, etc.)
        ↓
Stone scale overrides (border-stone-200, bg-stone-50 — template page layer)
        ↓
Tailwind @theme inline mappings
        ↓
Component className (variant CVA)
```

**Implementation file (future phases):** `frontend/src/app/globals.css`  
**Component library:** `frontend/src/components/ui/`

---

## 4. Color System

See [COLOR_GUIDE.md](./COLOR_GUIDE.md) for complete palette, HEX values, and usage rules.

### Quick reference

| Role | Variable | Light HEX |
|------|----------|-----------|
| Primary | `--primary` | `#000000` |
| Primary button | stone gradient | `#44403C` → `#292524` |
| Background | `--background` / `bg-stone-50` | `#F7F7F7` / `#FAFAF9` |
| Surface | `--card` | `#FFFFFF` |
| Text | `--foreground` | `#0C0A09` |
| Muted | `--muted-foreground` | `#78716C` |
| Border | `--border` / `stone-200` | `#E2E8F0` / `#E7E5E4` |
| Success | `--color-success` | `#22C55E` |
| Warning | `--color-warning` | `#EAB308` |
| Danger | `--destructive` | `#EF4444` |
| Info | `--color-info` | `#3B82F6` |

---

## 5. Typography

See [TYPOGRAPHY.md](./TYPOGRAPHY.md) for complete type scale.

| Role | Font | Variable |
|------|------|----------|
| Body | Roboto | `--font-sans` |
| Headings | Lato | `--font-heading` |
| Navigation | Montserrat | `--font-nav` |

**Base size:** 14px (`0.875rem` / `text-sm`)  
**Line height:** 1.5 (body), 1.25 (headings)

---

## 6. Spacing System

8px base grid. All spacing values are multiples of 4px; preferred rhythm uses 8px steps.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `space-1` | 4px | `p-1`, `gap-1` | Icon padding, tight inline gaps |
| `space-2` | 8px | `p-2`, `gap-2` | Button icon gap, compact lists |
| `space-3` | 12px | `p-3`, `gap-3` | Mobile content padding |
| `space-4` | 16px | `p-4`, `gap-4` | Card content, form field gaps |
| `space-5` | 20px | `p-5`, `gap-5` | Section internal spacing |
| `space-6` | 24px | `p-6`, `gap-6` | Card header padding, grid gaps |
| `space-8` | 32px | `p-8`, `gap-8` | Section separation (max for ERP) |

### Layout spacing standards

| Context | Standard |
|---------|----------|
| Page content padding | `p-4 lg:p-6` |
| Page vertical rhythm | `space-y-4` to `space-y-5` |
| Card internal padding | `p-4` (compact) or `p-6` (default) |
| Form field gap | `space-y-4` between fields |
| Grid gap | `gap-4` (dense) or `gap-6` (dashboard) |
| Sidebar width | `w-60` (240px) |
| Sidebar nav item | `px-3 py-2` |

---

## 7. Border Radius

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `--radius-sm` | 8px | `rounded-sm` | `calc(--radius - 4px)` |
| `--radius-md` | 10px | `rounded-md` | `calc(--radius - 2px)` — inputs |
| `--radius-lg` | 12px | `rounded-lg` | `--radius` (0.75rem) — cards, buttons, nav |
| `--radius-xl` | 16px | `rounded-xl` | Drawers (top corners) |
| `--radius-full` | 9999px | `rounded-full` | Badges, avatars, switches |

**Template default:** `--radius: 0.75rem` (12px). Dark mode shrinks to `0.5rem`.  
**ERP density note:** Controls may use `rounded-md` (10px) while cards/nav use `rounded-lg` (12px).

---

## 8. Elevation & Shadows

### Shadow levels

| Level | Class | Usage |
|-------|-------|-------|
| None | — | Cards, panels, tables (border-only) |
| Subtle | `shadow-sm` | Primary buttons at rest |
| Raised | `shadow-md` | Primary buttons on hover, dropdowns, tooltips |
| Overlay | `shadow-lg` | Dialogs, drawers |
| Inset highlight | `after:` pseudo | Material primary button gloss effect |

### Focus styles

All interactive elements:

```
focus-visible:outline-none
focus-visible:ring-2
focus-visible:ring-ring        /* --ring → black / white in dark */
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

### Hover elevation

| Element | Hover treatment |
|---------|----------------|
| Primary button | `shadow-sm` → `shadow-md`, gradient shift |
| Table row | `hover:bg-muted/50` (no shadow) |
| Ghost button | `hover:bg-accent` |
| Nav item | `hover:bg-stone-100`; active → stone gradient |
| Card (interactive) | Border color → `stone-400` (no shadow) |

---

## 9. Iconography

**Library:** `lucide-react` (exclusive — no react-icons, no heroicons)

| Size token | Dimensions | Usage |
|------------|------------|-------|
| `icon-xs` | 14px (`h-3.5 w-3.5`) | Inline badge icons |
| `icon-sm` | 16px (`h-4 w-4`) | Buttons, nav items, table actions |
| `icon-md` | 20px (`h-5 w-5`) | Mobile menu, section headers |
| `icon-lg` | 24px (`h-6 w-6`) | Empty states, feature icons |

**Stroke width:** Default Lucide 2px. Do not override.  
**Color:** Inherit from parent text color. Use `text-muted-foreground` for decorative icons.  
**Button embedding:** `[&_svg]:size-4 [&_svg]:shrink-0`  
**Nav embedding:** `mr-3` gap between icon and label

---

## 10. Motion & Animation

| Pattern | Duration | Easing | Usage |
|---------|----------|--------|-------|
| Color transition | 150–200ms | `ease-in-out` | Hover states, nav items |
| Button transition | 300ms | `ease-in` | Primary button gradient |
| Sidebar slide | 300ms | `ease-in-out` | Mobile drawer |
| Dialog open/close | 200ms | fade + zoom | Modals |
| Accordion | 200ms | `ease-out` | Expand/collapse |
| Content reveal | 350ms | `ease-out` | Page load (.content-reveal) |
| Skeleton pulse | 1.6s | `ease-in-out` | Loading placeholders |

**Reduced motion:** All animations disabled via `@media (prefers-reduced-motion: reduce)` in `globals.css`.

---

## 11. Background Hierarchy

```
Level 0 — App canvas        bg-stone-50 (#FAFAF9) + optional .grain-texture
Level 1 — Content area      transparent (inherits canvas)
Level 2 — Surface           --card (#FFFFFF cards/panels)
Level 3 — Elevated          --card + shadow-lg (dialogs)
Level 4 — Overlay           bg-black/80 (modal backdrop)
Level 5 — Sidebar           --sidebar-background (#FFFFFF light)
```

**Texture overlay (optional):** `.grain-texture::before` at 8% opacity — adopt in layout phase only.

---

## 12. Navigation Styles

### Sidebar

| State | Style |
|-------|-------|
| Default | `text-stone-700`, transparent background |
| Hover | `hover:bg-stone-100` |
| Active | Stone gradient (same as primary button), `text-stone-50` |
| Group label | `text-xs uppercase tracking-wide text-stone-500` |
| Item | `text-sm px-3 py-2 rounded-lg` |
| Panel | `w-60 bg-white border-r border-stone-200` |

### Top bar

| Element | Style |
|---------|-------|
| Height | `h-12` |
| Background | `--color-surface` with bottom border |
| Breadcrumbs | `text-sm text-muted-foreground` |
| Actions | Ghost buttons, icon size sm |

### Tabs (module sub-nav)

| Element | Style |
|---------|-------|
| List | `bg-muted rounded-md p-1 h-10` |
| Trigger (active) | `bg-background shadow-sm text-foreground` |
| Trigger (inactive) | `text-muted-foreground` |

---

## 13. Chart Colors

| Token | HEX | Usage |
|-------|-----|-------|
| `--chart-1` | `#22C55E` | Primary series (green) |
| `--chart-2` | `#0C0A09` | Secondary series (stone-950) |
| `--chart-3` | `#3B82F6` | Tertiary / sparkline active (blue) |
| `--chart-4` | `#78716C` | Neutral comparison (stone-500) |
| `--chart-5` | `#E7E5E4` | Inactive bars (stone-200) |

Chart text and grid lines use `--color-border` and `--color-muted`.

---

## 14. Dark Mode

Toggle via `next-themes` with `attribute="class"`. All tokens redefined under `.dark` in `globals.css`.

| Light token | Dark adjustment |
|-------------|----------------|
| `--background` | `hsl(240, 10%, 3.9%)` ≈ `#09090B` |
| `--card` | Same as background |
| `--primary` | `#FFFFFF` (inverted) |
| `--border` | `hsl(240, 3.7%, 15.9%)` ≈ `#27272A` |
| `--radius` | `0.5rem` (shrinks from 0.75rem) |
| Sidebar | Follows `--sidebar-background` (dark in `.dark`) |

---

## 15. File Reference

| Document | Contents |
|----------|----------|
| [COLOR_GUIDE.md](./COLOR_GUIDE.md) | Complete palette with HEX, usage, do/don't |
| [TYPOGRAPHY.md](./TYPOGRAPHY.md) | Type scale, heading hierarchy, financial text |
| [COMPONENT_SPECIFICATIONS.md](./COMPONENT_SPECIFICATIONS.md) | Per-component variants, states, a11y |
| [UI_PRIMITIVES.md](./UI_PRIMITIVES.md) | Primitive catalog and adoption status |

---

## 16. Governance

1. New components must use existing tokens and primitives.
2. New colors require design system update before implementation.
3. Deviations from this document require architectural justification.
4. Phase 02+ implements these standards in `frontend/src/components/ui/`.
5. Do not modify business pages until primitives are implemented.
