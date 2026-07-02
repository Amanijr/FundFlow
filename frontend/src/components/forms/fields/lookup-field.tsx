"use client";

import { Controller, type FieldValues } from "react-hook-form";

import { EntitySelector, type EntityOption } from "../entity-selector";
import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

interface LookupFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  options: EntityOption[];
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}

export function LookupField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  options,
  onSearch,
}: LookupFieldProps<T>) {
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
          <EntitySelector
            value={field.value ?? ""}
            onChange={field.onChange}
            options={options}
            placeholder={placeholder}
            onSearch={onSearch}
            className={disabled ? "pointer-events-none opacity-50" : undefined}
          />
        </FormField>
      )}
    />
  );
}
