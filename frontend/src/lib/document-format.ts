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
