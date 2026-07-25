export type DocumentCategory =
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

export type DocumentStatus = "processing" | "ready" | "archived" | "deleted";

export type AttachableEntityType =
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

export type UploadStatus =
  | "pending"
  | "validating"
  | "uploading"
  | "processing"
  | "complete"
  | "failed"
  | "cancelled";

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  status: DocumentStatus;
  mimeType: string;
  sizeBytes: number;
  version: number;
  tags: string[];
  entityType: AttachableEntityType;
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
  previewUrl?: string;
  changeNotes?: string;
  isSensitive?: boolean;
}

export interface DocumentVersion {
  version: number;
  documentId: string;
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
  previewUrl?: string;
}

export interface DocumentListResponse {
  items: Document[];
  page: number;
  totalPages: number;
  totalElements: number;
}

export interface DocumentSearchFilters {
  q?: string;
  category?: DocumentCategory;
  entityType?: AttachableEntityType;
  entityId?: string | number;
  uploadedBy?: number;
  from?: string;
  to?: string;
  tags?: string[];
  status?: DocumentStatus;
  mimeType?: string;
  page?: number;
  size?: number;
}

export interface UploadItem {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  error?: string;
  documentId?: string;
}

export interface UploadMetadata {
  entityType: AttachableEntityType;
  entityId?: string | number;
  category?: DocumentCategory;
  tags?: string[];
  changeNotes?: string;
}

export interface DocumentVersionListResponse {
  documentId: string;
  currentVersion: number;
  versions: DocumentVersion[];
}

export interface UploadValidationError {
  fileName: string;
  message: string;
}
