import { format, parseISO } from "date-fns";

export function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }
  try {
    return format(parseISO(value), "MMM d, yyyy");
  } catch {
    return value;
  }
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return "—";
  }
  try {
    return format(parseISO(value), "MMM d, yyyy h:mm a");
  } catch {
    return value;
  }
}

export function toApiDate(value?: Date | null) {
  if (!value) {
    return undefined;
  }
  return format(value, "yyyy-MM-dd");
}

export function parseApiDate(value?: string | null) {
  if (!value) {
    return null;
  }
  return parseISO(value);
}
