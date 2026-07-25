"use client";

import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
} from "@tanstack/react-table";
import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import "@/types/data-table";

import { Checkbox } from "@/components/ui/checkbox";
import { EmptyState } from "@/components/display/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEFAULT_PAGE_SIZE_OPTIONS } from "@/types/data-table";
import { cn } from "@/lib/utils";

import { DataTablePagination } from "./data-table-pagination";
import { DataTableSkeleton } from "./data-table-skeleton";
import { DataTableToolbar } from "./data-table-toolbar";

const PAGE_SIZE_STORAGE_KEY = "fundflow-table-page-size";

function readStoredPageSize(fallback: number) {
  if (typeof window === "undefined") return fallback;
  const stored = window.localStorage.getItem(PAGE_SIZE_STORAGE_KEY);
  const parsed = stored ? Number(stored) : fallback;
  return DEFAULT_PAGE_SIZE_OPTIONS.includes(parsed as (typeof DEFAULT_PAGE_SIZE_OPTIONS)[number])
    ? parsed
    : fallback;
}

export interface DataTableProps<TData> {
  columns: ColumnDef<TData, unknown>[];
  data: TData[];
  globalFilter?: string;
  enableSelection?: boolean;
  enableColumnVisibility?: boolean;
  enableExport?: boolean;
  onExport?: () => void;
  onExportCsv?: () => void;
  bulkActions?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  isLoading?: boolean;
  mode?: "client" | "server";
  pageCount?: number;
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  pageSizeOptions?: readonly number[];
  getRowId?: (row: TData) => string;
  className?: string;
}

export function DataTable<TData>({
  columns,
  data,
  globalFilter = "",
  enableSelection = false,
  enableColumnVisibility = true,
  enableExport = true,
  onExport,
  onExportCsv,
  bulkActions,
  emptyTitle = "No records found",
  emptyDescription = "Try adjusting your search or filters.",
  isLoading = false,
  mode = "client",
  pageCount,
  pagination: controlledPagination,
  onPaginationChange,
  sorting: controlledSorting,
  onSortingChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  getRowId,
  className,
}: DataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [pagination, setPagination] = useState<PaginationState>(() => ({
    pageIndex: 0,
    pageSize: readStoredPageSize(DEFAULT_PAGE_SIZE_OPTIONS[1]),
  }));

  useEffect(() => {
    if (mode === "client" && !controlledPagination) {
      window.localStorage.setItem(PAGE_SIZE_STORAGE_KEY, String(pagination.pageSize));
    }
  }, [controlledPagination, mode, pagination.pageSize]);

  const tableColumns = useMemo(() => {
    if (!enableSelection) {
      return columns;
    }
    const selectColumn: ColumnDef<TData, unknown> = {
      id: "select",
      header: ({ table: currentTable }) => (
        <Checkbox
          checked={currentTable.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => currentTable.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all on page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    };
    return [selectColumn, ...columns];
  }, [columns, enableSelection]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting: controlledSorting ?? sorting,
      rowSelection,
      columnVisibility,
      globalFilter,
      pagination: controlledPagination ?? pagination,
    },
    onSortingChange: onSortingChange ?? setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: onPaginationChange ?? setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: mode === "client" ? getSortedRowModel() : undefined,
    getFilteredRowModel: mode === "client" ? getFilteredRowModel() : undefined,
    getPaginationRowModel: mode === "client" ? getPaginationRowModel() : undefined,
    enableRowSelection: enableSelection,
    manualPagination: mode === "server",
    manualSorting: mode === "server",
    pageCount: mode === "server" ? pageCount : undefined,
    getRowId,
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;
  const totalCount = table.getFilteredRowModel().rows.length;

  if (isLoading) {
    return (
      <div className={cn("space-y-2", className)}>
        <DataTableSkeleton columns={Math.min(tableColumns.length, 6)} />
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <DataTableToolbar
        table={table}
        selectedCount={selectedCount}
        totalCount={totalCount}
        bulkActions={bulkActions}
        enableColumnVisibility={enableColumnVisibility}
        enableExport={enableExport}
        onExport={onExport}
        onExportCsv={onExportCsv}
        exportDisabled={totalCount === 0}
      />

      <div className="overflow-x-auto rounded-md border border-border bg-surface">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  const align = header.column.columnDef.meta?.align;
                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        align === "right" && "text-right",
                        align === "center" && "text-center",
                        header.column.columnDef.meta?.hiddenOnTablet && "hidden md:table-cell",
                        header.column.columnDef.meta?.hiddenOnMobile && "hidden lg:table-cell",
                      )}
                      aria-sort={
                        header.column.getIsSorted() === "asc"
                          ? "ascending"
                          : header.column.getIsSorted() === "desc"
                            ? "descending"
                            : header.column.getCanSort()
                              ? "none"
                              : undefined
                      }
                    >
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className={cn(
                            "inline-flex items-center gap-1 hover:text-foreground",
                            align === "right" && "ml-auto",
                          )}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {{
                            asc: <ChevronUp className="h-3.5 w-3.5" />,
                            desc: <ChevronDown className="h-3.5 w-3.5" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={tableColumns.length} className="p-0">
                  <EmptyState
                    title={emptyTitle}
                    description={emptyDescription}
                    className="border-0 bg-transparent"
                  />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined}>
                  {row.getVisibleCells().map((cell) => {
                    const align = cell.column.columnDef.meta?.align;
                    return (
                      <TableCell
                        key={cell.id}
                        className={cn(
                          align === "right" && "text-right",
                          align === "center" && "text-center",
                          cell.column.columnDef.meta?.hiddenOnTablet && "hidden md:table-cell",
                          cell.column.columnDef.meta?.hiddenOnMobile && "hidden lg:table-cell",
                        )}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} pageSizeOptions={pageSizeOptions} />
    </div>
  );
}
