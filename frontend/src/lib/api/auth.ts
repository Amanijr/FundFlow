import { apiRequest } from "@/lib/api/client";
import type {
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
  RegisterRequest,
  ResetPasswordRequest,
  UserResponse,
  VerifyMfaRequest,
} from "@/types/api";

export function login(request: LoginRequest) {
  return apiRequest<LoginResponse>("/api/v1/auth/login", {
    method: "POST",
    body: request,
  });
}

export function register(request: RegisterRequest) {
  return apiRequest<AuthResponse>("/api/v1/auth/register", {
    method: "POST",
    body: request,
  });
}

export function logout(token: string) {
  return apiRequest<void>("/api/v1/auth/logout", {
    method: "POST",
    token,
  });
}

export function refreshToken(token: string) {
  return apiRequest<RefreshTokenResponse>("/api/v1/auth/refresh", {
    method: "POST",
    token,
  });
}

export function forgotPassword(request: ForgotPasswordRequest) {
  return apiRequest<void>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: request,
  });
}

export function resetPassword(request: ResetPasswordRequest) {
  return apiRequest<void>("/api/v1/auth/reset-password", {
    method: "POST",
    body: request,
  });
}

export function verifyMfa(request: VerifyMfaRequest) {
  return apiRequest<AuthResponse>("/api/v1/auth/mfa/verify", {
    method: "POST",
    body: request,
  });
}

export function getCurrentUser(token: string) {
  return apiRequest<UserResponse>("/api/v1/auth/me", {
    method: "GET",
    token,
  });
}
