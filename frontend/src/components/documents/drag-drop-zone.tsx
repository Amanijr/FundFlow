"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import type { UploadValidationError } from "@/types/document";
import { cn } from "@/lib/utils";

interface DragDropZoneProps {
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  onFilesAccepted: (files: File[]) => void;
  onValidationError?: (errors: UploadValidationError[]) => void;
  className?: string;
  compact?: boolean;
}

export function DragDropZone({
  accept,
  multiple = true,
  disabled = false,
  onFilesAccepted,
  className,
  compact = false,
}: DragDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  function handleFiles(fileList: FileList | null) {
    if (!fileList || disabled) return;
    const files = Array.from(fileList);
    if (files.length === 0) return;
    onFilesAccepted(multiple ? files : [files[0]]);
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-background text-center transition-colors",
        dragActive && "border-primary bg-accent/40",
        disabled && "pointer-events-none opacity-50",
        compact ? "px-4 py-6" : "px-6 py-10",
        className,
      )}
      aria-label="Upload documents"
      onDragOver={(event) => {
        event.preventDefault();
        if (!disabled) setDragActive(true);
      }}
      onDragLeave={() => setDragActive(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragActive(false);
        handleFiles(event.dataTransfer.files);
      }}
      onPaste={(event) => {
        const items = event.clipboardData?.items;
        if (!items) return;
        const imageFiles: File[] = [];
        for (const item of items) {
          if (item.kind === "file" && item.type.startsWith("image/")) {
            const file = item.getAsFile();
            if (file) imageFiles.push(file);
          }
        }
        if (imageFiles.length > 0) onFilesAccepted(imageFiles);
      }}
    >
      <Upload className={cn("text-muted-foreground", compact ? "mb-2 h-6 w-6" : "mb-3 h-8 w-8")} />
      <p className={cn("font-medium text-foreground", compact ? "text-xs" : "text-sm")}>
        Drag and drop files here
      </p>
      <p className="mt-1 text-xs text-muted-foreground">or browse from your device</p>
      <Button
        type="button"
        variant="outline"
        size={compact ? "sm" : "default"}
        className="mt-3"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        Choose files
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
      />
    </div>
  );
}
