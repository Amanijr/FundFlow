"use client";

import { useEffect, useState } from "react";

import { useApiContext } from "@/hooks/use-api-context";
import { fetchDocumentBlob } from "@/lib/api/documents";
import type { Document } from "@/types/document";

export function useDocumentPreviewUrl(document?: Document | null) {
  const { token, organizationId } = useApiContext();
  const [url, setUrl] = useState<string | undefined>(document?.previewUrl);

  useEffect(() => {
    if (!document) {
      setUrl(undefined);
      return;
    }
    if (document.previewUrl) {
      setUrl(document.previewUrl);
      return;
    }
    if (!token) {
      setUrl(undefined);
      return;
    }

    let objectUrl: string | undefined;
    let cancelled = false;

    fetchDocumentBlob(token, document.id, organizationId)
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setUrl(objectUrl);
      })
      .catch(() => {
        if (!cancelled) setUrl(undefined);
      });

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [document?.id, document?.previewUrl, document?.version, organizationId, token]);

  return url;
}
