"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Controller, type FieldValues } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { FormField } from "../layout/form-field";
import type { BaseFieldProps } from "../types";

export function PasswordField<T extends FieldValues>(props: BaseFieldProps<T>) {
  const { control, name, label, description, placeholder, required, disabled, className } = props;
  const id = String(name);
  const [visible, setVisible] = useState(false);

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
          <div className="relative">
            <Input
              id={id}
              type={visible ? "text" : "password"}
              autoComplete="current-password"
              placeholder={placeholder}
              disabled={disabled}
              aria-invalid={!!fieldState.error}
              className="pr-10"
              {...field}
              value={field.value ?? ""}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-9 w-9"
              onClick={() => setVisible((value) => !value)}
              aria-label={visible ? "Hide password" : "Show password"}
            >
              {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </FormField>
      )}
    />
  );
}
