# Phase 04 — Motion Guidelines

**Date:** 2026-06-30  
**Implementation:** `frontend/src/app/globals.css`  
**Principle:** Motion communicates state — never decorates.

---

## 1. Motion Philosophy

| Allowed | Forbidden |
|---------|-----------|
| Fade | Bouncing |
| Scale (subtle) | Rotating loaders in UI chrome |
| Slide | Parallax |
| Collapse / expand | Attention-grabbing loops |
| Colour transitions | Distracting micro-interactions |

Animations must respect `prefers-reduced-motion: reduce`. All custom animations in `globals.css` disable under this media query.

---

## 2. Duration Tokens

| Token | Value | CSS variable (target) | Usage |
|-------|-------|----------------------|-------|
| `duration-fast` | 150ms | `--motion-duration-fast` | Hover colour, opacity |
| `duration-normal` | 200ms | `--motion-duration-normal` | Dialogs, accordions, dropdowns |
| `duration-moderate` | 300ms | `--motion-duration-moderate` | Buttons, sidebar width |
| `duration-slow` | 350ms | `--motion-duration-slow` | Content reveal |
| `duration-slower` | 600ms | — | Auth slider only (exception) |

**Tailwind mapping:**

```
duration-fast    → duration-150
duration-normal  → duration-200
duration-moderate → duration-300
duration-slow    → duration-350 (custom or closest 300)
```

**Rule:** Never invent durations like `duration-[237ms]`.

---

## 3. Easing Tokens

| Token | Value | Usage |
|-------|-------|-------|
| `ease-default` | `ease-in-out` | Colour, layout shifts |
| `ease-enter` | `ease-out` | Elements appearing |
| `ease-exit` | `ease-in` | Elements leaving |
| `ease-spring` | `cubic-bezier(0.5, 0, 0.5, 1)` | Loaders only |

Radix primitives ship their own easing for dialogs and dropdowns — do not override unless accessibility requires it.

---

## 4. Transition Tokens

Standard transition shorthand for interactive elements:

```css
transition-colors duration-fast ease-default
transition-all duration-moderate ease-default   /* buttons */
transition-[width] duration-moderate ease-default /* sidebar */
```

### Component transitions

| Component | Properties | Duration | Easing |
|-----------|------------|----------|--------|
| Button | `all` (gradient, shadow) | 300ms | ease-in |
| Nav item | `colors` | 200ms | ease-in-out |
| Ghost button | `colors` | 150ms | ease-in-out |
| Input focus | `ring`, `border-color` | 150ms | ease-in-out |
| Sidebar collapse | `width` | 300ms | ease-in-out |
| Card (interactive) | `border-color` | 150ms | ease-in-out |

---

## 5. Animation Patterns

### Fade

| Name | Keyframes | Duration | Usage |
|------|-----------|----------|-------|
| `content-reveal` | opacity 0→1, translateY 4px→0 | 350ms | Page content (`.content-reveal`) |
| `loader-fade-in` | opacity 0→1, translateY 6px→0 | 350ms | Loading states |
| Dialog fade | Radix built-in | 200ms | Modals |

### Scale

| Name | Usage |
|------|-------|
| Radix dialog zoom | `zoom-in-95` / `zoom-out-95` |
| Loader pulse | `loader-logo-pulse` — loading screens only |

### Slide

| Name | Duration | Usage |
|------|----------|-------|
| Mobile sidebar | 300ms | Sheet open/close (Radix) |
| Auth slider | 600ms | Login/register panel swap |

### Collapse / Expand

| Name | Duration | Usage |
|------|----------|-------|
| Accordion | 200ms | Radix accordion |
| Sidebar groups | — | Future nested nav |

---

## 6. Loading Animations

Restricted to loading screens and skeleton states — not navigation or data tables.

| Class | Animation | Duration | Context |
|-------|-----------|----------|---------|
| `.skeleton-shimmer` | Background position sweep | 1.6s | Skeleton placeholders |
| `.skeleton-row-in` | Fade + slide up | 400ms | Table skeleton rows |
| `.loader-spin` | Rotate | 1.1s | Spinner ring |
| `.loader-pulse-ring` | Scale + opacity | 2s | Branded loader |

All disabled under `prefers-reduced-motion: reduce`.

---

## 7. Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  .content-reveal,
  .skeleton-shimmer,
  .loader-* {
    animation: none;
  }
  .content-reveal {
    opacity: 1;
    transform: none;
  }
}
```

### Rules

1. Never gate critical information behind animation completion.
2. Functional state changes must be instant when motion is reduced.
3. Test shell and forms with reduced motion enabled in OS settings.

---

## 8. Forbidden Patterns

| Pattern | Reason |
|---------|--------|
| `animate-bounce` | Unprofessional in ERP |
| Continuous rotation in UI chrome | Distracting — loaders only |
| Parallax scrolling | Data-first violation |
| Staggered list animations > 50ms/item | Slows data scanning |
| Auto-playing carousel | Accessibility risk |

---

## 9. Z-Index & Motion Interaction

Animated overlays must use z-index tokens from DESIGN_TOKENS_AND_THEME.md §8:

- Dropdowns / sheets: `z-50`
- Header (sticky, no animation): `z-40`
- Sidebar: `z-10`

Do not animate `z-index`.

---

## 10. Implementation Checklist

| Pattern | Status | Location |
|---------|--------|----------|
| Content reveal | Implemented | `globals.css` `.content-reveal` |
| Skeleton shimmer | Implemented | `globals.css` `.skeleton-shimmer` |
| Reduced motion | Implemented | `globals.css` media query |
| Button transition | Implemented | `button.tsx` `duration-300` |
| Sidebar width | Implemented | `sidebar.tsx` `duration-300` |
| Duration CSS variables | Planned | `styles/tokens/motion.ts` |

---

## 11. Target `motion.ts` Export Shape

```ts
export const motionTokens = {
  duration: {
    fast: "150ms",
    normal: "200ms",
    moderate: "300ms",
    slow: "350ms",
  },
  easing: {
    default: "ease-in-out",
    enter: "ease-out",
    exit: "ease-in",
  },
  transition: {
    colors: "color, background-color, border-color 150ms ease-in-out",
    all: "all 300ms ease-in-out",
    width: "width 300ms ease-in-out",
  },
} as const;
```

---

## 12. Related Documents

- [DESIGN_TOKENS_AND_THEME.md](./DESIGN_TOKENS_AND_THEME.md) — duration and z-index overview
- [THEME_ARCHITECTURE.md](./THEME_ARCHITECTURE.md) — theme toggle transition
- Phase 01 [DESIGN_SYSTEM.md](../phase-01/DESIGN_SYSTEM.md) §10 — original motion table
