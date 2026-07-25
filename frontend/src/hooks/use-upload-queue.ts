"use client";

import { useCallback, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useApiContext } from "@/hooks/use-api-context";
import { uploadDocument } from "@/lib/api/documents";
import { validateFiles, type UploadValidationConfig } from "@/lib/document-validation";
import type { Document, UploadItem, UploadMetadata } from "@/types/document";

function createUploadId() {
  return `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface UseUploadQueueOptions extends UploadMetadata {
  validation?: UploadValidationConfig;
  existingDocuments?: Document[];
  onComplete?: (document: Document) => void;
}

export function useUploadQueue(options: UseUploadQueueOptions) {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();
  const [items, setItems] = useState<UploadItem[]>([]);
  const abortControllers = useRef<Map<string, AbortController>>(new Map());

  const uploadFile = useCallback(
    async (item: UploadItem) => {
      if (!token) return;

      setItems((prev) =>
        prev.map((entry) =>
          entry.id === item.id ? { ...entry, status: "uploading", progress: 0 } : entry,
        ),
      );

      try {
        const response = await uploadDocument(
          token,
          item.file,
          {
            entityType: options.entityType,
            entityId: options.entityId,
            category: options.category,
            tags: options.tags,
            changeNotes: options.changeNotes,
          },
          organizationId,
          (progress) => {
            setItems((prev) =>
              prev.map((entry) => (entry.id === item.id ? { ...entry, progress } : entry)),
            );
          },
        );

        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id
              ? { ...entry, status: "complete", progress: 100, documentId: response.data.id }
              : entry,
          ),
        );

        void queryClient.invalidateQueries({ queryKey: ["documents", organizationId] });
        options.onComplete?.(response.data);
        toast.success(`${item.file.name} uploaded`);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Upload failed";
        setItems((prev) =>
          prev.map((entry) =>
            entry.id === item.id ? { ...entry, status: "failed", error: message } : entry,
          ),
        );
        toast.error(message);
      }
    },
    [token, organizationId, options, queryClient],
  );

  const enqueue = useCallback(
    (files: File[]) => {
      const errors = validateFiles(files, options.existingDocuments ?? [], options.validation);
      if (errors.length > 0) {
        errors.forEach((err) => toast.error(err.message));
        return;
      }

      const newItems: UploadItem[] = files.map((file) => ({
        id: createUploadId(),
        file,
        status: "pending",
        progress: 0,
      }));

      setItems((prev) => [...prev, ...newItems]);
      newItems.forEach((item) => {
        void uploadFile(item);
      });
    },
    [options.existingDocuments, options.validation, uploadFile],
  );

  const cancel = useCallback((id: string) => {
    abortControllers.current.get(id)?.abort();
    setItems((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, status: "cancelled" } : entry)),
    );
  }, []);

  const retry = useCallback(
    (id: string) => {
      const item = items.find((entry) => entry.id === id);
      if (!item) return;
      void uploadFile({ ...item, status: "pending", progress: 0, error: undefined });
    },
    [items, uploadFile],
  );

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const clearCompleted = useCallback(() => {
    setItems((prev) => prev.filter((entry) => entry.status !== "complete"));
  }, []);

  const isUploading = items.some(
    (entry) => entry.status === "uploading" || entry.status === "processing",
  );

  return { items, enqueue, cancel, retry, remove, clearCompleted, isUploading };
}
