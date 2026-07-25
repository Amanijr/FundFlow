import type {
  Document,
  DocumentCategory,
  DocumentSearchFilters,
  DocumentVersion,
  DocumentVersionListResponse,
  UploadMetadata,
} from "@/types/document";

const now = Date.now();
let nextDocId = 10;

const previewUrlCache = new Map<string, string>();

const INITIAL_DOCUMENTS: Document[] = [
  {
    id: "doc-1",
    name: "invoice-march.pdf",
    category: "invoice",
    status: "ready",
    mimeType: "application/pdf",
    sizeBytes: 1_245_000,
    version: 1,
    tags: ["q1"],
    entityType: "expense",
    entityId: 1,
    organizationId: 1,
    uploadedBy: { id: 2, name: "David Mwangi" },
    uploadedAt: new Date(now - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-2",
    name: "receipt-scan.jpg",
    category: "receipt",
    status: "ready",
    mimeType: "image/jpeg",
    sizeBytes: 840_000,
    version: 2,
    tags: ["receipt"],
    entityType: "expense",
    entityId: 1,
    organizationId: 1,
    uploadedBy: { id: 2, name: "David Mwangi" },
    uploadedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
    changeNotes: "Corrected amount",
  },
  {
    id: "doc-3",
    name: "donation-receipt.pdf",
    category: "receipt",
    status: "ready",
    mimeType: "application/pdf",
    sizeBytes: 520_000,
    version: 1,
    tags: [],
    entityType: "donation",
    entityId: 1,
    organizationId: 1,
    uploadedBy: { id: 1, name: "Sarah Kimaro" },
    uploadedAt: new Date(now - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "doc-4",
    name: "grant-agreement.pdf",
    category: "grant_agreement",
    status: "ready",
    mimeType: "application/pdf",
    sizeBytes: 2_100_000,
    version: 1,
    tags: ["2026"],
    entityType: "grant",
    entityId: 1,
    organizationId: 1,
    uploadedBy: { id: 3, name: "Grace Admin" },
    uploadedAt: new Date(now - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_VERSIONS: Record<string, DocumentVersion[]> = {
  "doc-2": [
    {
      version: 1,
      documentId: "doc-2",
      name: "receipt-scan.jpg",
      sizeBytes: 800_000,
      mimeType: "image/jpeg",
      uploadedBy: { id: 2, name: "David Mwangi" },
      uploadedAt: new Date(now - 4 * 24 * 60 * 60 * 1000).toISOString(),
      isCurrent: false,
    },
    {
      version: 2,
      documentId: "doc-2",
      name: "receipt-scan.jpg",
      sizeBytes: 840_000,
      mimeType: "image/jpeg",
      uploadedBy: { id: 2, name: "David Mwangi" },
      uploadedAt: new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString(),
      changeNotes: "Corrected amount",
      isCurrent: true,
    },
  ],
};

let documents: Document[] = [...INITIAL_DOCUMENTS];

function cachePreviewUrl(documentId: string, file: File): string {
  const existing = previewUrlCache.get(documentId);
  if (existing) URL.revokeObjectURL(existing);
  const url = URL.createObjectURL(file);
  previewUrlCache.set(documentId, url);
  return url;
}

export function getPreviewUrl(documentId: string): string | undefined {
  return previewUrlCache.get(documentId);
}

export function getMockDocuments(filters?: DocumentSearchFilters): Document[] {
  let items = documents.filter((doc) => doc.status !== "deleted");

  if (filters?.status) {
    items = items.filter((doc) => doc.status === filters.status);
  } else {
    items = items.filter((doc) => doc.status === "ready" || doc.status === "archived");
  }

  if (filters?.entityType) {
    items = items.filter((doc) => doc.entityType === filters.entityType);
  }
  if (filters?.entityId != null) {
    items = items.filter((doc) => String(doc.entityId) === String(filters.entityId));
  }
  if (filters?.category) {
    items = items.filter((doc) => doc.category === filters.category);
  }
  if (filters?.q) {
    const lower = filters.q.toLowerCase();
    items = items.filter(
      (doc) =>
        doc.name.toLowerCase().includes(lower) ||
        doc.tags.some((tag) => tag.toLowerCase().includes(lower)),
    );
  }

  items = items.map((doc) => ({
    ...doc,
    previewUrl: previewUrlCache.get(doc.id) ?? doc.previewUrl,
  }));

  return items.sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
  );
}

export function getMockDocument(id: string): Document | null {
  const doc = documents.find((item) => item.id === id);
  if (!doc) return null;
  return { ...doc, previewUrl: previewUrlCache.get(id) ?? doc.previewUrl };
}

export function uploadMockDocument(
  file: File,
  meta: UploadMetadata,
  uploadedBy = { id: 1, name: "Demo User" },
): Document {
  const id = `doc-${nextDocId++}`;
  const previewUrl = cachePreviewUrl(id, file);
  const doc: Document = {
    id,
    name: file.name,
    category: meta.category ?? "other",
    status: "ready",
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    version: 1,
    tags: meta.tags ?? [],
    entityType: meta.entityType,
    entityId: meta.entityId,
    organizationId: 1,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
    previewUrl,
    changeNotes: meta.changeNotes,
  };
  documents = [doc, ...documents];
  MOCK_VERSIONS[id] = [
    {
      version: 1,
      documentId: id,
      name: file.name,
      sizeBytes: file.size,
      mimeType: doc.mimeType,
      uploadedBy,
      uploadedAt: doc.uploadedAt,
      isCurrent: true,
      previewUrl,
    },
  ];
  return doc;
}

export function uploadMockDocumentVersion(
  documentId: string,
  file: File,
  changeNotes?: string,
  uploadedBy = { id: 1, name: "Demo User" },
): Document | null {
  const index = documents.findIndex((item) => item.id === documentId);
  if (index === -1) return null;

  const current = documents[index];
  const nextVersion = current.version + 1;
  const previewUrl = cachePreviewUrl(documentId, file);

  const versions = MOCK_VERSIONS[documentId] ?? [];
  versions.forEach((v) => {
    v.isCurrent = false;
  });
  versions.push({
    version: nextVersion,
    documentId,
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type || current.mimeType,
    uploadedBy,
    uploadedAt: new Date().toISOString(),
    changeNotes,
    isCurrent: true,
    previewUrl,
  });
  MOCK_VERSIONS[documentId] = versions;

  documents[index] = {
    ...current,
    name: file.name,
    sizeBytes: file.size,
    mimeType: file.type || current.mimeType,
    version: nextVersion,
    uploadedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    previewUrl,
    changeNotes,
  };

  return documents[index];
}

export function deleteMockDocument(id: string): Document | null {
  const index = documents.findIndex((item) => item.id === id);
  if (index === -1) return null;
  documents[index] = { ...documents[index], status: "deleted" };
  return documents[index];
}

export function archiveMockDocument(id: string): Document | null {
  const index = documents.findIndex((item) => item.id === id);
  if (index === -1) return null;
  documents[index] = { ...documents[index], status: "archived" };
  return documents[index];
}

export function getMockDocumentVersions(documentId: string): DocumentVersionListResponse | null {
  const doc = getMockDocument(documentId);
  if (!doc) return null;
  const versions = (MOCK_VERSIONS[documentId] ?? []).map((v) => ({
    ...v,
    previewUrl: previewUrlCache.get(documentId) ?? v.previewUrl,
  }));
  return {
    documentId,
    currentVersion: doc.version,
    versions,
  };
}

export function updateMockDocumentMetadata(
  id: string,
  patch: { name?: string; category?: DocumentCategory; tags?: string[] },
): Document | null {
  const index = documents.findIndex((item) => item.id === id);
  if (index === -1) return null;
  documents[index] = {
    ...documents[index],
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  return documents[index];
}

export function resetMockDocuments(): void {
  documents = [...INITIAL_DOCUMENTS];
  nextDocId = 10;
  previewUrlCache.forEach((url) => URL.revokeObjectURL(url));
  previewUrlCache.clear();
}
