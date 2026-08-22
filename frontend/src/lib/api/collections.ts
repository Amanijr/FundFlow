import { apiRequest } from "@/lib/api/client";
import type {
  CollectionDashboardResponse,
  CollectionSessionCountRequest,
  CollectionSessionCreateRequest,
  CollectionSessionResponse,
} from "@/types/collection";

export function listCollectionSessions(token: string) {
  return apiRequest<CollectionSessionResponse[]>("/api/v1/collection-sessions", { token });
}

export function getCollectionDashboard(token: string) {
  return apiRequest<CollectionDashboardResponse>("/api/v1/collection-sessions/dashboard", { token });
}

export function getCollectionSession(token: string, id: number) {
  return apiRequest<CollectionSessionResponse>(`/api/v1/collection-sessions/${id}`, { token });
}

export function createCollectionSession(token: string, body: CollectionSessionCreateRequest) {
  return apiRequest<CollectionSessionResponse>("/api/v1/collection-sessions", {
    method: "POST",
    token,
    body,
  });
}

export function submitCollectionCount(token: string, id: number, body: CollectionSessionCountRequest) {
  return apiRequest<CollectionSessionResponse>(`/api/v1/collection-sessions/${id}/count`, {
    method: "PUT",
    token,
    body,
  });
}

export function verifyCollectionSession(token: string, id: number) {
  return apiRequest<CollectionSessionResponse>(`/api/v1/collection-sessions/${id}/verify`, {
    method: "POST",
    token,
  });
}

export function depositCollectionSession(token: string, id: number) {
  return apiRequest<CollectionSessionResponse>(`/api/v1/collection-sessions/${id}/deposit`, {
    method: "POST",
    token,
  });
}
