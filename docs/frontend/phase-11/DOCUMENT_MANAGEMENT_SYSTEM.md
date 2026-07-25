# Phase 11 — Enterprise Document Management System

**Date:** 2026-06-30  
**Status:** Implemented  
**Dependencies:** Phase 00–10

---

## 1. Executive Summary

Documents are first-class citizens in FundFlow ERP. Nearly every financial record, approval workflow, campaign, or audit trail references supporting files — receipts, invoices, contracts, grant agreements, and policies.

This phase defines a **centralized document management framework**. Modules attach, preview, version, and secure documents through shared services — not custom upload UIs per feature.

---

## 2. Design Philosophy

| Principle | Application |
|-----------|-------------|
| **Consistent** | Uploading an invoice feels identical to uploading a donation receipt |
| **Non-blocking** | Uploads run in a queue; pages remain interactive |
| **Permission-inherited** | Document access follows parent entity authorization |
| **Auditable** | Every view, download, and delete is logged |
| **Reusable** | One uploader, one viewer, one attachment list |

---

## 3. Document Categories

| Category | Examples | Typical entities |
|----------|----------|------------------|
| **Financial** | Receipt, invoice, voucher, bank slip, journal attachment | Expense, donation, journal entry |
| **Operations** | Contract, proposal, quotation, purchase order | Vendor, campaign |
| **Projects** | Grant agreement, project plan, budget, evidence | Grant, program, budget |
| **Administration** | User documents, org logo, policies | User, organization |

Categories power filtering and search. See [DOCUMENT_METADATA.md](./DOCUMENT_METADATA.md).

---

## 4. Supported File Types

| Group | Extensions | Preview |
|-------|------------|---------|
| Documents | PDF, DOCX, XLSX, CSV, TXT | PDF, TXT in-app; others download |
| Images | PNG, JPG, JPEG, WEBP | In-app viewer |
| Future | ZIP, ODT, PPTX | Download only |

Unsupported types produce clear inline validation — never silent failure.

Default limits (configurable per org/field):

| Type | Max size |
|------|----------|
| PDF / images | 10 MB |
| Spreadsheets | 25 MB |
| Default | 10 MB |

---

## 5. Architecture

```
Module detail page / form
    ↓
AttachmentList (entityType + entityId)
    ↓
lib/api/documents.ts
    ↓
TanStack Query + useUploadQueue
    ↓
├── FileUploader / DragDropZone
├── UploadQueue + UploadProgress
├── DocumentViewer + FilePreview
├── VersionHistory + MetadataPanel
└── Document search (library page)
```

**Rule:** Feature modules never implement standalone file pickers or preview modals — use the document framework.

---

## 6. Document Lifecycle

```
selected → validating → uploading → processing → ready
                              ↓           ↓
                          failed      virus_scan (backend)
                              ↓
                           retry / cancel

ready → viewed / downloaded → updated (new version) → archived → deleted → restored
```

See [FILE_UPLOAD_GUIDE.md](./FILE_UPLOAD_GUIDE.md) and [VERSIONING_STRATEGY.md](./VERSIONING_STRATEGY.md).

---

## 7. Current vs Target

### Implemented today

| Piece | Path | Status |
|-------|------|--------|
| Basic drop zone | `components/forms/file-uploader.tsx` | ⚠️ Local files only; no progress |
| Form field wrapper | `components/forms/fields/file-upload-field.tsx` | ⚠️ RHF integration; partial validation |
| Progress primitive | `components/ui/progress.tsx` | ✅ Unused in upload flow |
| Receipt preview | `donations/[id]/page.tsx` | ⚠️ Text dialog only; not file viewer |
| CSV export | `lib/utils/csv-export.ts` | ✅ Export pattern; not document download |

### Target structure

```
features/documents/
├── components/
│   ├── file-uploader.tsx          # extends forms primitive
│   ├── drag-drop-zone.tsx
│   ├── upload-queue.tsx
│   ├── upload-progress.tsx
│   ├── document-card.tsx
│   ├── document-grid.tsx
│   ├── document-list.tsx
│   ├── document-viewer.tsx
│   ├── file-preview.tsx
│   ├── metadata-panel.tsx
│   ├── version-history.tsx
│   └── attachment-list.tsx
├── hooks/
│   ├── use-documents.ts
│   ├── use-upload-queue.ts
│   └── use-document-viewer.ts
├── lib/
│   ├── document-validation.ts
│   ├── document-mime.ts
│   └── download-document.ts
├── types/
│   └── document.ts
└── api/
    └── documents.ts
```

Phase 07 `FileUploader` / `FileUploadField` remain the **form-layer** entry points; Phase 11 adds the **system layer** above them.

---

## 8. State Management

```ts
interface DocumentState {
  uploadQueue: UploadItem[];
  viewer: { documentId: string | null; version?: number };
  selection: string[];
  filters: DocumentSearchFilters;
  searchResults: Document[];
  isLoading: boolean;
  error: string | null;
}
```

| Concern | Approach |
|---------|----------|
| Entity attachments | TanStack Query `["documents", entityType, entityId, orgId]` |
| Upload queue | `useUploadQueue` hook (local state + XHR/fetch progress) |
| Viewer | `useDocumentViewer` — open/close, current index in list |
| Bulk selection | Local state in list/grid; cleared on navigation |
| Search | Query `["documents", "search", filters]` |

---

## 9. Security Model

Documents **inherit permissions from their parent entity**.

| Rule | Enforcement |
|------|-------------|
| Cannot view expense → cannot view expense attachments | Backend primary; route guard on deep links |
| Search returns only authorized documents | API filters by org + role |
| Download URLs are short-lived signed URLs | Backend issues token; frontend never stores permanent URLs |
| Sensitive categories flagged server-side | UI may show lock icon; no client-side permission matrix |

Never encode document ACLs in the frontend — display only what the API returns.

---

## 10. Module Integration Points

| Page | Component | Documents |
|------|-----------|-----------|
| `/expenses/[id]` | `AttachmentList` | Invoices, receipts |
| `/donations/[id]` | `AttachmentList` | Receipt scans, correspondence |
| `/grants/[id]` | `AttachmentList` | Agreements, budgets |
| `/budgets/[id]` | `AttachmentList` | Supporting spreadsheets |
| `/campaigns/[id]` | `AttachmentList` | Creative assets, contracts |
| `/accounting/journal-entries/[id]` | `AttachmentList` | Journal supporting docs |
| `/admin/users/[id]` | `AttachmentList` | HR documents |
| `/documents` (target) | `DocumentList` + search | Org-wide library |

Wizard forms (Phase 07): add **Documents** step using `FileUploadField` + `onUpload` from `useUploadQueue`.

---

## 11. Related Documents

| Document | Contents |
|----------|----------|
| [FILE_UPLOAD_GUIDE.md](./FILE_UPLOAD_GUIDE.md) | Upload workflow, validation, queue |
| [DOCUMENT_VIEWER.md](./DOCUMENT_VIEWER.md) | Preview, zoom, fullscreen |
| [DOCUMENT_METADATA.md](./DOCUMENT_METADATA.md) | Fields, categories, tags |
| [VERSIONING_STRATEGY.md](./VERSIONING_STRATEGY.md) | Revisions, history UI |
| [ATTACHMENT_FRAMEWORK.md](./ATTACHMENT_FRAMEWORK.md) | Entity attachment model |
| Phase 07 [FILE_UPLOAD_GUIDE.md](../phase-07/FILE_UPLOAD_GUIDE.md) | Form-field upload UX |
| Phase 10 [ACTIVITY_TIMELINE.md](../phase-10/ACTIVITY_TIMELINE.md) | Document audit events |

---

## 12. Acceptance Criteria

- [x] Document architecture documented
- [x] Upload flow and validation defined
- [x] Viewer and preview specified
- [x] Metadata model defined
- [x] Versioning strategy documented
- [x] Attachment framework documented
- [x] Security model reviewed
- [x] `lib/api/documents.ts` implemented
- [x] Upload queue with progress
- [x] Document viewer (PDF + images)
- [x] `AttachmentList` on entity detail pages
- [x] Version history UI
- [x] Document search page
- [x] Mock API handlers

---

## 13. Governance

Do not proceed to Phase 12 until this framework is reviewed and approved.

Modules attach documents via `AttachmentList` and `useDocuments` — no inline `<input type="file">` in feature code.
