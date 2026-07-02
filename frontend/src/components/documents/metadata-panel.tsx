import { format } from "date-fns";

import { getDocumentCategoryLabel } from "@/lib/document-categories";
import { formatBytes, formatMimeLabel } from "@/lib/document-format";
import type { Document } from "@/types/document";
import { cn } from "@/lib/utils";

interface MetadataPanelProps {
  document: Document;
  className?: string;
}

export function MetadataPanel({ document, className }: MetadataPanelProps) {
  const rows = [
    { label: "Name", value: document.name },
    { label: "Type", value: formatMimeLabel(document.mimeType) },
    { label: "Size", value: formatBytes(document.sizeBytes) },
    { label: "Version", value: `v${document.version}` },
    { label: "Category", value: getDocumentCategoryLabel(document.category) },
    {
      label: "Tags",
      value: document.tags.length > 0 ? document.tags.join(", ") : "—",
    },
    { label: "Entity", value: `${document.entityType}${document.entityId != null ? ` #${document.entityId}` : ""}` },
    { label: "Uploaded by", value: document.uploadedBy.name },
    {
      label: "Uploaded at",
      value: format(new Date(document.uploadedAt), "MMM d, yyyy h:mm a"),
    },
  ];

  if (document.changeNotes) {
    rows.push({ label: "Notes", value: document.changeNotes });
  }

  return (
    <aside className={cn("w-64 shrink-0 border-l border-border bg-muted/20 p-4", className)}>
      <h3 className="mb-3 text-sm font-semibold text-foreground">Details</h3>
      <dl className="space-y-3">
        {rows.map((row) => (
          <div key={row.label}>
            <dt className="text-xs text-muted-foreground">{row.label}</dt>
            <dd className="mt-0.5 text-sm text-foreground">{row.value}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
