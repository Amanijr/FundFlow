import { RefreshCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { UploadItem } from "@/types/document";
import { cn } from "@/lib/utils";

interface UploadProgressProps {
  item: UploadItem;
  onCancel?: () => void;
  onRetry?: () => void;
  onRemove?: () => void;
  className?: string;
}

const STATUS_LABEL: Record<UploadItem["status"], string> = {
  pending: "Waiting…",
  validating: "Validating…",
  uploading: "Uploading…",
  processing: "Processing…",
  complete: "Complete",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function UploadProgress({ item, onCancel, onRetry, onRemove, className }: UploadProgressProps) {
  const isActive = item.status === "uploading" || item.status === "processing";

  return (
    <div
      className={cn(
        "rounded-md border border-border px-3 py-2",
        item.status === "failed" && "border-red-200 bg-red-50/50",
        item.status === "complete" && "border-emerald-200 bg-emerald-50/30",
        className,
      )}
      aria-live="polite"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              "truncate text-sm font-medium",
              item.status === "cancelled" && "text-muted-foreground line-through",
            )}
          >
            {item.file.name}
          </p>
          <p className="text-xs text-muted-foreground">{STATUS_LABEL[item.status]}</p>
          {item.error && <p className="mt-1 text-xs text-red-600">{item.error}</p>}
        </div>
        <div className="flex shrink-0 gap-1">
          {isActive && onCancel && (
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onCancel} aria-label="Cancel upload">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          {item.status === "failed" && onRetry && (
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onRetry} aria-label="Retry upload">
              <RefreshCw className="h-3.5 w-3.5" />
            </Button>
          )}
          {(item.status === "complete" || item.status === "cancelled" || item.status === "failed") && onRemove && (
            <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove} aria-label="Remove from queue">
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </div>
      {(item.status === "uploading" || item.status === "processing") && (
        <Progress value={item.progress} className="mt-2 h-1.5" aria-label={`Upload progress for ${item.file.name}`} />
      )}
    </div>
  );
}
