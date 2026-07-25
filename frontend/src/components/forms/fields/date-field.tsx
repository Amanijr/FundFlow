"use client";

import { Controller, type FieldValues } from "react-hook-form";

import { DateInput } from "../date-input";
import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

export function DateField<T extends FieldValues>(props: BaseFieldProps<T>) {
  const { control, name, label, description, required, disabled, className } = props;
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
          <DateInput
            id={id}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            value={field.value ?? null}
            onChange={field.onChange}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        </FormField>
      )}
    />
  );
}
