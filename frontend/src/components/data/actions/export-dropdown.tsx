"use client";

import { Download, FileSpreadsheet } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ExportDropdownProps {
  onExportCsv?: () => void;
  onExportExcel?: () => void;
  disabled?: boolean;
  className?: string;
}

export function ExportDropdown({
  onExportCsv,
  onExportExcel,
  disabled = false,
  className,
}: ExportDropdownProps) {
  if (!onExportCsv && !onExportExcel) {
    return null;
  }

  if (onExportCsv && !onExportExcel) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className ?? "h-7 px-2 text-xs"}
        disabled={disabled}
        onClick={onExportCsv}
      >
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Export
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={className ?? "h-7 px-2 text-xs"}
          disabled={disabled}
        >
          <Download className="mr-1.5 h-3.5 w-3.5" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {onExportCsv && (
          <DropdownMenuItem onClick={onExportCsv}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export CSV
          </DropdownMenuItem>
        )}
        {onExportExcel && (
          <DropdownMenuItem disabled onClick={onExportExcel}>
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            Export Excel (soon)
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
