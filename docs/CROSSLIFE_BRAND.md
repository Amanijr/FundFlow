# CrossLife Mission Network — Brand & Design System

Visual identity extracted from [crosslife.live](https://crosslife.live/) and adapted for the FundFlow ERP platform.

Implementation lives in `frontend/src/app/globals.css` and `frontend/src/app/layout.tsx`.

---

## Brand essence

| Attribute | Expression |
|-----------|------------|
| **Mission** | Manifesting Sons of God — Life, Love, Sonship, Prayer |
| **Tone** | Warm, grounded, spiritual, welcoming |
| **Visual mood** | Dark hero imagery + warm cream sections + burnt-orange accent |
| **Motto** | *"Raising Sons, Revealing Christ."* |

---

## Color palette

### Core brand colors

| Swatch | Name | Hex | CSS variable | Usage |
|--------|------|-----|--------------|-------|
| 🟠 | **Accent / Primary** | `#C85716` | `--color-primary` | Buttons, links, active nav, CTAs |
| 🟤 | **Accent hover** | `#A84812` | `--color-primary-hover` | Button hover, pressed states |
| ⬛ | **Heading** | `#110A06` | `--color-heading` | Page titles, strong headings |
| ⬛ | **Body text** | `#1A1715` | `--color-text` | Paragraphs, table data, labels |
| 🟫 | **Muted** | `#6B6560` | `--color-muted` | Descriptions, placeholders, hints |
| 🟡 | **Light background** | `#FFFAF2` | `--color-background` | App canvas (warm cream) |
| ⬜ | **Surface** | `#FFFFFF` | `--color-surface` | Cards, panels, inputs, modals |
| 🟫 | **Border** | `#E8E0D8` | `--color-border` | Dividers, table lines, outlines |

### Chrome & navigation

| Swatch | Name | Hex | CSS variable | Usage |
|--------|------|-----|--------------|-------|
| ⬛ | **Sidebar / header** | `#1A1715` | `--color-sidebar` | Sidebar, dark chrome |
| 🟫 | **Sidebar hover** | `#2D2825` | `--color-sidebar-hover` | Nav item hover |
| 🟠 | **Sidebar active** | `#C85716` | `--color-sidebar-active` | Current route accent |

### Semantic status

| Swatch | Name | Hex | CSS variable | Source |
|--------|------|-----|--------------|--------|
| 🟢 | **Success** | `#059652` | `--color-success` | crosslife.live forms |
| 🔴 | **Danger** | `#DF1529` | `--color-danger` | crosslife.live forms |
| 🟡 | **Warning** | `#E8A317` | `--color-warning` | ERP attention states |

### Section backgrounds (marketing site)

| Context | Hex | Notes |
|---------|-----|-------|
| Default light | `#FFFFFF` | White sections |
| Warm alternate | `#FFFAF2` | `.light-background` on website |
| Dark hero / footer | `#000000` | Hero slideshow, footer |
| Dark surface | `#252626` | Cards on dark sections |

---

## Typography

Fonts loaded via Google Fonts in `layout.tsx` — matching crosslife.live.

| Role | Font | Weight | CSS variable | Used for |
|------|------|--------|--------------|----------|
| **Body** | Roboto | 400, 500, 600, 700 | `--font-sans` | Paragraphs, tables, forms, buttons |
| **Headings** | Lato | 400, 700, 900 | `--font-heading` | `h1`–`h6`, page titles |
| **Navigation** | Montserrat | 400–700 | `--font-nav` | Sidebar labels, nav groups, logo |

### Type scale (website → ERP adaptation)

| Element | Website | ERP platform |
|---------|---------|--------------|
| Hero title | Lato 56px / 700 | N/A (no marketing hero) |
| Section title | Lato 44px / 700, -1px tracking | Page title: `text-xl font-bold` (Lato) |
| Body | Roboto 16px | `14px` base (`text-sm`) for ERP density |
| Nav links | Montserrat 16px | Sidebar: `text-[13px]` Montserrat |
| Logo | Lato 26px / 800, accent color | Sidebar: `CROSSLIFE` Montserrat |

### CSS usage

```css
body { font-family: var(--font-sans); }
h1, h2, h3, h4, h5, h6 { font-family: var(--font-heading); color: var(--color-heading); }
.font-nav { font-family: var(--font-nav); }
```

---

## UI patterns (from website)

### Buttons

| Style | Website | ERP adaptation |
|-------|---------|----------------|
| Primary | `#C85716` fill, white text, `border-radius: 50px`, 2px border | `rounded-md` (compact ERP), same colors |
| Primary hover | 15% darker + soft orange shadow | `--color-primary-hover` |
| Outline | Transparent + orange border | `variant="outline"` with primary border |

### Header / navigation

- Fixed top bar with `rgba(26, 23, 21, 0.85)` translucent dark background
- White nav text at 80% opacity; hover/active → `#C85716`
- Logo: image + **CROSSLIFE** wordmark in accent orange

### Sections

- Alternating white and warm cream (`#FFFAF2`) backgrounds
- Section titles centered with Lato bold
- AOS fade-up scroll animations on marketing pages

### Cards & surfaces

- White surface on cream background
- Accent border on hover (`3px solid #C85716`)
- No heavy shadows — border-defined separation

### Auth overlay gradient

```css
linear-gradient(135deg, #1A1715 0%, #C85716 100%)
```

Warm dark → brand orange (matches website header + accent).

---

## Dark mode

Warm dark palette (not cold slate):

| Token | Light | Dark |
|-------|-------|------|
| Background | `#FFFAF2` | `#110A06` |
| Surface | `#FFFFFF` | `#1A1715` |
| Text | `#1A1715` | `#FFFAF2` |
| Primary | `#C85716` | `#D4621F` (slightly brighter) |
| Border | `#E8E0D8` | `#3D3835` |

---

## Logo & wordmark

| Asset | Treatment |
|-------|-----------|
| Logo mark | Orange square badge with **C** (sidebar, loader, auth) |
| Wordmark | **CROSSLIFE** — Montserrat, tracking-wide, sidebar header |
| Full name | CrossLife Mission Network — auth footer, metadata |

Website uses `assets/img/logo.png` — replace badge **C** with actual logo image when asset is available.

---

## ERP mapping

How marketing-site patterns translate to the admin platform:

```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR (#1A1715)          │  TOP BAR (white/cream)    │
│  Montserrat nav              │  Org name + user menu     │
│  Active: orange left border  ├───────────────────────────┤
│  Logo: CROSSLIFE             │  CONTENT (#FFFAF2)       │
│                              │  Lato page titles         │
│                              │  Roboto body + tables     │
│                              │  Orange primary buttons   │
└─────────────────────────────────────────────────────────┘
```

| Website section | ERP equivalent |
|-----------------|----------------|
| Hero slideshow | Auth slider gradient panel |
| Giving section | Donations module |
| Church activities | Ministries, attendance |
| Feedback form | Future: support/feedback module |
| Footer (black) | Optional: platform footer |

---

## Do / Don't

**Do**
- Use warm cream background (`#FFFAF2`) — not cold gray-blue
- Use orange `#C85716` for all primary actions
- Use Lato for headings, Roboto for data, Montserrat for nav
- Keep sidebar dark warm brown (`#1A1715`), not blue-slate

**Don't**
- Reintroduce FundFlow blue (`#2563EB`) — replaced by CrossLife orange
- Use pure cold grays (`#F8FAFC`, `#64748B`) — use warm equivalents
- Use Geist font — replaced by Roboto/Lato/Montserrat
- Add marketing-style hero sizes inside ERP data pages

---

## Reference

- Live site: https://crosslife.live/
- Template base: BootstrapMade LeadPage (Bootstrap 5.3)
- Source CSS variables: `crosslife.live/assets/css/main.css`
- Platform tokens: `frontend/src/app/globals.css`
