import type { Document, UploadValidationError } from "@/types/document";

export const DEFAULT_MAX_SIZE_BYTES = 10 * 1024 * 1024;
export const SPREADSHEET_MAX_SIZE_BYTES = 25 * 1024 * 1024;

export const DEFAULT_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/csv",
  "text/plain",
];

export const DEFAULT_ALLOWED_ACCEPT =
  ".pdf,.png,.jpg,.jpeg,.webp,.xlsx,.docx,.csv,.txt," + DEFAULT_ALLOWED_MIME_TYPES.join(",");

const EXTENSION_MIME: Record<string, string> = {
  pdf: "application/pdf",
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  csv: "text/csv",
  txt: "text/plain",
};

function resolvedMimeType(file: File) {
  if (file.type === "image/jpg") {
    return "image/jpeg";
  }
  if (file.type) {
    return file.type;
  }
  const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_MIME[extension] ?? "";
}

export interface UploadValidationConfig {
  maxSizeBytes?: number;
  allowedMimeTypes?: string[];
  maxFiles?: number;
  allowDuplicates?: boolean;
}

export function validateFiles(
  files: File[],
  existing: Document[],
  config: UploadValidationConfig = {},
): UploadValidationError[] {
  const errors: UploadValidationError[] = [];
  const maxSize = config.maxSizeBytes ?? DEFAULT_MAX_SIZE_BYTES;
  const allowed = config.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;
  const maxFiles = config.maxFiles ?? 10;
  const allowDuplicates = config.allowDuplicates ?? false;

  if (files.length > maxFiles) {
    files.forEach((file) => {
      errors.push({ fileName: file.name, message: `Maximum ${maxFiles} files per upload` });
    });
    return errors;
  }

  const existingNames = new Set(existing.map((doc) => doc.name.toLowerCase()));

  const allowedSet = new Set(allowed.map((type) => (type === "image/jpg" ? "image/jpeg" : type)));

  for (const file of files) {
    const mime = resolvedMimeType(file);
    if (!mime || !allowedSet.has(mime)) {
      errors.push({
        fileName: file.name,
        message: `${file.name} is not a supported file type`,
      });
      continue;
    }

    const limit = file.type.includes("spreadsheet") || file.name.endsWith(".csv")
      ? SPREADSHEET_MAX_SIZE_BYTES
      : maxSize;

    if (file.size > limit) {
      errors.push({
        fileName: file.name,
        message: `${file.name} exceeds the ${Math.round(limit / (1024 * 1024))} MB limit`,
      });
    }

    if (!allowDuplicates && existingNames.has(file.name.toLowerCase())) {
      errors.push({
        fileName: file.name,
        message: `${file.name} is already attached`,
      });
    }
  }

  return errors;
}
