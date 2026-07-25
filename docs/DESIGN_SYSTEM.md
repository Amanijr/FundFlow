# FundFlow / CrossLife Design System

Visual standards, design tokens, and UI implementation guidelines for the CrossLife ERP platform.

**Brand reference:** [CROSSLIFE_BRAND.md](./CROSSLIFE_BRAND.md) — full palette, fonts, and patterns from [crosslife.live](https://crosslife.live/).

Implementation lives in `frontend/src/app/globals.css`.

---

# Color Palette

Official brand colors from CrossLife Mission Network. **Do not hardcode hex values in components** — use the CSS variables below.

## Light theme (default)

| Token | Variable | Hex | Usage |
|-------|----------|-----|--------|
| Primary | `--color-primary` | `#C85716` | Buttons, links, focus rings, active accents |
| Primary hover | `--color-primary-hover` | `#A84812` | Primary button hover |
| Success | `--color-success` | `#059652` | Confirmations, positive status, completed |
| Warning | `--color-warning` | `#E8A317` | Caution states, pending review |
| Danger | `--color-danger` | `#DF1529` | Errors, destructive actions, rejected |
| Background | `--color-background` | `#FFFAF2` | Page canvas (warm cream) |
| Surface | `--color-surface` | `#FFFFFF` | Cards, panels, modals, inputs |
| Heading | `--color-heading` | `#110A06` | Page titles, strong headings |
| Sidebar | `--color-sidebar` | `#1A1715` | Main navigation sidebar |
| Sidebar hover | `--color-sidebar-hover` | `#2D2825` | Nav item hover background |
| Border | `--color-border` | `#E8E0D8` | Dividers, outlines, table borders |
| Text primary | `--color-text` | `#1A1715` | Body copy |
| Text secondary | `--color-muted` | `#6B6560` | Descriptions, placeholders, hints |

Sidebar companion tokens (derived — do not hardcode in components):

| Token | Hex | Usage |
|-------|-----|--------|
| `--color-sidebar-foreground` | `#FFFFFF` | Nav labels, logo text |
| `--color-sidebar-muted` | `#B8B0A8` | Secondary sidebar text |
| `--color-sidebar-border` | `#3D3835` | Sidebar dividers |
| `--color-sidebar-accent` | `#2D2825` | Nav item hover background |
| `--color-sidebar-active` | `#C85716` | Active nav item (uses primary) |

## Typography

| Role | Font | Variable |
|------|------|----------|
| Body | Roboto | `--font-sans` |
| Headings | Lato | `--font-heading` |
| Navigation | Montserrat | `--font-nav` |

## CSS reference

```css
:root {
  --color-primary: #C85716;
  --color-primary-hover: #A84812;
  --color-success: #059652;
  --color-warning: #E8A317;
  --color-danger: #DF1529;
  --color-background: #FFFAF2;
  --color-surface: #FFFFFF;
  --color-heading: #110A06;
  --color-sidebar: #1A1715;
  --color-sidebar-hover: #2D2825;
  --color-border: #E8E0D8;
  --color-text: #1A1715;
  --color-muted: #6B6560;
}
```

## Semantic usage

| Context | Token |
|---------|--------|
| Primary CTA, links | `--color-primary` |
| Approved, paid, active | `--color-success` |
| Pending, draft, attention | `--color-warning` |
| Failed, delete, overdue | `--color-danger` |
| App background | `--color-background` |
| Cards, sheets, dropdowns | `--color-surface` |
| Sidebar navigation | `--color-sidebar` |
| All borders | `--color-border` |
| Primary copy | `--color-text` |
| Secondary copy | `--color-muted` |

## Dark theme

Dark mode uses the **same semantic hues** with adjusted surfaces for contrast. Derived values are defined in `frontend/src/app/globals.css` under `.dark`. Do not introduce module-specific dark palettes.

---

# ERP visual language

Production ERP UI — **Notus structure** + **shadcn/ui primitives** + **Dynamics/Stripe density**.

## Layout

| Area | Treatment |
|------|-----------|
| Sidebar | Dark (`--color-sidebar`), compact nav, left-border active state |
| Content | Light (`--color-background`), full-width, minimal padding |
| Chrome | `h-12` top bar, no shadows on surfaces |

## Density

- Base font size: `14px` (`text-sm` on `body`)
- Page titles: `text-xl font-semibold` — not marketing hero sizes
- Section titles: `text-sm font-semibold`
- Field labels: `text-xs text-muted-foreground`
- Inputs / buttons: `h-9` default
- Table rows: `py-2`, headers `h-9` with muted uppercase labels
- Page vertical rhythm: `space-y-4` to `space-y-5` — avoid `space-y-8`

## Surfaces

Use **`Panel`** (`components/ui/panel.tsx`) or restyled **`Card`** for data containers:

- Border only — **no box shadows**
- Compact header with bottom border (`px-4 py-2.5`)
- Content padding `px-4 py-3`

Avoid large decorative cards, icon marketing tiles, and tip callout cards.

## Tables

- Primary data presentation pattern (lists, reports hub, campaign performance)
- Toolbar strip above table: record count + compact actions (`h-7` buttons)
- Muted header row, subtle row hover
- Financial values: `tabular-nums`

## Forms

- **`FormSection`**: bordered panel with header strip, `gap-3` field grid
- Native selects: `h-9`, match `Input` sizing
- Workflow actions inline in panels — not nested decorative cards

## Workflows

- **`WorkflowStepper`**: horizontal tab-style steps with numbered indicators (expense approval, status tracking)
- Action panels appear only for the **current** workflow step

## Navigation tabs

Module sub-nav (Admin, Reports, Accounting, Platform) uses **underline tabs** (`border-b-2`), not pill buttons.

## Avoid

- `shadow-sm`, `shadow-lg`, heavy elevation
- Oversized KPI typography (`text-3xl`)
- Marketing-style report/category cards with icons
- Excessive whitespace and rounded-2xl decorative containers

---

# Frontend Architecture Standards

This section defines the approved frontend technology stack and implementation standards.

---

# Approved Technology Stack

Framework

* Next.js App Router
* TypeScript

Styling

* Tailwind CSS

Component Library

* shadcn/ui

Accessibility Primitives

* Radix UI

State Management

* Zustand

Forms

* React Hook Form
* Zod

Tables

* TanStack Table

Charts

* Recharts

Date Handling

* date-fns

Icons

* Lucide React

Animations

* Framer Motion (minimal usage)

---

# Prohibited UI Libraries

The following libraries are not allowed:

* Bootstrap
* AdminLTE
* CoreUI
* Material UI
* Ant Design
* PrimeReact

Reason:

These libraries introduce conflicting design systems and reduce consistency.

---

# Component Philosophy

FundFlow follows a composable architecture.

Pages should be assembled from reusable primitives rather than custom page-specific components.

Good

Page
→ Toolbar
→ Filters
→ DataTable
→ Pagination

Bad

CampaignPageTable
DonorPageTable
ExpensePageTable

Every table should use the same DataTable foundation.

---

# Core UI Components

The following components must exist in the shared UI layer.

## DataTable

Used by:

* Donors
* Campaigns
* Donations
* Expenses
* Funds
* Users
* Reports

Features:

* Search
* Sorting
* Filtering
* Pagination
* Bulk Actions
* Export
* Column Visibility

Implementation:

TanStack Table

---

## EntityHeader

Used by:

* Donor Detail
* Campaign Detail
* Fund Detail
* Expense Detail

Contains:

* Title
* Status
* Metadata
* Actions

---

## FilterBar

Contains:

* Search
* Filters
* Saved Views
* Reset Filters

Must remain consistent across all modules.

---

## PageHeader

Contains:

* Breadcrumbs
* Title
* Description
* Primary Action

All pages must use this component.

---

## ActivityTimeline

Used for:

* Donations
* Expenses
* Campaigns
* Grants

Displays chronological activity.

---

## AuditTrail

Used for:

* Financial Records
* Users
* Permissions

Displays immutable audit history.

---

# Dashboard Architecture

Dashboards are role-specific.

Do not create one universal dashboard.

---

## Executive Dashboard

Widgets:

* Fund Balance
* Budget Utilization
* Donation Trends
* Campaign Performance
* Pending Approvals

---

## Finance Dashboard

Widgets:

* Cash Position
* Expense Trends
* Budget Variance
* Fund Balances
* Recent Transactions

---

## Fundraising Dashboard

Widgets:

* Active Campaigns
* Donation Growth
* Top Donors
* Campaign Effectiveness
* Recent Contributions

---

# Navigation Standards

Navigation must be role-aware.

Users should only see modules relevant to their role.

Example:

Fundraising Officer

Visible:

* Donors
* Campaigns
* Donations

Hidden:

* General Ledger
* User Management

---

# Search Standards

Global Search is mandatory.

Keyboard Shortcut:

CMD + K
CTRL + K

Search must return:

* Donors
* Campaigns
* Donations
* Expenses
* Funds
* Users
* Reports

Results should support direct navigation.

---

# Form Standards

All forms must use:

React Hook Form
+
Zod Validation

Never use local component state for complex forms.

Large forms should support:

* Draft Save
* Autosave
* Unsaved Changes Protection

---

# Data Table Standards

All tables must be built on the shared DataTable component.

Required Features:

* Pagination
* Search
* Filters
* Sorting
* Export
* Column Visibility
* Bulk Actions

Optional Features:

* Saved Views
* Grouping
* Virtualization

No module may implement its own table solution.

---

# Theme Standards

Support:

* Light Theme
* Dark Theme

Dark mode must be fully supported from the beginning.

No module-specific color themes are allowed.

---

# Design Tokens

All visual values must be tokenized. **Color tokens are mandatory** — see [Color Palette](#color-palette) above.

## Color tokens (required)

```css
--color-primary
--color-success
--color-warning
--color-danger
--color-background
--color-surface
--color-sidebar
--color-border
--color-text
--color-muted
```

## Radius tokens

```css
--radius-sm
--radius-md
--radius-lg
```

## Spacing tokens

```css
--spacing-xs
--spacing-sm
--spacing-md
--spacing-lg
```

Hardcoded hex, rgb, or arbitrary color values in components are prohibited. Use tokens or Tailwind classes mapped to tokens (e.g. `bg-primary`, `text-muted-foreground`).

---

# AI Agent Instructions

When generating UI:

Always:

* Use shadcn/ui components
* Use Tailwind CSS
* Use TypeScript
* Use shared design tokens
* Use shared DataTable
* Use shared PageHeader
* Use shared FilterBar
* Use role-based navigation

Never:

* Create custom styling systems
* Use inline styles
* Introduce new component libraries
* Create duplicate implementations
* Build module-specific table components

All generated UI must feel like part of the same ERP platform.
