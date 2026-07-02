import { apiRequest } from "@/lib/api/client";
import type { ProgramDashboardResponse, ProgramRequest, ProgramResponse } from "@/types/verticals";

export function listPrograms(token: string) {
  return apiRequest<ProgramResponse[]>("/api/v1/programs", { token });
}

export function getProgram(token: string, id: number) {
  return apiRequest<ProgramResponse>(`/api/v1/programs/${id}`, { token });
}

export function getProgramDashboard(token: string, id: number) {
  return apiRequest<ProgramDashboardResponse>(`/api/v1/programs/${id}/dashboard`, { token });
}

export function createProgram(token: string, body: ProgramRequest) {
  return apiRequest<ProgramResponse>("/api/v1/programs", { method: "POST", token, body });
}

export function updateProgram(token: string, id: number, body: ProgramRequest) {
  return apiRequest<ProgramResponse>(`/api/v1/programs/${id}`, { method: "PUT", token, body });
}
