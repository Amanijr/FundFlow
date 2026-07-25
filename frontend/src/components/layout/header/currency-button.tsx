"use client";

import { Check, Coins } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useUserSession } from "@/hooks/use-user-session";
import { cn } from "@/lib/utils";
import type { DisplayCurrency } from "@/types/session";

const CURRENCIES: DisplayCurrency[] = ["TZS", "USD", "EUR", "GBP"];

export function CurrencyButton() {
  const { displayCurrency, setDisplayCurrency } = useUserSession();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="hidden h-8 gap-1.5 px-2.5 text-xs font-medium md:inline-flex"
          aria-label="Display currency"
        >
          <Coins className="h-3.5 w-3.5 text-muted-foreground" />
          {displayCurrency}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-44 border border-border bg-surface p-2 shadow-none">
        <p className="px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Display currency
        </p>
        <ul className="mt-1 space-y-0.5">
          {CURRENCIES.map((currency) => {
            const active = currency === displayCurrency;
            return (
              <li key={currency}>
                <button
                  type="button"
                  onClick={() => setDisplayCurrency(currency)}
                  className={cn(
                    "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                    active && "bg-accent/50 font-medium",
                  )}
                >
                  {currency}
                  {active && <Check className="h-3.5 w-3.5 text-foreground" />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
