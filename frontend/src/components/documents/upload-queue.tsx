import type { UploadItem } from "@/types/document";
import { cn } from "@/lib/utils";

import { UploadProgress } from "./upload-progress";

interface UploadQueueProps {
  items: UploadItem[];
  onCancel?: (id: string) => void;
  onRetry?: (id: string) => void;
  onRemove?: (id: string) => void;
  className?: string;
}

export function UploadQueue({ items, onCancel, onRetry, onRemove, className }: UploadQueueProps) {
  if (items.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)} role="list" aria-label="Upload queue">
      {items.map((item) => (
        <UploadProgress
          key={item.id}
          item={item}
          onCancel={onCancel ? () => onCancel(item.id) : undefined}
          onRetry={onRetry ? () => onRetry(item.id) : undefined}
          onRemove={onRemove ? () => onRemove(item.id) : undefined}
        />
      ))}
    </div>
  );
}
