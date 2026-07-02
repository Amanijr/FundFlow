import type { ColumnDef, Table } from "@tanstack/react-table";

import { downloadCsv } from "@/lib/utils/csv-export";

function getColumnLabel<TData>(column: { id: string; columnDef: ColumnDef<TData, unknown> }): string {
  const meta = column.columnDef.meta;
  if (meta?.exportHeader) return meta.exportHeader;
  if (meta?.label) return meta.label;
  if (typeof column.columnDef.header === "string") return column.columnDef.header;
  return column.id;
}

export function getExportableColumns<TData>(table: Table<TData>) {
  return table
    .getVisibleLeafColumns()
    .filter((column) => column.id !== "select" && column.id !== "actions");
}

export function buildExportRows<TData>(
  table: Table<TData>,
  rows: TData[],
  getCellValue: (row: TData, columnId: string) => string | number,
): { headers: string[]; rows: (string | number)[][] } {
  const columns = getExportableColumns(table);
  const headers = columns.map((column) => getColumnLabel(column));
  const exportRows = rows.map((row) => columns.map((column) => getCellValue(row, column.id)));

  return { headers, rows: exportRows };
}

export function exportTableToCsv<TData>(
  filename: string,
  table: Table<TData>,
  rows: TData[],
  getCellValue: (row: TData, columnId: string) => string | number,
) {
  const { headers, rows: exportRows } = buildExportRows(table, rows, getCellValue);
  downloadCsv(filename, headers, exportRows);
}
