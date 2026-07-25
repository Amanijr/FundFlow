# Phase 04 — Design Tokens & Theme System

**Date:** 2026-06-30  
**Status:** Approved (documentation)  
**Dependencies:** Phase 00, Phase 01, Phase 02, Phase 03  
**Active palette:** Material + shadcn template (stone neutrals, black primary)  
**Deferred:** CrossLife brand colours — see Phase 01 `COLOR_GUIDE.md` §11

---

## 1. Executive Summary

The Design Token System is the single source of truth for every visual property in FundFlow ERP. Instead of inventing colours, spacing, shadows, or motion inside components, developers consume predefined tokens that map to CSS variables and Tailwind utilities.

This phase formalises what Phase 01 extracted into an enterprise-grade token architecture with semantic naming, theme parity, and implementation targets.

**Rule:** No reusable component may introduce hardcoded visual values. Every property must trace to a token.

---

## 2. Design Philosophy

| Principle | Application |
|-----------|-------------|
| **Enterprise first** | Professional, clean, minimal — no decorative UI |
| **Data first** | Content has higher visual priority than chrome |
| **Accessibility** | WCAG AA contrast minimum; focus rings on all interactives |
| **Consistency** | One token per visual decision; no ad-hoc values |

---

## 3. Token Architecture

```
Primitive tokens (raw values)
        ↓
Semantic tokens (--color-text, --color-surface, --color-success)
        ↓
Component tokens (--button-primary-bg, --sidebar-active)
        ↓
CSS variables (:root / .dark in globals.css)
        ↓
Tailwind @theme inline mappings
        ↓
Component className (CVA variants)
```

### Implementation layers

| Layer | Location (current) | Location (target) |
|-------|-------------------|-------------------|
| CSS variables | `frontend/src/app/globals.css` | `globals.css` + `styles/tokens/*.ts` |
| Tailwind theme | `@theme inline` in `globals.css` | `styles/tailwind/tailwind.theme.ts` |
| Shared utilities | `lib/utils/material-styles.ts` | `styles/tokens/theme.ts` |
| Components | `components/ui/*` | Consume tokens only |

Phase 04 defines the contract. Token file extraction into `styles/tokens/` is a follow-up implementation task — not required for documentation approval.

---

## 4. Token Categories

| Category | Document | Key tokens |
|----------|----------|------------|
| Colors | [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) | Brand, surface, text, border, status, financial |
| Typography | [TYPOGRAPHY_SYSTEM.md](./TYPOGRAPHY_SYSTEM.md) | Display, H1–H4, body, small, caption, label |
| Spacing | This document §5 | 4px grid, 8px rhythm |
| Radius | This document §6 | `--radius-sm` through `--radius-full` |
| Shadows | This document §7 | `shadow-xs` through `shadow-xl` |
| Borders | [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) §4 | default, subtle, strong, interactive |
| Motion | [MOTION_GUIDELINES.md](./MOTION_GUIDELINES.md) | fast, normal, slow |
| Breakpoints | [RESPONSIVE_BREAKPOINTS.md](./RESPONSIVE_BREAKPOINTS.md) | sm, md, lg, xl, 2xl |
| Z-index | This document §8 | header, sidebar, dialog, tooltip |
| Icons | This document §9 | 16px, 20px, 24px |
| Theme | [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) | light, dark, system |

---

## 5. Spacing System

**Base grid:** 4px with preferred 8px rhythm.

| Token | Value | Tailwind | Usage |
|-------|-------|----------|-------|
| `space-0` | 0 | `p-0`, `gap-0` | Reset |
| `space-1` | 4px | `p-1`, `gap-1` | Icon padding, tight inline gaps |
| `space-2` | 8px | `p-2`, `gap-2` | Button icon gap, compact lists |
| `space-3` | 12px | `p-3`, `gap-3` | Mobile content padding |
| `space-4` | 16px | `p-4`, `gap-4` | Card content, form field gaps |
| `space-5` | 20px | `p-5`, `gap-5` | Section internal spacing |
| `space-6` | 24px | `p-6`, `gap-6` | Card header padding, grid gaps |
| `space-8` | 32px | `p-8`, `gap-8` | Section separation |
| `space-10` | 40px | `p-10`, `gap-10` | Large section breaks |
| `space-12` | 48px | `p-12`, `gap-12` | Auth panels, hero spacing |
| `space-16` | 64px | `p-16`, `gap-16` | Marketing-only (rare in ERP) |

### Layout standards

| Context | Token usage |
|---------|-------------|
| Page content padding | `px-4 py-4 sm:px-5 lg:px-6` |
| Page vertical rhythm | `space-y-4` to `space-y-5` |
| Card internal padding | `p-4` (compact) or `p-6` (default) |
| Form field gap | `space-y-4` |
| Grid gap | `gap-4` (dense) or `gap-6` (dashboard) |
| Sidebar width | `w-60` (240px) |
| Header height | `h-12` (48px) |

**Forbidden:** arbitrary values like `p-[13px]`, `gap-[22px]`, `mt-[7px]`.

---

## 6. Radius Tokens

Base token: `--radius: 0.75rem` (12px light) / `0.5rem` (8px dark).

| Token | Light value | CSS variable | Tailwind | Usage |
|-------|-------------|--------------|----------|-------|
| `radius-none` | 0 | — | `rounded-none` | Tables, flush panels |
| `radius-sm` | 8px | `--radius-sm` | `rounded-sm` | Badges, chips |
| `radius-md` | 10px | `--radius-md` | `rounded-md` | Inputs, compact controls |
| `radius-lg` | 12px | `--radius-lg` / `--radius` | `rounded-lg` | Cards, buttons, nav items |
| `radius-xl` | 16px | — | `rounded-xl` | Drawers, large panels |
| `radius-full` | 9999px | — | `rounded-full` | Avatars, switches, pills |

Derived formulas (current):

```css
--radius-sm: calc(var(--radius) - 4px);
--radius-md: calc(var(--radius) - 2px);
--radius-lg: var(--radius);
```

---

## 7. Shadow & Elevation Tokens

ERP uses **border-first** surfaces. Shadows communicate elevation for overlays and primary actions only.

| Token | Tailwind | Usage |
|-------|----------|-------|
| `shadow-none` | — | Cards, tables, panels (border-only) |
| `shadow-xs` | Custom (future) | Subtle inset highlights |
| `shadow-sm` | `shadow-sm` | Primary buttons at rest |
| `shadow-md` | `shadow-md` | Button hover, dropdowns |
| `shadow-lg` | `shadow-lg` | Dialogs, drawers |
| `shadow-xl` | `shadow-xl` | Command palette, elevated modals |

### Elevation hierarchy

```
Level 0 — App canvas        bg-background (stone-50)
Level 1 — Content area      transparent
Level 2 — Surface           bg-card + border
Level 3 — Elevated          bg-card + shadow-lg
Level 4 — Overlay           bg-black/80 backdrop
Level 5 — Sidebar           bg-sidebar + border-r
```

Material primary button uses an inset highlight pseudo-element — see `materialGradientClasses` in `lib/utils/material-styles.ts`.

---

## 8. Z-Index Scale

Avoid arbitrary `z-[999]`. Use named layers:

| Token | Value | Usage |
|-------|-------|-------|
| `z-base` | 0 | Default content |
| `z-sticky` | 10 | Sidebar (desktop) |
| `z-header` | 40 | Sticky header |
| `z-dropdown` | 50 | Dropdowns, popovers, sheets |
| `z-modal` | 50 | Dialogs (Radix portal) |
| `z-tooltip` | 50 | Tooltips |
| `z-toast` | 50 | Toast notifications |
| `z-skip-link` | 50 | Skip-to-content (focus only) |
| `z-max` | 50 | Reserved — do not exceed without design review |

Radix primitives manage stacking within portals. Shell components use `z-40` (header) and `z-10` (sidebar).

---

## 9. Icon System

**Library:** `lucide-react` exclusively.

| Token | Size | Tailwind | Usage |
|-------|------|----------|-------|
| `icon-inline` | 16px | `h-4 w-4` | Buttons, nav, table actions |
| `icon-compact` | 20px | `h-5 w-5` | Section headers, mobile menu |
| `icon-default` | 24px | `h-6 w-6` | Empty states, feature icons |
| `icon-xs` | 14px | `h-3.5 w-3.5` | Badge icons, breadcrumbs |

**Stroke:** Lucide default 2px — do not override.  
**Colour:** Inherit from parent; use `text-muted-foreground` for decorative icons.

---

## 10. Opacity Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `opacity-disabled` | 0.5 | Disabled controls |
| `opacity-muted` | 0.7 | Secondary overlays |
| `opacity-backdrop` | 0.8 | Modal backdrop (`bg-black/80`) |
| `opacity-hover` | 0.8 | Outline button hover |
| `opacity-skeleton` | 0.4–1.0 | Skeleton pulse animation |

Status tints use `color-mix` or 10%/30% alpha — see COLOR_SYSTEM.md.

---

## 11. Component Token Pattern

Every primitive maps semantic tokens to variants:

```
Button (default)
  → --primary / material gradient
  → --primary-foreground
  → --radius-lg
  → shadow-sm → shadow-md on hover
  → transition duration-normal

Card
  → --card background
  → --border
  → --radius-lg
  → shadow-none

Input
  → --input border
  → --radius-md
  → focus: --ring
```

See Phase 01 `COMPONENT_SPECIFICATIONS.md` for per-component detail.

---

## 12. Constraints

Never:

- Hardcode hex, rgb, or hsl in components
- Use raw Tailwind colour scales (`text-blue-500`, `bg-green-500`) in feature or layout code
- Invent spacing outside the 4px grid
- Add animation durations outside motion tokens
- Duplicate token values in multiple files

Always:

- Reference semantic Tailwind classes (`text-foreground`, `bg-card`, `border-border`)
- Use CSS variables for custom properties
- Verify dark mode parity when adding tokens
- Document new tokens before implementation

---

## 13. Target Folder Structure

```
frontend/src/styles/
├── tokens/
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── radius.ts
│   ├── shadow.ts
│   ├── motion.ts
│   ├── breakpoints.ts
│   ├── z-index.ts
│   └── theme.ts          # aggregates + exports
└── tailwind/
    └── tailwind.theme.ts # @theme extension source
```

Current source of truth remains `globals.css` until token files are extracted.

---

## 14. Migration from Current State

| Area | Current | Target |
|------|---------|--------|
| Colours | `globals.css` `:root` / `.dark` | + `styles/tokens/colors.ts` |
| Typography | `globals.css` + `layout.tsx` fonts | + `styles/tokens/typography.ts` |
| Spacing | Tailwind defaults | Documented scale (this doc) |
| Motion | `globals.css` keyframes | + `styles/tokens/motion.ts` |
| Stone literals | `border-stone-200`, `bg-stone-50` in shell | Migrate to `border-border`, `bg-background` |
| Material gradient | `material-styles.ts` | Component token `--button-primary-gradient` |

**Incremental rule:** New code uses semantic tokens. Existing stone literals are migrated during component refactors, not in bulk.

---

## 15. Acceptance Criteria

- [x] Token categories documented
- [x] Semantic colour architecture defined
- [x] Typography scale defined
- [x] Spacing, radius, shadow scales defined
- [x] Motion guidelines documented
- [x] Breakpoints documented
- [x] Dark mode strategy documented
- [x] Z-index scale documented
- [ ] Token TypeScript files extracted (implementation follow-up)
- [ ] Stone literals eliminated from shell (implementation follow-up)

---

## 16. Related Documents

| Document | Contents |
|----------|----------|
| [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) | Full colour token reference |
| [TYPOGRAPHY_SYSTEM.md](./TYPOGRAPHY_SYSTEM.md) | Type scale and hierarchy |
| [MOTION_GUIDELINES.md](./MOTION_GUIDELINES.md) | Animation rules and durations |
| [RESPONSIVE_BREAKPOINTS.md](./RESPONSIVE_BREAKPOINTS.md) | Breakpoint tokens |
| [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) | Light/dark/system implementation |
| Phase 01 [DESIGN_SYSTEM.md](../phase-01/DESIGN_SYSTEM.md) | Visual foundation |
| Phase 03 [APPLICATION_SHELL.md](../phase-03/APPLICATION_SHELL.md) | Shell token consumption |

---

## 17. Governance

1. New tokens require Phase 04 document update before code merge.
2. CrossLife brand activation requires explicit design approval and COLOR_SYSTEM update.
3. Do not proceed to Phase 05 until this phase is reviewed and approved.
