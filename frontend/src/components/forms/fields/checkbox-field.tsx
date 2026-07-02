"use client";

import { Controller, type FieldValues } from "react-hook-form";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

interface CheckboxFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  checkboxLabel?: string;
}

export function CheckboxField<T extends FieldValues>({
  control,
  name,
  label,
  checkboxLabel,
  description,
  required,
  disabled,
  className,
}: CheckboxFieldProps<T>) {
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
          <div className="flex items-center gap-2 pt-1">
            <Checkbox
              id={id}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
            />
            {checkboxLabel && (
              <Label htmlFor={id} className="text-sm font-normal text-foreground">
                {checkboxLabel}
              </Label>
            )}
          </div>
        </FormField>
      )}
    />
  );
}
