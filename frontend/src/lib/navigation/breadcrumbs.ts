import { navigationGroups } from "@/lib/navigation/navigation";
import type { BreadcrumbItem } from "@/components/layout/breadcrumb/breadcrumbs";

const SEGMENT_LABELS: Record<string, string> = {
  admin: "Administration",
  accounting: "Accounting",
  "chart-of-accounts": "Chart of accounts",
  "journal-entries": "Journal entries",
  "general-ledger": "General ledger",
  "trial-balance": "Trial balance",
  dashboard: "Dashboard",
  executive: "Executive",
  finance: "Finance",
  fundraising: "Fundraising",
  new: "New",
  edit: "Edit",
  "receive-gift": "Receive a gift",
  "spend-money": "Spend money",
  church: "Church",
  collections: "Sunday collections",
  ministries: "Ministries",
  attendance: "Attendance",
};

function titleCaseSegment(segment: string): string {
  return segment
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function findNavLabel(path: string): string | undefined {
  for (const group of navigationGroups) {
    for (const item of group.items) {
      if (item.href === path) {
        return item.label;
      }
    }
  }
  return undefined;
}

export interface BuildBreadcrumbsOptions {
  pathname: string;
  /** Override labels for dynamic segments (e.g. entity name for `[id]`). */
  overrides?: Record<string, string>;
}

/**
 * Derives breadcrumb items from the current pathname and navigation config.
 * Dynamic segments use overrides when provided; otherwise segments are title-cased.
 */
export function buildBreadcrumbs({
  pathname,
  overrides = {},
}: BuildBreadcrumbsOptions): BreadcrumbItem[] {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [{ label: "Dashboard" }];
  }

  const items: BreadcrumbItem[] = [];
  let path = "";

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    path += `/${segment}`;
    const isLast = index === segments.length - 1;

    const override = overrides[segment] ?? overrides[path];
    const navLabel = findNavLabel(path);
    const staticLabel = SEGMENT_LABELS[segment];
    const label =
      override ?? navLabel ?? staticLabel ?? titleCaseSegment(segment);

    items.push({
      label,
      href: isLast ? undefined : path,
    });
  }

  return items;
}
