import { apiRequest } from "@/lib/api/client";
import { isMockApiEnabled } from "@/lib/mock/config";
import {
  archiveMockDocument,
  deleteMockDocument,
  getMockDocument,
  getMockDocuments,
  getMockDocumentVersions,
  getPreviewUrl,
  uploadMockDocument,
  uploadMockDocumentVersion,
  updateMockDocumentMetadata,
} from "@/lib/mock/document-store";
import type { ApiResponse } from "@/types/api";
import { ApiError } from "@/types/api";
import type {
  Document,
  DocumentListResponse,
  DocumentSearchFilters,
  DocumentVersionListResponse,
  UploadMetadata,
} from "@/types/document";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

function buildQuery(filters?: DocumentSearchFilters): string {
  if (!filters) return "";
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.entityType) params.set("entityType", filters.entityType);
  if (filters.entityId != null) params.set("entityId", String(filters.entityId));
  if (filters.status) params.set("status", filters.status);
  if (filters.page != null) params.set("page", String(filters.page));
  if (filters.size != null) params.set("size", String(filters.size));
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function listDocuments(
  token: string,
  organizationId?: number,
  filters?: DocumentSearchFilters,
) {
  return apiRequest<DocumentListResponse>(
    `/api/v1/documents${buildQuery(filters)}`,
    { token, organizationId },
  );
}

export function getDocument(token: string, id: string, organizationId?: number) {
  return apiRequest<Document>(`/api/v1/documents/${id}`, { token, organizationId });
}

export function updateDocument(
  token: string,
  id: string,
  body: Partial<Pick<Document, "name" | "category" | "tags">>,
  organizationId?: number,
) {
  return apiRequest<Document>(`/api/v1/documents/${id}`, {
    method: "PATCH",
    token,
    organizationId,
    body,
  });
}

export function deleteDocument(token: string, id: string, organizationId?: number) {
  return apiRequest<Document>(`/api/v1/documents/${id}`, {
    method: "DELETE",
    token,
    organizationId,
  });
}

export function archiveDocument(token: string, id: string, organizationId?: number) {
  return apiRequest<Document>(`/api/v1/documents/${id}/archive`, {
    method: "POST",
    token,
    organizationId,
  });
}

export function listDocumentVersions(token: string, id: string, organizationId?: number) {
  return apiRequest<DocumentVersionListResponse>(`/api/v1/documents/${id}/versions`, {
    token,
    organizationId,
  });
}

export async function uploadDocument(
  token: string,
  file: File,
  meta: UploadMetadata,
  organizationId?: number,
  onProgress?: (progress: number) => void,
): Promise<ApiResponse<Document>> {
  if (isMockApiEnabled()) {
    onProgress?.(30);
    await new Promise((resolve) => setTimeout(resolve, 400));
    onProgress?.(70);
    await new Promise((resolve) => setTimeout(resolve, 300));
    onProgress?.(100);
    const doc = uploadMockDocument(file, meta);
    return {
      success: true,
      message: "Uploaded",
      data: doc,
      timestamp: new Date().toISOString(),
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("entityType", meta.entityType);
  if (meta.entityId != null) formData.append("entityId", String(meta.entityId));
  if (meta.category) formData.append("category", meta.category);
  if (meta.tags?.length) formData.append("tags", JSON.stringify(meta.tags));
  if (meta.changeNotes) formData.append("changeNotes", meta.changeNotes);

  return uploadWithProgress<Document>(
    `${API_BASE}/api/v1/documents/upload`,
    formData,
    token,
    organizationId,
    onProgress,
  );
}

export async function uploadDocumentVersion(
  token: string,
  documentId: string,
  file: File,
  changeNotes?: string,
  organizationId?: number,
  onProgress?: (progress: number) => void,
): Promise<ApiResponse<Document>> {
  if (isMockApiEnabled()) {
    onProgress?.(50);
    await new Promise((resolve) => setTimeout(resolve, 500));
    onProgress?.(100);
    const doc = uploadMockDocumentVersion(documentId, file, changeNotes);
    if (!doc) throw new ApiError("Document not found", 404);
    return {
      success: true,
      message: "Version uploaded",
      data: doc,
      timestamp: new Date().toISOString(),
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  if (changeNotes) formData.append("changeNotes", changeNotes);

  return uploadWithProgress<Document>(
    `${API_BASE}/api/v1/documents/${documentId}/versions`,
    formData,
    token,
    organizationId,
    onProgress,
  );
}

export function getDocumentDownloadUrl(id: string): string {
  if (isMockApiEnabled()) {
    const preview = getPreviewUrl(id);
    return preview ?? "#";
  }
  return `${API_BASE}/api/v1/documents/${id}/download`;
}

export async function fetchDocumentBlob(
  token: string,
  id: string,
  organizationId?: number,
): Promise<Blob> {
  if (isMockApiEnabled()) {
    const preview = getPreviewUrl(id);
    if (preview) {
      const response = await fetch(preview);
      if (!response.ok) throw new ApiError("Unable to download", response.status);
      return response.blob();
    }
    throw new ApiError("File is not available to preview", 404);
  }

  const headers = new Headers();
  headers.set("Authorization", `Bearer ${token}`);
  if (organizationId != null) {
    headers.set("X-Organization-Id", String(organizationId));
  }

  const response = await fetch(`${API_BASE}/api/v1/documents/${id}/download`, { headers });
  if (!response.ok) {
    throw new ApiError("Unable to download file", response.status);
  }
  return response.blob();
}

export async function downloadDocumentFile(
  token: string,
  document: Document,
  organizationId?: number,
) {
  if (isMockApiEnabled() && document.previewUrl) {
    window.open(document.previewUrl, "_blank", "noopener,noreferrer");
    return;
  }
  const blob = await fetchDocumentBlob(token, document.id, organizationId);
  const url = URL.createObjectURL(blob);
  const anchor = window.document.createElement("a");
  anchor.href = url;
  anchor.download = document.name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function uploadWithProgress<T>(
  url: string,
  formData: FormData,
  token: string,
  organizationId: number | undefined,
  onProgress?: (progress: number) => void,
): Promise<ApiResponse<T>> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("Accept", "application/json");
    if (organizationId != null) {
      xhr.setRequestHeader("X-Organization-Id", String(organizationId));
    }

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };

    xhr.onload = () => {
      try {
        const payload = JSON.parse(xhr.responseText) as ApiResponse<T>;
        if (xhr.status >= 400 || !payload.success) {
          reject(new ApiError(payload.message || "Upload failed", xhr.status));
          return;
        }
        resolve(payload);
      } catch {
        const hint =
          xhr.status === 404
            ? "Document upload is not available on this server. Rebuild and restart the API."
            : xhr.status >= 500
              ? "The server could not store this file. Try again or use a smaller PDF or image."
              : "Upload failed";
        reject(new ApiError(hint, xhr.status));
      }
    };

    xhr.onerror = () => reject(new ApiError("Upload failed", 0));
    xhr.send(formData);
  });
}

// Re-export mock helpers for handlers
export {
  archiveMockDocument,
  deleteMockDocument,
  getMockDocument,
  getMockDocuments,
  getMockDocumentVersions,
  updateMockDocumentMetadata,
  uploadMockDocument,
  uploadMockDocumentVersion,
};
