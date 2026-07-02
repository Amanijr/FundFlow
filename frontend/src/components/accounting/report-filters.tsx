"use client";

import { DateInput } from "@/components/forms/date-input";
import { Button } from "@/components/ui/button";

interface ReportFiltersProps {
  fromDate: Date | null;
  toDate: Date | null;
  onFromChange: (value: Date | null) => void;
  onToChange: (value: Date | null) => void;
  onApply: () => void;
  onReset: () => void;
  accountSelector?: React.ReactNode;
}

export function ReportFilters({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  onApply,
  onReset,
  accountSelector,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4">
      {accountSelector}
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">From</p>
        <DateInput value={fromDate} onChange={onFromChange} />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-medium text-muted-foreground">To</p>
        <DateInput value={toDate} onChange={onToChange} />
      </div>
      <Button type="button" onClick={onApply}>
        Apply
      </Button>
      <Button type="button" variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
