# FundFlow ERP — Color Guide

**Phase:** 01  
**Active palette:** Material + shadcn template (`material-shadcn-1.0.0/client/src/index.css`)  
**Rule:** Never hardcode hex values in components. Always use CSS variables or Tailwind semantic classes.

> **CrossLife brand colours are deferred.** See [§11 Deferred — CrossLife Brand](#11-deferred--crosslife-brand) at the end of this document. Do not use them during template migration phases.

---

## 1. Primary Palette

Material black / stone gradient — authoritative primary for CTAs, active nav, focus rings, and links.

| Name | HEX | CSS Variable | HSL (source) | Usage |
|------|-----|--------------|--------------|-------|
| Primary | `#000000` | `--primary` | `hsl(0, 0%, 0%)` | Semantic primary, focus ring |
| Primary foreground | `#FFFFFF` | `--primary-foreground` | `hsl(0, 0%, 100%)` | Text on primary backgrounds |
| Primary button gradient (from) | `#44403C` | — | stone-700 | Button gradient top |
| Primary button gradient (to) | `#292524` | — | stone-800 | Button gradient bottom |
| Primary button border | `#1C1917` | — | stone-900 | Button border |

**Dark mode primary:** `#FFFFFF` (`--primary` under `.dark`)  
**Dark mode primary foreground:** `#000000`

### Material gradient (buttons & active nav)

Primary buttons and active sidebar items use the template stone gradient — not a flat fill:

```
gradient: linear-gradient(to bottom, #44403C, #292524)   /* stone-700 → stone-800 */
border: #1C1917                                           /* stone-900 */
text: #FAFAF9                                             /* stone-50 */
inset highlight: inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 0 rgba(0,0,0,0.35)
shadow: shadow-sm → shadow-md on hover
```

Map to semantic classes in implementation: `bg-primary` for flat contexts; gradient classes for `Button variant="default"` and active nav items.

---

## 2. Secondary Palette

Template warm off-white neutrals from shadcn tokens.

| Name | HEX | CSS Variable | HSL (source) | Usage |
|------|-----|--------------|--------------|-------|
| Secondary | `#F5F5F4` | `--secondary` | `hsl(60, 4.8%, 95.9%)` | Subtle backgrounds, secondary buttons |
| Secondary foreground | `#1C1917` | `--secondary-foreground` | `hsl(24, 9.8%, 10%)` | Text on secondary |
| Accent | `#F5F5F4` | `--accent` | `hsl(60, 4.8%, 95.9%)` | Hover backgrounds, ghost button hover |
| Accent foreground | `#1C1917` | `--accent-foreground` | `hsl(24, 9.8%, 10%)` | Text on accent |
| Muted | `#F5F5F4` | `--muted` | `hsl(60, 4.8%, 95.9%)` | Table headers, tab lists, skeleton |
| Muted foreground | `#78716C` | `--muted-foreground` | `hsl(25, 5.3%, 44.7%)` | Placeholders, captions, labels |

**Dark mode secondary / muted:** `hsl(240, 3.7%, 15.9%)` ≈ `#27272A`

---

## 3. Semantic Status Colors

| Status | Name | HEX | CSS Variable | Source |
|--------|------|-----|--------------|--------|
| Success | Green | `#22C55E` | `--color-success` | Template chart accent (`green-500`) |
| Warning | Amber | `#EAB308` | `--color-warning` | Standard attention state |
| Error | Red | `#EF4444` | `--destructive` | `hsl(0, 84.2%, 60.2%)` from template |
| Info | Blue | `#3B82F6` | `--color-info` | Template mini-chart accent (`blue-500`) |

**Dark mode destructive:** `hsl(0, 62.8%, 30.6%)` ≈ `#7F1D1D`

### Status background tints (alerts, badges)

| Status | Background | Border | Text |
|--------|------------|--------|------|
| Success | `#22C55E` at 10% | `#22C55E` at 30% | `#16A34A` |
| Warning | `#EAB308` at 10% | `#EAB308` at 30% | `#A16207` |
| Error | `#EF4444` at 10% | `#EF4444` at 30% | `#EF4444` |
| Info | `#3B82F6` at 10% | `#3B82F6` at 30% | `#3B82F6` |

---

## 4. Neutral Grayscale — Stone Scale

Template uses Tailwind `stone-*` as the dominant neutral scale. Map to semantic tokens in components.

| Step | HEX | Tailwind | Maps to |
|------|-----|----------|---------|
| 50 | `#FAFAF9` | `stone-50` | App shell (`bg-stone-50`), button text on dark |
| 100 | `#F5F5F4` | `stone-100` | Nav hover (`hover:bg-stone-100`), `--muted` |
| 200 | `#E7E5E4` | `stone-200` | Card borders (`border-stone-200`), sidebar dividers |
| 300 | `#D6D3D1` | `stone-300` | Secondary button border |
| 400 | `#A8A29E` | `stone-400` | — |
| 500 | `#78716C` | `stone-500` | Group labels, `--muted-foreground` |
| 600 | `#57534E` | `stone-600` | — |
| 700 | `#44403C` | `stone-700` | Gradient top, nav text (`text-stone-700`) |
| 800 | `#292524` | `stone-800` | Gradient bottom, primary button fill |
| 900 | `#1C1917` | `stone-900` | Headings, brand text (`text-stone-900`) |
| 950 | `#0C0A09` | `stone-950` | `--foreground`, chart secondary series |

### Semantic token → stone mapping

| Semantic class | Stone equivalent | HEX |
|----------------|-----------------|-----|
| `bg-background` | near `stone-50` / shell | `#F7F7F7` |
| `bg-card` | white | `#FFFFFF` |
| `border-border` | cool border token | `#E2E8F0` |
| `border-stone-200` | card borders (template override) | `#E7E5E4` |
| `text-foreground` | `stone-950` | `#0C0A09` |
| `text-muted-foreground` | `stone-500` | `#78716C` |

**Note:** Template uses both shadcn semantic tokens (`--border`: `#E2E8F0`) and hardcoded `stone-*` on cards/nav. During implementation, prefer semantic tokens and set `--border` to `#E7E5E4` (stone-200) for visual parity.

---

## 5. Background Hierarchy

| Level | Name | HEX | Variable | Usage |
|-------|------|-----|----------|-------|
| L0 | Canvas | `#FAFAF9` | `bg-stone-50` | App shell with optional `.grain-texture` |
| L0 alt | Canvas (token) | `#F7F7F7` | `--background` | shadcn background token |
| L1 | Surface | `#FFFFFF` | `--card` | Cards, panels, inputs, modals |
| L2 | Muted surface | `#F5F5F4` | `--muted` | Table headers, tab lists, skeleton |
| L3 | Popover | `#FFFFFF` | `--popover` | Dropdowns, tooltips, select menus |
| L4 | Overlay | `rgba(0,0,0,0.8)` | — | Dialog/drawer backdrop |
| L5 | Sidebar | `#FFFFFF` | `--sidebar-background` | Light sidebar panel (template) |

### Dark mode backgrounds

| Level | HEX | Variable |
|-------|-----|----------|
| Canvas | `#09090B` | `--background` (`hsl(240, 10%, 3.9%)`) |
| Surface | `#09090B` | `--card` |
| Muted surface | `#27272A` | `--muted` |
| Sidebar | `#09090B` | `--sidebar-background` |

---

## 6. Sidebar Chrome

Template uses a **light sidebar** (white/transparent), not a dark chrome bar.

| Name | HEX | Variable / Class | Usage |
|------|-----|----------------|-------|
| Sidebar background | `#FFFFFF` | `--sidebar-background` | Sidebar panel |
| Sidebar foreground | `#0C0A09` | `--sidebar-foreground` | Nav labels, brand text |
| Sidebar border | `#E7E5E4` | `border-stone-200` | Right border, section dividers |
| Nav item default | `#44403C` | `text-stone-700` | Inactive nav text |
| Nav item hover | `#F5F5F4` | `hover:bg-stone-100` | Hover background |
| Nav item active | stone gradient | See §1 gradient | Active route — same as primary button |
| Group label | `#78716C` | `text-stone-500` | `text-xs uppercase tracking-wide` |

---

## 7. Chart Colors

From template `charts-showcase.tsx` and `mini-chart.tsx`:

| Token | HEX | Usage |
|-------|-----|-------|
| `--chart-1` | `#22C55E` | Primary series (green-500) |
| `--chart-2` | `#0C0A09` | Secondary series (stone-950) |
| `--chart-3` | `#3B82F6` | Tertiary / mini-chart active (blue-500) |
| `--chart-4` | `#78716C` | Neutral comparison (stone-500) |
| `--chart-5` | `#E7E5E4` | Inactive bars / baseline (stone-200) |

**Sparkline inactive bars:** `hsl(var(--muted))` or `#E7E5E4`  
**Sparkline active bars:** `#3B82F6`

---

## 8. shadcn Semantic Aliases

Source: `material-shadcn-1.0.0/client/src/index.css`

```css
:root {
  --background: hsl(0, 0%, 97%);           /* #F7F7F7 */
  --foreground: hsl(20, 14.3%, 4.1%);      /* #0C0A09 */
  --card: hsl(0, 0%, 100%);                /* #FFFFFF */
  --card-foreground: hsl(20, 14.3%, 4.1%);
  --primary: hsl(0, 0%, 0%);               /* #000000 */
  --primary-foreground: hsl(0, 0%, 100%);
  --secondary: hsl(60, 4.8%, 95.9%);       /* #F5F5F4 */
  --muted: hsl(60, 4.8%, 95.9%);
  --muted-foreground: hsl(25, 5.3%, 44.7%); /* #78716C */
  --destructive: hsl(0, 84.2%, 60.2%);     /* #EF4444 */
  --border: hsl(214, 32%, 91%);            /* #E2E8F0 */
  --input: hsl(214, 32%, 91%);
  --ring: hsl(0, 0%, 0%);
  --radius: 0.75rem;

  --sidebar-background: hsl(0, 0%, 100%);
  --sidebar-foreground: hsl(20, 14.3%, 4.1%);
  --sidebar-primary: hsl(0, 0%, 0%);
  --sidebar-border: hsl(214, 32%, 91%);

  /* Chart tokens (define in implementation — missing from template CSS) */
  --chart-1: #22c55e;
  --chart-2: #0c0a09;
  --chart-3: #3b82f6;
  --chart-4: #78716c;
  --chart-5: #e7e5e4;

  /* ERP semantic extensions */
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-info: #3b82f6;
}
```

---

## 9. Usage Rules

### Do

- Use `bg-stone-50` for app shell, `bg-card` for surfaces
- Use stone gradient for primary buttons and active nav items
- Use `text-muted-foreground` / `text-stone-500` for secondary text
- Use `border-stone-200` on cards (template pattern)
- Use `--destructive` for error states and destructive buttons
- Test all pairs in both light and dark mode

### Don't

- Use CrossLife orange (`#C85716`) during template migration phases
- Use dark sidebar chrome (`#1A1715`) — template sidebar is light
- Hardcode `#292524` or `#000000` in JSX — use tokens or `stone-*` via theme
- Create module-specific color palettes
- Use red/green as the only status indicators without icons

---

## 10. Contrast Requirements

| Pair | Ratio target | Standard |
|------|-------------|----------|
| Body text on background | ≥ 7:1 | WCAG AAA |
| Muted text on background | ≥ 4.5:1 | WCAG AA |
| White text on stone-800 button | ≥ 4.5:1 | WCAG AA |
| stone-700 text on stone-50 | ≥ 4.5:1 | WCAG AA |
| Focus ring on surface | ≥ 3:1 | WCAG AA (non-text) |

**Verified pairs (template):**
- `#0C0A09` on `#FAFAF9` → 19.8:1 ✓
- `#78716C` on `#FAFAF9` → 4.6:1 ✓
- `#FAFAF9` on `#292524` → 14.2:1 ✓
- `#44403C` on `#F5F5F4` → 9.7:1 ✓

---

## 11. Deferred — CrossLife Brand

The following palette is **documented but not active**. It lives in `docs/CROSSLIFE_BRAND.md` and `frontend/src/app/globals.css` for future brand rollout. Do not apply during Phase 02–08 template migration.

| Name | HEX | Notes |
|------|-----|-------|
| Primary | `#C85716` | CrossLife burnt orange |
| Primary hover | `#A84812` | — |
| Background | `#FFFAF2` | Warm cream canvas |
| Sidebar | `#1A1715` | Dark navigation chrome |
| Sidebar active | `#C85716` | Orange active accent |
| Success | `#059652` | — |
| Warning | `#E8A317` | — |
| Danger | `#DF1529` | — |

**When to activate:** After template migration is complete and stakeholders approve brand switch. Requires a dedicated phase to remap tokens in `globals.css` and restyle gradient buttons to orange.
