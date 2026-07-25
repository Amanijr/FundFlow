# Attachment Framework

**Phase:** 11 — Enterprise Document Management System

---

## 1. Purpose

Documents attach to ERP entities through a **generic attachment model**. Modules pass `entityType` + `entityId`; the framework handles list, upload, preview, and permissions.

---

## 2. Attachment Model

```ts
type AttachableEntityType =
  | "donation"
  | "expense"
  | "budget"
  | "campaign"
  | "journal_entry"
  | "vendor"
  | "grant"
  | "program"
  | "donor"
  | "user"
  | "organization";

interface AttachmentRef {
  entityType: AttachableEntityType;
  entityId: string | number;
  organizationId: number;
}

interface Attachment extends Document {
  attachmentId: string;
  attachedAt: string;
  attachedBy: {
    id: number;
    name: string;
  };
  isRequired?: boolean;     // workflow: missing blocks submit
  sortOrder?: number;
}
```

A document may attach to **one primary entity**. Cross-references (e.g. link grant doc from expense) use backend linking — not duplicate uploads.

---

## 3. Component: `AttachmentList`

Primary integration surface for module detail pages.

```tsx
interface AttachmentListProps {
  entityType: AttachableEntityType;
  entityId: string | number;
  category?: DocumentCategory;       // default for new uploads
  allowedCategories?: DocumentCategory[];
  maxFiles?: number;
  requiredCategories?: DocumentCategory[];
  readOnly?: boolean;
  compact?: boolean;
  className?: string;
}
```

### Layout

```
┌─ Attachments (3) ─────────────── [Upload] ─┐
│ invoice.pdf      Invoice · 1.2 MB    [···] │
│ receipt.jpg      Receipt · 840 KB    [···] │
│ contract.pdf     Contract · 2.1 MB [···] │
└────────────────────────────────────────────┘
```

| Feature | Behaviour |
|---------|-----------|
| Upload button | Opens file picker → `useUploadQueue` |
| Row click | Open `DocumentViewer` |
| Overflow menu | Download, new version, edit metadata, archive, delete |
| Empty state | "No attachments yet." + upload CTA |
| Required hint | Amber banner when `requiredCategories` unmet |
| Loading | Skeleton rows |

---

## 4. Data Flow

```
AttachmentList
    ↓
useEntityDocuments(entityType, entityId)
    ↓
GET /api/v1/documents?entityType=&entityId=
    ↓
Render DocumentCard rows
    ↓
Upload → POST /api/v1/documents/upload (with entity fields)
    ↓
Invalidate ["documents", entityType, entityId]
```

---

## 5. API Contracts

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/documents` | GET | List by `entityType` + `entityId` |
| `/api/v1/documents/upload` | POST | Upload and attach |
| `/api/v1/documents/{id}` | DELETE | Soft delete attachment |
| `/api/v1/documents/{id}/restore` | POST | Restore deleted |
| `/api/v1/documents/bulk` | POST | Bulk delete / archive / tag |

**List query:**

```
GET /api/v1/documents?entityType=expense&entityId=1042&status=ready
```

---

## 6. Permission Inheritance

```
User requests GET /expenses/1042
    ↓
AuthGuard + role check → allowed
    ↓
GET /api/v1/documents?entityType=expense&entityId=1042
    ↓
Backend verifies same permission scope
    ↓
Returns only authorized documents
```

| Scenario | Frontend behaviour |
|----------|-------------------|
| User can view entity | Show `AttachmentList` |
| User can edit entity | Show upload + delete |
| User view-only | List + download + preview; no upload |
| No entity access | Route guard blocks page — attachments never fetched |

Never pass document IDs from untrusted URLs without server validation.

---

## 7. Form Integration (create flows)

During **create** (no `entityId` yet):

| Mode | Behaviour |
|------|-----------|
| **Deferred attach** | Files in form state; parent submits entity then uploads with returned id |
| **Draft entity** | Backend creates draft record first; attach immediately |

```tsx
// expense-form.tsx (target)
<FormCard title="Attachments">
  <FileUploadField
    name="attachments"
    control={form.control}
    label="Supporting documents"
    accept=".pdf,image/*"
    maxFiles={5}
    onUpload={async (files) => {
      if (!expenseId) return []; // hold locally until save
      return uploadQueue.enqueue(files);
    }}
  />
</FormCard>
```

Phase 07 wizard: **Documents** step uses same pattern.

---

## 8. Module Placement Map

| Module | Page | Required docs (examples) |
|--------|------|--------------------------|
| Expenses | `/expenses/[id]` | Invoice, receipt |
| Donations | `/donations/[id]` | Receipt scan |
| Grants | `/grants/[id]` | Grant agreement, budget |
| Budgets | `/budgets/[id]` | Supporting spreadsheet |
| Campaigns | `/campaigns/[id]` | Contract, creative |
| Journal entries | `/accounting/journal-entries/[id]` | Supporting attachment |
| Donors | `/donors/[id]` | Correspondence (optional) |
| Users | `/admin/users/[id]` | HR documents |
| Organization | `/admin/settings` | Logo, policies |

Wrap in `Panel` / `FormCard` consistent with surrounding detail layout.

---

## 9. Bulk Operations

On `/documents` library page and multi-select in `AttachmentList` (admin):

| Action | API | Permission |
|--------|-----|------------|
| Download (zip) | `POST /api/v1/documents/bulk/download` | View |
| Delete | `POST /api/v1/documents/bulk/delete` | Edit or admin |
| Archive | `POST /api/v1/documents/bulk/archive` | Edit or admin |
| Tag | `POST /api/v1/documents/bulk/tag` | Edit |
| Export metadata | Client-side CSV | View |

Use `BulkActionBar` from Phase 06 data experience pattern.

Selection state:

```ts
const [selectedIds, setSelectedIds] = useState<string[]>([]);
```

Confirm destructive actions with `AlertDialog`.

---

## 10. Document Audit Trail

**Component:** extend `AuditTrail` or embed document-specific log.

| Action | Label |
|--------|-------|
| `uploaded` | Document uploaded |
| `viewed` | Document previewed |
| `downloaded` | Document downloaded |
| `metadata_updated` | Metadata updated |
| `version_created` | New version uploaded |
| `deleted` | Document deleted |
| `restored` | Document restored |

```ts
GET /api/v1/documents/{id}/audit
```

Display in `MetadataPanel` **Activity** tab.

---

## 11. `DocumentGrid` vs `DocumentList`

| Component | Use case |
|-----------|----------|
| `DocumentList` | Entity attachments, search results (default) |
| `DocumentGrid` | Visual assets (campaign images, logos) |
| `DocumentCard` | Shared row/tile primitive |

Toggle on `/documents` search page.

---

## 12. Hook Summary

```ts
export function useEntityDocuments(entityType: string, entityId: string | number) {
  return useDocuments({ entityType, entityId, status: "ready" });
}

export function useDeleteDocument() { /* mutation + confirm */ }
export function useRestoreDocument() { /* mutation */ }
export function useBulkDocumentAction() { /* bulk endpoint */ }
```

---

## 13. Error States

| State | UI |
|-------|-----|
| Load failed | `ErrorAlert` + retry in panel |
| Upload failed | Per-file error in queue |
| Permission denied on download | Toast: "You do not have access to this document" |
| Entity deleted | Hide attachment list; show archived message |

---

## 14. Mobile

- `AttachmentList` full width
- Upload opens native file picker / camera (future)
- Overflow menu becomes bottom `Sheet` action list
- Preview opens full-screen `DocumentViewer`

---

## 15. Checklist

- [ ] `AttachableEntityType` + `Attachment` types
- [ ] `AttachmentList` component
- [ ] `useEntityDocuments` hook
- [ ] Wire to expense, donation, grant detail pages
- [ ] Form deferred-upload pattern documented in expense-form
- [ ] Bulk action bar on documents page
- [ ] Document audit API + UI tab
- [ ] Permission-aware read-only mode
- [ ] Mock attachments per entity in `document-store.ts`
