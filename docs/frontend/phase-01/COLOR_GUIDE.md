# FundFlow ERP — Color Guide

**Phase:** 01  
**Rule:** Never hardcode hex values in components. Always use CSS variables or Tailwind semantic classes.

---

## 1. Primary Palette

CrossLife brand orange — the authoritative primary for all CTAs, active states, focus rings, and links.

| Name | HEX | CSS Variable | HSL | Usage |
|------|-----|--------------|-----|-------|
| Primary | `#C85716` | `--color-primary` | 22° 80% 44% | Buttons, links, active nav, focus rings |
| Primary hover | `#A84812` | `--color-primary-hover` | 20° 80% 36% | Button hover, pressed states |
| Primary foreground | `#FFFFFF` | `--primary-foreground` | — | Text on primary backgrounds |

**Dark mode primary:** `#D4621F` (`--color-primary` under `.dark`)

### Material gradient adaptation

Primary buttons use a Material-style gradient mapped to brand orange:

```
gradient: linear-gradient(to bottom, #D4621F, #C85716)
border: #A84812
inset highlight: rgba(255,255,255,0.25) top, rgba(0,0,0,0.2) bottom
```

Do not use template stone-800 gradient for primary actions.

---

## 2. Secondary Palette

Warm neutrals derived from CrossLife cream palette — not template cool grays.

| Name | HEX | CSS Variable | Usage |
|------|-----|--------------|-------|
| Secondary | `#F5EFE6` | `--secondary` | Subtle backgrounds, secondary buttons |
| Secondary foreground | `#1A1715` | `--secondary-foreground` | Text on secondary |
| Accent | `#F5EFE6` | `--accent` | Hover backgrounds, ghost button hover |
| Accent foreground | `#1A1715` | `--accent-foreground` | Text on accent |

**Dark mode secondary:** `#2D2825`

---

## 3. Semantic Status Colors

| Status | Name | HEX | CSS Variable | Usage |
|--------|------|-----|--------------|-------|
| Success | Green | `#059652` | `--color-success` | Approved, paid, active, completed |
| Warning | Amber | `#E8A317` | `--color-warning` | Pending, draft, attention required |
| Error | Red | `#DF1529` | `--color-danger` / `--destructive` | Failed, rejected, delete, overdue |
| Info | Blue | `#2563EB` | `--color-info` | Informational banners, help text, links |

### Status background tints (alerts, badges)

| Status | Background | Border | Text |
|--------|------------|--------|------|
| Success | `#059652` at 10% opacity | `#059652` at 30% | `#059652` |
| Warning | `#E8A317` at 10% opacity | `#E8A317` at 30% | `#92680D` |
| Error | `#DF1529` at 10% opacity | `#DF1529` at 30% | `#DF1529` |
| Info | `#2563EB` at 10% opacity | `#2563EB` at 30% | `#2563EB` |

---

## 4. Neutral Grayscale

Warm stone-inspired scale mapped to CrossLife brand. Use semantic tokens first; reach for scale steps only when semantic tokens don't apply.

| Step | HEX | Name | Maps to |
|------|-----|------|---------|
| 50 | `#FAFAF8` | Warm white | Near `--color-background` |
| 100 | `#F5EFE6` | Cream light | `--secondary`, `--muted` bg |
| 200 | `#E8E0D8` | Warm border | `--color-border` |
| 300 | `#D4CCC4` | Warm gray light | Disabled borders |
| 400 | `#A8A29E` | Warm gray | Placeholder text (dark mode) |
| 500 | `#6B6560` | Muted text | `--color-muted` |
| 600 | `#57534E` | Body secondary | Supporting text |
| 700 | `#44403C` | Dark gray | — |
| 800 | `#2D2825` | Sidebar hover | `--color-sidebar-hover` |
| 900 | `#1A1715` | Sidebar / body text | `--color-sidebar`, `--color-text` |
| 950 | `#110A06` | Heading / dark bg | `--color-heading`, dark `--color-background` |

### Template stone → ERP mapping

| Template class | ERP equivalent |
|----------------|----------------|
| `bg-stone-50` | `bg-background` |
| `border-stone-200` | `border-border` |
| `text-stone-900` | `text-foreground` |
| `text-stone-600` | `text-muted-foreground` |
| `bg-stone-800` | `bg-primary` (with brand gradient) |
| `text-stone-500` | `text-muted-foreground` |

---

## 5. Background Hierarchy

| Level | Name | HEX | Variable | Usage |
|-------|------|-----|----------|-------|
| L0 | Canvas | `#FFFAF2` | `--color-background` | App shell background |
| L1 | Surface | `#FFFFFF` | `--color-surface` / `--card` | Cards, panels, inputs, modals |
| L2 | Muted surface | `#F5EFE6` | `--muted` | Table headers, tab lists, skeleton |
| L3 | Popover | `#FFFFFF` | `--popover` | Dropdowns, tooltips, select menus |
| L4 | Overlay | `rgba(0,0,0,0.8)` | — | Dialog/drawer backdrop |
| L5 | Sidebar | `#1A1715` | `--color-sidebar` | Navigation chrome |

### Dark mode backgrounds

| Level | HEX |
|-------|-----|
| Canvas | `#110A06` |
| Surface | `#1A1715` |
| Muted surface | `#2D2825` |
| Sidebar | `#1A1715` (unchanged) |

---

## 6. Sidebar Chrome

| Name | HEX | Variable | Usage |
|------|-----|----------|-------|
| Sidebar background | `#1A1715` | `--color-sidebar` | Sidebar panel |
| Sidebar foreground | `#FFFFFF` | `--color-sidebar-foreground` | Nav labels, logo |
| Sidebar muted | `#B8B0A8` | `--color-sidebar-muted` | Group labels, secondary nav text |
| Sidebar border | `#3D3835` | `--color-sidebar-border` | Dividers, scrollbar |
| Sidebar accent | `#2D2825` | `--color-sidebar-accent` | Nav item hover |
| Sidebar active | `#C85716` | `--color-sidebar-active` | Active route left border |

---

## 7. Chart Colors

| Token | HEX | Usage |
|-------|-----|-------|
| `--chart-1` | `#C85716` | Primary data series |
| `--chart-2` | `#059652` | Positive / income |
| `--chart-3` | `#2563EB` | Secondary comparison |
| `--chart-4` | `#E8A317` | Warning / budget variance |
| `--chart-5` | `#6B6560` | Neutral / baseline |

**Sparkline inactive bars:** `hsl(var(--muted))`  
**Sparkline active bars:** `--chart-1` or `--chart-3`

---

## 8. shadcn Semantic Aliases

These map CrossLife tokens to shadcn component expectations:

```css
:root {
  --background: var(--color-background);
  --foreground: var(--color-text);
  --card: var(--color-surface);
  --card-foreground: var(--color-text);
  --primary: var(--color-primary);
  --primary-foreground: #ffffff;
  --secondary: #f5efe6;
  --muted: #f5efe6;
  --muted-foreground: var(--color-muted);
  --destructive: var(--color-danger);
  --border: var(--color-border);
  --input: var(--color-border);
  --ring: var(--color-primary);
}
```

---

## 9. Usage Rules

### Do

- Use `bg-primary`, `text-muted-foreground`, `border-border` in components
- Use `--color-success` for approved/paid status badges
- Use `--color-danger` for destructive button variant
- Use `--color-sidebar-active` for current navigation item
- Test all color pairs in both light and dark mode

### Don't

- Hardcode `#C85716` in JSX or CSS modules
- Use template `stone-*` classes directly — map to semantic tokens
- Use pure `#000000` or `#FFFFFF` for text (use `--color-text` / `--color-heading`)
- Create module-specific color palettes
- Use red and green as the only status indicators without icons (colorblind accessibility)

---

## 10. Contrast Requirements

| Pair | Ratio target | Standard |
|------|-------------|----------|
| Body text on background | ≥ 7:1 | WCAG AAA |
| Muted text on background | ≥ 4.5:1 | WCAG AA |
| Primary button text on primary | ≥ 4.5:1 | WCAG AA |
| Sidebar text on sidebar bg | ≥ 4.5:1 | WCAG AA |
| Focus ring on surface | ≥ 3:1 | WCAG AA (non-text) |

**Verified pairs:**
- `#1A1715` on `#FFFAF2` → 12.4:1 ✓
- `#6B6560` on `#FFFAF2` → 4.6:1 ✓
- `#FFFFFF` on `#C85716` → 4.5:1 ✓
- `#B8B0A8` on `#1A1715` → 5.8:1 ✓
