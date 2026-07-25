import { apiRequest } from "@/lib/api/client";
import type { Role, UserResponse } from "@/types/api";

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
}

export interface UpdateUserRoleRequest {
  role: Role;
}

export function listUsers(token: string) {
  return apiRequest<UserResponse[]>("/api/v1/users", { token });
}

export function getUser(token: string, id: number) {
  return apiRequest<UserResponse>(`/api/v1/users/${id}`, { token });
}

export function inviteUser(token: string, body: CreateUserRequest) {
  return apiRequest<UserResponse>("/api/v1/users", { method: "POST", token, body });
}

export function updateUserRole(token: string, id: number, body: UpdateUserRoleRequest) {
  return apiRequest<UserResponse>(`/api/v1/users/${id}/role`, { method: "PUT", token, body });
}
