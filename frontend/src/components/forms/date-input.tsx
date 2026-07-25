"use client";

import { format } from "date-fns";
import { forwardRef } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface DateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: Date | null;
  onChange?: (value: Date | null) => void;
}

export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onChange, className, ...props }, ref) => {
    const stringValue = value ? format(value, "yyyy-MM-dd") : "";

    return (
      <Input
        ref={ref}
        type="date"
        className={cn(className)}
        value={stringValue}
        onChange={(e) => {
          onChange?.(e.target.value ? new Date(e.target.value) : null);
        }}
        {...props}
      />
    );
  },
);
DateInput.displayName = "DateInput";
