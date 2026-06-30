# Phase 00 — Component Inventory

**Date:** 2026-06-30  
**Purpose:** Map every significant UI component across ERP and template, classify migration action.

**Legend:** Reuse · Replace · Refactor · Delete · Create · Adopt

---

## 1. UI Primitives (`components/ui/`)

| Component | ERP | Template | Action | Notes |
|-----------|:---:|:--------:|--------|-------|
| Accordion | ✗ | ✓ | Adopt | Needed for collapsible sections |
| Alert | ✗ | ✓ | Adopt | Replace custom ErrorAlert styling |
| Alert Dialog | ✗ | ✓ | Adopt | Replace ConfirmDialog primitive layer |
| Aspect Ratio | ✗ | ✓ | Adopt | Low priority |
| Avatar | ✓ | ✓ | Replace styling | Port template avatar styles |
| Badge | ✓ | ✓ | Replace styling | Align with Material badge look |
| Breadcrumb | ✗ | ✓ | Adopt | ERP has custom Breadcrumbs — evaluate |
| Button | ✓ | ✓ | Replace styling | Material gradient default variant |
| Calendar | ✗ | ✓ | Adopt | Needed for date-input enhancement |
| Card | ✓ | ✓ | Replace | Stone border, template padding scale |
| Carousel | ✗ | ✓ | Create | Only if needed by domain pages |
| Chart | ✗ | ✓ | Adopt | ChartContainer wrapper for Recharts |
| Checkbox | ✓ | ✓ | Replace styling | Match template checkbox |
| Collapsible | ✗ | ✓ | Adopt | Sidebar sections, filters |
| Command | ✗ | ✓ | Refactor | ERP uses cmdk directly — align with shadcn Command |
| Context Menu | ✗ | ✓ | Adopt | Table row actions |
| Dialog | ✓ | ✓ | Replace styling | Material animations + overlay |
| Drawer | ✗ | ✓ | Adopt | Alternative to Sheet for mobile |
| Dropdown Menu | ✓ | ✓ | Replace styling | Match template menu styles |
| Form | ✗ | ✓ | Refactor | Integrate with existing FormField pattern |
| Hover Card | ✗ | ✓ | Adopt | Donor/campaign preview cards |
| Input | ✓ | ✓ | Replace styling | h-10, ring focus, template borders |
| Input OTP | ✗ | ✓ | Create | Future 2FA support |
| Label | ✓ | ✓ | Replace styling | Minor alignment |
| Menubar | ✗ | ✓ | Delete | Not needed in ERP |
| Navigation Menu | ✗ | ✓ | Delete | ERP uses custom sidebar nav |
| Pagination | ✗ | ✓ | Adopt | Enhance DataTable pagination |
| Panel | ✓ | ✗ | Reuse | ERP-specific; restyle only |
| Popover | ✓ | ✓ | Replace styling | Filter dropdowns, date pickers |
| Progress | ✗ | ✓ | Adopt | Campaign/budget progress bars |
| Radio Group | ✗ | ✓ | Adopt | Form option groups |
| Resizable | ✗ | ✓ | Create | Only if split-pane layouts needed |
| Scroll Area | ✗ | ✓ | Adopt | Sidebar overflow, long lists |
| Select | ✗ | ✓ | Adopt | ERP lacks shadcn Select primitive |
| Separator | ✓ | ✓ | Replace styling | Match template divider |
| Sheet | ✓ | ✓ | Replace styling | Mobile sidebar drawer |
| Sidebar (shadcn) | ✗ | ✓ | Delete | Use ERP custom sidebar with template styles |
| Skeleton | ✗ | ✓ | Adopt | Replace PageSkeleton internals |
| Slider | ✗ | ✓ | Adopt | Report filter ranges |
| Switch | ✗ | ✓ | Adopt | Settings toggles |
| Table | ✓ | ✓ | Replace styling | Restyle for Material table look |
| Tabs | ✗ | ✓ | Adopt | Module sub-navigation (accounting, reports) |
| Textarea | ✗ | ✓ | Adopt | Long-form fields in domain forms |
| Toast / Toaster | ✗ | ✓ | Refactor | ERP uses Sonner — keep Sonner, adopt toast styles if needed |
| Toggle | ✗ | ✓ | Adopt | View mode switches |
| Toggle Group | ✗ | ✓ | Adopt | Filter chip groups |
| Tooltip | ✗ | ✓ | Adopt | Icon buttons, truncated text |

---

## 2. Layout Components

| Component | ERP | Template | Action | Notes |
|-----------|:---:|:--------:|--------|-------|
| AppShell | ✓ | ✓ (Layout) | Refactor | Keep ERP structure; apply Material shell styling |
| Sidebar | ✓ | ✓ | Replace | Material gradient active state, w-60, stone palette |
| SidebarNav | ✓ | ✗ | Reuse | Keep RBAC nav logic and config |
| MobileSidebar | ✓ | ✓ (mobile) | Replace | Template slide-in pattern |
| TopNavigation | ✓ | ✗ | Refactor | ERP-only; restyle header bar |
| PageHeader | ✓ | ✓ (title prop) | Refactor | Merge template title block styling |
| SectionHeader | ✓ | ✗ | Reuse | Restyle typography only |
| Breadcrumbs | ✓ | ✗ | Reuse | Keep logic; optional shadcn Breadcrumb adopt |
| ContentContainer | ✓ | ✗ | Reuse | Restyle padding to `p-3 lg:p-6` |
| Footer | ✗ | ✓ | Create | Optional attribution/footer bar |

---

## 3. Data Display Components

| Component | ERP | Template | Action | Notes |
|-----------|:---:|:--------:|--------|-------|
| DataTable | ✓ | ✗ | Reuse | TanStack Table composite — restyle only |
| FilterBar | ✓ | ✗ | Reuse | Restyle with template input/select styles |
| EmptyState | ✓ | ✗ | Reuse | Restyle illustration and typography |
| DetailCard | ✓ | ✗ | Reuse | Apply Material card styling |
| EntityHeader | ✓ | ✗ | Reuse | Restyle title area |
| StatusBadge | ✓ | ✓ (Badge) | Refactor | Map to template Badge variants |
| MetricCard | ✓ | ✓ (stats-grid) | Refactor | Adopt template stat card layout |
| KPIWidget | ✓ | ✗ | Reuse | Restyle; integrate MiniChart pattern |
| TrendChart | ✓ | ✓ (charts-showcase) | Refactor | Adopt ChartContainer wrapper |
| RecentActivityFeed | ✓ | ✗ | Reuse | Restyle list items |

---

## 4. Form Components

| Component | ERP | Template | Action | Notes |
|-----------|:---:|:--------:|--------|-------|
| FormField | ✓ | ✓ (Form) | Refactor | Align with shadcn Form component |
| FormSection | ✓ | ✗ | Reuse | Restyle section headers |
| DateInput | ✓ | ✓ (Calendar) | Refactor | Integrate shadcn Calendar + Popover |
| CurrencyInput | ✓ | ✗ | Reuse | Keep logic; restyle input wrapper |
| EntitySelector | ✓ | ✗ | Reuse | Restyle dropdown/combobox |
| FileUploader | ✓ | ✗ | Reuse | Restyle drop zone |

---

## 5. Feedback Components

| Component | ERP | Template | Action | Notes |
|-----------|:---:|:--------:|--------|-------|
| LoadingState | ✓ | ✗ | Reuse | Restyle spinner/loader |
| PageSkeleton | ✓ | ✓ (Skeleton) | Refactor | Use shadcn Skeleton primitives |
| ErrorAlert | ✓ | ✓ (Alert) | Refactor | Migrate to shadcn Alert |
| SuccessAlert | ✓ | ✓ (Alert) | Refactor | Migrate to shadcn Alert |
| WarningAlert | ✓ | ✓ (Alert) | Refactor | Migrate to shadcn Alert |
| ConfirmDialog | ✓ | ✓ (AlertDialog) | Refactor | Migrate to shadcn AlertDialog |
| FundFlowLoader | ✓ | ✗ | Reuse | Brand loader; restyle colors |
| MockModeBanner | ✓ | ✗ | Reuse | Dev-only; restyle banner |

---

## 6. Workflow Components

| Component | ERP | Template | Action | Notes |
|-----------|:---:|:--------:|--------|-------|
| WorkflowStepper | ✓ | ✗ | Reuse | Restyle step indicators |
| WorkflowStatus | ✓ | ✗ | Reuse | Restyle status chips |
| ApprovalWorkflow | ✓ | ✗ | Reuse | Keep business logic |
| ActivityTimeline | ✓ | ✗ | Reuse | Restyle timeline entries |
| AuditTrail | ✓ | ✗ | Reuse | Restyle log entries |

---

## 7. Security & Auth Components

| Component | ERP | Template | Action | Notes |
|-----------|:---:|:--------:|--------|-------|
| AuthGuard | ✓ | ✗ | Reuse | No changes |
| GuestGuard | ✓ | ✗ | Reuse | No changes |
| AdminGuard | ✓ | ✗ | Reuse | No changes |
| PlatformAuthGuard | ✓ | ✗ | Reuse | No changes |
| DashboardGuard | ✓ | ✗ | Reuse | No changes |
| RoleGuard | ✓ | ✗ | Reuse | No changes |
| PermissionGate | ✓ | ✗ | Reuse | No changes |
| LoginForm | ✓ | ✓ (sign-in) | Replace | Material auth page layout |
| RegisterForm | ✓ | ✓ (sign-up) | Replace | Material auth page layout |
| AuthSlider | ✓ | ✗ | Reuse | Restyle slider panel |

---

## 8. Navigation Components

| Component | ERP | Template | Action | Notes |
|-----------|:---:|:--------:|--------|-------|
| CommandPalette | ✓ | ✓ (Command) | Refactor | Align cmdk usage with shadcn Command |
| navigation.ts config | ✓ | ✗ | Reuse | Keep all nav items and RBAC |
| permissions.ts | ✓ | ✗ | Reuse | No changes |

---

## 9. Platform Components

| Component | ERP | Template | Action | Notes |
|-----------|:---:|:--------:|--------|-------|
| PlatformShell | ✓ | ✗ | Reuse | Restyle shell |
| PlatformNav | ✓ | ✗ | Reuse | Restyle nav |
| TenantSwitcher | ✓ | ✗ | Reuse | Restyle dropdown |
| TenantContextBanner | ✓ | ✗ | Reuse | Restyle banner |

---

## 10. Domain Components (Business Logic — Reuse Only)

All domain-specific components retain their logic and API integration. Only visual styling changes.

| Module | Components | Action |
|--------|-----------|--------|
| Dashboard | `executive-dashboard-view`, `finance-dashboard-view`, `fundraising-dashboard-view`, `dashboard-insights` | Refactor styling |
| Fundraising | `donor-form`, `campaign-form`, `donation-form`, status badges | Refactor styling |
| Finance | `fund-form`, `budget-form`, `expense-form`, `expense-workflow-panel`, status badges | Refactor styling |
| Accounting | `accounting-nav`, `chart-of-account-form`, `journal-source-link` | Refactor styling |
| Reporting | `reports-nav`, `report-filters`, `export-actions`, `report-summary` | Refactor styling |
| Admin | `admin-nav`, `invite-user-form`, `organization-settings-form` | Refactor styling |
| Programs | `program-form`, `grant-form`, `beneficiary-form` | Refactor styling |
| Verticals | `ministry-form`, `sponsorship-form`, status badges | Refactor styling |
| Platform | `super-admin-form`, org management, log viewer | Refactor styling |

---

## 11. Template-Only Components (Reference)

These exist only in the template and may be adopted if needed:

| Component | Template Path | Adoption Priority |
|-----------|--------------|-------------------|
| ThemeConfigurator | `components/theme-configurator.tsx` | Low — wire to settings if desired |
| StatsGrid | `components/dashboard/stats-grid.tsx` | Medium — pattern for dashboard KPIs |
| MiniChart | `components/dashboard/mini-chart.tsx` | Medium — sparkline stat cards |
| ChartsShowcase | `components/dashboard/charts-showcase.tsx` | Low — reference only |
| ProjectsTable | `components/dashboard/projects-table.tsx` | Low — ERP DataTable is superior |
| Footer | `components/layout/footer.tsx` | Low — optional |

---

## 12. Summary Counts

| Action | Count | Description |
|--------|-------|-------------|
| Reuse | 42 | Keep ERP component; no structural changes |
| Replace | 12 | Swap visual implementation from template |
| Refactor | 18 | Merge ERP logic with template styling |
| Adopt | 28 | Import template primitive not in ERP |
| Create | 3 | Build new using template patterns |
| Delete | 3 | Template components not needed in ERP |

---

## 13. Priority Order

### P0 — Foundation (blocks everything)
Button, Card, Input, Label, Dialog, Table, Badge, Separator

### P1 — Layout Shell
AppShell, Sidebar, MobileSidebar, TopNavigation, PageHeader

### P2 — Data & Forms
DataTable (restyle), Select, Form, Calendar, Popover, Tabs, Pagination

### P3 — Feedback & Charts
Alert, AlertDialog, Skeleton, Chart (ChartContainer), Progress, Tooltip

### P4 — Auth & Polish
LoginForm, RegisterForm, AuthSlider, dark mode, grain-texture

### P5 — Domain Modules
Page-by-page restyle of business module components
