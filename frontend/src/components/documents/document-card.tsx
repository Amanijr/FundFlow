import { Lock, MoreHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { getDocumentCategoryLabel } from "@/lib/document-categories";
import { formatBytes, formatDocumentRelativeTime, formatMimeLabel, getDocumentIcon } from "@/lib/document-format";
import type { Document } from "@/types/document";
import { cn } from "@/lib/utils";

interface DocumentCardProps {
  document: Document;
  onPreview?: () => void;
  onDownload?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onUploadVersion?: () => void;
  readOnly?: boolean;
  className?: string;
}

export function DocumentCard({
  document,
  onPreview,
  onDownload,
  onArchive,
  onDelete,
  onUploadVersion,
  readOnly = false,
  className,
}: DocumentCardProps) {
  const Icon = getDocumentIcon(document.mimeType);
  const relativeTime = formatDocumentRelativeTime(document.uploadedAt);

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-md border border-border px-3 py-2.5 transition-colors hover:bg-accent/30",
        className,
      )}
    >
      <button
        type="button"
        onClick={onPreview}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-surface">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium text-foreground">{document.name}</p>
            {document.isSensitive && <Lock className="h-3 w-3 shrink-0 text-amber-600" aria-label="Sensitive document" />}
            {document.version > 1 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                v{document.version}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {getDocumentCategoryLabel(document.category)} · {formatMimeLabel(document.mimeType)} ·{" "}
            {formatBytes(document.sizeBytes)}
            {relativeTime ? ` · ${relativeTime}` : ""}
          </p>
        </div>
      </button>

      {!readOnly && (onDownload || onArchive || onDelete || onUploadVersion) && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
              aria-label={`Actions for ${document.name}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {onPreview && <DropdownMenuItem onClick={onPreview}>Preview</DropdownMenuItem>}
            {onDownload && <DropdownMenuItem onClick={onDownload}>Download</DropdownMenuItem>}
            {onUploadVersion && <DropdownMenuItem onClick={onUploadVersion}>Upload new version</DropdownMenuItem>}
            {(onArchive || onDelete) && <DropdownMenuSeparator />}
            {onArchive && <DropdownMenuItem onClick={onArchive}>Archive</DropdownMenuItem>}
            {onDelete && (
              <DropdownMenuItem className="text-red-600" onClick={onDelete}>
                Delete
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
