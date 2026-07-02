"use client";

import { Controller, type FieldValues } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

interface TextFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  type?: React.HTMLInputTypeAttribute;
  autoComplete?: string;
}

export function TextField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  type = "text",
  autoComplete,
}: TextFieldProps<T>) {
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
          <Input
            id={id}
            type={type}
            placeholder={placeholder}
            disabled={disabled}
            autoComplete={autoComplete}
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
