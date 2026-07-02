"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormActionsProps {
  onCancel?: () => void;
  onSaveDraft?: () => void;
  onNext?: () => void;
  cancelLabel?: string;
  draftLabel?: string;
  submitLabel?: string;
  deleteLabel?: string;
  onDelete?: () => void;
  isSubmitting?: boolean;
  isSavingDraft?: boolean;
  submitDisabled?: boolean;
  sticky?: boolean;
  isLastStep?: boolean;
  className?: string;
}

export function FormActions({
  onCancel,
  onSaveDraft,
  onNext,
  cancelLabel = "Cancel",
  draftLabel = "Save draft",
  submitLabel = "Save",
  deleteLabel = "Delete",
  onDelete,
  isSubmitting,
  isSavingDraft,
  submitDisabled,
  sticky = false,
  isLastStep = true,
  className,
}: FormActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-end",
        sticky &&
          "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] sm:static sm:border-0 sm:p-0 sm:shadow-none",
        className,
      )}
    >
      {onDelete && (
        <Button
          type="button"
          variant="destructive"
          className="sm:mr-auto"
          onClick={onDelete}
          disabled={isSubmitting || isSavingDraft}
        >
          {deleteLabel}
        </Button>
      )}
      {onCancel && (
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting || isSavingDraft}>
          {cancelLabel}
        </Button>
      )}
      {onSaveDraft && (
        <Button
          type="button"
          variant="secondary"
          onClick={onSaveDraft}
          disabled={isSubmitting || isSavingDraft}
        >
          {isSavingDraft ? "Saving draft…" : draftLabel}
        </Button>
      )}
      {isLastStep ? (
        <Button type="submit" disabled={isSubmitting || submitDisabled}>
          {isSubmitting ? "Saving…" : submitLabel}
        </Button>
      ) : (
        <Button type="button" onClick={onNext} disabled={isSubmitting || submitDisabled}>
          {submitLabel}
        </Button>
      )}
    </div>
  );
}
