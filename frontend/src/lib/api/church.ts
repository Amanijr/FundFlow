import { apiRequest } from "@/lib/api/client";
import type {
  AttendanceRecordRequest,
  AttendanceRecordResponse,
  AttendanceSummaryResponse,
  MinistryRequest,
  MinistryResponse,
} from "@/types/verticals";

export function listMinistries(token: string) {
  return apiRequest<MinistryResponse[]>("/api/v1/church/ministries", { token });
}

export function getMinistry(token: string, id: number) {
  return apiRequest<MinistryResponse>(`/api/v1/church/ministries/${id}`, { token });
}

export function createMinistry(token: string, body: MinistryRequest) {
  return apiRequest<MinistryResponse>("/api/v1/church/ministries", { method: "POST", token, body });
}

export function updateMinistry(token: string, id: number, body: MinistryRequest) {
  return apiRequest<MinistryResponse>(`/api/v1/church/ministries/${id}`, { method: "PUT", token, body });
}

export function listAttendance(token: string) {
  return apiRequest<AttendanceRecordResponse[]>("/api/v1/church/attendance", { token });
}

export function recordAttendance(token: string, body: AttendanceRecordRequest) {
  return apiRequest<AttendanceRecordResponse>("/api/v1/church/attendance", { method: "POST", token, body });
}

export function getAttendanceSummary(token: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return apiRequest<AttendanceSummaryResponse>(
    `/api/v1/church/attendance/summary${query ? `?${query}` : ""}`,
    { token },
  );
}
