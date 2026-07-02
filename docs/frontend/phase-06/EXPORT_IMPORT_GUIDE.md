# Phase 06 — Export & Import Guide

**Date:** 2026-06-30  
**Implementation:** `lib/utils/csv-export.ts`, `components/reports/export-actions.tsx`, DataTable `onExport`

---

## 1. Export Philosophy

Exports must reflect **what the user sees**:

- Current filters applied
- Selected rows when selection is active (otherwise all filtered rows)
- Visible columns only (respect column visibility)

Never export hidden columns or unfiltered full dataset without user intent.

---

## 2. Export Architecture

```
DataTable Export button
    ↓ onExport callback
Page / feature handler
    ↓ build rows from filtered/selected data
    ↓ map visible columns to headers
exportService.downloadCsv() | downloadExcel() | downloadPdf()
```

**DataTable triggers export. Page implements it. Shared utilities execute download.**

---

## 3. Supported Formats

| Format | Status | Utility | Use case |
|--------|--------|---------|----------|
| **CSV** | Implemented | `downloadCsv()` | Default — all list pages |
| **Excel** | Planned | `downloadExcel()` | Finance reports, multi-sheet |
| **PDF** | Planned | Server-generated | Official reports, audit |

### CSV (current)

```ts
// lib/utils/csv-export.ts
downloadCsv(filename: string, headers: string[], rows: (string | number)[][]): void
```

- UTF-8 BOM optional for Excel compatibility (target)
- Escapes commas, quotes, newlines
- Client-side only — no server round-trip

### ExportActions component

```tsx
<ExportActions
  filename="donors-2026-06-30.csv"
  headers={["Name", "Email", "Phone", "Added"]}
  rows={filtered.map((d) => [name, email, phone, date])}
  disabled={filtered.length === 0}
/>
```

### DataTable integration

```tsx
<DataTable
  enableExport
  onExport={() => downloadCsv("donors.csv", headers, rows)}
/>
```

---

## 4. Building Export Data

### From filtered dataset

```ts
function exportDonors(donors: DonorResponse[]) {
  const headers = ["Donor", "Email", "Phone", "Added"];
  const rows = donors.map((d) => [
    `${d.firstName} ${d.lastName}`,
    d.email,
    d.phone ?? "",
    formatDate(d.createdAt),
  ]);
  downloadCsv(`donors-${format(new Date(), "yyyy-MM-dd")}.csv`, headers, rows);
}
```

Always use formatters from [DATA_FORMATTING_GUIDE.md](./DATA_FORMATTING_GUIDE.md) — not raw API values.

### From selected rows

```ts
function exportSelected(table: Table<DonorResponse>) {
  const selected = table.getFilteredSelectedRowModel().rows.map((r) => r.original);
  exportDonors(selected);
}
```

### Visible columns only (target)

```ts
function getExportableColumns(table: Table<T>) {
  return table
    .getVisibleLeafColumns()
    .filter((col) => col.id !== "select" && col.id !== "actions");
}
```

---

## 5. Export Dropdown (target)

Replace single Export button with format menu:

```tsx
<ExportDropdown
  onExportCsv={handleCsv}
  onExportExcel={handleExcel}
  onExportPdf={handlePdf}
  disabled={rowCount === 0}
/>
```

| Item | Icon | Priority |
|------|------|----------|
| Export CSV | FileSpreadsheet | P0 |
| Export Excel | FileSpreadsheet | P2 |
| Export PDF | FileText | P3 |

---

## 6. Server-Side Export (target)

Large datasets or PDF reports require API endpoints:

```
GET /api/v1/donors/export?format=csv&q=...&status=...
```

| Concern | Rule |
|---------|------|
| Auth | Same token + org header as list API |
| Filters | Pass same query params as list |
| Async | Long exports → job + email link (future) |
| Audit | Log export events for compliance |

Client triggers download via presigned URL or blob response.

---

## 7. Import Architecture (future)

### Import flow

```
ImportDialog
    ↓ user selects file
FileParser (CSV / Excel)
    ↓
PreviewTable (first 10 rows)
    ↓
Validation (Zod schema per entity)
    ↓
Conflict resolution UI
    ↓
Confirm import
    ↓
API batch create
    ↓
Result summary (created, skipped, errors)
```

### ImportDialog props (target)

```ts
interface ImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityLabel: string;           // "Donors"
  schema: ZodSchema;
  onImport: (rows: unknown[]) => Promise<ImportResult>;
  templateUrl?: string;          // downloadable CSV template
}
```

### Phases

| Phase | Capability |
|-------|------------|
| 06 | Document only |
| 07+ | CSV import with preview |
| Future | Excel, conflict resolution, rollback |

---

## 8. Security

| Rule | Detail |
|------|--------|
| Permission | Export requires same read permission as list |
| PII | Mask sensitive fields in export if VIEW_ONLY role |
| Platform | Never export cross-tenant data without tenant context |
| Filename | No user input in filename — use entity + date pattern |

---

## 9. Filename Convention

```
{entity}-{yyyy-MM-dd}.csv

Examples:
donors-2026-06-30.csv
journal-entries-2026-06-30.csv
platform-users-2026-06-30.csv
```

---

## 10. Error Handling

| Error | UX |
|-------|-----|
| Empty dataset | Disable export button |
| Export failed | Toast destructive + retry |
| Partial import | Summary dialog with error rows downloadable |

---

## 11. Report Export

Report pages use `ExportActions` alongside chart/table data. Same rules apply — export reflects active report filters from `report-filters.tsx` state.

---

## 12. Target File Structure

```
lib/export/
├── csv.ts              # move from csv-export.ts
├── excel.ts            # planned (sheetjs or similar)
├── build-export-rows.ts
└── types.ts

components/data/actions/
├── export-dropdown.tsx
└── import-dialog.tsx
```

---

## 13. Do / Don't

### Do

```ts
downloadCsv("expenses.csv", headers, rowsFromFilteredData);
```

### Don't

```ts
downloadCsv("expenses.csv", headers, allExpensesUnfiltered);
fetch("/api/export").then(...) // inside DataTable component
```

---

## 14. Related Documents

- [DATATABLE_SPECIFICATION.md](./DATATABLE_SPECIFICATION.md) — onExport prop
- [DATA_FORMATTING_GUIDE.md](./DATA_FORMATTING_GUIDE.md) — cell formatters for export rows
- [FILTER_SYSTEM.md](./FILTER_SYSTEM.md) — export respects filters
