import type { NotificationCategory } from "@/types/notification";

export const NOTIFICATION_CATEGORIES: {
  value: NotificationCategory;
  label: string;
}[] = [
  { value: "financial", label: "Financial" },
  { value: "donations", label: "Donations" },
  { value: "campaigns", label: "Campaigns" },
  { value: "budgets", label: "Budgets" },
  { value: "expenses", label: "Expenses" },
  { value: "users", label: "User management" },
  { value: "security", label: "Security" },
  { value: "workflow", label: "Workflow" },
  { value: "reports", label: "Reports" },
  { value: "system", label: "System" },
];

export function getCategoryLabel(category: NotificationCategory): string {
  return NOTIFICATION_CATEGORIES.find((item) => item.value === category)?.label ?? category;
}
