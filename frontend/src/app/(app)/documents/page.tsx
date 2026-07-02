"use client";

import { useState } from "react";

import { DocumentCard } from "@/components/documents/document-card";
import { DocumentListSkeleton } from "@/components/documents/document-list-skeleton";
import { DocumentViewer } from "@/components/documents/document-viewer";
import { ErrorAlert } from "@/components/feedback/error-alert";
import { PageHeader } from "@/components/layout/page-header";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useDocumentViewer } from "@/hooks/use-document-viewer";
import { useDocuments } from "@/hooks/use-documents";
import { getDocumentDownloadUrl } from "@/lib/api/documents";
import { DOCUMENT_CATEGORIES } from "@/lib/document-categories";
import type { Document, DocumentCategory, DocumentSearchFilters } from "@/types/document";
import { cn } from "@/lib/utils";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "ready", label: "Active" },
  { value: "archived", label: "Archived" },
] as const;

export default function DocumentsPage() {
  const [filters, setFilters] = useState<DocumentSearchFilters>({
    size: 50,
  });
  const [search, setSearch] = useState("");

  const documentsQuery = useDocuments({
    ...filters,
    q: search || filters.q,
  });

  const documents = documentsQuery.data?.items ?? [];
  const viewer = useDocumentViewer(documents);

  function handleDownload(document: Document) {
    const url = document.previewUrl ?? getDocumentDownloadUrl(document.id);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Documents"
        description="Search and manage organization documents."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          placeholder="Search by filename or tag…"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-sm"
          aria-label="Search documents"
        />
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  status: option.value === "all" ? undefined : option.value,
                }))
              }
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                (option.value === "all" && !filters.status) || filters.status === option.value
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {option.label}
            </button>
          ))}
          {DOCUMENT_CATEGORIES.slice(0, 4).map((category) => (
            <button
              key={category.value}
              type="button"
              onClick={() =>
                setFilters((prev) => ({
                  ...prev,
                  category:
                    prev.category === category.value
                      ? undefined
                      : (category.value as DocumentCategory),
                }))
              }
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-xs transition-colors",
                filters.category === category.value
                  ? "border-stone-900 bg-stone-900 text-white"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="space-y-2 p-4">
          {documentsQuery.isLoading && <DocumentListSkeleton rows={5} />}
          {documentsQuery.isError && <ErrorAlert message="Unable to load documents." />}
          {!documentsQuery.isLoading && !documentsQuery.isError && documents.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">No documents found.</p>
          )}
          {!documentsQuery.isLoading &&
            documents.map((document, index) => (
              <DocumentCard
                key={document.id}
                document={document}
                readOnly
                onPreview={() => viewer.open(index)}
                onDownload={() => handleDownload(document)}
              />
            ))}
        </CardContent>
      </Card>

      <DocumentViewer
        open={viewer.isOpen}
        onOpenChange={(open) => !open && viewer.close()}
        documents={documents}
        currentIndex={viewer.currentIndex}
        onIndexChange={(index) => viewer.open(index)}
      />
    </div>
  );
}
