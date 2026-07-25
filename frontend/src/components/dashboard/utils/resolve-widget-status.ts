import type { WidgetStatus } from "../types";

export function resolveWidgetStatus<T>({
  isLoading,
  isError,
  data,
  isEmpty,
}: {
  isLoading: boolean;
  isError: boolean;
  data: T | undefined;
  isEmpty?: (data: T) => boolean;
}): WidgetStatus {
  if (isLoading) return "loading";
  if (isError) return "error";
  if (data == null || isEmpty?.(data)) return "empty";
  return "success";
}
