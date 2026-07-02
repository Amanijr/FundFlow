"use client";

import { Controller, type FieldValues } from "react-hook-form";

import { Textarea } from "@/components/ui/textarea";

import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

interface TextareaFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  rows?: number;
}

export function TextareaField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  rows = 3,
}: TextareaFieldProps<T>) {
  const id = String(name);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          htmlFor={id}
          required={required}
          description={description}
          error={fieldState.error?.message}
          className={className}
        >
          <Textarea
            id={id}
            rows={rows}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            aria-describedby={fieldState.error ? `${id}-error` : undefined}
            {...field}
            value={field.value ?? ""}
          />
        </FormField>
      )}
    />
  );
}
