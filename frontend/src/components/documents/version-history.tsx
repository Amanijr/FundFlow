import { format } from "date-fns";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatBytes } from "@/lib/document-format";
import { useDocumentVersions } from "@/hooks/use-documents";
import { getDocumentDownloadUrl } from "@/lib/api/documents";
import type { Document } from "@/types/document";
import { cn } from "@/lib/utils";

interface VersionHistoryProps {
  document: Document;
  className?: string;
}

export function VersionHistory({ document, className }: VersionHistoryProps) {
  const versionsQuery = useDocumentVersions(document.id);

  if (versionsQuery.isLoading) return <LoadingState />;
  if (versionsQuery.isError || !versionsQuery.data) {
    return <p className="text-sm text-muted-foreground">Unable to load version history.</p>;
  }

  const versions = versionsQuery.data.versions;

  return (
    <ol className={cn("space-y-4", className)}>
      {versions.map((version, index) => (
        <li key={version.version} className="relative pl-6">
          {index < versions.length - 1 && (
            <span className="absolute left-[7px] top-4 h-full w-px bg-border" aria-hidden />
          )}
          <span
            className={cn(
              "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 bg-surface",
              version.isCurrent ? "border-stone-900" : "border-border",
            )}
          />
          <div className="space-y-1">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium text-foreground">
                v{version.version}
                {version.isCurrent && (
                  <span className="ml-2 text-xs font-normal text-muted-foreground">(current)</span>
                )}
              </p>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                aria-label={`Download version ${version.version}`}
                onClick={() => {
                  const url = version.previewUrl ?? getDocumentDownloadUrl(document.id);
                  window.open(url, "_blank", "noopener,noreferrer");
                }}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{version.name}</p>
            <p className="text-xs text-muted-foreground">
              {format(new Date(version.uploadedAt), "MMM d, yyyy h:mm a")} · {version.uploadedBy.name} ·{" "}
              {formatBytes(version.sizeBytes)}
            </p>
            {version.changeNotes && (
              <p className="text-xs text-muted-foreground">{version.changeNotes}</p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}
