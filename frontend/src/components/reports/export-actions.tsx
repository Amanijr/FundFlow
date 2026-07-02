"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/utils/csv-export";

interface ExportActionsProps {
  filename: string;
  headers: string[];
  rows: (string | number)[][];
  disabled?: boolean;
}

export function ExportActions({ filename, headers, rows, disabled }: ExportActionsProps) {
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={disabled || rows.length === 0}
      onClick={() => downloadCsv(filename, headers, rows)}
    >
      <Download className="mr-2 h-4 w-4" />
      Export CSV
    </Button>
  );
}
