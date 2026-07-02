"use client";

import type { Table } from "@tanstack/react-table";

import { ExportDropdown } from "@/components/data/actions/export-dropdown";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

function getColumnLabel<TData>(table: Table<TData>, columnId: string): string {
  const column = table.getColumn(columnId);
  if (!column) return columnId;
  const meta = column.columnDef.meta;
  if (meta?.label) return meta.label;
  if (meta?.exportHeader) return meta.exportHeader;
  if (typeof column.columnDef.header === "string") return column.columnDef.header;
  return columnId;
}

export interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  selectedCount: number;
  totalCount: number;
  bulkActions?: React.ReactNode;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  onExportCsv?: () => void;
  onExport?: () => void;
  exportDisabled?: boolean;
  className?: string;
}

export function DataTableToolbar<TData>({
  table,
  selectedCount,
  totalCount,
  bulkActions,
  enableColumnVisibility = true,
  enableExport = true,
  onExportCsv,
  onExport,
  exportDisabled = false,
  className,
}: DataTableToolbarProps<TData>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-muted/20 px-3 py-1.5",
        className,
      )}
      aria-live="polite"
    >
      <div className="text-xs text-muted-foreground">
        {selectedCount > 0 ? (
          <span>
            <span className="font-medium text-foreground">{selectedCount}</span> selected · {totalCount} total
          </span>
        ) : (
          <span>
            <span className="font-medium text-foreground">{totalCount}</span> records
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {selectedCount > 0 && bulkActions}
        {enableColumnVisibility && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuItem
                    key={column.id}
                    onClick={() => column.toggleVisibility(!column.getIsVisible())}
                  >
                    {column.getIsVisible() ? "Hide" : "Show"} {getColumnLabel(table, column.id)}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
        {enableExport && (
          <ExportDropdown
            onExportCsv={onExportCsv ?? onExport}
            disabled={exportDisabled || totalCount === 0}
          />
        )}
      </div>
    </div>
  );
}
