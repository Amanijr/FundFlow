"use client";

import type { FieldErrors } from "react-hook-form";

import { ErrorAlert } from "@/components/feedback/error-alert";

interface ValidationSummaryProps {
  errors: FieldErrors;
  title?: string;
  className?: string;
}

function collectMessages(errors: FieldErrors, messages: string[] = []) {
  for (const value of Object.values(errors)) {
    if (!value) continue;
    if ("message" in value && typeof value.message === "string") {
      messages.push(value.message);
      continue;
    }
    collectMessages(value as FieldErrors, messages);
  }
  return [...new Set(messages)];
}

export function ValidationSummary({
  errors,
  title = "Please fix the following errors:",
  className,
}: ValidationSummaryProps) {
  const messages = collectMessages(errors);
  if (messages.length === 0) return null;

  return (
    <div className={className} aria-live="polite">
      <ErrorAlert message={title} className="mb-2" />
      <ul className="list-disc space-y-1 pl-5 text-sm text-danger">
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    </div>
  );
}
