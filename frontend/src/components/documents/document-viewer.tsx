"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";

import { FilePreview } from "@/components/documents/file-preview";
import { MetadataPanel } from "@/components/documents/metadata-panel";
import { VersionHistory } from "@/components/documents/version-history";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDocumentDownloadUrl } from "@/lib/api/documents";
import type { Document } from "@/types/document";
import { cn } from "@/lib/utils";

interface DocumentViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documents: Document[];
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  showMetadata?: boolean;
}

export function DocumentViewer({
  open,
  onOpenChange,
  documents,
  currentIndex = 0,
  onIndexChange,
  showMetadata = true,
}: DocumentViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  const current = documents[currentIndex] ?? null;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < documents.length - 1;

  function handleDownload() {
    if (!current) return;
    const url = current.previewUrl ?? getDocumentDownloadUrl(current.id);
    window.open(url, "_blank", "noopener,noreferrer");
  }

  function handleClose(nextOpen: boolean) {
    if (!nextOpen) {
      setZoom(1);
      setRotation(0);
    }
    onOpenChange(nextOpen);
  }

  if (!current) return null;

  const isImage = current.mimeType.startsWith("image/");

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="flex h-[min(90vh,800px)] max-w-5xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="flex shrink-0 flex-row items-center justify-between gap-2 border-b border-border px-4 py-3">
          <DialogTitle className="truncate text-base">{current.name}</DialogTitle>
          <div className="flex items-center gap-1" role="toolbar" aria-label="Document viewer controls">
            {documents.length > 1 && (
              <>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!hasPrev}
                  aria-label="Previous document"
                  onClick={() => onIndexChange?.(currentIndex - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  disabled={!hasNext}
                  aria-label="Next document"
                  onClick={() => onIndexChange?.(currentIndex + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Zoom out" onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Zoom in" onClick={() => setZoom((z) => Math.min(3, z + 0.25))}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Fit to view" onClick={() => setZoom(1)}>
              <Maximize2 className="h-4 w-4" />
            </Button>
            {isImage && (
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Rotate" onClick={() => setRotation((r) => (r + 90) % 360)}>
                <RotateCw className="h-4 w-4" />
              </Button>
            )}
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" aria-label="Download" onClick={handleDownload}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex min-h-0 flex-1">
          <div className={cn("min-w-0 flex-1", showMetadata && "border-r border-border")}>
            <Tabs defaultValue="preview" className="flex h-full flex-col">
              <TabsList className="mx-4 mt-2 w-fit">
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="versions">Versions</TabsTrigger>
              </TabsList>
              <TabsContent value="preview" className="mt-0 min-h-0 flex-1 overflow-auto">
                <FilePreview
                  document={current}
                  zoom={zoom}
                  rotation={rotation}
                  onDownload={handleDownload}
                />
              </TabsContent>
              <TabsContent value="versions" className="overflow-auto p-4">
                <VersionHistory document={current} />
              </TabsContent>
            </Tabs>
          </div>
          {showMetadata && <MetadataPanel document={current} className="hidden md:block" />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
