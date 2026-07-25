"use client";

import { Controller, type FieldValues } from "react-hook-form";

import { CurrencyInput } from "../currency-input";
import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

interface CurrencyFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  allowEmpty?: boolean;
}

export function CurrencyField<T extends FieldValues>({
  control,
  name,
  label,
  description,
  placeholder,
  required,
  disabled,
  className,
  allowEmpty = false,
}: CurrencyFieldProps<T>) {
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
          <CurrencyInput
            id={id}
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            value={field.value ?? (allowEmpty ? "" : 0)}
            onChange={(value) => {
              if (allowEmpty && value === "") {
                field.onChange(undefined);
                return;
              }
              field.onChange(value === "" ? 0 : value);
            }}
            onBlur={field.onBlur}
            name={field.name}
            ref={field.ref}
          />
        </FormField>
      )}
    />
  );
}
