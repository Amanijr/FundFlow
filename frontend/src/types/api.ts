export type Role =
  | "SUPER_ADMIN"
  | "ORG_ADMIN"
  | "FINANCE_MANAGER"
  | "ACCOUNTANT"
  | "FUNDRAISING_MANAGER"
  | "PROGRAM_MANAGER"
  | "STAFF"
  | "VOLUNTEER"
  | "AUDITOR"
  | "DONOR"
  | "VIEW_ONLY";

export type OrganizationType =
  | "CHURCH"
  | "NGO"
  | "FOUNDATION"
  | "CHARITY"
  | "COMMUNITY_ORGANIZATION"
  | "SCHOOL"
  | "RELIGIOUS_INSTITUTION";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  organizationId: number | null;
  organizationType: OrganizationType | null;
  role: Role;
  email: string;
  firstName: string;
  lastName: string;
}

export interface UserResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: number | null;
  organizationType: OrganizationType | null;
  enabled: boolean;
}

export interface OrganizationRequest {
  name: string;
  slug?: string;
  type: OrganizationType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  requiresMfa?: boolean;
  mfaToken?: string;
  availableMethods?: ("totp" | "email")[];
  maskedEmail?: string;
  accessToken?: string;
  tokenType?: string;
  userId?: number;
  organizationId?: number | null;
  organizationType?: OrganizationType | null;
  role?: Role;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface VerifyMfaRequest {
  mfaToken: string;
  method: "totp" | "email";
  code: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  tokenType: string;
}

export interface RegisterRequest {
  organization: OrganizationRequest;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface SessionUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: number | null;
  organizationType: OrganizationType | null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isAuthResponse(data: LoginResponse): data is AuthResponse {
  return Boolean(data.accessToken && data.role && data.email);
}
