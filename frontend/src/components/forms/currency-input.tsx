"use client";

import { forwardRef, useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number | "";
  onChange?: (value: number | "") => void;
  /** ISO currency code shown as prefix. Defaults to TZS per financial standards. */
  currency?: string;
}

/** Keep only digits and a single decimal point (max 2 decimals). */
function sanitizeAmount(raw: string) {
  const cleaned = raw.replace(/[^0-9.]/g, "");
  const [whole, ...rest] = cleaned.split(".");
  if (rest.length === 0) {
    return whole;
  }
  return `${whole}.${rest.join("").slice(0, 2)}`;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value = "", onChange, className, currency = "TZS", ...props }, ref) => {
    const [display, setDisplay] = useState(value === "" ? "" : String(value));

    useEffect(() => {
      setDisplay(value === "" ? "" : String(value));
    }, [value]);

    return (
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {currency}
        </span>
        <Input
          ref={ref}
          inputMode="decimal"
          className={cn("pl-12 text-right tabular-nums", className)}
          value={display}
          onChange={(e) => {
            const raw = sanitizeAmount(e.target.value);
            setDisplay(raw);
            onChange?.(raw === "" ? "" : Number(raw));
          }}
          {...props}
        />
      </div>
    );
  },
);
CurrencyInput.displayName = "CurrencyInput";
