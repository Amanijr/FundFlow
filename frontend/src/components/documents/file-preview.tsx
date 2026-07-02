"use client";

import { useEffect, useState } from "react";
import { Download, FileIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { isPreviewableMime } from "@/lib/document-format";
import type { Document } from "@/types/document";
import { cn } from "@/lib/utils";

interface FilePreviewProps {
  document: Document;
  previewUrl?: string;
  zoom?: number;
  rotation?: number;
  onDownload?: () => void;
  className?: string;
}

export function FilePreview({
  document,
  previewUrl,
  zoom = 1,
  rotation = 0,
  onDownload,
  className,
}: FilePreviewProps) {
  const [textContent, setTextContent] = useState<string | null>(null);
  const [loadingText, setLoadingText] = useState(false);
  const url = previewUrl ?? document.previewUrl;

  const isText =
    document.mimeType === "text/plain" || document.mimeType === "text/csv";
  const isImage = document.mimeType.startsWith("image/");
  const isPdf = document.mimeType === "application/pdf";
  const canPreview = isPreviewableMime(document.mimeType) && url;

  useEffect(() => {
    if (!isText || !url) {
      setTextContent(null);
      return;
    }
    setLoadingText(true);
    fetch(url)
      .then((response) => response.text())
      .then(setTextContent)
      .catch(() => setTextContent("Unable to load file content."))
      .finally(() => setLoadingText(false));
  }, [isText, url]);

  if (!canPreview) {
    return (
      <div className={cn("flex flex-col items-center justify-center gap-4 p-8 text-center", className)}>
        <FileIcon className="h-12 w-12 text-muted-foreground" />
        <div>
          <p className="font-medium text-foreground">{document.name}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Preview not available for this file type.
          </p>
        </div>
        {onDownload && (
          <Button type="button" variant="outline" className="gap-2" onClick={onDownload}>
            <Download className="h-4 w-4" />
            Download
          </Button>
        )}
      </div>
    );
  }

  if (isPdf && url) {
    return (
      <iframe
        title={`${document.name} preview`}
        src={url}
        className={cn("h-full min-h-[24rem] w-full border-0 bg-white", className)}
        style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
      />
    );
  }

  if (isImage && url) {
    return (
      <div className={cn("flex h-full min-h-[24rem] items-center justify-center overflow-auto bg-muted/30 p-4", className)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={document.name}
          className="max-h-full max-w-full object-contain"
          style={{ transform: `scale(${zoom}) rotate(${rotation}deg)` }}
        />
      </div>
    );
  }

  if (isText) {
    if (loadingText) return <LoadingState />;
    return (
      <pre
        className={cn(
          "h-full min-h-[24rem] overflow-auto whitespace-pre-wrap rounded-none bg-muted/30 p-4 text-sm text-foreground",
          className,
        )}
      >
        {textContent}
      </pre>
    );
  }

  return null;
}
