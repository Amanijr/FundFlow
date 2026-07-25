"use client";

import { useEffect, useRef } from "react";
import type { FieldValues, UseFormGetValues } from "react-hook-form";

interface UseFormDraftOptions<T extends FieldValues> {
  storageKey: string;
  getValues: UseFormGetValues<T>;
  isDirty: boolean;
  enabled?: boolean;
  intervalMs?: number;
  onSave?: (values: T) => void | Promise<void>;
}

export function useFormDraft<T extends FieldValues>({
  storageKey,
  getValues,
  isDirty,
  enabled = true,
  intervalMs = 30_000,
  onSave,
}: UseFormDraftOptions<T>) {
  const onSaveRef = useRef(onSave);
  onSaveRef.current = onSave;

  useEffect(() => {
    if (!enabled || !isDirty) return;

    const id = window.setInterval(() => {
      const values = getValues();
      window.localStorage.setItem(storageKey, JSON.stringify(values));
      void onSaveRef.current?.(values);
    }, intervalMs);

    return () => window.clearInterval(id);
  }, [enabled, getValues, intervalMs, isDirty, storageKey]);

  function loadDraft(): T | null {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  function clearDraft() {
    window.localStorage.removeItem(storageKey);
  }

  return { loadDraft, clearDraft };
}
