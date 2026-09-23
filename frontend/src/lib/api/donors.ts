import { apiRequest } from "@/lib/api/client";
import { peopleApiBase, type PeopleModule } from "@/lib/people/module";
import type { DonorDetailResponse, DonorRequest, DonorResponse } from "@/types/fundraising";

export function listPeople(token: string, module: PeopleModule) {
  return apiRequest<DonorResponse[]>(peopleApiBase(module), { token });
}

export function getPerson(token: string, module: PeopleModule, id: number) {
  return apiRequest<DonorDetailResponse>(`${peopleApiBase(module)}/${id}`, { token });
}

export function createPerson(token: string, module: PeopleModule, body: DonorRequest) {
  return apiRequest<DonorResponse>(peopleApiBase(module), { method: "POST", token, body });
}

export function updatePerson(token: string, module: PeopleModule, id: number, body: DonorRequest) {
  return apiRequest<DonorResponse>(`${peopleApiBase(module)}/${id}`, { method: "PUT", token, body });
}

export function deletePerson(token: string, module: PeopleModule, id: number) {
  return apiRequest<void>(`${peopleApiBase(module)}/${id}`, { method: "DELETE", token });
}

export function listDonors(token: string) {
  return listPeople(token, "donors");
}

export function getDonor(token: string, id: number) {
  return getPerson(token, "donors", id);
}

export function createDonor(token: string, body: DonorRequest) {
  return createPerson(token, "donors", body);
}

export function updateDonor(token: string, id: number, body: DonorRequest) {
  return updatePerson(token, "donors", id, body);
}

export function deleteDonor(token: string, id: number) {
  return deletePerson(token, "donors", id);
}

export function listMembers(token: string) {
  return listPeople(token, "members");
}
