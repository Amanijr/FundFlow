"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useApiContext } from "@/hooks/use-api-context";
import {
  archiveDocument,
  deleteDocument,
  getDocument,
  listDocumentVersions,
  listDocuments,
  updateDocument,
} from "@/lib/api/documents";
import type { Document, DocumentSearchFilters } from "@/types/document";

function documentsQueryKey(organizationId?: number, filters?: DocumentSearchFilters) {
  return ["documents", organizationId, filters ?? {}] as const;
}

export function useDocuments(filters?: DocumentSearchFilters) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: documentsQueryKey(organizationId, filters),
    queryFn: async () => (await listDocuments(token!, organizationId, filters)).data,
    enabled: Boolean(token),
  });
}

export function useEntityDocuments(entityType: string, entityId: string | number) {
  return useDocuments({
    entityType: entityType as DocumentSearchFilters["entityType"],
    entityId,
    status: "ready",
  });
}

export function useDocument(id: string) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["documents", id, organizationId],
    queryFn: async () => (await getDocument(token!, id, organizationId)).data,
    enabled: Boolean(token && id),
  });
}

export function useDocumentVersions(documentId: string) {
  const { token, organizationId } = useApiContext();

  return useQuery({
    queryKey: ["documents", documentId, "versions", organizationId],
    queryFn: async () => (await listDocumentVersions(token!, documentId, organizationId)).data,
    enabled: Boolean(token && documentId),
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();

  return useMutation({
    mutationFn: (id: string) => deleteDocument(token!, id, organizationId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents", organizationId] });
    },
  });
}

export function useArchiveDocument() {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();

  return useMutation({
    mutationFn: (id: string) => archiveDocument(token!, id, organizationId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents", organizationId] });
    },
  });
}

export function useUpdateDocumentMetadata() {
  const queryClient = useQueryClient();
  const { token, organizationId } = useApiContext();

  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string;
      patch: Partial<Pick<Document, "name" | "category" | "tags">>;
    }) => updateDocument(token!, id, patch, organizationId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: ["documents", organizationId] });
    },
  });
}
