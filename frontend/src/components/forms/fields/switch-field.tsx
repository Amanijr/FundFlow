"use client";

import { Controller, type FieldValues } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

interface SwitchFieldProps<T extends FieldValues> extends BaseFieldProps<T> {
  switchLabel?: string;
}

export function SwitchField<T extends FieldValues>({
  control,
  name,
  label,
  switchLabel,
  description,
  required,
  disabled,
  className,
}: SwitchFieldProps<T>) {
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
            <Switch
              id={id}
              checked={!!field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
            />
            {switchLabel && (
              <Label htmlFor={id} className="text-sm font-normal text-foreground">
                {switchLabel}
              </Label>
            )}
          </div>
        </FormField>
      )}
    />
  );
}
