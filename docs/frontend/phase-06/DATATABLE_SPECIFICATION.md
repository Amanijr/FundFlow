# Phase 06 — DataTable Specification

**Date:** 2026-06-30  
**Implementation:** `frontend/src/components/tables/data-table.tsx`  
**Engine:** TanStack Table v8

---

## 1. Purpose

`DataTable` is the single reusable table component for FundFlow ERP. Every module list — donors, expenses, journal entries, platform users — configures it with column definitions and data props. No module builds its own table.

---

## 2. Component Tree

```
DataTable
├── DataTableToolbar          (record count, bulk actions, columns, export)
├── Table / TableHeader / TableBody   (ui/table primitives)
│   └── Sortable column headers
│   └── Row cells via flexRender
├── EmptyState                (zero rows)
└── DataTablePagination       (prev / next — target: full pagination)
```

**Target extraction:** Toolbar and pagination become sub-components under `components/data/data-table/`.

---

## 3. Props API

### Current

```ts
interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  globalFilter?: string;
  enableSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  onExport?: () => void;
  bulkActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}
```

### Target extensions

```ts
interface DataTableProps<TData> {
  // ... existing ...
  mode?: "client" | "server";
  pageCount?: number;                    // server mode
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  isLoading?: boolean;
  error?: Error | null;
  onRetry?: () => void;
  pageSizeOptions?: number[];              // default [10, 25, 50, 100]
  mobileView?: "table" | "cards";         // default "table"
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
}
```

---

## 4. Column Definition

Columns use TanStack `ColumnDef<TData>`. Extended via `meta` for ERP conventions:

```ts
interface FundFlowColumnMeta {
  /** Cell type for default formatter */
  type?: "text" | "currency" | "percent" | "date" | "datetime" | "status" | "user" | "link";
  /** Hide on tablet breakpoint */
  hiddenOnTablet?: boolean;
  /** Hide on mobile — use DataList instead */
  hiddenOnMobile?: boolean;
  /** Text alignment */
  align?: "left" | "right" | "center";
  /** Export header label override */
  exportHeader?: string;
  /** RBAC — hide column if user lacks permission */
  requiredPermission?: string;
}
```

### Column definition checklist

| Field | Required | Notes |
|-------|----------|-------|
| `accessorKey` or `accessorFn` | Yes | Data path |
| `header` | Yes | Column title |
| `cell` | Optional | Custom renderer; prefer cell components |
| `enableSorting` | Default true | Set false for action columns |
| `enableHiding` | Default true | Set false for select/actions |
| `size` / `minSize` | Optional | Fixed width columns |
| `meta.type` | Recommended | Enables default formatters |

### Example

```ts
const columns: ColumnDef<DonorResponse>[] = [
  {
    accessorKey: "name",
    header: "Donor",
    cell: ({ row }) => (
      <Link href={`/donors/${row.original.id}`} className="font-medium text-primary hover:underline">
        {row.original.firstName} {row.original.lastName}
      </Link>
    ),
    meta: { type: "link" },
  },
  {
    accessorKey: "lifetimeValue",
    header: "Lifetime value",
    cell: ({ row }) => <CurrencyCell value={row.original.lifetimeValue} />,
    meta: { type: "currency", align: "right" },
  },
  {
    id: "actions",
    header: "",
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => <RowActionsMenu row={row.original} />,
  },
];
```

**Never hardcode columns inside DataTable.** Columns live in feature files: `features/donors/columns.tsx` or page `useMemo`.

---

## 5. Sorting

### Client mode (current)

- TanStack `getSortedRowModel()`
- Click column header toggles: none → asc → desc
- Indicators: `ChevronUp`, `ChevronDown`, `ChevronsUpDown` (muted)

### Server mode (target)

- Controlled `sorting` state passed to DataTable
- Page passes sort to API query key: `["donors", { sort, page, q }]`
- Header click calls `onSortingChange` only — no local sort

### Accessibility

- Sortable headers use `<button type="button">`
- `aria-sort="ascending" | "descending" | "none"` on `<th>` (target)

---

## 6. Filtering

DataTable accepts `globalFilter` string for TanStack global filter model.

**Page responsibility:** Filter data before passing to DataTable OR pass raw data with globalFilter for client-side column filter.

**Recommended pattern:** Page filters via `useMemo` (see donors page); pass filtered array + same string as `globalFilter` for toolbar count accuracy.

Advanced filters via FilterBar — see [FILTER_SYSTEM.md](./FILTER_SYSTEM.md).

---

## 7. Global Search Integration

```
FilterBar (search input)
    ↓ onSearchChange
Page state (search: string)
    ↓ useMemo filter OR API query
DataTable (data + globalFilter)
```

Search is owned by the page, not DataTable. DataTable reflects count in toolbar.

---

## 8. Pagination

### Current

- Client-side via `getPaginationRowModel()`
- Default page size: 10 (TanStack default)
- UI: "Page X of Y" + Previous / Next buttons
- `h-7` compact buttons, `text-xs` labels

### Target

| Control | Behaviour |
|---------|-------------|
| First / Last | Jump to ends |
| Page numbers | 1 … 5 ellipsis pattern |
| Page size | Select: 10, 25, 50, 100 |
| Persistence | `localStorage` key `fundflow-table-page-size` |

Server mode: `manualPagination: true`, `pageCount` from API.

---

## 9. Row Selection & Bulk Actions

### Selection column

When `enableSelection={true}`:

- Prepends checkbox column
- Header: select all on **current page**
- Row: individual checkbox
- `aria-label="Select all"` / `aria-label="Select row"`

### Bulk toolbar

When `selectedCount > 0`:

- Renders `bulkActions` slot in toolbar
- Shows "N selected · M total"

### Bulk action rules

| Rule | Detail |
|------|--------|
| Destructive last | Delete, Reject after Approve, Export |
| Confirm destructive | Use ConfirmDialog before batch delete |
| Permission gate | Wrap bulk buttons in PermissionGate |
| Clear selection | After successful bulk operation |

```tsx
<DataTable
  enableSelection
  bulkActions={
    <>
      <Button size="sm" variant="outline">Export selected</Button>
      <Button size="sm" variant="destructive">Delete</Button>
    </>
  }
/>
```

---

## 10. Row Actions

### Target: `RowActionsMenu`

Dropdown per row with permission-aware items:

| Action | Icon | Variant |
|--------|------|---------|
| View | Eye | default |
| Edit | Pencil | default |
| Duplicate | Copy | default |
| Archive | Archive | outline |
| Audit history | History | default |
| Delete | Trash | destructive (separated) |

Current: inline links/buttons in column `cell` — migrate to shared menu.

```tsx
<RowActionsMenu
  items={[
    { label: "View", href: `/donors/${id}` },
    { label: "Edit", href: `/donors/${id}/edit`, permission: "donors:write" },
    { label: "Delete", onClick: handleDelete, variant: "destructive", permission: "donors:delete" },
  ]}
/>
```

---

## 11. Column Visibility

- "Columns" dropdown in toolbar when `enableColumnVisibility`
- Toggle show/hide per column (except select column)
- Target: human-readable labels from `meta.exportHeader` or header string
- Target: persist visibility in localStorage per route

---

## 12. Empty, Loading, Error States

| State | Component | When |
|-------|-----------|------|
| Loading (page) | `LoadingState layout="list"` | `isLoading` from React Query |
| Loading (table) | Skeleton rows inside table | `isLoading` prop on DataTable (target) |
| Empty | `EmptyState` inside table body | `rows.length === 0` |
| Error | `DataErrorState` above table | `isError` from React Query |

Empty state props: `emptyTitle`, `emptyDescription` — override per module.

```tsx
<DataTable
  emptyTitle="No donations found"
  emptyDescription="Record your first donation to get started."
/>
```

---

## 13. Export

Export button in toolbar calls `onExport` — **page provides implementation**.

Export must respect:

- Current filters (export `filtered` data, not raw)
- Selected rows when selection active
- Visible columns only

See [EXPORT_IMPORT_GUIDE.md](./EXPORT_IMPORT_GUIDE.md).

---

## 14. Responsive Behaviour

| Breakpoint | Strategy |
|------------|----------|
| Desktop | Full table |
| Tablet | Hide `meta.hiddenOnTablet` columns |
| Mobile | `DataList` card layout (target) OR `overflow-x-auto` wrapper |

Current: horizontal scroll via table container. Acceptable interim.

### DataList (target)

```tsx
<DataList
  data={filtered}
  renderCard={(item) => <DonorCard donor={item} />}
/>
```

Toggle via `mobileView="cards"` on DataTable or separate route layout.

---

## 15. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Semantic table | `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` |
| Sort buttons | Keyboard activatable |
| Selection | Checkbox labels |
| Row selected | `data-state="selected"` on row |
| Empty state | Visible text in table cell |

---

## 16. Performance

```ts
// Columns must be memoized
const columns = useMemo(() => [...], [deps]);

// Stable row ids for selection
getRowId: (row) => String(row.id),
```

Target: `@tanstack/react-virtual` for virtualized body when `data.length > 200`.

---

## 17. Do / Don't

### Do

```tsx
<DataTable columns={columns} data={filtered} globalFilter={search} />
```

### Don't

```tsx
<table className="w-full">...</table>  // in feature pages
<DataTable columns={hardcodedDonorColumns} />  // inside shared component
```

---

## 18. Migration Checklist

- [ ] Extract `DataTableToolbar`
- [ ] Extract `DataTablePagination` with page size
- [ ] Add `DataTableSkeleton` rows
- [ ] Add `RowActionsMenu`
- [ ] Add server-side mode props
- [ ] Move to `components/data/data-table/`
- [ ] Add `components/data/index.ts` barrel
