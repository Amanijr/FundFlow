import type { ApiResponse } from "@/types/api";
import { ApiError } from "@/types/api";
import { isMockApiEnabled } from "@/lib/mock/config";
import { mockApiRequest } from "@/lib/mock/handlers";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  token?: string | null;
  organizationId?: number | null;
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  if (isMockApiEnabled()) {
    return mockApiRequest<T>(path, options);
  }

  const { body, token, organizationId, headers, ...init } = options;

  const requestHeaders = new Headers(headers);
  requestHeaders.set("Accept", "application/json");

  if (body !== undefined) {
    requestHeaders.set("Content-Type", "application/json");
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (organizationId != null) {
    requestHeaders.set("X-Organization-Id", String(organizationId));
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: requestHeaders,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let payload: ApiResponse<T> | null = null;

  try {
    payload = (await response.json()) as ApiResponse<T>;
  } catch {
    if (!response.ok) {
      throw new ApiError(response.statusText || "Request failed", response.status);
    }
    throw new ApiError("Invalid response from server", response.status);
  }

  if (!response.ok || !payload.success) {
    const code = "code" in payload && typeof payload.code === "string" ? payload.code : undefined;
    throw new ApiError(payload.message || "Request failed", response.status, code);
  }

  return payload;
}
