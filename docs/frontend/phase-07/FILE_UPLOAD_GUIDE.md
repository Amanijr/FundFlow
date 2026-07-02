# File Upload Guide

**Phase:** 07 — Enterprise Form System  
**Current component:** `frontend/src/components/forms/file-uploader.tsx`

---

## 1. Purpose

FundFlow forms attach documents across modules:

| Module | Typical files |
|--------|---------------|
| Donations | Receipts, thank-you letters |
| Expenses | Invoices, receipts |
| Grants | PDF applications, budgets (Excel) |
| HR | Contracts, ID scans |
| Accounting | Bank statements, import files |

Upload UI must be consistent: drag-drop zone, progress, validation feedback, and accessible file list.

---

## 2. Upload UX Standards

### Drop zone anatomy

```
┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
│            [Upload icon]              │
│     Drag and drop files here          │
│     or browse from your device        │
│         [ Choose files ]              │
│  • invoice.pdf (1.2 MB)        [×]    │
└ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
```

| Element | Requirement |
|---------|-------------|
| Drop zone | Dashed `border-border`, `bg-muted/30`, min height for touch |
| Icon | `Upload` from lucide, `text-muted-foreground` |
| Primary text | `text-sm font-medium` |
| Secondary text | `text-xs text-muted-foreground` |
| Browse button | `Button variant="outline"` — triggers hidden `<input type="file">` |
| File list | Name, size, remove action, upload progress |

**Current implementation** covers drop zone + browse + basic file name list. Target `FileUploadField` adds RHF integration, validation, progress, and remove.

---

## 3. Supported File Types

| Category | MIME / extension | Max size (default) |
|----------|------------------|-------------------|
| PDF | `application/pdf`, `.pdf` | 10 MB |
| Images | `image/jpeg`, `image/png`, `image/webp` | 5 MB |
| Excel | `.xlsx`, `.xls`, `text/csv` | 25 MB |
| Word | `.docx` | 10 MB |
| Generic attachment | Configurable per field | 10 MB |

Define per-field in Zod:

```ts
const receiptSchema = z.object({
  files: z
    .array(z.instanceof(File))
    .min(1, "At least one receipt is required")
    .max(5, "Maximum 5 files")
    .refine(
      (files) => files.every((f) => f.size <= 10 * 1024 * 1024),
      "Each file must be under 10 MB",
    )
    .refine(
      (files) => files.every((f) =>
        ["application/pdf", "image/jpeg", "image/png"].includes(f.type),
      ),
      "Only PDF and images are allowed",
    ),
});
```

---

## 4. Component API (target)

```tsx
interface FileUploadFieldProps {
  name: string;
  control: Control<FieldValues>;
  label: string;
  description?: string;
  accept?: string;           // input accept attribute
  multiple?: boolean;
  maxFiles?: number;
  maxSizeBytes?: number;
  allowedTypes?: string[];   // MIME list for client check
  onUpload?: (files: File[]) => Promise<UploadedFile[]>;
  disabled?: boolean;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  url?: string;      // after server upload
  mimeType: string;
}
```

### Modes

| Mode | Behaviour |
|------|-----------|
| **Local only** | Files stay in form state until parent submits `FormData` |
| **Immediate upload** | `onUpload` per file; store returned `id`/`url` in form |
| **Existing + new** | Show server files with delete; append new local files |

Forms do not call APIs directly — parent provides `onUpload` from a feature hook.

---

## 5. React Hook Form Integration

```tsx
<Controller
  control={control}
  name="attachments"
  render={({ field }) => (
    <FileUploader
      accept=".pdf,image/*"
      multiple
      onFilesSelected={(files) => field.onChange(files)}
    />
  )}
/>
```

Target wrapper:

```tsx
<FileUploadField
  control={control}
  name="attachments"
  label="Receipts"
  description="PDF or image, max 10 MB each"
  accept=".pdf,image/jpeg,image/png"
  multiple
  maxFiles={5}
/>
```

---

## 6. Drag and Drop

Current `FileUploader` behaviour:

- `onDragOver` → `preventDefault()` to allow drop
- `onDrop` → `preventDefault()`, read `dataTransfer.files`

**Enhancements (target):**

- Visual `dragActive` state (border-primary background)
- Reject folders if not supported
- Keyboard: focus drop zone, Enter opens file picker

---

## 7. Upload Progress

For immediate-upload mode:

```
invoice.pdf  [████████░░] 80%
```

Use `ui/progress` per file. States: `pending` | `uploading` | `complete` | `error`.

On error: show message under file row, allow retry. Do not clear other successful uploads.

---

## 8. Preview

| Type | Preview |
|------|---------|
| Images | Thumbnail in file list |
| PDF | Icon + filename; optional modal viewer |
| Excel | Icon + filename |

Lazy-load previews. No auto-download on select.

---

## 9. Validation Summary

| Check | Where |
|-------|-------|
| File count | Zod `.min` / `.max` |
| File size | Zod `.refine` on each `File.size` |
| MIME type | Zod `.refine` on `File.type` |
| Virus scan | Server only |
| Duplicate name | Optional client warning; server authoritative |

Client checks are UX — server re-validates type, size, and content.

---

## 10. Security

- Never trust `File.type` or extension alone — server inspects magic bytes
- Sanitize filenames for display (strip path segments)
- Do not render uploaded HTML/SVG inline without sanitization
- Signed URLs for download — short-lived
- PII documents: respect org retention policy (server)

---

## 11. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Label | `FormField` label associated with file input |
| Keyboard | Hidden input focusable via browse button |
| Announcements | `aria-live` region for "3 files selected" / errors |
| Progress | `aria-valuenow` on `Progress` |
| Remove | `aria-label="Remove invoice.pdf"` |

---

## 12. Mobile

- Full-width drop zone
- Large touch target on "Choose files" (`min-h-11`)
- Use device camera for receipt capture: `accept="image/*" capture="environment"` on dedicated receipt fields
- Sticky form actions remain visible above keyboard

---

## 13. Avatar Upload Variant

Specialized subset for profile/org logo:

- Single file
- `accept="image/*"`
- Square crop preview (target)
- Max 2 MB
- Returns cropped blob or base64 to parent

---

## 14. Import Dialog (Excel/CSV)

Bulk import is **not** the same as attachment upload — see Phase 06 `ImportDialog` (target).

| Attachment upload | Data import |
|-------------------|-------------|
| Stored as document | Parsed into records |
| `FileUploadField` | `ImportDialog` + column mapping |
| Few files | Single spreadsheet |

---

## 15. Migration from Current FileUploader

| Step | Action |
|------|--------|
| 1 | Keep `FileUploader` as presentational primitive |
| 2 | Add `FileUploadField` with Controller + validation props |
| 3 | Add remove button + file size display |
| 4 | Add progress UI when `onUpload` provided |
| 5 | Use in expense-form, grant applications |

---

## 16. Checklist

- [ ] Files wrapped in `FormField` with label
- [ ] Client size/type validation in Zod
- [ ] Clear error messages per constraint
- [ ] Remove individual files before submit
- [ ] Server upload separated from field component
- [ ] Progress and error states per file
- [ ] Accessible file list and actions
