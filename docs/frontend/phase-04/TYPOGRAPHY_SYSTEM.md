# Phase 04 — Typography System

**Date:** 2026-06-30  
**Base size:** 14px (ERP data density)  
**Implementation:** `frontend/src/app/layout.tsx` (fonts), `globals.css` (defaults)

---

## 1. Typography Principles

| Rule | Detail |
|------|--------|
| Maximum two font families per context | Body (Roboto) + headings (Lato); nav adds Montserrat |
| Avoid excessive weights | 400, 500, 600, 700 only — no 300 or 800 in ERP |
| Hierarchy through size and spacing | Not colour alone |
| Tabular figures for financial data | `.tabular-nums` utility |
| rem-based sizes | Respects user font preferences |

---

## 2. Font Families

Loaded via `next/font/google` in `frontend/src/app/layout.tsx`.

| Token | Font | Weights | CSS variable | Tailwind |
|-------|------|---------|--------------|----------|
| `font-sans` | Roboto | 400, 500, 600, 700 | `--font-sans` | `font-sans` |
| `font-heading` | Lato | 400, 700, 900 | `--font-heading` | `font-heading` |
| `font-nav` | Montserrat | 400, 500, 600, 700 | `--font-nav` | `font-nav` |

### Application

```css
body {
  font-family: var(--font-sans);
  font-size: 0.875rem;   /* 14px — body token */
  line-height: 1.5;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  color: var(--color-heading);
}
```

**Rejected:** Template Inter font — not part of FundFlow brand.

---

## 3. Type Scale Tokens

Enterprise hierarchy mapped to implementation classes.

| Token | Size | rem | Line height | Weight | Tailwind | Role |
|-------|------|-----|-------------|--------|----------|------|
| `display` | 30px | 1.875rem | 1.2 | 700 | `text-3xl font-bold font-heading` | Marketing/auth headings only |
| `h1` | 20px | 1.25rem | 1.3 | 700 | `text-xl font-bold font-heading` | Page title (one per page) |
| `h2` | 14px | 0.875rem | 1.4 | 600 | `text-sm font-semibold font-heading` | Section title |
| `h3` | 14px | 0.875rem | 1.4 | 600 | `text-sm font-semibold` | Subsection, card title |
| `h4` | 12px | 0.75rem | 1.5 | 600 | `text-xs font-semibold font-heading` | Card header, panel label |
| `body-lg` | 16px | 1rem | 1.5 | 400 | `text-base` | Emphasised body, mobile inputs |
| `body` | 14px | 0.875rem | 1.5 | 400 | `text-sm` | **Default application text** |
| `body-medium` | 14px | 0.875rem | 1.5 | 500 | `text-sm font-medium` | Emphasised inline |
| `small` | 12px | 0.75rem | 1.5 | 400 | `text-xs` | Secondary information |
| `caption` | 12px | 0.75rem | 1.5 | 400 | `text-xs text-muted-foreground` | Metadata, timestamps |
| `label` | 12px | 0.75rem | 1.5 | 500 | `text-xs font-medium` | Form labels |
| `label-upper` | 11px | 0.6875rem | 1.4 | 600 | `text-xs uppercase tracking-wide` | Table headers, nav groups |
| `metric` | 24px | 1.5rem | 1.25 | 700 | `text-2xl font-bold font-heading tabular-nums` | Dashboard KPIs |

---

## 4. Heading Hierarchy

| Level | Token | Element | Component | Usage |
|-------|-------|---------|-----------|-------|
| Display | `display` | h1 (auth only) | Auth pages | Rare — not in ERP modules |
| H1 | `h1` | h1 | `PageHeader` title | Dashboard title, list page title |
| H2 | `h2` | h2 | Section headers | Form sections, report groups |
| H3 | `h3` | h3 | Card titles | Detail panels |
| H4 | `h4` | h4 | Card subtitles | Nested groups |
| H5/H6 | — | — | — | Not used |

### Page title pattern

```tsx
<h1 className="font-heading text-xl font-bold tracking-tight text-foreground">
  Donors
</h1>
<p className="text-xs text-muted-foreground">
  Manage donor records and giving history
</p>
```

### Section title pattern

```tsx
<h2 className="font-heading text-sm font-semibold text-foreground">
  Contact Information
</h2>
```

---

## 5. Body Text Tokens

| Token | Classes | Usage |
|-------|---------|-------|
| Body default | `text-sm text-foreground` | Paragraphs, table cells |
| Body large | `text-base text-foreground` | Readable descriptions |
| Body small | `text-xs text-muted-foreground` | Helper text |
| Body link | `text-sm font-medium text-primary underline-offset-4 hover:underline` | Inline links |

**Paragraph spacing:** `mb-4` between paragraphs; `leading-relaxed` for long-form only.

---

## 6. Financial Typography

| Context | Token | Classes |
|---------|-------|---------|
| Currency amount | `metric` (large) or `body` | `text-sm font-medium tabular-nums` |
| Negative amount | body + colour | `text-destructive tabular-nums` |
| Positive amount | body + colour | `text-success tabular-nums` |
| Column header | `label-upper` | `text-xs font-medium uppercase tracking-wide text-muted-foreground` |
| Row data | `body` | `text-sm tabular-nums` |

Always apply `tabular-nums` to numeric columns for alignment.

---

## 7. Navigation Typography

| Context | Token | Classes |
|---------|-------|---------|
| Sidebar brand | nav + h4 scale | `font-nav text-sm font-semibold tracking-wide` |
| Sidebar group | `label-upper` | `text-xs font-semibold uppercase tracking-wide text-muted-foreground` |
| Sidebar item | `body` | `text-sm font-normal` |
| Breadcrumb | `small` | `text-sm text-muted-foreground` |
| Header title | `body-medium` | `text-sm font-medium text-foreground` |

---

## 8. Form Typography

| Element | Token | Classes |
|---------|-------|---------|
| Label | `label` | `text-xs font-medium text-foreground` |
| Input text | `body` | `text-sm` |
| Placeholder | `caption` | `placeholder:text-muted-foreground` |
| Helper text | `caption` | `text-xs text-muted-foreground` |
| Error message | `small` + danger | `text-xs text-destructive` |
| Required indicator | `caption` | `text-destructive` |

---

## 9. Colour Pairing

| Text token | Colour token |
|------------|--------------|
| Headings | `--color-heading` / `text-foreground` |
| Body | `--foreground` / `text-foreground` |
| Secondary | `--muted-foreground` / `text-muted-foreground` |
| Disabled | `text-muted-foreground opacity-50` |
| Inverse | `--primary-foreground` on dark surfaces |
| Link | `--primary` / `text-primary` |

---

## 10. Letter Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `tracking-tight` | -0.025em | Page titles |
| `tracking-normal` | 0 | Body default |
| `tracking-wide` | 0.025em | Nav brand, uppercase labels |

No custom `letter-spacing` values outside Tailwind scale.

---

## 11. Rules & Constraints

### Do

- Use `PageHeader` for page titles (single H1)
- Use semantic size tokens from §3
- Use `font-heading` for h1–h4 only
- Use `font-nav` for sidebar brand and group labels

### Don't

- Mix font families within the same heading level
- Use `text-3xl` inside ERP modules (display/auth only)
- Hardcode `font-size: 15px` or arbitrary rem values
- Use colour alone to establish hierarchy

---

## 12. Target `typography.ts` Export Shape

```ts
export const typographyTokens = {
  fontFamily: {
    sans: "var(--font-sans)",
    heading: "var(--font-heading)",
    nav: "var(--font-nav)",
  },
  fontSize: {
    display: "1.875rem",
    h1: "1.25rem",
    h2: "0.875rem",
    h3: "0.875rem",
    h4: "0.75rem",
    bodyLg: "1rem",
    body: "0.875rem",
    small: "0.75rem",
    caption: "0.75rem",
    label: "0.75rem",
    metric: "1.5rem",
  },
  lineHeight: {
    tight: 1.25,
    snug: 1.3,
    normal: 1.5,
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
} as const;
```

---

## 13. Related Documents

- Phase 01 [TYPOGRAPHY.md](../phase-01/TYPOGRAPHY.md) — detailed examples
- [DESIGN_TOKENS_AND_THEME.md](./DESIGN_TOKENS_AND_THEME.md) — master token index
