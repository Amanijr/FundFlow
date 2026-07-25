# Phase 06 — Search Architecture

**Date:** 2026-06-30  
**Scope:** List search, command palette (navigation), future semantic search

---

## 1. Search Layers

FundFlow has three distinct search systems — do not conflate them.

| Layer | Component | Scope | Location |
|-------|-----------|-------|----------|
| **Global navigation** | CommandPalette | Routes, actions | Shell header (Cmd+K) |
| **List search** | FilterBar search input | Current page records | Above DataTable |
| **Future: semantic** | AI search (planned) | Cross-entity | TBD |

This document covers **list search** primarily.

---

## 2. List Search Architecture

```
User types in FilterBar
    ↓
onSearchChange (immediate or debounced)
    ↓
Page state: search string
    ↓
┌─────────────────────────────────────┐
│ Client mode: useMemo filter on data │
│ Server mode: update query key → API │
└─────────────────────────────────────┘
    ↓
Filtered data → DataTable
    ↓
globalFilter prop (count / optional TanStack filter)
```

**Search is page-owned.** FilterBar is a controlled input. DataTable displays results.

---

## 3. SearchInput Specification

### Current (embedded in FilterBar)

```tsx
<Input
  value={searchValue}
  onChange={(e) => onSearchChange(e.target.value)}
  placeholder={searchPlaceholder}
  className="h-8 pl-8 text-[13px]"
/>
<Search icon absolute left />
```

### Target: standalone SearchInput

```ts
interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;        // default 0 in FilterBar, 300 in standalone
  autoFocus?: boolean;
  className?: string;
  "aria-label"?: string;
}
```

With optional debounce via `useDebouncedValue` hook in `hooks/use-debounced-value.ts`.

---

## 4. Client vs Server Search

### Client-side (current majority)

**When:** Dataset loaded in full (< ~500 rows), already in React Query cache.

```ts
const filtered = useMemo(() => {
  const q = search.toLowerCase().trim();
  if (!q) return data ?? [];
  return (data ?? []).filter((row) =>
    searchableFields(row).some((field) => field.toLowerCase().includes(q)),
  );
}, [data, search]);
```

Define searchable fields per entity in feature hook — not in DataTable.

### Server-side (target)

**When:** Paginated API, large datasets, full-text index on backend.

```ts
const query = useQuery({
  queryKey: ["donors", { q: debouncedSearch, page, size }],
  queryFn: () => listDonors({ q: debouncedSearch, page, size }),
});
```

Debounce search input 300ms before updating query key to reduce API calls.

---

## 5. Debouncing

| Context | Debounce | Reason |
|---------|----------|--------|
| Client filter | 0–150ms optional | Instant feel on small sets |
| Server search | 300ms | Reduce API load |
| Command palette | 0ms | Local filter of static actions |

```ts
// hooks/use-debounced-value.ts (target)
export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
```

---

## 6. Column Search (future)

Per-column filter inputs in table header row — distinct from global search.

| Mode | UI | Use case |
|------|-----|----------|
| Global | FilterBar | Primary discovery |
| Column | Input in `<th>` | Dense financial tables |

TanStack column filters: `columnFilters` state + `getFilteredRowModel()`.

Not required for Phase 06 approval — document for Phase 07+.

---

## 7. Keyboard Navigation

| Key | FilterBar search | Command palette |
|-----|------------------|-----------------|
| `/` | Focus search (target) | — |
| `Cmd+K` | — | Open palette |
| `Escape` | Clear search (target) | Close palette |
| `Enter` | — | Execute selected action |

Search input must be reachable via Tab order after page header.

---

## 8. Search + Filter Interaction

Search combines with filters (AND):

```
visibleRows = applyFilters(applySearch(allRows))
```

Reset clears search **and** all filters via single `onReset` handler.

Chip for active search (target):

```tsx
{ search && <FilterChip id="search" label={`Search: "${search}"`} /> }
```

---

## 9. Empty Search Results

When `filtered.length === 0` but `data.length > 0`:

```tsx
<DataTable
  emptyTitle="No matches found"
  emptyDescription="Try a different search term or clear filters."
/>
```

Distinguish from true empty dataset:

```tsx
emptyTitle={data.length === 0 ? "No donors yet" : "No matches found"}
```

---

## 10. Command Palette (navigation search)

Separate from list search — already implemented.

| File | `components/navigation/command-palette.tsx` |
| Trigger | Cmd+K, header SearchBar |
| Data | `buildCommandActions(role, orgType)` |
| Future | Extend with entity search results from API |

Do not merge command palette with FilterBar.

---

## 11. Future: Semantic / AI Search

Placeholder architecture:

```
SearchInput (mode="semantic")
    ↓
searchService.semantic({ q, orgId, entities })
    ↓
Unified results: donors, campaigns, reports, settings
    ↓
Result list with entity type badge + navigate
```

Requirements for future phase:

- Backend search index
- Rate limiting
- Permission-filtered results
- No LLM in critical financial paths without audit

---

## 12. Performance

| Technique | Application |
|-----------|-------------|
| Debounce server queries | 300ms |
| Memoize filter functions | `useMemo` |
| Trim + lowercase once | Inside filter callback |
| Avoid regex on every keystroke | Simple `includes` for client |
| Cancel in-flight requests | React Query `signal` |

---

## 13. Accessibility

```tsx
<Input
  aria-label={searchPlaceholder ?? "Search records"}
  role="searchbox"
  ...
/>
```

Announce result count changes via `aria-live="polite"` region in toolbar (target).

---

## 14. Related Documents

- [FILTER_SYSTEM.md](./FILTER_SYSTEM.md) — filter stacking
- [DATATABLE_SPECIFICATION.md](./DATATABLE_SPECIFICATION.md) — globalFilter prop
- Phase 03 [NAVIGATION_SYSTEM.md](../phase-03/NAVIGATION_SYSTEM.md) — command palette
