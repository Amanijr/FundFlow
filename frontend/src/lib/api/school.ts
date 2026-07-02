import { apiRequest } from "@/lib/api/client";
import type { StudentSponsorshipRequest, StudentSponsorshipResponse } from "@/types/verticals";

export function listSponsorships(token: string) {
  return apiRequest<StudentSponsorshipResponse[]>("/api/v1/school/sponsorships", { token });
}

export function getSponsorship(token: string, id: number) {
  return apiRequest<StudentSponsorshipResponse>(`/api/v1/school/sponsorships/${id}`, { token });
}

export function createSponsorship(token: string, body: StudentSponsorshipRequest) {
  return apiRequest<StudentSponsorshipResponse>("/api/v1/school/sponsorships", { method: "POST", token, body });
}

export function updateSponsorship(token: string, id: number, body: StudentSponsorshipRequest) {
  return apiRequest<StudentSponsorshipResponse>(`/api/v1/school/sponsorships/${id}`, { method: "PUT", token, body });
}
