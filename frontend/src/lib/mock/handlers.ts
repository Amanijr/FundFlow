import type { ApiResponse, OrganizationType, Role } from "@/types/api";
import { ApiError } from "@/types/api";
import type { PlatformOrganization, PlatformUser, SystemLogResponse } from "@/types/platform";

import { mockDelay } from "@/lib/mock/config";
import {
  MOCK_BENEFICIARIES,
  MOCK_BUDGETS,
  MOCK_CAMPAIGNS,
  MOCK_DEMO_PASSWORD,
  MOCK_DEMO_USERS,
  MOCK_DONATIONS,
  MOCK_DONORS,
  MOCK_EXECUTIVE_DASHBOARD,
  MOCK_EXPENSES,
  MOCK_FUNDS,
  MOCK_GRANTS,
  MOCK_INSIGHTS,
  MOCK_MINISTRIES,
  MOCK_ORG,
  MOCK_ORGANIZATIONS,
  MOCK_PROGRAMS,
  MOCK_SPONSORSHIPS,
  MOCK_TRENDS,
  buildAuthResponse,
  getCampaignDashboard,
  getDonationDetail,
  getDonorDetail,
  getGrantUtilization,
  getProgramDashboard,
  nextMockId,
} from "@/lib/mock/fixtures";
import {
  getMockNotifications,
  markAllMockNotificationsRead,
  MOCK_ACTIVITY_FEED,
  MOCK_ANNOUNCEMENTS,
  mockNotificationPreferences,
  updateMockNotification,
  updateMockNotificationPreferences,
} from "@/lib/mock/notification-store";
import {
  archiveMockDocument,
  deleteMockDocument,
  getMockDocument,
  getMockDocuments,
  getMockDocumentVersions,
  updateMockDocumentMetadata,
  uploadMockDocument,
  uploadMockDocumentVersion,
} from "@/lib/mock/document-store";

import type { RequestOptions } from "@/lib/api/client";

function ok<T>(data: T, message = "OK"): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
}

function parsePath(path: string): { pathname: string; search: URLSearchParams } {
  const [pathname, search = ""] = path.split("?");
  return { pathname, search: new URLSearchParams(search) };
}

function matchId(pathname: string, prefix: string): number | null {
  const match = pathname.match(new RegExp(`^${prefix}/(\\d+)(?:/|$)`));
  return match ? Number(match[1]) : null;
}

const mockPlatformOrganizations: PlatformOrganization[] = Object.values(MOCK_ORGANIZATIONS).map((organization) => ({
  id: organization.id,
  name: organization.name,
  slug: organization.slug,
  type: organization.type,
  email: organization.email,
  phone: organization.phone,
  address: organization.address,
  city: organization.city,
  state: organization.state,
  country: organization.country,
  active: organization.active,
  createdAt: organization.createdAt,
}));

const mockPlatformUsers: PlatformUser[] = [
  {
    id: 1,
    email: "super@demo.local",
    firstName: "Platform",
    lastName: "Admin",
    role: "SUPER_ADMIN",
    organizationId: null,
    organizationName: "Platform",
    enabled: true,
  },
  {
    id: 2,
    email: "admin@demo.local",
    firstName: "Grace",
    lastName: "Admin",
    role: "ORG_ADMIN",
    organizationId: 1,
    organizationName: "CrossLife Mission Network",
    enabled: true,
  },
  {
    id: 3,
    email: "finance@demo.local",
    firstName: "David",
    lastName: "Mwangi",
    role: "FINANCE_MANAGER",
    organizationId: 1,
    organizationName: "CrossLife Mission Network",
    enabled: true,
  },
  {
    id: 4,
    email: "auditor@hopefoundation.org",
    firstName: "Neema",
    lastName: "Auditor",
    role: "AUDITOR",
    organizationId: 2,
    organizationName: "Hope Foundation",
    enabled: true,
  },
];

const mockPlatformLogs: SystemLogResponse[] = [
  {
    id: 1,
    logType: "EVENT",
    severity: "INFO",
    category: "AUTH",
    message: "User login succeeded",
    details: "email=finance@demo.local",
    organizationId: 1,
    userEmail: "finance@demo.local",
    requestMethod: "POST",
    requestPath: "/api/v1/auth/login",
    httpStatus: 200,
    alertResolved: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    logType: "ALERT",
    severity: "WARNING",
    category: "ALERT",
    message: "Security event detected: User login failed",
    details: "email=unknown@example.com",
    userEmail: "unknown@example.com",
    requestMethod: "POST",
    requestPath: "/api/v1/auth/login",
    httpStatus: 401,
    alertResolved: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
];

function handleAuth(
  pathname: string,
  method: string,
  body: unknown,
): ApiResponse<unknown> | null {
  if (pathname === "/api/v1/auth/login" && method === "POST") {
    const { email, password } = (body ?? {}) as { email?: string; password?: string };
    if (!email || !password) {
      throw new ApiError("Email and password are required", 400);
    }

    if (email.toLowerCase() === "mfa@demo.local" && password === MOCK_DEMO_PASSWORD) {
      return ok(
        {
          requiresMfa: true,
          mfaToken: "mock-mfa-token",
          availableMethods: ["totp", "email"],
          maskedEmail: "m***@demo.local",
        },
        "MFA required (mock)",
      );
    }

    const demo = MOCK_DEMO_USERS[email.toLowerCase()];
    if (demo && password === MOCK_DEMO_PASSWORD) {
      return ok(
        buildAuthResponse(email, demo.role, demo.firstName, demo.lastName, demo.organizationId),
        "Signed in (mock)",
      );
    }

    if (password === MOCK_DEMO_PASSWORD) {
      return ok(
        buildAuthResponse(email, "ORG_ADMIN", "Demo", "User", 1),
        "Signed in (mock)",
      );
    }

    throw new ApiError("Invalid credentials. Use password: demo", 401, "INVALID_CREDENTIALS");
  }

  if (pathname === "/api/v1/auth/register" && method === "POST") {
    const req = (body ?? {}) as {
      email?: string;
      firstName?: string;
      lastName?: string;
    };
    return ok(
      buildAuthResponse(
        req.email ?? "new@demo.local",
        "ORG_ADMIN",
        req.firstName ?? "New",
        req.lastName ?? "Admin",
        1,
        nextMockId(),
      ),
      "Registered (mock)",
    );
  }

  if (pathname === "/api/v1/auth/forgot-password" && method === "POST") {
    return ok(undefined, "If an account exists, a reset link has been sent.");
  }

  if (pathname === "/api/v1/auth/reset-password" && method === "POST") {
    const { token, password } = (body ?? {}) as { token?: string; password?: string };
    if (!token || !password) {
      throw new ApiError("Token and password are required", 400);
    }
    if (token === "expired") {
      throw new ApiError("This reset link has expired.", 400, "RESET_TOKEN_EXPIRED");
    }
    if (token === "invalid") {
      throw new ApiError("This reset link is invalid.", 400, "RESET_TOKEN_INVALID");
    }
    return ok(undefined, "Password updated successfully.");
  }

  if (pathname === "/api/v1/auth/mfa/verify" && method === "POST") {
    const { mfaToken, code } = (body ?? {}) as { mfaToken?: string; code?: string };
    if (!mfaToken || !code) {
      throw new ApiError("Verification code is required", 400);
    }
    if (mfaToken !== "mock-mfa-token" || code !== "123456") {
      throw new ApiError("Invalid verification code.", 401, "MFA_INVALID_CODE");
    }
    return ok(
      buildAuthResponse("mfa@demo.local", "ORG_ADMIN", "MFA", "User", 1),
      "Verified (mock)",
    );
  }

  if (pathname === "/api/v1/auth/logout" && method === "POST") {
    return ok(undefined, "Signed out");
  }

  if (pathname === "/api/v1/auth/refresh" && method === "POST") {
    return ok({ accessToken: "mock-refreshed-token", tokenType: "Bearer" }, "Token refreshed");
  }

  return null;
}

function roleFromToken(token?: string | null): string {
  if (!token) return "org_admin";
  if (token.includes("super_admin")) return "super_admin";
  if (token.includes("finance_manager")) return "finance_manager";
  if (token.includes("fundraising_manager")) return "fundraising_manager";
  return "org_admin";
}

function handleAuthMe(token?: string | null): ApiResponse<unknown> {
  const roleKey = roleFromToken(token);
  const emailMap: Record<string, string> = {
    super_admin: "super@demo.local",
    finance_manager: "finance@demo.local",
    fundraising_manager: "fundraising@demo.local",
    org_admin: "admin@demo.local",
  };
  const email = emailMap[roleKey] ?? "admin@demo.local";
  const demo = MOCK_DEMO_USERS[email]!;
  return ok({
    id: 1,
    email: demo ? email : "admin@demo.local",
    firstName: demo?.firstName ?? "Grace",
    lastName: demo?.lastName ?? "Admin",
    role: demo?.role ?? "ORG_ADMIN",
    organizationId: demo?.organizationId ?? 1,
    organizationType: demo?.organizationId != null ? "CHURCH" : null,
    enabled: true,
  });
}

export async function mockApiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiResponse<T>> {
  await mockDelay();

  const method = (options.method ?? "GET").toUpperCase();
  const { pathname } = parsePath(path);
  const body = options.body;

  if (pathname === "/api/v1/auth/me" && method === "GET") {
    return handleAuthMe(options.token) as ApiResponse<T>;
  }

  const authResult = handleAuth(pathname, method, body);
  if (authResult) {
    return authResult as ApiResponse<T>;
  }

  if (pathname === "/api/v1/organizations/me") {
    if (method === "GET" || method === "PUT") {
      const org =
        (options.organizationId != null && MOCK_ORGANIZATIONS[options.organizationId]) || MOCK_ORG;
      return ok(org) as ApiResponse<T>;
    }
  }

  if (pathname.startsWith("/api/v1/analytics/dashboard")) {
    return ok(MOCK_EXECUTIVE_DASHBOARD) as ApiResponse<T>;
  }
  if (pathname.startsWith("/api/v1/analytics/trends")) {
    return ok(MOCK_TRENDS) as ApiResponse<T>;
  }
  if (pathname === "/api/v1/analytics/insights") {
    return ok(MOCK_INSIGHTS) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/donors") {
    if (method === "GET") return ok(MOCK_DONORS) as ApiResponse<T>;
    if (method === "POST") {
      const req = body as Record<string, string>;
      return ok({
        id: nextMockId(),
        organizationId: 1,
        ...req,
        createdAt: new Date().toISOString(),
      }) as ApiResponse<T>;
    }
  }
  const donorId = matchId(pathname, "/api/v1/donors");
  if (donorId != null) {
    if (method === "GET") {
      const detail = getDonorDetail(donorId);
      if (!detail) throw new ApiError("Donor not found", 404);
      return ok(detail) as ApiResponse<T>;
    }
    if (method === "PUT" || method === "DELETE") {
      const detail = getDonorDetail(donorId) ?? MOCK_DONORS[0];
      return ok(detail) as ApiResponse<T>;
    }
  }

  if (pathname === "/api/v1/donations") {
    if (method === "GET") return ok(MOCK_DONATIONS) as ApiResponse<T>;
    if (method === "POST") {
      return ok({
        id: nextMockId(),
        organizationId: 1,
        amount: (body as { amount?: number })?.amount ?? 0,
        donationTime: new Date().toISOString(),
        status: "COMPLETED",
        donationType: "ONE_TIME",
        anonymous: false,
      }) as ApiResponse<T>;
    }
  }
  const donationId = matchId(pathname, "/api/v1/donations");
  if (donationId != null) {
    const detail = getDonationDetail(donationId);
    if (!detail) throw new ApiError("Donation not found", 404);
    return ok(detail) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/campaigns") {
    if (method === "GET") return ok(MOCK_CAMPAIGNS) as ApiResponse<T>;
    if (method === "POST") {
      return ok({
        id: nextMockId(),
        organizationId: 1,
        status: "DRAFT",
        createdAt: new Date().toISOString(),
        ...(body as object),
      }) as ApiResponse<T>;
    }
  }
  const campaignDashMatch = pathname.match(/^\/api\/v1\/campaigns\/(\d+)\/dashboard$/);
  if (campaignDashMatch) {
    const dash = getCampaignDashboard(Number(campaignDashMatch[1]));
    if (!dash) throw new ApiError("Campaign not found", 404);
    return ok(dash) as ApiResponse<T>;
  }
  const campaignId = matchId(pathname, "/api/v1/campaigns");
  if (campaignId != null) {
    const campaign = MOCK_CAMPAIGNS.find((c) => c.id === campaignId);
    if (!campaign) throw new ApiError("Campaign not found", 404);
    if (method === "DELETE") return ok(undefined as T) as ApiResponse<T>;
    return ok({ ...campaign, ...(method === "PUT" ? (body as object) : {}) }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/funds" || pathname === "/api/v1/funds/transfers") {
    if (method === "GET") return ok(pathname.includes("transfers") ? [] : MOCK_FUNDS) as ApiResponse<T>;
    if (method === "POST") {
      return ok({ id: nextMockId(), organizationId: 1, ...(body as object) }) as ApiResponse<T>;
    }
  }
  const fundId = matchId(pathname, "/api/v1/funds");
  if (fundId != null) {
    const fund = MOCK_FUNDS.find((f) => f.id === fundId);
    if (!fund) throw new ApiError("Fund not found", 404);
    return ok({ ...fund, ...(method === "PUT" ? (body as object) : {}) }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/expenses") {
    if (method === "GET") return ok(MOCK_EXPENSES) as ApiResponse<T>;
    if (method === "POST") {
      return ok({
        id: nextMockId(),
        organizationId: 1,
        status: "DRAFT",
        createdAt: new Date().toISOString(),
        ...(body as object),
      }) as ApiResponse<T>;
    }
  }
  const expenseId = matchId(pathname, "/api/v1/expenses");
  if (expenseId != null) {
    const expense = MOCK_EXPENSES.find((e) => e.id === expenseId) ?? MOCK_EXPENSES[0];
    if (pathname.includes("/submit") || pathname.includes("/approve") || pathname.includes("/pay")) {
      return ok({ ...expense, status: "APPROVED" }) as ApiResponse<T>;
    }
    if (pathname.includes("/reject")) {
      return ok({ ...expense, status: "REJECTED" }) as ApiResponse<T>;
    }
    return ok(expense) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/budgets") {
    if (method === "GET") return ok(MOCK_BUDGETS) as ApiResponse<T>;
    if (method === "POST") {
      return ok({
        id: nextMockId(),
        status: "DRAFT",
        totalBudget: 0,
        lines: [],
        createdAt: new Date().toISOString(),
        ...(body as object),
      }) as ApiResponse<T>;
    }
  }
  const budgetId = matchId(pathname, "/api/v1/budgets");
  if (budgetId != null) {
    const budget = MOCK_BUDGETS.find((b) => b.id === budgetId) ?? MOCK_BUDGETS[0];
    return ok(budget) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/programs") {
    if (method === "GET") return ok(MOCK_PROGRAMS) as ApiResponse<T>;
    if (method === "POST") {
      return ok({ id: nextMockId(), createdAt: new Date().toISOString(), ...(body as object) }) as ApiResponse<T>;
    }
  }
  const programDashMatch = pathname.match(/^\/api\/v1\/programs\/(\d+)\/dashboard$/);
  if (programDashMatch) {
    const dash = getProgramDashboard(Number(programDashMatch[1]));
    if (!dash) throw new ApiError("Program not found", 404);
    return ok(dash) as ApiResponse<T>;
  }
  const programId = matchId(pathname, "/api/v1/programs");
  if (programId != null) {
    const program = MOCK_PROGRAMS.find((p) => p.id === programId);
    if (!program) throw new ApiError("Program not found", 404);
    return ok({ ...program, ...(method === "PUT" ? (body as object) : {}) }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/grants") {
    if (method === "GET") return ok(MOCK_GRANTS) as ApiResponse<T>;
    if (method === "POST") {
      return ok({
        id: nextMockId(),
        status: "DRAFT",
        createdAt: new Date().toISOString(),
        ...(body as object),
      }) as ApiResponse<T>;
    }
  }
  const grantUtilMatch = pathname.match(/^\/api\/v1\/grants\/(\d+)\/utilization$/);
  if (grantUtilMatch) {
    const util = getGrantUtilization(Number(grantUtilMatch[1]));
    if (!util) throw new ApiError("Grant not found", 404);
    return ok(util) as ApiResponse<T>;
  }
  const grantId = matchId(pathname, "/api/v1/grants");
  if (grantId != null) {
    const grant = MOCK_GRANTS.find((g) => g.id === grantId);
    if (!grant) throw new ApiError("Grant not found", 404);
    if (pathname.includes("/activate") || pathname.includes("/close")) {
      return ok(grant) as ApiResponse<T>;
    }
    return ok({ ...grant, ...(method === "PUT" ? (body as object) : {}) }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/beneficiaries") {
    if (method === "GET") return ok(MOCK_BENEFICIARIES) as ApiResponse<T>;
    if (method === "POST") {
      return ok({ id: nextMockId(), createdAt: new Date().toISOString(), ...(body as object) }) as ApiResponse<T>;
    }
  }
  const beneficiaryId = matchId(pathname, "/api/v1/beneficiaries");
  if (beneficiaryId != null) {
    const b = MOCK_BENEFICIARIES.find((x) => x.id === beneficiaryId) ?? MOCK_BENEFICIARIES[0];
    return ok(b) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/church/ministries") {
    if (method === "GET") return ok(MOCK_MINISTRIES) as ApiResponse<T>;
    if (method === "POST") {
      return ok({ id: nextMockId(), active: true, createdAt: new Date().toISOString(), ...(body as object) }) as ApiResponse<T>;
    }
  }
  const ministryId = matchId(pathname, "/api/v1/church/ministries");
  if (ministryId != null) {
    const m = MOCK_MINISTRIES.find((x) => x.id === ministryId) ?? MOCK_MINISTRIES[0];
    return ok(m) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/church/attendance") {
    if (method === "GET") return ok([]) as ApiResponse<T>;
    if (method === "POST") {
      return ok({ id: nextMockId(), recordedAt: new Date().toISOString(), ...(body as object) }) as ApiResponse<T>;
    }
  }
  if (pathname.includes("/api/v1/church/attendance/summary")) {
    return ok({ totalAttendance: 248, recordCount: 4 }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/school/sponsorships") {
    if (method === "GET") return ok(MOCK_SPONSORSHIPS) as ApiResponse<T>;
    if (method === "POST") {
      return ok({ id: nextMockId(), status: "ACTIVE", createdAt: new Date().toISOString(), ...(body as object) }) as ApiResponse<T>;
    }
  }
  const sponsorshipId = matchId(pathname, "/api/v1/school/sponsorships");
  if (sponsorshipId != null) {
    const s = MOCK_SPONSORSHIPS.find((x) => x.id === sponsorshipId) ?? MOCK_SPONSORSHIPS[0];
    return ok(s) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/users") {
    if (method === "GET") {
      return ok([
        {
          id: 1,
          email: "admin@demo.local",
          firstName: "Grace",
          lastName: "Admin",
          role: "ORG_ADMIN",
          organizationId: 1,
          enabled: true,
        },
        {
          id: 2,
          email: "finance@demo.local",
          firstName: "David",
          lastName: "Mwangi",
          role: "FINANCE_MANAGER",
          organizationId: 1,
          enabled: true,
        },
      ]) as ApiResponse<T>;
    }
    if (method === "POST") {
      return ok({
        id: nextMockId(),
        organizationId: 1,
        enabled: true,
        ...(body as object),
      }) as ApiResponse<T>;
    }
  }
  const userId = matchId(pathname, "/api/v1/users");
  if (userId != null) {
    return ok({
      id: userId,
      email: "staff@demo.local",
      firstName: "Staff",
      lastName: "Member",
      role: "STAFF",
      organizationId: 1,
      enabled: true,
    }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/accounting/chart-of-accounts") {
    if (method === "GET") {
      return ok([
        {
          id: 1,
          code: "1000",
          name: "Cash",
          accountType: "ASSET",
          active: true,
          systemAccount: false,
          createdAt: "2024-01-01T08:00:00Z",
        },
        {
          id: 2,
          code: "4000",
          name: "Donation Income",
          accountType: "REVENUE",
          active: true,
          systemAccount: false,
          createdAt: "2024-01-01T08:00:00Z",
        },
        {
          id: 3,
          code: "5000",
          name: "Program Expenses",
          accountType: "EXPENSE",
          active: true,
          systemAccount: false,
          createdAt: "2024-01-01T08:00:00Z",
        },
      ]) as ApiResponse<T>;
    }
    if (method === "POST") return ok({ id: nextMockId(), ...(body as object) }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/accounting/journal-entries") {
    if (method === "GET") {
      return ok([
        {
          id: 1,
          entryDate: "2026-06-20",
          description: "Donation posting",
          sourceType: "DONATION_PAYMENT",
          sourceId: 101,
          totalDebits: 250000,
          totalCredits: 250000,
          lines: [],
        },
      ]) as ApiResponse<T>;
    }
  }
  const jeId = matchId(pathname, "/api/v1/accounting/journal-entries");
  if (jeId != null) {
    return ok({
      id: jeId,
      entryDate: "2026-06-20",
      description: "Sample entry",
      sourceType: "DONATION_PAYMENT",
      sourceId: jeId,
      totalDebits: 100000,
      totalCredits: 100000,
      lines: [],
    }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/accounting/trial-balance") {
    return ok({
      asOfDate: "2026-06-30",
      lines: [
        { accountCode: "1000", accountName: "Cash", debit: 8450000, credit: 0 },
        { accountCode: "4000", accountName: "Donation Income", debit: 0, credit: 4850000 },
      ],
      totalDebit: 8450000,
      totalCredit: 8450000,
    }) as ApiResponse<T>;
  }

  if (pathname.startsWith("/api/v1/accounting/general-ledger")) {
    return ok({ accountId: 1, accountName: "Cash", lines: [], openingBalance: 0, closingBalance: 8450000 }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/accounting/initialize" && method === "POST") {
    return ok(undefined as T) as ApiResponse<T>;
  }

  if (pathname.startsWith("/api/v1/reports/")) {
    return ok({
      fromDate: "2026-01-01",
      toDate: "2026-06-30",
      totalIncome: 4850000,
      totalExpenses: 3120000,
      netIncome: 1730000,
      lines: [],
    }) as ApiResponse<T>;
  }

  if (pathname.startsWith("/api/v1/platform/dashboard")) {
    if (pathname === "/api/v1/platform/dashboard" && method === "GET") {
      return ok({
        platformStats: {
          totalOrganizations: mockPlatformOrganizations.length,
          activeOrganizations: mockPlatformOrganizations.filter((organization) => organization.active).length,
          totalUsers: mockPlatformUsers.length,
          superAdminCount: mockPlatformUsers.filter((user) => user.role === "SUPER_ADMIN").length,
        },
        inactiveOrganizations: mockPlatformOrganizations.filter((organization) => !organization.active).length,
        logsLast24Hours: mockPlatformLogs.length,
        errorsLast24Hours: mockPlatformLogs.filter((log) => log.severity === "ERROR" || log.severity === "CRITICAL").length,
        securityEventsLast24Hours: mockPlatformLogs.filter((log) => log.logType === "SECURITY").length,
        unresolvedAlerts: mockPlatformLogs.filter((log) => log.logType === "ALERT" && !log.alertResolved).length,
        organizations: mockPlatformOrganizations,
        users: mockPlatformUsers,
        recentActivity: mockPlatformLogs,
        recentAlerts: mockPlatformLogs.filter((log) => log.logType === "ALERT"),
        recentErrors: mockPlatformLogs.filter((log) => log.severity === "ERROR" || log.severity === "CRITICAL"),
      }) as ApiResponse<T>;
    }

    if (pathname === "/api/v1/platform/dashboard/organizations") {
      if (method === "GET") {
        return ok(mockPlatformOrganizations) as ApiResponse<T>;
      }
      if (method === "POST") {
        const request = (body ?? {}) as Partial<PlatformOrganization>;
        const organization: PlatformOrganization = {
          id: nextMockId(),
          name: request.name ?? "New Organization",
          slug: request.slug ?? String(request.name ?? "new-organization").toLowerCase().replace(/\s+/g, "-"),
          type: (request.type ?? "NGO") as OrganizationType,
          email: request.email,
          phone: request.phone,
          address: request.address,
          city: request.city,
          state: request.state,
          country: request.country,
          active: true,
          createdAt: new Date().toISOString(),
        };
        mockPlatformOrganizations.unshift(organization);
        return ok(organization as T, "Organization created");
      }
    }

    const organizationId = matchId(pathname, "/api/v1/platform/dashboard/organizations");
    if (organizationId != null) {
      const organization = mockPlatformOrganizations.find((item) => item.id === organizationId);
      if (!organization) throw new ApiError("Organization not found", 404);
      if (pathname.endsWith("/status") && method === "PUT") {
        organization.active = Boolean((body as { active?: boolean } | undefined)?.active);
        return ok(organization as T, "Organization status updated");
      }
      if (method === "GET") {
        return ok(organization as T);
      }
    }

    if (pathname === "/api/v1/platform/dashboard/users") {
      if (method === "GET") {
        return ok(mockPlatformUsers) as ApiResponse<T>;
      }
      if (method === "POST") {
        const request = (body ?? {}) as {
          organizationId?: number;
          email?: string;
          firstName?: string;
          lastName?: string;
          role?: Role;
        };
        const organization = mockPlatformOrganizations.find((item) => item.id === Number(request.organizationId));
        if (!organization) throw new ApiError("Organization not found", 404);
        const user: PlatformUser = {
          id: nextMockId(),
          email: request.email ?? "new-user@example.com",
          firstName: request.firstName ?? "New",
          lastName: request.lastName ?? "User",
          role: request.role ?? "STAFF",
          organizationId: organization.id,
          organizationName: organization.name,
          enabled: true,
        };
        mockPlatformUsers.unshift(user);
        return ok(user as T, "Tenant user created");
      }
    }

    const userId = matchId(pathname, "/api/v1/platform/dashboard/users");
    if (userId != null) {
      const user = mockPlatformUsers.find((item) => item.id === userId);
      if (!user) throw new ApiError("User not found", 404);
      if (pathname.endsWith("/role") && method === "PUT") {
        user.role = ((body as { role?: Role } | undefined)?.role ?? user.role);
        return ok(user as T, "User role updated");
      }
      if (pathname.endsWith("/status") && method === "PUT") {
        user.enabled = Boolean((body as { enabled?: boolean } | undefined)?.enabled);
        return ok(user as T, user.enabled ? "User account enabled" : "User account disabled");
      }
      if (method === "GET") {
        return ok(user as T);
      }
    }

    if (pathname === "/api/v1/platform/dashboard/super-admins" && method === "POST") {
      const request = (body ?? {}) as { email?: string; firstName?: string; lastName?: string };
      const user: PlatformUser = {
        id: nextMockId(),
        email: request.email ?? "owner@example.com",
        firstName: request.firstName ?? "Platform",
        lastName: request.lastName ?? "Owner",
        role: "SUPER_ADMIN",
        organizationId: null,
        organizationName: "Platform",
        enabled: true,
      };
      mockPlatformUsers.unshift(user);
      return ok(user as T, "Super administrator created");
    }

    if (pathname === "/api/v1/platform/dashboard/logs") {
      return ok(mockPlatformLogs as T);
    }

    const logId = matchId(pathname, "/api/v1/platform/dashboard/logs");
    if (logId != null) {
      const log = mockPlatformLogs.find((item) => item.id === logId);
      if (!log) throw new ApiError("System log entry not found", 404);
      if (pathname.endsWith("/resolve") && method === "PUT") {
        log.alertResolved = true;
        return ok(log as T, "Alert resolved");
      }
      if (method === "GET") {
        return ok(log as T);
      }
    }
  }

  if (pathname === "/api/v1/notifications/unread-count" && method === "GET") {
    const count = getMockNotifications().filter((n) => n.status === "unread").length;
    return ok(count as T) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/notifications/read-all" && method === "POST") {
    markAllMockNotificationsRead();
    return ok(undefined as T) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/notifications/preferences") {
    if (method === "GET") {
      return ok(mockNotificationPreferences) as ApiResponse<T>;
    }
    if (method === "PUT") {
      const updated = updateMockNotificationPreferences(
        (body ?? {}) as Partial<import("@/types/notification").NotificationPreferences>,
      );
      return ok(updated as T) as ApiResponse<T>;
    }
  }

  if (pathname === "/api/v1/notifications") {
    if (method === "GET") {
      const { search } = parsePath(path);
      let items = [...getMockNotifications()];
      const status = search.get("status");
      const category = search.get("category");
      const q = search.get("q");
      if (status && status !== "all") {
        items = items.filter((n) => n.status === status);
      }
      if (category) {
        items = items.filter((n) => n.category === category);
      }
      if (q) {
        const lower = q.toLowerCase();
        items = items.filter(
          (n) =>
            n.title.toLowerCase().includes(lower) ||
            n.body?.toLowerCase().includes(lower),
        );
      }
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return ok({
        items,
        page: 0,
        totalPages: 1,
        totalElements: items.length,
      }) as ApiResponse<T>;
    }
  }

  const notificationIdMatch = pathname.match(/^\/api\/v1\/notifications\/([^/]+)(?:\/(.+))?$/);
  if (notificationIdMatch) {
    const id = notificationIdMatch[1];
    const action = notificationIdMatch[2];

    if (!action && method === "GET") {
      const item = getMockNotifications().find((n) => n.id === id);
      if (!item) throw new ApiError("Notification not found", 404);
      return ok(item) as ApiResponse<T>;
    }

    if (action === "read" && method === "POST") {
      const updated = updateMockNotification(id, {
        status: "read",
        readAt: new Date().toISOString(),
      });
      if (!updated) throw new ApiError("Notification not found", 404);
      return ok(updated) as ApiResponse<T>;
    }

    if (action === "acknowledge" && method === "POST") {
      const updated = updateMockNotification(id, {
        status: "acknowledged",
        acknowledgedAt: new Date().toISOString(),
        readAt: new Date().toISOString(),
      });
      if (!updated) throw new ApiError("Notification not found", 404);
      return ok(updated) as ApiResponse<T>;
    }

    if (action === "archive" && method === "POST") {
      const updated = updateMockNotification(id, { status: "archived" });
      if (!updated) throw new ApiError("Notification not found", 404);
      return ok(updated) as ApiResponse<T>;
    }
  }

  if (pathname === "/api/v1/activity/feed" && method === "GET") {
    return ok({ items: MOCK_ACTIVITY_FEED }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/announcements/active" && method === "GET") {
    return ok(MOCK_ANNOUNCEMENTS) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/workflow/inbox/count" && method === "GET") {
    const { getMockInboxCount } = await import("@/lib/mock/workflow-store");
    return ok(getMockInboxCount() as T) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/workflow/inbox" && method === "GET") {
    const { getMockInbox } = await import("@/lib/mock/workflow-store");
    const { search } = parsePath(path);
    const items = getMockInbox({
      status: (search.get("status") as import("@/types/workflow-instance").InboxFilters["status"]) ?? undefined,
      entityType: search.get("entityType") ?? undefined,
      q: search.get("q") ?? undefined,
      sort: (search.get("sort") as import("@/types/workflow-instance").InboxFilters["sort"]) ?? undefined,
    });
    return ok({
      items,
      page: 0,
      totalPages: 1,
      totalElements: items.length,
    }) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/workflow/instances" && method === "GET") {
    const { getMockWorkflowByEntity } = await import("@/lib/mock/workflow-store");
    const { search } = parsePath(path);
    const entityType = search.get("entityType");
    const entityId = search.get("entityId");
    if (entityType && entityId) {
      const instance = getMockWorkflowByEntity(entityType, entityId);
      if (!instance) throw new ApiError("Workflow not found", 404);
      return ok(instance as T) as ApiResponse<T>;
    }
  }

  const workflowInstanceMatch = pathname.match(/^\/api\/v1\/workflow\/instances\/([^/]+)(?:\/(.+))?$/);
  if (workflowInstanceMatch) {
    const instanceId = workflowInstanceMatch[1];
    const action = workflowInstanceMatch[2];
    const store = await import("@/lib/mock/workflow-store");

    if (!action && method === "GET") {
      const instance = store.getMockWorkflowInstance(instanceId);
      if (!instance) throw new ApiError("Workflow not found", 404);
      return ok(instance as T) as ApiResponse<T>;
    }

    if (action === "comments") {
      if (method === "GET") {
        return ok(store.getMockWorkflowComments(instanceId) as T) as ApiResponse<T>;
      }
      if (method === "POST") {
        const { body: commentBody, visibility } = (body ?? {}) as {
          body?: string;
          visibility?: "public" | "internal";
        };
        const comment = store.addMockWorkflowComment(
          instanceId,
          commentBody ?? "",
          visibility ?? "public",
        );
        return ok(comment as T) as ApiResponse<T>;
      }
    }

    if (action === "timeline" && method === "GET") {
      return ok(store.getMockWorkflowTimeline(instanceId) as T) as ApiResponse<T>;
    }

    if (action === "approve" && method === "POST") {
      const { comment } = (body ?? {}) as { comment?: string };
      const updated = store.approveMockWorkflow(instanceId, comment);
      if (!updated) throw new ApiError("Workflow not found", 404);
      return ok(updated as T) as ApiResponse<T>;
    }

    if (action === "reject" && method === "POST") {
      const { reason } = (body ?? {}) as { reason?: string };
      const updated = store.rejectMockWorkflow(instanceId, reason ?? "Rejected");
      if (!updated) throw new ApiError("Workflow not found", 404);
      return ok(updated as T) as ApiResponse<T>;
    }

    if (action === "return" && method === "POST") {
      const { comment } = (body ?? {}) as { comment?: string };
      const updated = store.returnMockWorkflow(instanceId, comment ?? "Returned");
      if (!updated) throw new ApiError("Workflow not found", 404);
      return ok(updated as T) as ApiResponse<T>;
    }

    if (action === "delegate" && method === "POST") {
      const updated = store.delegateMockWorkflow(
        instanceId,
        (body ?? {}) as import("@/types/workflow-instance").DelegatePayload,
      );
      if (!updated) throw new ApiError("Workflow not found", 404);
      return ok(updated as T) as ApiResponse<T>;
    }

    if (action === "reassign" && method === "POST") {
      const updated = store.reassignMockWorkflow(
        instanceId,
        (body ?? {}) as import("@/types/workflow-instance").ReassignPayload,
      );
      if (!updated) throw new ApiError("Workflow not found", 404);
      return ok(updated as T) as ApiResponse<T>;
    }
  }

  if (pathname === "/api/v1/documents/upload" && method === "POST") {
    const payload = (body ?? {}) as {
      fileName?: string;
      fileSize?: number;
      mimeType?: string;
      entityType?: string;
      entityId?: string;
      category?: string;
    };
    const doc = uploadMockDocument(
      new File([""], payload.fileName ?? "upload.bin", { type: payload.mimeType ?? "application/octet-stream" }),
      {
        entityType: (payload.entityType ?? "expense") as import("@/types/document").AttachableEntityType,
        entityId: payload.entityId,
        category: payload.category as import("@/types/document").DocumentCategory | undefined,
      },
    );
    return ok(doc) as ApiResponse<T>;
  }

  if (pathname === "/api/v1/documents") {
    const { search } = parsePath(path);
    if (method === "GET") {
      const items = getMockDocuments({
        entityType: search.get("entityType") as import("@/types/document").AttachableEntityType | undefined,
        entityId: search.get("entityId") ?? undefined,
        category: search.get("category") as import("@/types/document").DocumentCategory | undefined,
        status: (search.get("status") as import("@/types/document").DocumentStatus) ?? undefined,
        q: search.get("q") ?? undefined,
      });
      return ok({
        items,
        page: 0,
        totalPages: 1,
        totalElements: items.length,
      }) as ApiResponse<T>;
    }
  }

  const documentIdMatch = pathname.match(/^\/api\/v1\/documents\/([^/]+)(?:\/(.+))?$/);
  if (documentIdMatch) {
    const id = documentIdMatch[1];
    const action = documentIdMatch[2];

    if (!action && method === "GET") {
      const item = getMockDocument(id);
      if (!item) throw new ApiError("Document not found", 404);
      return ok(item) as ApiResponse<T>;
    }

    if (!action && method === "PATCH") {
      const updated = updateMockDocumentMetadata(id, (body ?? {}) as Parameters<typeof updateMockDocumentMetadata>[1]);
      if (!updated) throw new ApiError("Document not found", 404);
      return ok(updated) as ApiResponse<T>;
    }

    if (!action && method === "DELETE") {
      const deleted = deleteMockDocument(id);
      if (!deleted) throw new ApiError("Document not found", 404);
      return ok(deleted) as ApiResponse<T>;
    }

    if (action === "archive" && method === "POST") {
      const archived = archiveMockDocument(id);
      if (!archived) throw new ApiError("Document not found", 404);
      return ok(archived) as ApiResponse<T>;
    }

    if (action === "versions") {
      if (method === "GET") {
        const versions = getMockDocumentVersions(id);
        if (!versions) throw new ApiError("Document not found", 404);
        return ok(versions) as ApiResponse<T>;
      }
      if (method === "POST") {
        const { fileName, mimeType, changeNotes } = (body ?? {}) as {
          fileName?: string;
          mimeType?: string;
          changeNotes?: string;
        };
        const updated = uploadMockDocumentVersion(
          id,
          new File([""], fileName ?? "version.bin", { type: mimeType ?? "application/octet-stream" }),
          changeNotes,
        );
        if (!updated) throw new ApiError("Document not found", 404);
        return ok(updated) as ApiResponse<T>;
      }
    }
  }

  if (method === "GET") {
    console.warn(`[mock-api] Unhandled GET ${pathname} — returning empty list`);
    return ok([] as T) as ApiResponse<T>;
  }

  if (method === "POST" || method === "PUT") {
    console.warn(`[mock-api] Unhandled ${method} ${pathname} — returning echo`);
    return ok((body ?? {}) as T) as ApiResponse<T>;
  }

  throw new ApiError(`Mock API: no handler for ${method} ${pathname}`, 404);
}
