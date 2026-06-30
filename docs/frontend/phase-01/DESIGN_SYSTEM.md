# FundFlow ERP — Unified Design System

**Phase:** 01 — Design System Extraction  
**Date:** 2026-06-30  
**Status:** Approved foundation  
**Sources:** Material + shadcn template (`material-shadcn-1.0.0/`), CrossLife brand (`docs/CROSSLIFE_BRAND.md`), ERP production tokens (`frontend/src/app/globals.css`)

---

## 1. Purpose

This document is the single source of truth for FundFlow ERP visual design. It unifies:

- **CrossLife brand identity** — warm orange primary, cream backgrounds, dark sidebar chrome
- **Material + shadcn patterns** — component structure, elevation, animations, Radix accessibility
- **ERP density standards** — compact 14px base, border-defined surfaces, financial data layouts

Any future ERP page must be built from these tokens and primitives. Do not invent new colors, spacing, or component styles.

---

## 2. Design Principles

| Principle | Rule |
|-----------|------|
| **Token-first** | Use CSS variables and Tailwind semantic classes. Never hardcode hex in components. |
| **Border over shadow** | Data surfaces use borders for separation. Shadows reserved for overlays, dropdowns, and primary buttons. |
| **Compact density** | 14px body, `h-9` default controls, tight vertical rhythm for data-heavy screens. |
| **Warm neutrals** | Cream canvas, warm gray borders — not cool gray or pure white shell. |
| **Accessible by default** | Radix primitives, visible focus rings, WCAG AA contrast minimum. |
| **Dark mode parity** | Every light token has a dark counterpart. Same semantic hues, adjusted surfaces. |

---

## 3. Token Architecture

```
CrossLife brand tokens (--color-*)
        ↓
shadcn semantic aliases (--primary, --muted, --border, etc.)
        ↓
Tailwind 4 @theme inline mappings
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
| Primary | `--color-primary` | `#C85716` |
| Background | `--color-background` | `#FFFAF2` |
| Surface | `--color-surface` | `#FFFFFF` |
| Text | `--color-text` | `#1A1715` |
| Muted | `--color-muted` | `#6B6560` |
| Border | `--color-border` | `#E8E0D8` |
| Success | `--color-success` | `#059652` |
| Warning | `--color-warning` | `#E8A317` |
| Danger | `--color-danger` | `#DF1529` |
| Info | `--color-info` | `#2563EB` |

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
| `--radius-sm` | 4px | `rounded-sm` | Checkboxes, small chips |
| `--radius-md` | 6px | `rounded-md` | Inputs, buttons (ERP default) |
| `--radius-lg` | 8px | `rounded-lg` | Cards, dialogs, panels |
| `--radius-xl` | 12px | `rounded-xl` | Drawers (top corners), modals |
| `--radius-full` | 9999px | `rounded-full` | Badges, avatars, switches |

**ERP default:** `--radius-md` (6px) for controls; `--radius-lg` (8px) for containers.  
**Template reference:** 12px (`0.75rem`) — adopted only for marketing-style auth cards.

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
focus-visible:ring-ring        /* --color-primary */
focus-visible:ring-offset-2
focus-visible:ring-offset-background
```

### Hover elevation

| Element | Hover treatment |
|---------|----------------|
| Primary button | `shadow-sm` → `shadow-md`, gradient shift |
| Table row | `hover:bg-muted/50` (no shadow) |
| Ghost button | `hover:bg-accent` |
| Nav item | Background fill + left border accent |
| Card (interactive) | Border color → `--color-primary` (no shadow) |

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
Level 0 — App canvas        --color-background (#FFFAF2 cream)
Level 1 — Content area      transparent (inherits canvas)
Level 2 — Surface           --color-surface (#FFFFFF cards/panels)
Level 3 — Elevated          --color-surface + shadow-lg (dialogs)
Level 4 — Overlay           bg-black/80 (modal backdrop)
Level 5 — Sidebar chrome    --color-sidebar (#1A1715 dark)
```

**Texture overlay (optional):** `.grain-texture::before` at 8% opacity — adopt in layout phase only.

---

## 12. Navigation Styles

### Sidebar

| State | Style |
|-------|-------|
| Default | `text-sidebar-muted`, transparent background |
| Hover | `bg-sidebar-accent` (`#2D2825`) |
| Active | `bg-sidebar-accent`, left border `3px solid --color-primary`, text white |
| Group label | `text-xs uppercase tracking-wider text-sidebar-muted font-nav` |
| Item | `text-[13px] font-nav px-3 py-2 rounded-md` |

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
| `--chart-1` | `#C85716` | Primary series (brand orange) |
| `--chart-2` | `#059652` | Success / positive trend |
| `--chart-3` | `#2563EB` | Secondary series |
| `--chart-4` | `#E8A317` | Warning / attention |
| `--chart-5` | `#6B6560` | Neutral / comparison |

Chart text and grid lines use `--color-border` and `--color-muted`.

---

## 14. Dark Mode

Toggle via `next-themes` with `attribute="class"`. All tokens redefined under `.dark` in `globals.css`.

| Light token | Dark adjustment |
|-------------|----------------|
| `--color-background` | `#110A06` (deep warm black) |
| `--color-surface` | `#1A1715` |
| `--color-primary` | `#D4621F` (slightly brighter) |
| `--color-border` | `#3D3835` |
| Sidebar | Unchanged (always dark chrome) |

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
