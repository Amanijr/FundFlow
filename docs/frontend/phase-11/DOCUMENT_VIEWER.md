# Document Viewer

**Phase:** 11 — Enterprise Document Management System

---

## 1. Purpose

Users preview supported documents inside the application without downloading. Unsupported formats show metadata and a download action.

The viewer is a **single reusable component** — opened from attachment lists, search results, and notification deep links.

---

## 2. Preview Support Matrix

| Format | In-app preview | Fallback |
|--------|----------------|----------|
| PDF | ✅ Embedded viewer | Download |
| PNG, JPG, JPEG, WEBP | ✅ Image viewer | Download |
| TXT, CSV | ✅ Monospace text panel | Download |
| DOCX, XLSX | ❌ | Download + icon |
| Unsupported | ❌ | Download + clear message |

MIME detection uses server `mimeType` — not file extension alone.

---

## 3. Component Architecture

```
DocumentViewer (Dialog shell)
├── ViewerToolbar
│   ├── Previous / Next
│   ├── Zoom in / out / fit
│   ├── Rotate (images)
│   ├── Download
│   ├── Print
│   └── Fullscreen
├── FilePreview (content area)
│   ├── PdfPreview
│   ├── ImagePreview
│   └── TextPreview
└── MetadataPanel (collapsible sidebar)
```

---

## 4. Component API

```tsx
interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  initialIndex?: number;
  onDownload?: (doc: Document) => void;
  showMetadata?: boolean;
}
```

### Hook: `useDocumentViewer`

```ts
function useDocumentViewer(documents: Document[]) {
  return {
    isOpen: boolean;
    currentIndex: number;
    current: Document | null;
    open: (index?: number) => void;
    close: () => void;
    next: () => void;
    prev: () => void;
  };
}
```

---

## 5. Dialog Shell

Reuse `@/components/ui/dialog`:

```tsx
<Dialog open={open} onOpenChange={onOpenChange}>
  <DialogContent className="flex h-[min(90vh,800px)] max-w-5xl flex-col gap-0 p-0">
    <ViewerToolbar ... />
    <div className="flex min-h-0 flex-1">
      <FilePreview document={current} zoom={zoom} rotation={rotation} />
      {showMetadata && <MetadataPanel document={current} />}
    </div>
  </DialogContent>
</Dialog>
```

- `DialogTitle` with filename (sr-only or visible in toolbar)
- Focus trapped inside dialog; restore focus on close
- `Escape` closes viewer

---

## 6. `FilePreview`

```tsx
interface FilePreviewProps {
  document: Document;
  zoom: number;       // 0.5 – 3.0
  rotation: number;   // 0, 90, 180, 270 (images only)
  className?: string;
}
```

### PDF

- **Target:** `react-pdf` or native `<iframe src={previewUrl}>` with signed URL
- Endpoint: `GET /api/v1/documents/{id}/preview` → `application/pdf` stream
- Zoom: CSS `transform: scale()` on container or PDF page width
- Loading: skeleton in content area
- Error: "Unable to preview this PDF" + download button

### Images

- `<img src={previewUrl} alt={document.name} />`
- Zoom + rotate via CSS transform
- Pinch-to-zoom on mobile (future)

### Text

- Fetch preview URL; render in `<pre className="overflow-auto text-sm">`
- Max height scroll; syntax not required

### Unsupported

```
┌────────────────────────────────────┐
│         [File type icon]           │
│     spreadsheet.xlsx               │
│  Preview not available for this    │
│  file type.                        │
│         [ Download ]               │
└────────────────────────────────────┘
```

---

## 7. Toolbar Actions

| Action | Icon | Behaviour |
|--------|------|-----------|
| Previous | `ChevronLeft` | Index - 1; disabled at start |
| Next | `ChevronRight` | Index + 1; disabled at end |
| Zoom in | `ZoomIn` | +0.25 |
| Zoom out | `ZoomOut` | -0.25 |
| Fit | `Maximize2` | Reset zoom to fit width |
| Rotate | `RotateCw` | Images only; +90° |
| Download | `Download` | `GET /api/v1/documents/{id}/download` |
| Print | `Printer` | `window.print()` on preview content or open PDF in new tab |
| Fullscreen | `Expand` | `Dialog` max viewport or Fullscreen API |
| Close | `X` | `onOpenChange(false)` |

Toolbar: `Button variant="ghost" size="icon"` with `aria-label` per action.

---

## 8. Thumbnail Previews

`DocumentCard` and search results show thumbnails when available:

```ts
interface Document {
  thumbnailUrl?: string;  // server-generated for PDF page 1 / images
}
```

Fallback: file-type icon from MIME (`FileText`, `Image`, `Sheet`).

---

## 9. API Contracts

| Endpoint | Method | Response |
|----------|--------|----------|
| `/api/v1/documents/{id}/preview` | GET | Stream or redirect to signed URL |
| `/api/v1/documents/{id}/download` | GET | `Content-Disposition: attachment` |

Headers: `Authorization`, `X-Organization-Id`

Log **viewed** and **downloaded** events on backend (audit trail).

Frontend: call `logDocumentView(id)` optionally on open (or backend logs on preview URL hit).

---

## 10. Integration Examples

### Attachment list

```tsx
const viewer = useDocumentViewer(documents);

<AttachmentList
  documents={documents}
  onPreview={(doc) => viewer.open(documents.indexOf(doc))}
/>
<DocumentViewer
  open={viewer.isOpen}
  onOpenChange={viewer.close}
  documents={documents}
  initialIndex={viewer.currentIndex}
/>
```

### Donation receipt (migrate existing)

Replace text `<pre>` dialog in `donations/[id]/page.tsx` with `DocumentViewer` when receipt is stored as PDF document.

---

## 11. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Dialog | `role="dialog"`, labelled by filename |
| Toolbar | `role="toolbar"` with labelled icon buttons |
| Zoom | Announce level via `aria-live` (optional) |
| PDF iframe | `title="{filename} preview"` |
| Images | Meaningful `alt` from document name |
| Keyboard | Arrow keys for prev/next when toolbar focused |

---

## 12. Mobile

- Viewer opens full-screen (`Dialog` `className="h-full max-w-full rounded-none"`)
- Toolbar collapses to overflow menu (`DropdownMenu`) on narrow screens
- Swipe left/right for prev/next (future)
- Download uses native share sheet where available

---

## 13. Performance

| Concern | Mitigation |
|---------|------------|
| Large PDFs | Lazy load pages; preview endpoint may return first page only |
| Many images | Unload off-screen previews when navigating |
| Signed URL expiry | Refresh preview URL on 403 |

---

## 14. Checklist

- [ ] `DocumentViewer` component
- [ ] `FilePreview` with PDF / image / text branches
- [ ] `ViewerToolbar`
- [ ] `useDocumentViewer` hook
- [ ] Preview + download API client functions
- [ ] Mock preview URLs in dev
- [ ] Migrate donation receipt dialog
- [ ] Keyboard navigation
- [ ] Mobile full-screen layout
