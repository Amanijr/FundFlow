import { apiRequest } from "@/lib/api/client";
import type {
  AttendanceRecordRequest,
  AttendanceRecordResponse,
  AttendanceSummaryResponse,
  ChurchDashboardResponse,
  MemberMinistryRequest,
  MemberMinistryResponse,
  MembershipReportResponse,
  MinistryRequest,
  MinistryResponse,
  PartnershipRequest,
  PartnershipResponse,
  ServiceEventRequest,
  ServiceEventResponse,
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

export function listMinistryMembers(token: string, ministryId: number) {
  return apiRequest<MemberMinistryResponse[]>(`/api/v1/church/ministries/${ministryId}/members`, { token });
}

export function assignMinistryMember(token: string, ministryId: number, body: MemberMinistryRequest) {
  return apiRequest<MemberMinistryResponse>(`/api/v1/church/ministries/${ministryId}/members`, {
    method: "POST",
    token,
    body,
  });
}

export function removeMinistryMember(token: string, ministryId: number, assignmentId: number) {
  return apiRequest<MemberMinistryResponse>(`/api/v1/church/ministries/${ministryId}/members/${assignmentId}`, {
    method: "DELETE",
    token,
  });
}

export function listMemberMinistries(token: string, memberId: number) {
  return apiRequest<MemberMinistryResponse[]>(`/api/v1/members/${memberId}/ministries`, { token });
}

export function listServices(token: string) {
  return apiRequest<ServiceEventResponse[]>("/api/v1/church/services", { token });
}

export function getService(token: string, id: number) {
  return apiRequest<ServiceEventResponse>(`/api/v1/church/services/${id}`, { token });
}

export function createService(token: string, body: ServiceEventRequest) {
  return apiRequest<ServiceEventResponse>("/api/v1/church/services", { method: "POST", token, body });
}

export function updateService(token: string, id: number, body: ServiceEventRequest) {
  return apiRequest<ServiceEventResponse>(`/api/v1/church/services/${id}`, { method: "PUT", token, body });
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

export function getChurchDashboard(token: string) {
  return apiRequest<ChurchDashboardResponse>("/api/v1/church/dashboard", { token });
}

export function getMembershipReport(token: string) {
  return apiRequest<MembershipReportResponse>("/api/v1/church/reports/membership", { token });
}

export function listPartnerships(token: string, memberId?: number) {
  const query = memberId != null ? `?memberId=${memberId}` : "";
  return apiRequest<PartnershipResponse[]>(`/api/v1/church/partnerships${query}`, { token });
}

export function getPartnership(token: string, id: number) {
  return apiRequest<PartnershipResponse>(`/api/v1/church/partnerships/${id}`, { token });
}

export function createPartnership(token: string, body: PartnershipRequest) {
  return apiRequest<PartnershipResponse>("/api/v1/church/partnerships", { method: "POST", token, body });
}

export function updatePartnership(token: string, id: number, body: PartnershipRequest) {
  return apiRequest<PartnershipResponse>(`/api/v1/church/partnerships/${id}`, { method: "PUT", token, body });
}

export function listMemberPartnerships(token: string, memberId: number) {
  return apiRequest<PartnershipResponse[]>(`/api/v1/members/${memberId}/partnerships`, { token });
}
