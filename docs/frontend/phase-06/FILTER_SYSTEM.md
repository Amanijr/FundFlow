# Phase 06 — Filter System

**Date:** 2026-06-30  
**Implementation:** `frontend/src/components/tables/filter-bar.tsx`  
**Companion:** [SEARCH_ARCHITECTURE.md](./SEARCH_ARCHITECTURE.md)

---

## 1. Purpose

The filter system provides reusable, stackable filters for every ERP list view. Users refine datasets without learning module-specific filter UIs.

---

## 2. Architecture

```
FilterBar
├── SearchInput          (global text search)
├── FilterSlot           (module-specific controls)
├── ResetButton          (clear all)
└── ActiveFilterChips    (removable summary)
```

**State ownership:** Feature page or dedicated `use*Filters` hook — never inside FilterBar.

```tsx
const { search, setSearch, filters, setFilter, activeChips, reset } = useDonorFilters();

<FilterBar
  searchValue={search}
  onSearchChange={setSearch}
  filters={<DonorFilterControls filters={filters} onChange={setFilter} />}
  activeChips={activeChips}
  onRemoveChip={(id) => clearFilter(id)}
  onReset={reset}
/>
```

---

## 3. FilterBar API

### Current

```ts
interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  activeChips?: FilterChip[];
  onRemoveChip?: (id: string) => void;
  onReset?: () => void;
  className?: string;
}

interface FilterChip {
  id: string;
  label: string;
}
```

### Target: AdvancedFilter panel

Collapsible panel for dense filter sets (reports, audit logs):

```tsx
<AdvancedFilter open={open} onOpenChange={setOpen}>
  <AdvancedFilterSection title="Date range">
    <DateRangeFilter value={dateRange} onChange={setDateRange} />
  </AdvancedFilterSection>
  <AdvancedFilterSection title="Status">
    <StatusMultiSelect value={statuses} onChange={setStatuses} />
  </AdvancedFilterSection>
</AdvancedFilter>
```

---

## 4. Filter Types

| Type | Control | Use case | Example |
|------|---------|----------|---------|
| **Text** | `Input` | Name, reference, memo | Donor name |
| **Number** | `Input type="number"` | Quantity, count | Donation count |
| **Currency range** | Min/max inputs | Amount bands | Expenses $100–$500 |
| **Date** | `DateInput` | Single date | Journal entry date |
| **Date range** | Two `DateInput` | Period filters | Reports Q1 2026 |
| **Status** | `Select` or multi | Workflow state | PENDING, APPROVED |
| **Multi select** | Checkbox list / Select | Categories | Fund types |
| **Boolean** | `Switch` / Checkbox | Flags | Active only |
| **Organization** | `EntitySelector` | Platform admin | Tenant filter |
| **User** | `EntitySelector` | Assigned to | Approver |

---

## 5. Filter Stacking

Filters combine with **AND** logic by default.

```
search: "smith"
AND status: ["APPROVED", "PENDING"]
AND dateRange: { from: "2026-01-01", to: "2026-03-31" }
AND fundId: "42"
```

OR logic only inside a single multi-select filter (status in A or B).

### Client-side filter hook pattern

```ts
function useDonorFilters(donors: DonorResponse[] | undefined) {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string | "all">("all");

  const filtered = useMemo(() => {
    let result = donors ?? [];
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => ...);
    }
    if (status !== "all") {
      result = result.filter((d) => d.status === status);
    }
    return result;
  }, [donors, search, status]);

  const activeChips = useMemo(() => {
    const chips: FilterChip[] = [];
    if (status !== "all") chips.push({ id: "status", label: `Status: ${status}` });
    return chips;
  }, [status]);

  const reset = () => { setSearch(""); setStatus("all"); };

  return { search, setSearch, status, setStatus, filtered, activeChips, reset };
}
```

### Server-side filter pattern (target)

```ts
const filters = { q: search, status, from, to, page, size };
const query = useQuery({ queryKey: ["donors", filters], queryFn: () => listDonors(filters) });
```

---

## 6. Filter Chips

Active filters display as removable chips below FilterBar.

| Property | Rule |
|----------|------|
| Label | Human-readable: `Status: Approved`, not `status=APPROVED` |
| Remove | Click chip → clears that filter only |
| Reset | Clears all filters + search |

Chip styling: `text-[11px]`, `border-border`, `bg-surface` — matches current FilterBar.

---

## 7. Module Filter Examples

### Donors

| Filter | Type |
|--------|------|
| Search | Text (name, email) |
| Status | Select (future) |
| Tags | Multi select (future) |

### Expenses

| Filter | Type |
|--------|------|
| Search | Text |
| Status | Status multi |
| Date range | Date range |
| Fund | Entity selector |

### Journal entries

| Filter | Type |
|--------|------|
| Search | Text |
| Date range | Date range |
| Posted | Boolean |

### Platform users

| Filter | Type |
|--------|------|
| Search | Text |
| Organization | Organization |
| Role | Multi select |

---

## 8. Report Filters

`components/accounting/report-filters.tsx` and `components/reports/report-filters.tsx` are domain-specific filter rows for report pages. They should compose shared filter primitives — not duplicate FilterBar layout.

Target: extract `DateRangeFilter`, `FundSelectorFilter` as reusable building blocks.

---

## 9. Responsive Behaviour

| Breakpoint | Layout |
|------------|--------|
| Mobile | FilterBar stacks vertically; filters wrap |
| Tablet+ | Search flex-1, filters inline |
| Dense modules | AdvancedFilter in sheet on mobile |

```tsx
className="flex flex-col gap-2 lg:flex-row lg:items-center"  // current FilterBar
```

---

## 10. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Search label | `aria-label` or visible label |
| Filter controls | Each has `<Label>` |
| Chips | `button` with descriptive text + remove icon `aria-hidden` |
| Reset | "Reset filters" button text |

---

## 11. Target Components

| Component | Path | Status |
|-----------|------|--------|
| FilterBar | `data/filter-bar/filter-bar.tsx` | Exists (tables/) |
| FilterChip | `data/filter-bar/filter-chip.tsx` | Inline in FilterBar |
| AdvancedFilter | `data/filter-bar/advanced-filter.tsx` | Planned |
| DateRangeFilter | `data/filters/date-range-filter.tsx` | Planned |
| StatusFilter | `data/filters/status-filter.tsx` | Planned |
| CurrencyRangeFilter | `data/filters/currency-range-filter.tsx` | Planned |

---

## 12. Constraints

- FilterBar does not fetch data
- Filter state lives in page or feature hook
- New filter types added as shared components — not inline in one page
- Filters must sync with export (export filtered dataset)

---

## 13. Related Documents

- [SEARCH_ARCHITECTURE.md](./SEARCH_ARCHITECTURE.md) — search vs filter boundary
- [DATATABLE_SPECIFICATION.md](./DATATABLE_SPECIFICATION.md) — table integration
- [EXPORT_IMPORT_GUIDE.md](./EXPORT_IMPORT_GUIDE.md) — export respects filters
