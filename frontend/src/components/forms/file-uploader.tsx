"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FileUploaderProps {
  accept?: string;
  multiple?: boolean;
  onFilesSelected?: (files: File[]) => void;
  className?: string;
}

export function FileUploader({ accept, multiple, onFilesSelected, className }: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<File[]>([]);

  function handleFiles(fileList: FileList | null) {
    if (!fileList) {
      return;
    }
    const next = Array.from(fileList);
    setFiles(next);
    onFilesSelected?.(next);
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/30 px-6 py-10 text-center",
        className,
      )}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
      }}
    >
      <Upload className="mb-3 h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium text-foreground">Drag and drop files here</p>
      <p className="mt-1 text-xs text-muted-foreground">or browse from your device</p>
      <Button type="button" variant="outline" className="mt-4" onClick={() => inputRef.current?.click()}>
        Choose files
      </Button>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept={accept}
        multiple={multiple}
        onChange={(e) => handleFiles(e.target.files)}
      />
      {files.length > 0 && (
        <ul className="mt-4 w-full text-left text-sm text-muted-foreground">
          {files.map((file) => (
            <li key={file.name}>{file.name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
