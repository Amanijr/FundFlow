# Phase 04 — Theme Architecture

**Date:** 2026-06-30  
**Stack:** Next.js 15, Tailwind CSS 4, next-themes  
**Source of truth:** `frontend/src/app/globals.css`

---

## 1. Overview

FundFlow supports three appearance modes:

| Mode | Behaviour |
|------|-----------|
| **Light** | Default `:root` tokens |
| **Dark** | `.dark` class on `<html>` |
| **System** | Follows `prefers-color-scheme` via next-themes |

Every visual token exists in both light and dark themes. Components never implement theme-specific overrides inline.

---

## 2. Theme Stack

```
next-themes (ThemeProvider)
        ↓
attribute="class" on <html>
        ↓
.dark class toggled
        ↓
CSS variable cascade (:root → .dark)
        ↓
Tailwind @theme inline mappings
        ↓
Component semantic classes
```

### Provider configuration

```tsx
// app/providers.tsx (current pattern)
<ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
  {children}
</ThemeProvider>
```

`disableTransitionOnChange` prevents flash of intermediate colours during theme swap.

---

## 3. Token Cascade

### Light theme (`:root`)

Defined in `globals.css` lines 5–72. Key groups:

- shadcn semantic aliases (`--primary`, `--muted`, `--border`, etc.)
- ERP aliases (`--color-surface`, `--color-text`, etc.)
- Sidebar tokens (`--sidebar-background`, etc.)
- Chart tokens (`--chart-1` through `--chart-5`)
- Radius derivatives (`--radius-sm`, `--radius-md`, `--radius-lg`)

### Dark theme (`.dark`)

Defined in `globals.css` lines 74–117. Rules:

| Token group | Dark adjustment |
|-------------|-----------------|
| Background | Near-black `#09090B` |
| Foreground | Near-white `#FAFAFA` |
| Primary | Inverted white/black |
| Muted surfaces | Zinc `#27272A` |
| Borders | Match muted surfaces |
| Destructive | Darker red `#7F1D1D` |
| Radius | Shrinks `0.75rem` → `0.5rem` |
| Sidebar | Dark background, light active state |

---

## 4. Tailwind Integration

Tailwind CSS 4 uses `@theme inline` to expose CSS variables as utility classes.

```css
@theme inline {
  --color-primary: var(--color-primary);
  --color-background: var(--color-background);
  --color-foreground: var(--foreground);
  /* ... full mapping in globals.css */
}
```

This enables:

```tsx
className="bg-background text-foreground border-border"
className="bg-card text-card-foreground"
className="text-muted-foreground"
```

### Custom variant

```css
@custom-variant dark (&:is(.dark *));
```

Allows dark-mode utilities without repeating `.dark` prefix in every component.

---

## 5. Theme Toggle

### Current implementation

- `UserMenu` → Appearance item toggles light/dark
- Uses `useTheme()` from `next-themes`
- Shell header — no business logic

### Target behaviour

| Option | next-themes value |
|--------|-------------------|
| Light | `theme: "light"` |
| Dark | `theme: "dark"` |
| System | `theme: "system"` |

Preferences UI (three-option selector) is a Phase 05+ enhancement. Current binary toggle is acceptable interim.

### Persistence

`next-themes` stores preference in `localStorage` under `theme` key. System mode respects OS changes on reload.

---

## 6. Component Theme Consumption

### Correct

```tsx
<div className="bg-card border border-border text-foreground">
<Button variant="default" />  {/* uses material gradient — theme-aware */}
<p className="text-muted-foreground">
```

### Incorrect

```tsx
<div className="bg-white dark:bg-zinc-900">
<div className="text-stone-700 dark:text-stone-300">
```

Migrate stone literals to semantic tokens incrementally.

---

## 7. Special Cases

### Material gradient button

Primary buttons use stone gradient in both themes via `materialGradientClasses` in `lib/utils/material-styles.ts`. Dark mode does not invert the gradient — it remains the dark stone fill for brand consistency.

### Charts

Chart colours (`--chart-1` through `--chart-5`) are shared across themes. Axis/grid colours use `--color-border` and `--color-muted` which adapt per theme.

### Auth pages

Auth slider overlay uses fixed stone gradient (`#1c1917` → `#44403c`) — acceptable exception for marketing chrome outside the app shell.

### Platform shell

`/platform/*` routes share the same token system via `globals.css`. No separate theme file.

---

## 8. Sidebar Theme

Sidebar tokens are theme-aware:

| Token | Light | Dark |
|-------|-------|------|
| `--sidebar-background` | `#FFFFFF` | `#09090B` |
| `--sidebar-foreground` | `#0C0A09` | `#FAFAFA` |
| `--sidebar-border` | `#E7E5E4` | `#27272A` |
| `--color-sidebar-active` | `#292524` | `#FAFAFA` |

Active nav item uses material gradient in both themes.

---

## 9. Adding New Tokens

Checklist for any new CSS variable:

1. Define in `:root` (light value)
2. Define in `.dark` (dark value)
3. Add to `@theme inline` block if Tailwind utility needed
4. Document in [COLOR_SYSTEM.md](./COLOR_SYSTEM.md)
5. Verify WCAG AA contrast in both themes
6. Test with system preference toggle

---

## 10. Organization Context (Multi-Tenancy)

Theme preference is **per browser** (localStorage) — not per organization.

Organization branding (future CrossLife activation) would extend tokens via CSS variable overrides at the layout level, not per-component. Deferred until brand activation is approved.

---

## 11. File Structure

### Current

```
frontend/src/app/
├── globals.css          # All theme tokens
├── layout.tsx           # Font loading
└── providers.tsx        # ThemeProvider
```

### Target

```
frontend/src/
├── app/globals.css      # CSS variable declarations only
├── styles/
│   ├── tokens/
│   │   ├── colors.ts
│   │   └── theme.ts     # Aggregates light/dark maps
│   └── tailwind/
│       └── tailwind.theme.ts
```

Build step or script may generate `globals.css` from token files in a future phase.

---

## 12. Testing Checklist

- [ ] Light mode — all shell zones render correctly
- [ ] Dark mode — no white flashes on navigation
- [ ] System mode — respects OS preference
- [ ] Theme persists across page reload
- [ ] Focus rings visible in both themes
- [ ] Status badges readable in both themes
- [ ] Charts legible in both themes
- [ ] `prefers-reduced-motion` independent of theme

---

## 13. Accessibility

| Concern | Solution |
|---------|----------|
| Contrast | All token pairs meet WCAG AA — see COLOR_SYSTEM.md §13 |
| Focus visibility | `--ring` inverts per theme |
| Forced colours | Semantic tokens degrade gracefully |
| Motion + theme | Independent — reduced motion does not affect theme |

---

## 14. Related Documents

| Document | Contents |
|----------|----------|
| [COLOR_SYSTEM.md](./COLOR_SYSTEM.md) | Full colour token tables |
| [DESIGN_TOKENS_AND_THEME.md](./DESIGN_TOKENS_AND_THEME.md) | Master token index |
| [MOTION_GUIDELINES.md](./MOTION_GUIDELINES.md) | `disableTransitionOnChange` rationale |
| Phase 01 [DESIGN_SYSTEM.md](../phase-01/DESIGN_SYSTEM.md) §14 | Original dark mode table |

---

## 15. Governance

Do not proceed to Phase 05 until theme architecture is reviewed and approved alongside the full Phase 04 token system.
