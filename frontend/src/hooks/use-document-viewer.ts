"use client";

import { useCallback, useState } from "react";

import type { Document } from "@/types/document";

export function useDocumentViewer(documents: Document[]) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const open = useCallback(
    (index = 0) => {
      setCurrentIndex(Math.max(0, Math.min(index, documents.length - 1)));
      setIsOpen(true);
    },
    [documents.length],
  );

  const close = useCallback(() => setIsOpen(false), []);

  const next = useCallback(() => {
    setCurrentIndex((prev) => Math.min(prev + 1, documents.length - 1));
  }, [documents.length]);

  const prev = useCallback(() => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  return {
    isOpen,
    currentIndex,
    current: documents[currentIndex] ?? null,
    open,
    close,
    next,
    prev,
    hasNext: currentIndex < documents.length - 1,
    hasPrev: currentIndex > 0,
  };
}
