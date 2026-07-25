# FundFlow ERP — UI Primitives Catalog

**Phase:** 01  
**Purpose:** Complete inventory of reusable UI primitives with adoption status and implementation priority.

**Legend:**
- ✅ In ERP (`frontend/src/components/ui/`)
- 📦 In template only (`material-shadcn-1.0.0/client/src/components/ui/`)
- 🔧 Needs restyle (exists but doesn't match design system)
- ➕ Adopt (copy from template in Phase 02)

---

## 1. Primitive Summary

| Category | Total | In ERP | To Adopt | To Restyle |
|----------|-------|--------|----------|------------|
| Actions | 3 | 1 | 0 | 2 |
| Forms | 10 | 4 | 5 | 1 |
| Data display | 6 | 3 | 2 | 1 |
| Feedback | 5 | 1 | 3 | 1 |
| Overlay | 5 | 2 | 2 | 1 |
| Navigation | 5 | 0 | 4 | 1 |
| Layout | 3 | 1 | 1 | 1 |
| **Total** | **37** | **12** | **17** | **8** |

---

## 2. Actions

### Button 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — needs restyle |
| Template | `material-shadcn-1.0.0/client/src/components/ui/button.tsx` |
| ERP | `frontend/src/components/ui/button.tsx` |
| Priority | P0 |
| Action | Replace styling with Material stone gradient (template `button.tsx`) |

**Variants:** default, secondary, destructive, outline, ghost, link  
**Sizes:** default (h-9), sm, lg, icon  
**Dependencies:** `@radix-ui/react-slot`, `class-variance-authority`

---

### Toggle 📦
| Field | Value |
|-------|-------|
| Status | Adopt in Phase 02 |
| Priority | P3 |
| Usage | View mode switches (list/grid) |

---

### Toggle Group 📦
| Field | Value |
|-------|-------|
| Status | Adopt in Phase 02 |
| Priority | P3 |
| Usage | Filter chip groups |

---

## 3. Forms

### Input 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — needs restyle |
| Priority | P0 |
| Action | Align to h-9, ring focus, template border style |

**States:** default, focus, disabled, error, placeholder

---

### Label 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — minor alignment |
| Priority | P0 |
| Style | `text-xs font-medium` |

---

### Textarea ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P2 |
| Style | `min-h-[80px]`, same border/focus as Input |

---

### Select ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P1 |
| Primitive | `@radix-ui/react-select` |
| Usage | Status dropdowns, role selectors, fund pickers |

---

### Checkbox 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — needs restyle |
| Priority | P0 |
| Style | `h-4 w-4`, primary border, checked fill |

---

### Radio Group ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P2 |
| Usage | Payment method, report format selection |

---

### Switch ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P2 |
| Usage | Settings toggles, feature flags |

---

### Slider ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P3 |
| Usage | Report date range, budget threshold filters |

---

### Input OTP 📦
| Field | Value |
|-------|-------|
| Status | Adopt (future) |
| Priority | P4 |
| Usage | Two-factor authentication (not yet in ERP) |

---

### Form ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P1 |
| Integration | React Hook Form (already in ERP) |
| Usage | All domain forms (donor, expense, budget) |

---

## 4. Data Display

### Card 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — needs restyle |
| Priority | P0 |
| Action | Stone border → `border-border`, compact ERP padding |

**Parts:** Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter

---

### Badge 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — needs restyle |
| Priority | P0 |
| Action | Add success/warning semantic variants |

---

### Avatar ✅
| Field | Value |
|-------|-------|
| Status | In ERP — minor restyle |
| Priority | P1 |
| Primitive | `@radix-ui/react-avatar` |

---

### Table 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — needs ERP density overrides |
| Priority | P0 |
| Note | Used by `DataTable` composite — do not replace DataTable |

**Parts:** Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableFooter, TableCaption

---

### Progress ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P2 |
| Usage | Campaign progress, budget utilization bars |

---

### Chart ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P2 |
| File | `chart.tsx` (ChartContainer wrapper) |
| Usage | Dashboard trend charts, KPI sparklines |

---

## 5. Feedback

### Alert ➕
| Field | Value |
|-------|-------|
| Status | Adopt — replaces custom ErrorAlert/SuccessAlert/WarningAlert |
| Priority | P1 |
| Variants | default, destructive, success, warning |

---

### Alert Dialog ➕
| Field | Value |
|-------|-------|
| Status | Adopt — replaces ConfirmDialog |
| Priority | P1 |
| Usage | Delete confirmations, irreversible action guards |

---

### Skeleton ➕
| Field | Value |
|-------|-------|
| Status | Adopt — enhances PageSkeleton |
| Priority | P2 |
| Enhancement | Use `.skeleton-shimmer` from globals.css |

---

### Toast / Sonner ✅
| Field | Value |
|-------|-------|
| Status | ERP uses Sonner — keep, no change |
| Priority | — |
| Note | Do not adopt template shadcn toast; Sonner is superior |

---

### Spinner ✅
| Field | Value |
|-------|-------|
| Status | Custom `FundFlowLoader` in ERP |
| Priority | P3 restyle |
| File | `frontend/src/components/feedback/fundflow-loader.tsx` |

---

## 6. Overlay

### Dialog 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — needs animation upgrade |
| Priority | P0 |
| Action | Add tailwindcss-animate fade/zoom from template |

---

### Drawer ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P2 |
| Primitive | `vaul` |
| Usage | Mobile filter panels, quick actions |

---

### Sheet ✅
| Field | Value |
|-------|-------|
| Status | In ERP (mobile sidebar) |
| Priority | P1 restyle |
| Note | Used by MobileSidebar — restyle only |

---

### Popover 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — minor restyle |
| Priority | P1 |
| Usage | Date pickers, filter dropdowns |

---

### Tooltip ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P2 |
| Usage | Icon button help, truncated column headers |

---

## 7. Navigation

### Breadcrumb ➕
| Field | Value |
|-------|-------|
| Status | Adopt — optional upgrade to custom Breadcrumbs |
| Priority | P2 |
| ERP existing | `frontend/src/components/layout/breadcrumbs.tsx` |

---

### Tabs ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P1 |
| Usage | Accounting sub-nav, reports sub-nav |

---

### Accordion ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P3 |
| Usage | Collapsible report filters, settings sections |

---

### Navigation Menu 📦
| Field | Value |
|-------|-------|
| Status | Do not adopt |
| Reason | ERP uses custom sidebar nav with RBAC |

---

### Sidebar (shadcn) 📦
| Field | Value |
|-------|-------|
| Status | Do not adopt |
| Reason | ERP custom sidebar with Zustand store and RBAC config |

---

## 8. Layout & Utility

### Separator 🔧
| Field | Value |
|-------|-------|
| Status | In ERP — minor restyle |
| Priority | P1 |

---

### Panel ✅
| Field | Value |
|-------|-------|
| Status | ERP-specific compact container |
| Priority | P1 restyle |
| File | `frontend/src/components/ui/panel.tsx` |
| Note | Prefer Panel over Card for ERP data density |

---

### Scroll Area ➕
| Field | Value |
|-------|-------|
| Status | Adopt |
| Priority | P2 |
| Usage | Sidebar overflow, long dropdown lists |

---

## 9. Template-Only (Do Not Adopt)

These exist in the template but are not needed in ERP:

| Component | Reason |
|-----------|--------|
| `menubar` | No menubar navigation pattern in ERP |
| `carousel` | No carousel UI in ERP |
| `context-menu` | Low priority; defer to Phase 08+ |
| `hover-card` | Low priority |
| `resizable` | No split-pane layouts |
| `aspect-ratio` | No media layouts |
| `collapsible` | Accordion covers use cases |
| `command` (standalone) | ERP already uses cmdk via CommandPalette |
| `pagination` (standalone) | DataTable has built-in pagination |
| `calendar` (standalone) | Adopt as part of DateInput, not standalone page |

---

## 10. Implementation Priority Matrix

### P0 — Foundation (Phase 02a)
Must be complete before any page restyle.

| Primitive | Action |
|-----------|--------|
| Button | Restyle |
| Input | Restyle |
| Label | Restyle |
| Card | Restyle |
| Badge | Restyle |
| Table | Restyle |
| Dialog | Restyle |
| Checkbox | Restyle |
| Separator | Restyle |

### P1 — Core (Phase 02b)
Required for forms and module navigation.

| Primitive | Action |
|-----------|--------|
| Select | Adopt |
| Form | Adopt |
| Tabs | Adopt |
| Alert | Adopt |
| Alert Dialog | Adopt |
| Popover | Restyle |
| Sheet | Restyle |
| Avatar | Restyle |
| Panel | Restyle |

### P2 — Enhancement (Phase 03)
Improves dashboards and data display.

| Primitive | Action |
|-----------|--------|
| Chart | Adopt |
| Skeleton | Adopt |
| Tooltip | Adopt |
| Progress | Adopt |
| Switch | Adopt |
| Radio Group | Adopt |
| Textarea | Adopt |
| Drawer | Adopt |
| Scroll Area | Adopt |
| Breadcrumb | Adopt |

### P3 — Polish (Phase 04+)
| Primitive | Action |
|-----------|--------|
| Accordion | Adopt |
| Slider | Adopt |
| Toggle / Toggle Group | Adopt |
| Spinner | Restyle FundFlowLoader |

---

## 11. Dependency Installation Checklist

Packages to add to `frontend/package.json` during Phase 02:

| Package | For primitive |
|---------|--------------|
| `tailwindcss-animate` | Dialog, dropdown animations |
| `@radix-ui/react-select` | Select |
| `@radix-ui/react-tabs` | Tabs |
| `@radix-ui/react-progress` | Progress |
| `@radix-ui/react-switch` | Switch |
| `@radix-ui/react-radio-group` | Radio Group |
| `@radix-ui/react-tooltip` | Tooltip |
| `@radix-ui/react-scroll-area` | Scroll Area |
| `@radix-ui/react-accordion` | Accordion |
| `@radix-ui/react-slider` | Slider |
| `@radix-ui/react-toggle` | Toggle |
| `@radix-ui/react-toggle-group` | Toggle Group |
| `react-day-picker` | Calendar (DateInput) |
| `vaul` | Drawer |

---

## 12. File Structure (Target)

```
frontend/src/components/ui/
├── accordion.tsx        ➕ P3
├── alert-dialog.tsx     ➕ P1
├── alert.tsx            ➕ P1
├── avatar.tsx           🔧 P1
├── badge.tsx            🔧 P0
├── breadcrumb.tsx       ➕ P2
├── button.tsx           🔧 P0
├── card.tsx             🔧 P0
├── chart.tsx            ➕ P2
├── checkbox.tsx         🔧 P0
├── dialog.tsx           🔧 P0
├── drawer.tsx           ➕ P2
├── dropdown-menu.tsx    🔧 P1
├── form.tsx             ➕ P1
├── input.tsx            🔧 P0
├── label.tsx            🔧 P0
├── panel.tsx            🔧 P1 (ERP-specific)
├── popover.tsx          🔧 P1
├── progress.tsx         ➕ P2
├── radio-group.tsx      ➕ P2
├── scroll-area.tsx      ➕ P2
├── select.tsx           ➕ P1
├── separator.tsx        🔧 P1
├── sheet.tsx            🔧 P1
├── skeleton.tsx         ➕ P2
├── switch.tsx           ➕ P2
├── table.tsx            🔧 P0
├── tabs.tsx             ➕ P1
├── textarea.tsx         ➕ P2
├── tooltip.tsx          ➕ P2
└── slider.tsx           ➕ P3
```

---

## 13. Usage Guidelines

1. **Import from `@/components/ui/`** — never duplicate primitive code in domain components.
2. **Compose, don't customize** — use variants and `className` prop; don't fork primitives.
3. **One primitive per concern** — Button for actions, Link for navigation, Badge for status.
4. **Panel for data, Card for widgets** — Panel for list/detail pages; Card for dashboard widgets.
5. **Form for all domain forms** — wrap React Hook Form fields in Form/FormField/FormItem.
6. **Alert Dialog for destructive confirms** — never use `window.confirm()`.
7. **Skeleton for loading** — never show empty containers while data loads.
