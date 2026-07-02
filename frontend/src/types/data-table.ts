import type { RowData } from "@tanstack/react-table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface ColumnMeta<TData extends RowData, TValue> {
    type?: "text" | "currency" | "percent" | "date" | "datetime" | "status" | "user" | "link";
    align?: "left" | "right" | "center";
    hiddenOnTablet?: boolean;
    hiddenOnMobile?: boolean;
    exportHeader?: string;
    label?: string;
  }
}

export interface FundFlowColumnMeta {
  type?: "text" | "currency" | "percent" | "date" | "datetime" | "status" | "user" | "link";
  align?: "left" | "right" | "center";
  hiddenOnTablet?: boolean;
  hiddenOnMobile?: boolean;
  exportHeader?: string;
  label?: string;
}

export const DEFAULT_PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;
