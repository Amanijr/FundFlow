import type { OrganizationType, Role } from "@/types/api";

export type LogType = "EVENT" | "ERROR" | "EXCEPTION" | "ALERT" | "SECURITY";

export type LogSeverity = "INFO" | "WARNING" | "ERROR" | "CRITICAL";

export interface PlatformStatsResponse {
  totalOrganizations: number;
  activeOrganizations: number;
  totalUsers: number;
  superAdminCount: number;
}

export interface PlatformOrganization {
  id: number;
  name: string;
  slug: string;
  type: OrganizationType;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  active: boolean;
  createdAt: string;
}

export interface PlatformUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId?: number | null;
  organizationName?: string;
  enabled: boolean;
}

export interface SystemLogResponse {
  id: number;
  logType: LogType;
  severity: LogSeverity;
  category: string;
  message: string;
  details?: string;
  organizationId?: number;
  userId?: number;
  userEmail?: string;
  requestMethod?: string;
  requestPath?: string;
  httpStatus?: number;
  exceptionType?: string;
  alertResolved: boolean;
  createdAt: string;
}

export interface PlatformDashboardResponse {
  platformStats: PlatformStatsResponse;
  inactiveOrganizations: number;
  logsLast24Hours: number;
  errorsLast24Hours: number;
  securityEventsLast24Hours: number;
  unresolvedAlerts: number;
  organizations: PlatformOrganization[];
  users: PlatformUser[];
  recentActivity: SystemLogResponse[];
  recentAlerts: SystemLogResponse[];
  recentErrors: SystemLogResponse[];
}

export interface OrganizationStatusRequest {
  active: boolean;
}

export interface CreateSuperAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface BootstrapSuperAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LogSearchParams {
  type?: LogType;
  severity?: LogSeverity;
  category?: string;
  organizationId?: number;
  alertsOnly?: boolean;
  from?: string;
  to?: string;
}
