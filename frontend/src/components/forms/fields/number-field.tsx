"use client";

import { Controller, type FieldValues } from "react-hook-form";

import { Input } from "@/components/ui/input";

import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

export function NumberField<T extends FieldValues>(props: BaseFieldProps<T>) {
  const { control, name, label, description, placeholder, required, disabled, className } = props;
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
            type="number"
            inputMode="decimal"
            placeholder={placeholder}
            disabled={disabled}
            aria-invalid={!!fieldState.error}
            value={field.value ?? ""}
            onChange={(event) => {
              const raw = event.target.value;
              field.onChange(raw === "" ? "" : Number(raw));
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
