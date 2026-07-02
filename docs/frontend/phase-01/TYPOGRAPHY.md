# FundFlow ERP — Typography Guide

**Phase:** 01  
**Base size:** 14px (ERP data density)  
**Fonts:** Roboto (body), Lato (headings), Montserrat (navigation)

---

## 1. Font Families

Loaded via `next/font/google` in `frontend/src/app/layout.tsx`.

| Role | Font | Weights | CSS Variable | Tailwind |
|------|------|---------|--------------|----------|
| Body | Roboto | 400, 500, 600, 700 | `--font-sans` | `font-sans` |
| Headings | Lato | 400, 700, 900 | `--font-heading` | `font-heading` |
| Navigation | Montserrat | 400, 500, 600, 700 | `--font-nav` | `font-nav` |

### Application rules

```css
body {
  font-family: var(--font-sans);
  font-size: 0.875rem;    /* 14px */
  line-height: 1.5;
}

h1–h6 {
  font-family: var(--font-heading);
  color: var(--color-heading);
}

.sidebar, .font-nav {
  font-family: var(--font-nav);
}
```

**Rejected:** Template Inter font — not loaded, not part of brand.

---

## 2. Type Scale

8-step scale optimized for ERP density. All sizes use rem for accessibility.

| Token | Size | rem | Line height | Weight | Tailwind | Usage |
|-------|------|-----|-------------|--------|----------|-------|
| `text-2xs` | 11px | 0.6875rem | 1.4 | 500 | Custom | Table column headers (uppercase) |
| `text-xs` | 12px | 0.75rem | 1.5 | 400–600 | `text-xs` | Labels, captions, meta, badges |
| `text-sm` | 14px | 0.875rem | 1.5 | 400–600 | `text-sm` | **Body default**, table data, inputs |
| `text-base` | 16px | 1rem | 1.5 | 400–600 | `text-base` | Emphasized body, mobile inputs |
| `text-lg` | 18px | 1.125rem | 1.4 | 600 | `text-lg` | Dialog titles, card titles (compact) |
| `text-xl` | 20px | 1.25rem | 1.3 | 700 | `text-xl` | **Page titles** |
| `text-2xl` | 24px | 1.5rem | 1.25 | 700 | `text-2xl` | Dashboard hero metrics |
| `text-3xl` | 30px | 1.875rem | 1.2 | 700 | `text-3xl` | Auth page headings only |

---

## 3. Heading Hierarchy

| Level | Element | Size | Weight | Font | Color | Usage |
|-------|---------|------|--------|------|-------|-------|
| H1 | Page title | `text-xl` (20px) | 700 | Lato | `--color-heading` | One per page via PageHeader |
| H2 | Section title | `text-sm` (14px) | 600 | Lato | `--color-heading` | Form sections, panel headers |
| H3 | Subsection | `text-sm` (14px) | 600 | Roboto | `--color-text` | Card titles, detail groups |
| H4 | Group label | `text-xs` (12px) | 600 | Montserrat | `--color-muted` | Sidebar groups, filter labels |
| H5 | Micro heading | `text-xs` (12px) | 500 | Roboto | `--color-muted` | Table group headers |
| H6 | — | — | — | — | — | Not used in ERP |

### Page title pattern

```tsx
<h1 className="text-xl font-bold font-heading text-heading">
  Donors
</h1>
<p className="text-sm text-muted-foreground">
  Manage donor records and giving history
</p>
```

### Section title pattern

```tsx
<h2 className="text-sm font-semibold font-heading text-heading">
  Contact Information
</h2>
```

---

## 4. Body Text

| Style | Size | Weight | Color | Usage |
|-------|------|--------|-------|-------|
| Body default | 14px | 400 | `--color-text` | Paragraphs, descriptions |
| Body medium | 14px | 500 | `--color-text` | Emphasized inline text |
| Body small | 12px | 400 | `--color-muted` | Timestamps, helper text |
| Body link | 14px | 500 | `--color-primary` | Inline links, `underline-offset-4` |

**Paragraph spacing:** `mb-4` between paragraphs; `leading-relaxed` for long-form only.

---

## 5. Labels & Form Text

| Element | Size | Weight | Color | Class |
|---------|------|--------|-------|-------|
| Field label | 12px | 500 | `--color-text` | `text-xs font-medium` |
| Required indicator | 12px | 500 | `--color-danger` | `text-destructive` |
| Placeholder | 14px | 400 | `--color-muted` | `placeholder:text-muted-foreground` |
| Helper text | 12px | 400 | `--color-muted` | `text-xs text-muted-foreground` |
| Error message | 12px | 500 | `--color-danger` | `text-xs text-destructive` |
| Input value | 14px | 400 | `--color-text` | `text-sm` |

---

## 6. Captions & Meta

| Element | Size | Weight | Color | Usage |
|---------|------|--------|-------|-------|
| Caption | 12px | 400 | `--color-muted` | Image captions, footnotes |
| Timestamp | 12px | 400 | `--color-muted` | `text-xs text-muted-foreground` |
| Badge text | 12px | 600 | varies | `text-xs font-semibold` |
| Breadcrumb | 14px | 400 | `--color-muted` | `text-sm text-muted-foreground` |
| Breadcrumb current | 14px | 500 | `--color-text` | `text-sm font-medium` |

---

## 7. Table Text

| Element | Size | Weight | Transform | Color | Class |
|---------|------|--------|-----------|-------|-------|
| Column header | 11–12px | 600 | uppercase | `--color-muted` | `text-xs font-semibold uppercase tracking-wider text-muted-foreground` |
| Cell data | 14px | 400 | none | `--color-text` | `text-sm` |
| Cell numeric | 14px | 400 | none | `--color-text` | `text-sm tabular-nums` |
| Cell muted | 14px | 400 | none | `--color-muted` | `text-sm text-muted-foreground` |
| Footer / totals | 14px | 600 | none | `--color-text` | `text-sm font-semibold tabular-nums` |

**Financial columns:** Always use `.tabular-nums` for aligned decimal columns.

---

## 8. Dashboard Metrics

| Element | Size | Weight | Font | Color | Class |
|---------|------|--------|------|-------|-------|
| Metric value | 24px | 700 | Lato | `--color-heading` | `text-2xl font-bold font-heading` |
| Metric label | 12px | 500 | Roboto | `--color-muted` | `text-xs font-medium text-muted-foreground` |
| Metric delta (positive) | 12px | 600 | Roboto | `--color-success` | `text-xs font-semibold text-success` |
| Metric delta (negative) | 12px | 600 | Roboto | `--color-danger` | `text-xs font-semibold text-destructive` |
| Sparkline label | 12px | 400 | Roboto | `--color-muted` | `text-xs` |

### Stats card pattern

```
┌─────────────────────────┐
│  Total Donations        │  ← text-xs font-medium text-muted-foreground
│  $124,500               │  ← text-2xl font-bold font-heading tabular-nums
│  ↑ 12.5% vs last month │  ← text-xs font-semibold text-success
│  ▂▃▅▇█ (sparkline)      │
└─────────────────────────┘
```

---

## 9. Navigation Text

| Element | Size | Weight | Font | Color |
|---------|------|--------|------|-------|
| Sidebar brand | 18px | 600 | sans | `text-stone-900` |
| Sidebar item | 14px | 400 | sans | `text-stone-700` |
| Sidebar item (active) | 14px | 400 | sans | `text-stone-50` on gradient |
| Sidebar group label | 12px | 600 | sans | `text-stone-500` |
| Top bar title | 14px | 600 | Lato | `--color-heading` |
| Tab trigger | 14px | 500 | Roboto | active: `--color-text`, inactive: `--color-muted` |

---

## 10. Dialog & Overlay Text

| Element | Size | Weight | Usage |
|---------|------|--------|-------|
| Dialog title | 18px / 600 | `text-lg font-semibold` |
| Dialog description | 14px / 400 | `text-sm text-muted-foreground` |
| Alert title | 14px / 600 | `font-semibold leading-none` |
| Alert description | 14px / 400 | `text-sm` |
| Drawer title | 18px / 600 | `text-lg font-semibold` |

---

## 11. Letter Spacing

| Context | Tracking |
|---------|----------|
| Body text | normal |
| Table headers (uppercase) | `tracking-wider` (0.05em) |
| Sidebar group labels | `tracking-wider` |
| Page titles | normal |
| Badge text | normal |
| Metric values | `tracking-tight` (-0.025em) |

---

## 12. Do / Don't

### Do

- Use `text-sm` (14px) as the default body size
- Use `font-heading` (Lato) for page and section titles only
- Use `font-nav` (Montserrat) for sidebar and navigation labels
- Use `tabular-nums` on all currency and numeric columns
- Keep page titles at `text-xl` — not marketing hero sizes

### Don't

- Use `text-2xl` CardTitle on ERP data cards (template default — too large)
- Mix Inter or system fonts alongside brand fonts
- Use `font-bold` on body paragraphs
- Set font sizes below 11px (accessibility floor)
- Use colored text without semantic meaning
