# Document Metadata

**Phase:** 11 — Enterprise Document Management System

---

## 1. Purpose

Every document in FundFlow carries structured metadata for display, search, filtering, and audit. Metadata is **authoritative from the API** — the frontend displays and edits only fields the server exposes.

---

## 2. Core Model

```ts
type DocumentCategory =
  | "receipt"
  | "invoice"
  | "voucher"
  | "bank_slip"
  | "journal_attachment"
  | "contract"
  | "proposal"
  | "quotation"
  | "purchase_order"
  | "grant_agreement"
  | "project_plan"
  | "budget"
  | "supporting_evidence"
  | "user_document"
  | "organization_logo"
  | "policy"
  | "other";

type DocumentStatus = "processing" | "ready" | "archived" | "deleted";

interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  status: DocumentStatus;
  mimeType: string;
  sizeBytes: number;
  version: number;
  tags: string[];
  entityType: string;
  entityId?: string | number;
  entityLabel?: string;
  organizationId: number;
  uploadedBy: {
    id: number;
    name: string;
  };
  uploadedAt: string;
  updatedAt?: string;
  thumbnailUrl?: string;
  previewUrl?: string;       // short-lived; refresh before viewer open
  downloadUrl?: string;      // short-lived
  changeNotes?: string;      // latest version notes
  isSensitive?: boolean;
}
```

---

## 3. Category Taxonomy

| Group | `DocumentCategory` values |
|-------|---------------------------|
| Financial | `receipt`, `invoice`, `voucher`, `bank_slip`, `journal_attachment` |
| Operations | `contract`, `proposal`, `quotation`, `purchase_order` |
| Projects | `grant_agreement`, `project_plan`, `budget`, `supporting_evidence` |
| Administration | `user_document`, `organization_logo`, `policy` |
| Fallback | `other` |

Define labels in `lib/document-categories.ts` (mirror `notification-categories.ts` pattern).

```ts
export const DOCUMENT_CATEGORIES = [
  { value: "receipt", label: "Receipt", group: "Financial" },
  // ...
] as const;
```

---

## 4. Display Fields

### Document card (list / grid)

```
┌────────────────────────────────────┐
│ [thumb]  invoice-march.pdf         │
│          Invoice · 1.2 MB          │
│          Uploaded by Sarah · 2d ago│
│          [v3]  expense, receipt    │
└────────────────────────────────────┘
```

| Field | Format |
|-------|--------|
| Name | Truncate with tooltip |
| Category | Human label |
| Size | `formatBytes(sizeBytes)` |
| Uploaded by | User display name |
| Date | Relative + absolute on hover |
| Version | Badge `v{n}` when > 1 |
| Tags | Chip list (max 3 visible) |

### Metadata panel (viewer sidebar)

| Section | Fields |
|---------|--------|
| **File** | Name, type, size, version |
| **Classification** | Category, tags |
| **Context** | Entity type, entity link, organization |
| **Provenance** | Uploaded by, uploaded at, updated at |
| **Notes** | Change notes (latest version) |

Editable fields (when permitted): `name`, `category`, `tags`, `changeNotes` — via `PATCH /api/v1/documents/{id}`.

---

## 5. Tags

- Free-form strings, normalized lowercase on server
- Max 10 tags per document; max 32 chars each
- UI: combobox with suggestions from org tag index
- Filter documents by tag in search

```tsx
<TagInput
  value={tags}
  onChange={setTags}
  suggestions={orgTags}
  maxTags={10}
/>
```

---

## 6. Search & Filters

```ts
interface DocumentSearchFilters {
  q?: string;              // filename, tags, entity label
  category?: DocumentCategory;
  entityType?: string;
  entityId?: string | number;
  uploadedBy?: number;
  from?: string;           // ISO date
  to?: string;
  tags?: string[];
  status?: DocumentStatus;
  mimeType?: string;
  page?: number;
  size?: number;
}
```

**Search page** (`/documents`): `PageHeader` + filter bar (reuse Phase 06 `FilterChip` pattern) + `DocumentList` / `DocumentGrid` toggle.

| Filter UI | Control |
|-----------|---------|
| Keyword | `SearchInput` |
| Category | Select |
| Date range | Date pickers |
| Uploaded by | User lookup |
| Tags | Multi-select chips |

Results respect permissions — empty state: "No documents found."

---

## 7. API Contracts

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/documents` | GET | List / search |
| `/api/v1/documents/{id}` | GET | Single document |
| `/api/v1/documents/{id}` | PATCH | Update metadata |
| `/api/v1/documents/search` | GET | Full-text search (alias or dedicated) |

**List response:**

```json
{
  "success": true,
  "data": {
    "items": [ Document[] ],
    "page": 0,
    "totalPages": 5,
    "totalElements": 87
  }
}
```

**PATCH body (partial):**

```json
{
  "name": "invoice-march-2026.pdf",
  "category": "invoice",
  "tags": ["q1", "operations"]
}
```

---

## 8. Formatting Utilities

```ts
// lib/document-format.ts
export function formatBytes(bytes: number): string;
export function formatMimeLabel(mimeType: string): string;
export function getDocumentIcon(mimeType: string): LucideIcon;
```

Reuse Phase 06 data formatting conventions for dates (`date-fns`).

---

## 9. Sensitive Documents

When `isSensitive: true`:

- Lock icon on `DocumentCard`
- Extra confirm dialog before download (optional org policy)
- Excluded from global search for unauthorized roles (server)
- Watermark on preview (backend concern; UI shows badge)

---

## 10. Export Metadata

Bulk action: **Export metadata** → CSV of selected documents:

| Column | Source |
|--------|--------|
| ID | `id` |
| Name | `name` |
| Category | label |
| Size | `sizeBytes` |
| MIME | `mimeType` |
| Version | `version` |
| Entity | `entityType` + `entityId` |
| Uploaded by | `uploadedBy.name` |
| Uploaded at | `uploadedAt` |
| Tags | joined |

Use `downloadCsv` from `lib/utils/csv-export.ts`.

---

## 11. Hook

```ts
export function useDocuments(filters?: DocumentSearchFilters) {
  return useQuery({
    queryKey: ["documents", organizationId, filters],
    queryFn: () => listDocuments(token, organizationId, filters),
    enabled: Boolean(token),
  });
}

export function useUpdateDocumentMetadata() {
  return useMutation({
    mutationFn: ({ id, patch }) => updateDocument(token, id, patch, organizationId),
    onSuccess: () => invalidate document queries,
  });
}
```

---

## 12. Checklist

- [ ] `Document` type in `types/document.ts`
- [ ] `document-categories.ts` labels
- [ ] `formatBytes` / MIME helpers
- [ ] `listDocuments` / `updateDocument` API
- [ ] `useDocuments` hook
- [ ] `MetadataPanel` component
- [ ] `DocumentCard` with metadata display
- [ ] Search page with filters
- [ ] Tag input component
- [ ] Mock document fixtures
