# Phase 05 — Component Variants

**Date:** 2026-06-30  
**Source:** Phase 01 specifications + current `components/ui/` implementation  
**Rule:** All visual values trace to Phase 04 design tokens.

---

## 1. Variant System Overview

FundFlow uses **class-variance-authority (CVA)** for components with multiple visual styles. Each variant maps to semantic design tokens — never raw colour scales.

```ts
const buttonVariants = cva(baseClasses, {
  variants: { variant: { ... }, size: { ... } },
  defaultVariants: { variant: "default", size: "default" },
});
```

---

## 2. Button

| Variant | Background | Text | Border | Shadow | Usage |
|---------|------------|------|--------|--------|-------|
| `default` | Stone gradient | `stone-50` | `stone-900` | `shadow-sm` → `md` hover | Primary CTA |
| `secondary` | Transparent | `stone-700` | `stone-300` | `shadow-sm` | Secondary action |
| `destructive` | `bg-destructive` | `destructive-foreground` | — | `shadow-sm` | Delete, reject |
| `outline` | Transparent | `stone-700` | `border` | `shadow-sm` | Toolbar, tertiary |
| `ghost` | Transparent | inherit | — | — | Icon buttons, nav |
| `link` | — | `foreground` | — | — | Inline text action |

### Sizes

| Size | Height | Padding | Font | Usage |
|------|--------|---------|------|-------|
| `sm` | 32px `h-8` | `px-2.5` | `text-xs` | Dense tables, toolbars |
| `default` | 36px `h-9` | `px-3` | `text-sm` | ERP default |
| `lg` | 40px `h-10` | `px-4` | `text-sm` | Auth pages |
| `icon` | 36×36 `h-9 w-9` | — | — | Icon-only |

### States

| State | Visual |
|-------|--------|
| Default | Base variant |
| Hover | Gradient shift / `hover:bg-accent` / `hover:opacity-80` |
| Focus | `ring-2 ring-ring ring-offset-2` |
| Active | Darker gradient |
| Disabled | `opacity-50 pointer-events-none` |
| Loading | Spinner + `aria-busy`, label preserved |

---

## 3. Input

Single visual variant. Differentiation via `type` attribute and state.

| State | Border | Ring | Background |
|-------|--------|------|------------|
| Default | `border-input` | — | `bg-background` |
| Focus | `border-input` | `ring-2 ring-ring` | `bg-background` |
| Disabled | `border-input` | — | `opacity-50` |
| Error | `border-destructive` | `ring-destructive` | `bg-background` |
| Placeholder | — | — | `text-muted-foreground` |

| Size | Height | Usage |
|------|--------|-------|
| ERP default | `h-9` | All app forms |
| Auth | `h-10` | Login/register only |

---

## 4. Badge

| Variant | Background | Text | Border |
|---------|------------|------|--------|
| `default` | `bg-primary` | `primary-foreground` | transparent |
| `secondary` | `bg-secondary` | `secondary-foreground` | transparent |
| `outline` | transparent | `foreground` | `border` |
| `success` | `success/15` | `success` | transparent |
| `warning` | `warning/15` | `warning` | transparent |
| `danger` | `danger/15` | `danger` | transparent |

### StatusBadge mapping

| Status | Badge variant |
|--------|---------------|
| DRAFT | `secondary` |
| PENDING_REVIEW | `warning` |
| APPROVED | `success` |
| REJECTED | `danger` |
| COMPLETED | `success` |
| ARCHIVED | `outline` |

---

## 5. Card

| Variant | Style | Usage |
|---------|-------|-------|
| Default | `rounded-lg border border-border bg-card` | Standard container |
| Compact | Reduced header/content padding | ERP list pages (default) |
| Interactive | `hover:border-primary/50` | Clickable summary (target) |
| Flat | No border, `bg-muted/30` | Nested panels |

### Parts sizing (ERP density)

| Part | Padding | Typography |
|------|---------|------------|
| CardHeader | `px-4 py-2.5 border-b` | — |
| CardTitle | — | `text-sm font-semibold` |
| CardDescription | — | `text-xs text-muted-foreground` |
| CardContent | `px-4 py-3` | — |
| CardFooter | `px-4 py-3 border-t` | — |

---

## 6. Alert (target)

| Variant | Border | Background | Icon colour |
|---------|--------|------------|-------------|
| `default` | `border` | `bg-background` | `foreground` |
| `destructive` | `destructive/50` | `destructive/10` | `destructive` |
| `success` | `success/30` | `success/10` | `success` |
| `warning` | `warning/30` | `warning/10` | `warning` |

---

## 7. Avatar

| Size | Dimensions | Usage |
|------|------------|-------|
| `sm` | 24px | Table rows |
| `default` | 32px | Header, lists |
| `lg` | 40px | Profile headers |

| State | Display |
|-------|---------|
| Image loaded | `AvatarImage` |
| Fallback | Initials on `bg-muted` |
| Presence online (target) | Green dot `bg-success` |
| Presence away (target) | Amber dot `bg-warning` |

---

## 8. Table

| Variant | Style |
|---------|-------|
| Default | `border-collapse`, row `border-b` |
| Compact | `text-sm`, reduced cell padding |
| Striped (target) | Alternate `bg-muted/30` rows |

### Row states

| State | Style |
|-------|-------|
| Default | — |
| Hover | `hover:bg-muted/50` |
| Selected | `bg-muted` |
| Header | `text-muted-foreground font-medium` |

---

## 9. Dialog / Sheet / Popover

| Property | Dialog | Sheet | Popover |
|----------|--------|-------|---------|
| Overlay | `bg-black/80` | `bg-black/80` | — |
| Content bg | `bg-card` | `bg-card` | `bg-popover` |
| Shadow | `shadow-lg` | `shadow-lg` | `shadow-md` |
| Radius | `rounded-lg` | `rounded-xl` (top) | `rounded-md` |
| Animation | fade + zoom | slide | fade + zoom |

---

## 10. Enterprise Component Variants

### KpiCard / StatisticCard

| Variant | Border | Background |
|---------|--------|------------|
| `neutral` | `border-border` | `bg-surface` |
| `success` | `success/25` | `success/5` |
| `warning` | `warning/25` | `warning/5` |
| `danger` | `danger/25` | `danger/5` |

### CurrencyDisplay (target)

| Variant | Text colour |
|---------|-------------|
| `default` | `text-foreground` |
| `positive` | `text-success` |
| `negative` | `text-destructive` |
| `muted` | `text-muted-foreground` |

### PercentageDisplay (target)

| Variant | Text colour | Condition |
|---------|-------------|-----------|
| `default` | `text-foreground` | value ≥ 0 |
| `positive` | `text-success` | explicit |
| `negative` | `text-destructive` | value < 0 |

---

## 11. Skeleton / Loading

| Pattern | Animation | Duration |
|---------|-----------|----------|
| `skeleton-shimmer` | Background sweep | 1.6s |
| `skeleton-row-in` | Fade + slide | 400ms |
| `loader-spin` | Rotate | 1.1s |
| `content-reveal` | Fade + slide | 350ms |

All disabled under `prefers-reduced-motion: reduce`.

---

## 12. Tabs (target)

| Part | Active | Inactive |
|------|--------|----------|
| TabsList | `bg-muted rounded-md p-1` | — |
| TabsTrigger | `bg-background shadow-sm text-foreground` | `text-muted-foreground` |

---

## 13. Size Scale Summary

Cross-component size alignment:

| Token name | Height | Used by |
|------------|--------|---------|
| `control-sm` | 32px | Button sm, compact inputs |
| `control-default` | 36px | Button, Input, Select trigger |
| `control-lg` | 40px | Auth inputs, Button lg |
| `header` | 48px | App header `h-12` |
| `icon-inline` | 16px | Button icons, nav |
| `icon-default` | 24px | Empty state, features |

---

## 14. Do / Don't

### Do

```tsx
<Button variant="outline" size="sm">Export</Button>
<Badge variant="success">Approved</Badge>
<StatisticCard variant="warning" label="Variance" value="12%" />
```

### Don't

```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
<span className="bg-green-100 text-green-800 px-2 rounded-full">Active</span>
<div className="border border-gray-200 p-6 rounded-xl shadow-2xl">...</div>
```

---

## 15. Related Documents

- [COMPONENT_API.md](./COMPONENT_API.md) — props reference
- Phase 04 [COLOR_SYSTEM.md](../phase-04/COLOR_SYSTEM.md) — token values
- Phase 04 [TYPOGRAPHY_SYSTEM.md](../phase-04/TYPOGRAPHY_SYSTEM.md) — type scale
- Phase 01 [COMPONENT_SPECIFICATIONS.md](../phase-01/COMPONENT_SPECIFICATIONS.md) — source specs
