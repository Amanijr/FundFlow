# Phase 04 — Color System

**Date:** 2026-06-30  
**Active palette:** Material + shadcn template  
**Implementation:** `frontend/src/app/globals.css`  
**Rule:** Never hardcode hex in components. Use semantic tokens only.

---

## 1. Color Architecture

Colours are organised into semantic groups. Components reference semantics — never raw palette steps.

```
Brand → Primary actions, focus rings, links
Surface → Backgrounds, cards, panels, dialogs
Text → Foreground hierarchy
Border → Dividers, inputs, table lines
Status → Success, warning, danger, info, workflow states
Financial → Income, expense, donation, fund, budget, ledger
Chart → Data visualisation series
Sidebar → Navigation chrome (subset of surface)
```

---

## 2. Brand Tokens

| Token | CSS variable | Light | Dark | Usage |
|-------|--------------|-------|------|-------|
| Primary | `--primary` | `#000000` | `#FFFFFF` | Focus ring, semantic primary |
| Primary foreground | `--primary-foreground` | `#FFFFFF` | `#000000` | Text on primary |
| Primary hover | `--color-primary-hover` | `#292524` | `#E7E5E4` | Button gradient bottom |
| Ring | `--ring` | `#000000` | `#FFFFFF` | Focus outline |

### Primary button gradient (component token)

Not a flat `--primary` fill — uses stone gradient via `materialGradientClasses`:

| Step | Value | Role |
|------|-------|------|
| Gradient from | `#44403C` (stone-700) | Top |
| Gradient to | `#292524` (stone-800) | Bottom |
| Border | `#1C1917` (stone-900) | Edge |
| Text | `#FAFAF9` (stone-50) | Label |
| Inset highlight | `rgba(255,255,255,0.25)` top | Gloss |

**Tailwind:** `bg-primary` for flat contexts; gradient classes for `Button variant="default"` and active nav.

---

## 3. Surface Tokens

| Token | CSS variable | Light | Dark | Usage |
|-------|--------------|-------|------|-------|
| Background | `--background` | `#FAFAF9` | `#09090B` | App canvas |
| Surface | `--color-surface` / `--card` | `#FFFFFF` | `#09090B` | Cards, panels |
| Surface foreground | `--card-foreground` | `#0C0A09` | `#FAFAFA` | Text on surface |
| Surface muted | `--muted` | `#F5F5F4` | `#27272A` | Table headers, tab lists |
| Surface elevated | `--popover` | `#FFFFFF` | `#09090B` | Dropdowns, popovers |
| Surface hover | `--accent` | `#F5F5F4` | `#27272A` | Ghost button hover |
| Overlay | — | `bg-black/80` | `bg-black/80` | Modal backdrop |

### Background hierarchy

```
Level 0 — bg-background     App shell canvas
Level 1 — transparent       Content area
Level 2 — bg-card           Cards, tables
Level 3 — bg-popover        Dropdowns
Level 4 — bg-black/80       Modal overlay
```

---

## 4. Text Tokens

| Token | CSS variable / class | Light | Usage |
|-------|---------------------|-------|-------|
| Text primary | `--foreground` / `text-foreground` | `#0C0A09` | Body, headings |
| Text secondary | `text-secondary-foreground` | `#1C1917` | On secondary backgrounds |
| Text muted | `--muted-foreground` / `text-muted-foreground` | `#78716C` | Captions, placeholders |
| Text disabled | `opacity-disabled` + muted | — | Disabled controls |
| Text inverse | `--primary-foreground` | `#FFFFFF` | On dark/primary backgrounds |
| Heading | `--color-heading` | `#0C0A09` / `#FAFAFA` | h1–h6 |

---

## 5. Border Tokens

| Token | CSS variable | Light | Dark | Usage |
|-------|--------------|-------|------|-------|
| Border default | `--border` | `#E7E5E4` | `#27272A` | Cards, dividers, tables |
| Border subtle | `stone-100` equivalent | `#F5F5F4` | — | Internal row separators |
| Border strong | `stone-300` equivalent | `#D6D3D1` | — | Emphasised dividers |
| Border interactive | `--input` | `#E7E5E4` | `#27272A` | Input fields |
| Border focus | `--ring` | `#000000` | `#FFFFFF` | Focus ring colour |
| Border error | `--destructive` | `#EF4444` | `#7F1D1D` | Invalid fields |
| Border success | `--color-success` | `#22C55E` | `#22C55E` | Valid state indicators |

**Preferred classes:** `border-border`, `border-input`, `border-destructive` — not `border-stone-200` in new code.

---

## 6. Status Tokens

| Status | Token | CSS variable | HEX | Usage |
|--------|-------|--------------|-----|-------|
| Success | `--color-success` | `--color-success` | `#22C55E` | Confirmations, positive metrics |
| Warning | `--color-warning` | `--color-warning` | `#EAB308` | Attention, pending review |
| Danger | `--destructive` | `--destructive` | `#EF4444` | Errors, destructive actions |
| Info | `--color-info` | `--color-info` | `#3B82F6` | Informational alerts |

### Workflow status (semantic extensions)

| State | Colour token | Background tint | Usage |
|-------|--------------|-----------------|-------|
| Pending | `--color-warning` | warning/10% | Awaiting action |
| Draft | `--color-muted` | muted | Unpublished records |
| Archived | `--color-muted` | muted/50% | Inactive records |
| Approved | `--color-success` | success/10% | Approved workflows |
| Rejected | `--destructive` | destructive/10% | Rejected workflows |

### Status tint pattern

```
Background: color at 10% opacity
Border:     color at 30% opacity
Text:       full saturation or darker shade
```

---

## 7. Financial Colour Tokens

Consistent across all ERP modules. Never invent per-page financial colours.

| Token | CSS variable (target) | HEX | Usage |
|-------|----------------------|-----|-------|
| Income | `--color-finance-income` | `#22C55E` | Revenue, credits, positive variance |
| Expense | `--color-finance-expense` | `#EF4444` | Costs, debits, negative variance |
| Donation | `--color-finance-donation` | `#22C55E` | Donation amounts (alias income green) |
| Fund | `--color-finance-fund` | `#3B82F6` | Fund balances, allocations |
| Budget | `--color-finance-budget` | `#EAB308` | Budget lines, forecasts |
| Ledger | `--color-finance-ledger` | `#78716C` | Neutral ledger entries |

**Current mapping:** Financial colours reuse status/chart tokens until dedicated variables are added to `globals.css`:

| Financial | Maps to (interim) |
|-----------|-------------------|
| Income / Donation | `--color-success` / `--chart-1` |
| Expense | `--destructive` |
| Fund | `--color-info` / `--chart-3` |
| Budget | `--color-warning` |
| Ledger | `--chart-4` / `--muted-foreground` |

---

## 8. Chart Tokens

| Token | HEX | Usage |
|-------|-----|-------|
| `--chart-1` | `#22C55E` | Primary series |
| `--chart-2` | `#0C0A09` | Secondary series |
| `--chart-3` | `#3B82F6` | Tertiary / sparkline |
| `--chart-4` | `#78716C` | Neutral comparison |
| `--chart-5` | `#E7E5E4` | Inactive bars |

Grid lines and axis labels: `--color-border`, `--color-muted`.

---

## 9. Sidebar Tokens

| Token | CSS variable | Light | Usage |
|-------|--------------|-------|-------|
| Sidebar background | `--sidebar-background` | `#FFFFFF` | Panel fill |
| Sidebar foreground | `--sidebar-foreground` | `#0C0A09` | Nav text |
| Sidebar border | `--sidebar-border` | `#E7E5E4` | Right edge |
| Sidebar accent | `--sidebar-accent` | `#F5F5F4` | Hover |
| Sidebar active | `--color-sidebar-active` | `#292524` | Active item (gradient) |
| Sidebar muted | `--color-sidebar-muted` | `#78716C` | Group labels |

---

## 10. Neutral Scale (Stone)

Raw scale for token authoring only — components use semantics.

| Step | HEX | Tailwind |
|------|-----|----------|
| 50 | `#FAFAF9` | `stone-50` |
| 100 | `#F5F5F4` | `stone-100` |
| 200 | `#E7E5E4` | `stone-200` |
| 300 | `#D6D3D1` | `stone-300` |
| 500 | `#78716C` | `stone-500` |
| 700 | `#44403C` | `stone-700` |
| 800 | `#292524` | `stone-800` |
| 900 | `#1C1917` | `stone-900` |
| 950 | `#0C0A09` | `stone-950` |

---

## 11. Usage Rules

### Do

```tsx
className="bg-card text-foreground border-border"
className="text-muted-foreground"
className="bg-destructive text-destructive-foreground"
className="text-primary"
className="bg-success"           // after @theme mapping
className="text-finance-income"  // target token
```

### Don't

```tsx
className="text-blue-500"
className="bg-green-500"
className="border-gray-200"
style={{ color: "#22C55E" }}
```

### Exceptions (temporary)

Shell components may still reference `stone-*` literals from Phase 03 implementation. Migrate to semantic tokens during Phase 05+ refactors.

---

## 12. Dark Mode Colour Rules

All tokens in §2–§9 have `.dark` counterparts in `globals.css`.

| Adjustment | Rule |
|------------|------|
| Background | Near-black `#09090B` |
| Primary | Inverted to white |
| Borders | Zinc `#27272A` |
| Status hues | Same hue, adjusted backgrounds |
| Radius | Shrinks `0.75rem` → `0.5rem` |

Never implement dark mode with one-off component overrides. Always use CSS variable cascade.

---

## 13. Accessibility — Contrast

| Pair | Minimum ratio | Status |
|------|---------------|--------|
| `--foreground` on `--background` | 4.5:1 | AA pass |
| `--muted-foreground` on `--background` | 4.5:1 | AA pass |
| `--primary-foreground` on gradient button | 4.5:1 | AA pass |
| Status text on tint backgrounds | 4.5:1 | Verify per badge |

Use [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) when adding new pairs.

---

## 14. Deferred — CrossLife Brand

CrossLife orange (`#C85716`), cream canvas, and dark sidebar are **not active**. See Phase 01 `COLOR_GUIDE.md` §11. Activating CrossLife requires updating this document and all semantic mappings.

---

## 15. Target `colors.ts` Export Shape

```ts
export const colorTokens = {
  brand: {
    primary: "var(--primary)",
    primaryForeground: "var(--primary-foreground)",
    primaryHover: "var(--color-primary-hover)",
  },
  surface: {
    background: "var(--background)",
    card: "var(--card)",
    muted: "var(--muted)",
    popover: "var(--popover)",
  },
  text: {
    foreground: "var(--foreground)",
    muted: "var(--muted-foreground)",
    heading: "var(--color-heading)",
  },
  status: {
    success: "var(--color-success)",
    warning: "var(--color-warning)",
    danger: "var(--destructive)",
    info: "var(--color-info)",
  },
  finance: {
    income: "var(--color-finance-income)",   // add to globals.css
    expense: "var(--color-finance-expense)",
    donation: "var(--color-finance-donation)",
    fund: "var(--color-finance-fund)",
    budget: "var(--color-finance-budget)",
    ledger: "var(--color-finance-ledger)",
  },
} as const;
```
