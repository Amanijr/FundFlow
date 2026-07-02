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
  fundSelector?: React.ReactNode;
  campaignSelector?: React.ReactNode;
  showAsOf?: boolean;
  asOfDate?: Date | null;
  onAsOfChange?: (value: Date | null) => void;
}

export function ReportFilters({
  fromDate,
  toDate,
  onFromChange,
  onToChange,
  onApply,
  onReset,
  fundSelector,
  campaignSelector,
  showAsOf,
  asOfDate,
  onAsOfChange,
}: ReportFiltersProps) {
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-surface p-4">
      {fundSelector}
      {campaignSelector}
      {showAsOf ? (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">As of</p>
          <DateInput value={asOfDate ?? null} onChange={onAsOfChange} />
        </div>
      ) : (
        <>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">From</p>
            <DateInput value={fromDate} onChange={onFromChange} />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">To</p>
            <DateInput value={toDate} onChange={onToChange} />
          </div>
        </>
      )}
      <Button type="button" onClick={onApply}>
        Apply
      </Button>
      <Button type="button" variant="outline" onClick={onReset}>
        Reset
      </Button>
    </div>
  );
}
