"use client";

import { useRef, useState } from "react";
import { RefreshCw, Upload } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DocumentCard } from "@/components/documents/document-card";
import { DocumentListSkeleton } from "@/components/documents/document-list-skeleton";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { DragDropZone } from "@/components/documents/drag-drop-zone";
import { UploadQueue } from "@/components/documents/upload-queue";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useApiContext } from "@/hooks/use-api-context";
import { useDocumentViewer } from "@/hooks/use-document-viewer";
import {
  useArchiveDocument,
  useDeleteDocument,
  useEntityDocuments,
} from "@/hooks/use-documents";
import { useUploadQueue } from "@/hooks/use-upload-queue";
import { downloadDocumentFile, uploadDocumentVersion } from "@/lib/api/documents";
import { DEFAULT_ALLOWED_ACCEPT, DEFAULT_ALLOWED_MIME_TYPES } from "@/lib/document-validation";
import type { AttachableEntityType, Document, DocumentCategory } from "@/types/document";
import { cn } from "@/lib/utils";

interface AttachmentListProps {
  entityType: AttachableEntityType;
  entityId: string | number;
  category?: DocumentCategory;
  readOnly?: boolean;
  showDropZone?: boolean;
  className?: string;
}

export function AttachmentList({
  entityType,
  entityId,
  category = "other",
  readOnly = false,
  showDropZone = true,
  className,
}: AttachmentListProps) {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();
  const documentsQuery = useEntityDocuments(entityType, entityId);
  const deleteDocument = useDeleteDocument();
  const archiveDocument = useArchiveDocument();
  const documents = documentsQuery.data?.items ?? [];
  const viewer = useDocumentViewer(documents);

  const uploadQueue = useUploadQueue({
    entityType,
    entityId,
    category,
    existingDocuments: documents,
    validation: { allowedMimeTypes: DEFAULT_ALLOWED_MIME_TYPES, maxFiles: 5 },
  });

  const [versionTarget, setVersionTarget] = useState<Document | null>(null);
  const [changeNotes, setChangeNotes] = useState("");
  const [versionUploading, setVersionUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const versionInputRef = useRef<HTMLInputElement>(null);

  async function handleVersionUpload(file: File) {
    if (!versionTarget || !token) return;
    setVersionUploading(true);
    try {
      await uploadDocumentVersion(
        token,
        versionTarget.id,
        file,
        changeNotes || undefined,
        organizationId,
      );
      toast.success(`Version ${versionTarget.version + 1} uploaded`);
      setVersionTarget(null);
      setChangeNotes("");
      await queryClient.invalidateQueries({ queryKey: ["documents", organizationId] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Version upload failed");
    } finally {
      setVersionUploading(false);
    }
  }

  async function handleDownload(document: Document) {
    if (!token) return;
    try {
      await downloadDocumentFile(token, document, organizationId);
    } catch {
      toast.error("Unable to download file");
    }
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            Attachments {documents.length > 0 && `(${documents.length})`}
          </h3>
          <p className="text-xs text-muted-foreground">Supporting documents for this record</p>
        </div>
        {!readOnly && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1"
            disabled={uploadQueue.isUploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </Button>
        )}
      </div>

      {!readOnly && (
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          accept={DEFAULT_ALLOWED_ACCEPT}
          onChange={(event) => {
            const files = event.target.files ? Array.from(event.target.files) : [];
            if (files.length > 0) uploadQueue.enqueue(files);
            event.target.value = "";
          }}
        />
      )}

      {!readOnly && showDropZone && (
        <DragDropZone
          compact
          multiple
          accept={DEFAULT_ALLOWED_ACCEPT}
          disabled={uploadQueue.isUploading}
          onFilesAccepted={uploadQueue.enqueue}
        />
      )}

      <UploadQueue
        items={uploadQueue.items}
        onCancel={uploadQueue.cancel}
        onRetry={uploadQueue.retry}
        onRemove={uploadQueue.remove}
      />

      {documentsQuery.isLoading && <DocumentListSkeleton />}

      {documentsQuery.isError && (
        <div className="space-y-2 text-center">
          <ErrorAlert message="Unable to load attachments." />
          <Button variant="outline" size="sm" className="gap-1" onClick={() => void documentsQuery.refetch()}>
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </Button>
        </div>
      )}

      {!documentsQuery.isLoading &&
        !documentsQuery.isError &&
        documents.length === 0 &&
        uploadQueue.items.length === 0 && (
          <div className="rounded-lg border border-dashed border-border px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">No attachments yet.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Upload receipts, invoices, or supporting documents.
            </p>
          </div>
        )}

      {!documentsQuery.isLoading &&
        documents.map((document, index) => (
          <DocumentCard
            key={document.id}
            document={document}
            readOnly={readOnly}
            onPreview={() => viewer.open(index)}
            onDownload={() => handleDownload(document)}
            onUploadVersion={readOnly ? undefined : () => setVersionTarget(document)}
            onArchive={readOnly ? undefined : () => void archiveDocument.mutateAsync(document.id)}
            onDelete={readOnly ? undefined : () => void deleteDocument.mutateAsync(document.id)}
          />
        ))}

      <DocumentViewer
        open={viewer.isOpen}
        onOpenChange={(open) => !open && viewer.close()}
        documents={documents}
        currentIndex={viewer.currentIndex}
        onIndexChange={(index) => viewer.open(index)}
      />

      <Dialog open={!!versionTarget} onOpenChange={(open) => !open && setVersionTarget(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload new version</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Replace{" "}
              <span className="font-medium text-foreground">{versionTarget?.name}</span> with an
              updated file.
            </p>
            <div className="space-y-2">
              <Label htmlFor="change-notes">Change notes (optional)</Label>
              <Input
                id="change-notes"
                value={changeNotes}
                onChange={(event) => setChangeNotes(event.target.value)}
                placeholder="Describe what changed"
              />
            </div>
            <input
              ref={versionInputRef}
              type="file"
              className="hidden"
              accept={DEFAULT_ALLOWED_ACCEPT}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleVersionUpload(file);
                event.target.value = "";
              }}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setVersionTarget(null)}>
              Cancel
            </Button>
            <Button
              type="button"
              disabled={versionUploading}
              onClick={() => versionInputRef.current?.click()}
            >
              {versionUploading ? "Uploading…" : "Choose file"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
