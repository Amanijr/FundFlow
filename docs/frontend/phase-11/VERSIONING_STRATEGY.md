# Versioning Strategy

**Phase:** 11 — Enterprise Document Management System

---

## 1. Purpose

FundFlow documents are versioned artifacts. Users upload revisions without losing history — critical for invoices, contracts, grant agreements, and audit compliance.

---

## 2. Version Model

```ts
interface DocumentVersion {
  version: number;           // 1-based, monotonic per document lineage
  documentId: string;        // version-specific id OR shared parent id
  name: string;
  sizeBytes: number;
  mimeType: string;
  uploadedBy: {
    id: number;
    name: string;
  };
  uploadedAt: string;
  changeNotes?: string;
  isCurrent: boolean;
  downloadUrl?: string;
}
```

### Lineage

- **Document** (`Document`) exposes `version` = current version number
- **History** is an ordered list of `DocumentVersion` entries
- Uploading a new file to an existing document creates **version N+1** — not a new unrelated document

```
Document lineage: doc-1042
├── v1  contract-draft.pdf     (2026-01-10, Sarah)
├── v2  contract-signed.pdf    (2026-01-15, Sarah) — "Signed copy"
└── v3  contract-amended.pdf   (2026-03-01, David) — "Amendment 1" ← current
```

---

## 3. When to Create a New Version

| Action | Result |
|--------|--------|
| Upload new file to existing attachment | New version |
| Edit metadata only (name, tags) | Same version; `updatedAt` changes |
| Replace via "Upload new version" button | New version |
| Upload to entity with no prior doc | v1 new document |

---

## 4. Upload New Version Flow

```
User clicks "Upload new version" on AttachmentList row
    ↓
File picker / drop zone (single file)
    ↓
Optional: change notes textarea
    ↓
Validate file
    ↓
POST /api/v1/documents/{id}/versions
    ↓
Refresh document + version history
    ↓
Toast: "Version 3 uploaded"
```

Change notes are **recommended** for financial and legal categories.

---

## 5. Version History UI

**Component:** `VersionHistory`

```
┌─ Version history ──────────────────────────────┐
│ ● v3 (current)  contract-amended.pdf         │
│   Mar 1, 2026 · David Mwangi                 │
│   "Amendment 1"                    [Download]│
│ ○ v2            contract-signed.pdf          │
│   Jan 15, 2026 · Sarah Kimaro                │
│   "Signed copy"                    [Download]│
│ ○ v1            contract-draft.pdf           │
│   Jan 10, 2026 · Sarah Kimaro      [Download]│
└──────────────────────────────────────────────┘
```

| Element | Spec |
|---------|------|
| Current version | Filled dot, `(current)` label, bold |
| Older versions | Hollow dot, muted text |
| Actions | Download any version; preview current in viewer |
| Restore | "Restore as current" → creates vN+1 copy of old file (optional policy) |

Place in:
- `MetadataPanel` tab inside `DocumentViewer`
- Entity detail `AttachmentList` expanded row

---

## 6. API Contracts

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/documents/{id}/versions` | GET | List versions |
| `/api/v1/documents/{id}/versions` | POST | Upload new version (multipart) |
| `/api/v1/documents/{id}/versions/{v}/download` | GET | Download specific version |
| `/api/v1/documents/{id}/versions/{v}/restore` | POST | Restore old version as new current (optional) |

**POST new version (multipart):**

| Field | Required |
|-------|----------|
| `file` | Yes |
| `changeNotes` | Recommended |

**GET versions response:**

```json
{
  "success": true,
  "data": {
    "documentId": "doc-1042",
    "currentVersion": 3,
    "versions": [ DocumentVersion[] ]
  }
}
```

---

## 7. Viewer Behaviour

- `DocumentViewer` opens **current version** by default
- Version selector in toolbar dropdown: "View version 2"
- Switching version fetches preview URL for that version
- Download respects selected version

```tsx
<Select value={String(selectedVersion)} onValueChange={setSelectedVersion}>
  {versions.map((v) => (
    <SelectItem key={v.version} value={String(v.version)}>
      v{v.version} {v.isCurrent && "(current)"}
    </SelectItem>
  ))}
</Select>
```

---

## 8. Comparison & Diff

**Out of scope for Phase 11 UI** — no inline PDF diff. Users download versions and compare externally.

Future: side-by-side image comparison for receipt versions.

---

## 9. Retention & Deletion

| Action | Version impact |
|--------|----------------|
| Soft delete document | All versions hidden; restorable |
| Archive | Current + history archived; read-only |
| Hard delete | Backend retention policy; not exposed in UI |

Deleted documents do not appear in search. Restore brings back latest version chain.

---

## 10. Audit Events

Each version operation logs:

| Event | Payload |
|-------|---------|
| `document.version.created` | version, changeNotes, uploadedBy |
| `document.version.downloaded` | version, userId |
| `document.version.restored` | fromVersion, newVersion |

Surface in entity `ActivityTimeline` (Phase 10) when `entityType` matches.

---

## 11. Hook

```ts
export function useDocumentVersions(documentId: string) {
  return useQuery({
    queryKey: ["documents", documentId, "versions", organizationId],
    queryFn: () => listDocumentVersions(token, documentId, organizationId),
    enabled: Boolean(token && documentId),
  });
}

export function useUploadDocumentVersion() {
  return useMutation({
    mutationFn: ({ documentId, file, changeNotes }) =>
      uploadDocumentVersion(token, documentId, file, { changeNotes }, organizationId),
    onSuccess: () => invalidate document + versions queries,
  });
}
```

---

## 12. Mock Data

`lib/mock/document-store.ts`:

```ts
const MOCK_VERSIONS: Record<string, DocumentVersion[]> = {
  "doc-1": [
    { version: 1, name: "receipt.pdf", ... },
    { version: 2, name: "receipt-corrected.pdf", isCurrent: true, changeNotes: "Corrected amount" },
  ],
};
```

Handler: append version on `POST .../versions`.

---

## 13. Checklist

- [ ] `DocumentVersion` type
- [ ] Version list + upload API functions
- [ ] `useDocumentVersions` hook
- [ ] `VersionHistory` component
- [ ] "Upload new version" action in `AttachmentList`
- [ ] Version selector in `DocumentViewer`
- [ ] Change notes field on version upload
- [ ] Activity timeline events for new versions
- [ ] Mock version handlers
