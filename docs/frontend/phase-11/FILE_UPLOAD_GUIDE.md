# File Upload Guide

**Phase:** 11 — Enterprise Document Management System  
**Extends:** Phase 07 [FILE_UPLOAD_GUIDE.md](../phase-07/FILE_UPLOAD_GUIDE.md)

---

## 1. Scope

Phase 07 defines **form-field** upload UX (`FileUploadField`). Phase 11 defines the **system-level** upload pipeline: validation, queue, progress, server transfer, and attachment binding.

---

## 2. Upload Workflow

```
Select files (picker / drag-drop / paste)
    ↓
Client validate (type, size, count, duplicates)
    ↓
Add to UploadQueue
    ↓
Preview filenames + sizes (optional thumbnail for images)
    ↓
Upload (multipart POST per file or batch)
    ↓
Backend: virus scan → processing → persist metadata
    ↓
Return Document record → attach to entity
    ↓
Complete (toast + refresh attachment list)
```

Each stage must be visible in the UI.

---

## 3. Upload Methods

| Method | Status | Component |
|--------|--------|-----------|
| File picker | ✅ Basic | `FileUploader` hidden input |
| Drag and drop | ✅ Basic | `FileUploader` / `DragDropZone` |
| Clipboard paste (images) | 🔜 Target | `DragDropZone` `onPaste` |
| Mobile camera | Future | `capture="environment"` on input |

---

## 4. Upload Queue Model

```ts
type UploadStatus =
  | "pending"
  | "validating"
  | "uploading"
  | "processing"
  | "complete"
  | "failed"
  | "cancelled";

interface UploadItem {
  id: string;              // client-generated uuid
  file: File;
  status: UploadStatus;
  progress: number;        // 0–100
  bytesPerSecond?: number;
  error?: string;
  documentId?: string;     // set after server success
  entityType?: string;
  entityId?: string | number;
  category?: DocumentCategory;
}
```

---

## 5. Component API (target)

### `DragDropZone`

```tsx
interface DragDropZoneProps {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  disabled?: boolean;
  onFilesAccepted: (files: File[]) => void;
  onValidationError?: (errors: UploadValidationError[]) => void;
  children?: React.ReactNode;
}
```

Visual: dashed border, `dragActive` ring on `dragover`, `aria-dropeffect="copy"`.

### `UploadQueue`

```tsx
interface UploadQueueProps {
  items: UploadItem[];
  onCancel: (id: string) => void;
  onRetry: (id: string) => void;
  onRemove: (id: string) => void;
}
```

### `UploadProgress`

```tsx
interface UploadProgressProps {
  filename: string;
  progress: number;
  status: UploadStatus;
  bytesPerSecond?: number;
  error?: string;
  onCancel?: () => void;
  onRetry?: () => void;
}
```

Uses `Progress` from `@/components/ui/progress`. Status text announced via `aria-live="polite"`.

---

## 6. Hook: `useUploadQueue`

```ts
interface UseUploadQueueOptions {
  entityType: string;
  entityId?: string | number;
  category?: DocumentCategory;
  maxConcurrent?: number;   // default 2
}

function useUploadQueue(options: UseUploadQueueOptions) {
  return {
    items: UploadItem[];
    enqueue: (files: File[]) => void;
    cancel: (id: string) => void;
    retry: (id: string) => void;
    clearCompleted: () => void;
    isUploading: boolean;
  };
}
```

### Upload implementation

```ts
async function uploadDocument(
  token: string,
  file: File,
  meta: UploadMetadata,
  onProgress: (pct: number) => void,
): Promise<Document> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("entityType", meta.entityType);
  if (meta.entityId != null) formData.append("entityId", String(meta.entityId));
  if (meta.category) formData.append("category", meta.category);

  // XMLHttpRequest or fetch with ReadableStream for progress events
  return uploadWithProgress("/api/v1/documents/upload", formData, token, onProgress);
}
```

Extend `lib/api/client.ts` with `uploadRequest` — **do not** send JSON `Content-Type` for multipart.

---

## 7. Validation

Centralize in `lib/document-validation.ts`:

```ts
interface UploadValidationConfig {
  maxSizeBytes: number;
  allowedMimeTypes: string[];
  maxFiles: number;
  allowDuplicates: boolean;
}

function validateFiles(
  files: File[],
  existing: Document[],
  config: UploadValidationConfig,
): UploadValidationError[];
```

| Check | Message example |
|-------|-----------------|
| MIME not allowed | `"invoice.exe is not a supported file type"` |
| Over size limit | `"invoice.pdf exceeds the 10 MB limit"` |
| Too many files | `"Maximum 5 files per upload"` |
| Duplicate name | `"invoice.pdf already attached"` |
| Required missing | `"At least one receipt is required"` |

Validation runs **before** enqueue. Failed files never enter the queue.

### Default MIME map

```ts
const DOCUMENT_MIME_TYPES = {
  pdf: ["application/pdf"],
  image: ["image/png", "image/jpeg", "image/webp"],
  spreadsheet: [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
  ],
  word: ["application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  text: ["text/plain"],
};
```

---

## 8. Upload Row UI

```
┌─────────────────────────────────────────────────────┐
│ 📄 invoice-march.pdf                    1.2 MB  [×] │
│ ████████████░░░░░░░░░░░░░░░░  48%   240 KB/s       │
│ Uploading…                              [Cancel]    │
└─────────────────────────────────────────────────────┘
```

| Status | Display |
|--------|---------|
| `pending` | Grey bar at 0% |
| `uploading` | Progress bar + speed |
| `processing` | Indeterminate spinner — "Processing…" |
| `complete` | Check icon; fade out after 2s |
| `failed` | Red message + **Retry** |
| `cancelled` | Strikethrough filename |

Uploads must not block form submit of unrelated fields — queue runs independently.

---

## 9. API Contracts (target)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/documents/upload` | POST | Multipart upload |
| `/api/v1/documents/upload/resume` | POST | Resumable chunk (future) |

**Request (multipart fields):**

| Field | Required |
|-------|----------|
| `file` | Yes |
| `entityType` | Yes |
| `entityId` | When attaching |
| `category` | Recommended |
| `tags` | Optional JSON array |
| `changeNotes` | Optional (new version) |

**Response:**

```json
{
  "success": true,
  "data": { /* Document */ }
}
```

---

## 10. Mock / Dev Mode

Add to `lib/mock/handlers.ts`:

- `POST /api/v1/documents/upload` — simulate delay + progress via staged responses
- Store in `lib/mock/document-store.ts`
- Return blob URLs for image preview in dev

Dev page: `/dev/components` — extend with `UploadQueue` demo.

---

## 11. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Drop zone label | `aria-label="Upload documents"` |
| File input | Associated `<label>` or `aria-describedby` for constraints |
| Progress | `role="progressbar"` + `aria-valuenow` |
| Status changes | `aria-live="polite"` region per queue |
| Keyboard | Browse button focusable; cancel/retry keyboard accessible |

---

## 12. Mobile

- Full-width drop zone; min touch target 44px
- `input[type=file]` with `accept="image/*"` for gallery
- Camera capture: `capture="environment"` (future flag)
- Upload queue stacks vertically; sticky cancel at bottom

---

## 13. Migration from Phase 07

| Step | Action |
|------|--------|
| 1 | Keep `FileUploadField` for forms — wire `onUpload` to `useUploadQueue` |
| 2 | Replace raw `FileUploader` usage in modules with `DragDropZone` + queue |
| 3 | Add `AttachmentList` to expense, donation, grant detail pages |
| 4 | Extend `apiRequest` → `uploadRequest` for multipart |
| 5 | Add mock upload handler |

---

## 14. Checklist

- [ ] `UploadItem` type in `types/document.ts`
- [ ] `document-validation.ts`
- [ ] `uploadRequest` in API client
- [ ] `useUploadQueue` hook
- [ ] `UploadQueue` + `UploadProgress` components
- [ ] `DragDropZone` with drag-active styling
- [ ] Clipboard paste for images
- [ ] Mock upload handler
- [ ] Wire `FileUploadField.onUpload`
