import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { FileImage, FileSpreadsheet, FileText, File as FileIcon } from "lucide-react";

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatMimeLabel(mimeType: string): string {
  if (mimeType === "application/pdf") return "PDF";
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.includes("spreadsheet") || mimeType === "text/csv") return "Spreadsheet";
  if (mimeType.includes("wordprocessing")) return "Word document";
  if (mimeType === "text/plain") return "Text";
  return mimeType.split("/").pop()?.toUpperCase() ?? "File";
}

export function getDocumentIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return FileImage;
  if (mimeType.includes("spreadsheet") || mimeType === "text/csv") return FileSpreadsheet;
  if (mimeType === "application/pdf" || mimeType.startsWith("text/")) return FileText;
  return FileIcon;
}

export function isPreviewableMime(mimeType: string): boolean {
  return (
    mimeType === "application/pdf" ||
    mimeType.startsWith("image/") ||
    mimeType === "text/plain" ||
    mimeType === "text/csv"
  );
}

function parseDocumentDate(value?: string | number | Date | number[] | null): Date | null {
  if (value == null || value === "") return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  if (typeof value === "number") {
    const date = new Date(value);
    return isValid(date) ? date : null;
  }
  if (Array.isArray(value) && value.length >= 3) {
    const [year, month, day, hour = 0, minute = 0, second = 0] = value;
    const date = new Date(year, month - 1, day, hour, minute, second);
    return isValid(date) ? date : null;
  }
  if (typeof value === "string") {
    const iso = parseISO(value);
    if (isValid(iso)) return iso;
    const date = new Date(value);
    return isValid(date) ? date : null;
  }
  return null;
}

export function formatDocumentRelativeTime(value?: string | number | Date | number[] | null): string {
  const date = parseDocumentDate(value);
  if (!date) return "";
  return formatDistanceToNow(date, { addSuffix: true });
}

export function formatDocumentDateTime(value?: string | number | Date | number[] | null): string {
  const date = parseDocumentDate(value);
  if (!date) return "—";
  return format(date, "MMM d, yyyy h:mm a");
}
