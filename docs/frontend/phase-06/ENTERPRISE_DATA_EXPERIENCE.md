# Phase 06 — Enterprise Data Experience

**Date:** 2026-06-30  
**Status:** Approved (documentation)  
**Dependencies:** Phase 00–05  
**Rule:** One data framework. No module-specific tables, filters, or export logic.

---

## 1. Executive Summary

FundFlow ERP is a data-driven platform. Users spend most of their time in tables, lists, search interfaces, filters, approval queues, and financial records. This phase defines the **enterprise data experience framework** — reusable patterns for displaying, searching, filtering, sorting, selecting, exporting, and acting on data.

Features configure the framework. They never rebuild it.

---

## 2. Design Philosophy

| Principle | Application |
|-----------|-------------|
| **Speed** | Skeleton loading, memoized columns, server pagination for large sets |
| **Clarity** | Tabular figures, consistent column alignment, visible sort indicators |
| **Discoverability** | FilterBar above every list, active filter chips, export in toolbar |
| **Accessibility** | Keyboard sort, ARIA on selection, semantic table markup |
| **Consistency** | Same table behaviour in Donors, Expenses, Journal Entries, Platform Users |

Users should never need to learn different table behaviours between modules.

---

## 3. Data Flow Architecture

```
Backend API
    ↓
services/ or lib/api/     (HTTP boundary — features only)
    ↓
React Query hook          (useDonors, useExpenses — feature layer)
    ↓
Page / feature view       (transform, filter state, column defs)
    ↓
FilterBar + DataTable     (presentation — no API calls)
    ↓
User actions              (navigate, bulk action, export — callbacks up)
```

### Hard rules

| Layer | May do | Must not do |
|-------|--------|-------------|
| **DataTable** | Sort, paginate, select, render cells | Call APIs, know domain types |
| **FilterBar** | Emit search/filter changes | Fetch data |
| **Feature page** | Define columns, wire queries, handle export | Build custom `<table>` markup |
| **Services** | HTTP, auth headers | Render UI |

**DataTable never communicates directly with APIs.**

---

## 4. Current vs Target

### Implemented today

| Component | Path | Capabilities |
|-----------|------|--------------|
| DataTable | `components/tables/data-table.tsx` | Sort, client pagination, global filter, selection, column visibility, export button, empty state |
| FilterBar | `components/tables/filter-bar.tsx` | Search input, filter slot, chips, reset |
| EmptyState | `components/display/empty-state.tsx` | Icon, title, description, action |
| LoadingState | `components/feedback/loading-state.tsx` | Page skeleton, brand loader |
| ErrorAlert | `components/feedback/error-alert.tsx` | Inline error (target: ErrorState) |
| ExportActions | `components/reports/export-actions.tsx` | CSV download |
| CSV utility | `lib/utils/csv-export.ts` | `downloadCsv()` |
| Formatters | `lib/utils/format.ts`, `dates.ts` | Currency, percent, date |

### Target folder structure

```
components/data/
├── data-table/
│   ├── data-table.tsx           # migrate from tables/
│   ├── data-table-toolbar.tsx
│   ├── data-table-pagination.tsx
│   └── use-data-table.ts
├── filter-bar/
│   ├── filter-bar.tsx
│   ├── filter-chip.tsx
│   └── advanced-filter.tsx
├── search/
│   └── search-input.tsx
├── cells/
│   ├── currency-cell.tsx
│   ├── date-cell.tsx
│   ├── status-cell.tsx
│   └── user-cell.tsx
├── actions/
│   ├── row-actions-menu.tsx
│   ├── bulk-toolbar.tsx
│   └── export-dropdown.tsx
├── states/
│   ├── data-empty-state.tsx
│   ├── data-loading-state.tsx
│   └── data-error-state.tsx
└── index.ts
```

Migration is incremental — re-export from `components/tables/` until imports are updated.

---

## 5. Standard List Page Pattern

Every ERP list page follows this composition:

```tsx
export default function DonorsPage() {
  const { data, isLoading, isError, refetch } = useDonors();
  const { search, setSearch, filtered } = useDonorFilters(data);
  const columns = useDonorColumns();

  if (isLoading) return <LoadingState layout="list" />;
  if (isError) return <DataErrorState onRetry={refetch} />;

  return (
    <div className="space-y-4">
      <PageHeader title="Donors" action={...} />
      <FilterBar searchValue={search} onSearchChange={setSearch} ... />
      <DataTable columns={columns} data={filtered} globalFilter={search} />
    </div>
  );
}
```

Reference implementation: `app/(app)/donors/page.tsx`.

---

## 6. Capability Matrix

| Capability | Client-side (current) | Server-side (target) |
|------------|----------------------|----------------------|
| Global search | FilterBar + page `useMemo` | Query param `?q=` |
| Column sort | TanStack `getSortedRowModel` | `?sort=field&dir=asc` |
| Pagination | TanStack `getPaginationRowModel` | `?page=1&size=25` |
| Row selection | Checkbox column | Same + selected IDs to API |
| Export | `onExport` + `downloadCsv` | API export endpoint |
| Bulk actions | `bulkActions` slot | API batch endpoint |
| Column visibility | Dropdown in toolbar | Persisted per user (future) |

---

## 7. Component Inventory

| Component | Document | Status |
|-----------|----------|--------|
| DataTable | [DATATABLE_SPECIFICATION.md](./DATATABLE_SPECIFICATION.md) | Partial |
| FilterBar / AdvancedFilter | [FILTER_SYSTEM.md](./FILTER_SYSTEM.md) | Partial |
| SearchInput | [SEARCH_ARCHITECTURE.md](./SEARCH_ARCHITECTURE.md) | Partial (in FilterBar) |
| Pagination | DATATABLE_SPECIFICATION.md §8 | Partial (prev/next only) |
| BulkToolbar | DATATABLE_SPECIFICATION.md §9 | Slot only |
| ExportDropdown | [EXPORT_IMPORT_GUIDE.md](./EXPORT_IMPORT_GUIDE.md) | Partial |
| ImportDialog | EXPORT_IMPORT_GUIDE.md §5 | Planned |
| RowActionsMenu | DATATABLE_SPECIFICATION.md §10 | Per-page inline |
| CurrencyCell / DateCell | [DATA_FORMATTING_GUIDE.md](./DATA_FORMATTING_GUIDE.md) | Inline in pages |
| DataErrorState | DATATABLE_SPECIFICATION.md §12 | Planned |

---

## 8. Responsive Strategy

| Viewport | Behaviour |
|----------|-----------|
| Desktop (≥1024px) | Full DataTable, all configured columns |
| Tablet (640–1023px) | Hide low-priority columns via `meta.hiddenOnTablet` |
| Mobile (<640px) | DataList card view (target) or horizontal scroll fallback |

Never force horizontal scrolling unless unavoidable. Prefer card list on mobile for primary modules.

See Phase 03 [RESPONSIVE_LAYOUTS.md](../phase-03/RESPONSIVE_LAYOUTS.md).

---

## 9. Security & Permissions

- Row actions and bulk actions wrapped in `PermissionGate` or role checks at column definition time
- Hide action menu items the user cannot perform — do not disable with tooltip only
- Export respects visible columns and current filter scope
- Platform/super-admin data never leaks into tenant export without explicit context

---

## 10. Performance Strategy

| Technique | When |
|-----------|------|
| `useMemo` for column defs | Always — columns array must be stable |
| Client pagination | < 500 rows |
| Server pagination | ≥ 500 rows or API-paginated endpoints |
| Virtualization (`@tanstack/react-virtual`) | ≥ 200 visible rows, single page |
| Debounced search | 300ms default — see SEARCH_ARCHITECTURE |
| Skeleton over spinner | List and table loading |

---

## 11. Constraints

Never:

- Call APIs from DataTable or FilterBar
- Hardcode columns inside shared components
- Duplicate table implementations per module
- Manually format currency/dates in cell JSX (use formatters/cells)
- Place destructive bulk actions adjacent to primary actions

Always:

- Define columns in feature hooks or `columns.tsx` files
- Pass data as props from React Query
- Use EmptyState, LoadingState, ErrorState consistently
- Respect Phase 04 design tokens in all data UI

---

## 12. Acceptance Criteria

- [x] Data architecture documented
- [x] DataTable specification complete
- [x] Filter system documented
- [x] Search architecture documented
- [x] Export/import guide documented
- [x] Formatting guide documented
- [ ] Server-side pagination adapter
- [ ] RowActionsMenu extracted
- [ ] Mobile DataList view
- [ ] ImportDialog placeholder
- [ ] DataErrorState component

---

## 13. Related Documents

| Document | Contents |
|----------|----------|
| [DATATABLE_SPECIFICATION.md](./DATATABLE_SPECIFICATION.md) | Column API, toolbar, pagination, selection |
| [FILTER_SYSTEM.md](./FILTER_SYSTEM.md) | Filter types, chips, stacking |
| [SEARCH_ARCHITECTURE.md](./SEARCH_ARCHITECTURE.md) | Global vs column search |
| [EXPORT_IMPORT_GUIDE.md](./EXPORT_IMPORT_GUIDE.md) | CSV, Excel, PDF, import flow |
| [DATA_FORMATTING_GUIDE.md](./DATA_FORMATTING_GUIDE.md) | Currency, date, status cells |
| Phase 05 [CORE_UI_COMPONENTS.md](../phase-05/CORE_UI_COMPONENTS.md) | UI primitives |
| Phase 02 [ARCHITECTURE.md](../phase-02/ARCHITECTURE.md) | Layer model |

---

## 14. Governance

Do not proceed to Phase 07 until this framework is reviewed and approved.

New list pages must use `FilterBar` + `DataTable` (or documented successor) without exception.
