"use client";

import { X } from "lucide-react";
import { Controller, type FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";

import { FileUploader } from "../file-uploader";
import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

interface FileUploadFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
}

function formatFileSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileUploadField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  required,
  disabled,
  className,
  accept,
  multiple,
  maxFiles,
}: FileUploadFieldProps<T>) {
  const id = String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const files: File[] = Array.isArray(field.value) ? field.value : field.value ? [field.value] : [];

        function updateFiles(next: File[]) {
          if (multiple) {
            field.onChange(maxFiles ? next.slice(0, maxFiles) : next);
            return;
          }
          field.onChange(next[0] ?? undefined);
        }

        return (
          <FormField
            label={label}
            htmlFor={id}
            required={required}
            description={description}
            error={fieldState.error?.message}
            className={className}
          >
            <FileUploader
              accept={accept}
              multiple={multiple}
              className={disabled ? "pointer-events-none opacity-50" : undefined}
              onFilesSelected={(selected) => {
                if (multiple) {
                  updateFiles([...files, ...selected]);
                  return;
                }
                updateFiles(selected);
              }}
            />
            {files.length > 0 && (
              <ul className="mt-3 space-y-2">
                {files.map((file, index) => (
                  <li
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-md border border-border px-3 py-2 text-sm"
                  >
                    <span>
                      {file.name}{" "}
                      <span className="text-muted-foreground">({formatFileSize(file.size)})</span>
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => updateFiles(files.filter((_, fileIndex) => fileIndex !== index))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </FormField>
        );
      }}
    />
  );
}
