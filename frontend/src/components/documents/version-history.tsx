import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { LoadingState } from "@/components/feedback/loading-state";
import { formatBytes, formatDocumentDateTime } from "@/lib/document-format";
import { useDocumentVersions } from "@/hooks/use-documents";
import { useApiContext } from "@/hooks/use-api-context";
import { downloadDocumentFile } from "@/lib/api/documents";
import type { Document } from "@/types/document";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface VersionHistoryProps {
  document: Document;
  className?: string;
}

export function VersionHistory({ document, className }: VersionHistoryProps) {
  const { token, organizationId } = useApiContext();
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
                  if (!token) return;
                  void downloadDocumentFile(token, document, organizationId).catch(() => {
                    toast.error("Unable to download file");
                  });
                }}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">{version.name}</p>
            <p className="text-xs text-muted-foreground">
              {formatDocumentDateTime(version.uploadedAt)} · {version.uploadedBy?.name ?? "Staff"} ·{" "}
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
