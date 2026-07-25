# Phase 09 — Authentication & Identity Experience

**Date:** 2026-06-30  
**Status:** Approved (documentation)  
**Dependencies:** Phase 00–08  
**Backend:** `/api/v1/auth/*` REST endpoints

---

## 1. Executive Summary

Authentication in FundFlow ERP is the complete identity lifecycle: sign in, session persistence, organization context, authorization, and sign out. No business module implements auth independently — all identity flows go through a centralized frontend auth layer backed by the API.

This phase documents the **authentication and identity experience** — flows, state, guards, permissions, and backend contracts.

---

## 2. Identity Principles

| Principle | Application |
|-----------|-------------|
| **Secure by default** | Tokens in memory + persisted session; passwords never stored client-side |
| **Invisible security** | Guards redirect silently; MFA when required, not optional friction |
| **Consistency** | One `LoginForm`, one auth store, one API client pattern |
| **Multi-tenant awareness** | Every API call carries org context via `X-Organization-Id` |
| **Least privilege** | UI gated by role; API enforces authorization |

---

## 3. Authentication Flow

```
User
  ↓
Login Page (GuestGuard)
  ↓
POST /api/v1/auth/login
  ↓
MFA Challenge (future — if required)
  ↓
Organization Selection (future — multi-org users)
  ↓
setSession(AuthResponse) → Zustand persist
  ↓
Redirect → getDefaultDashboardPath(role)
  ↓
AuthGuard wraps app → AppShell
  ↓
Navigation filtered by role + org type
```

---

## 4. Current vs Target

### Implemented today

| Piece | Path | Status |
|-------|------|--------|
| Login form | `components/auth/login-form.tsx` | ✅ Email + password |
| Register form | `components/auth/register-form.tsx` | ✅ Org + user signup |
| Auth slider UI | `components/auth/auth-slider.tsx` | ✅ Sign-in / sign-up |
| Auth store | `stores/auth-store.ts` | ✅ Zustand + persist |
| Auth API | `lib/api/auth.ts` | ✅ login, register, me |
| Auth guard | `components/auth/auth-guard.tsx` | ✅ Protected app routes |
| Guest guard | `components/auth/guest-guard.tsx` | ✅ Public auth routes |
| Admin guard | `components/auth/admin-guard.tsx` | ✅ ORG_ADMIN only |
| Platform guard | `components/auth/platform-auth-guard.tsx` | ✅ SUPER_ADMIN |
| Dashboard guard | `components/auth/dashboard-guard.tsx` | ✅ Role-based dashboards |
| Permission gate | `components/security/permission-gate.tsx` | ✅ Role-based UI |
| User menu | `components/layout/header/user-menu.tsx` | ✅ Logout, theme |
| Org switcher | `components/layout/organization/organization-switcher.tsx` | ⚠️ Display only |
| API context | `hooks/use-api-context.ts` | ✅ Token + org header |
| Permissions | `lib/navigation/permissions.ts` | ✅ Nav + dashboard access |

### Target (not yet implemented)

| Feature | Priority |
|---------|----------|
| Forgot password flow | High |
| Reset password page | High |
| MFA challenge (TOTP / email OTP) | High |
| Refresh token rotation | High |
| Session timeout dialog | Medium |
| Remember me (secure refresh) | Medium |
| Multi-org selection post-login | Medium |
| OAuth / SSO providers | Future |
| Fine-grained permissions (beyond role) | Future |

---

## 5. State Management

**Single source of truth:** `useAuthStore` (Zustand)

```ts
interface AuthState {
  accessToken: string | null;
  user: SessionUser | null;
  _hasHydrated: boolean;
  setSession: (auth: AuthResponse) => void;
  setUser: (user: SessionUser) => void;
  clearSession: () => void;
}
```

**Persisted to localStorage** (`fundflow-auth`): `accessToken`, `user` only.

**Never store:** passwords, refresh tokens in plain localStorage (target: httpOnly cookie for refresh).

**Hook facade:** `useAuth()` — `isAuthenticated`, `isReady`, `setSession`, `clearSession`.

---

## 6. Session User Model

```ts
interface SessionUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  organizationId: number | null;
}
```

Loaded from `AuthResponse` on login. Refresh via `GET /api/v1/auth/me` when profile changes.

**Target extensions:** `permissions[]`, `avatarUrl`, `mfaEnabled`, `preferredLocale`, `activeOrganization`.

---

## 7. API Integration

All auth calls through `lib/api/auth.ts` → `apiRequest` → `lib/api/client.ts`.

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/auth/login` | POST | Issue access token + user |
| `/api/v1/auth/register` | POST | Create org + admin user |
| `/api/v1/auth/me` | GET | Current user profile |
| `/api/v1/auth/logout` | POST | Invalidate session (target) |
| `/api/v1/auth/refresh` | POST | Rotate tokens (target) |
| `/api/v1/auth/forgot-password` | POST | Send reset email (target) |
| `/api/v1/auth/reset-password` | POST | Set new password (target) |
| `/api/v1/auth/mfa/verify` | POST | Complete MFA (target) |

**Request headers (authenticated):**

```
Authorization: Bearer {accessToken}
X-Organization-Id: {organizationId}
```

Set by `apiRequest` via `useApiContext()`.

---

## 8. Route Protection Layers

| Layer | Component | Scope |
|-------|-----------|-------|
| App shell | `AuthGuard` | All `(app)/*` routes |
| Guest only | `GuestGuard` | `(auth)/*` login/register |
| Platform | `PlatformAuthGuard` | `/platform/*` |
| Admin | `AdminGuard` | Admin settings pages |
| Dashboard | `DashboardGuard` | Role-specific dashboards |
| UI element | `PermissionGate` | Buttons, sections |

See [ROUTE_PROTECTION.md](./ROUTE_PROTECTION.md).

---

## 9. Authorization Model

FundFlow currently uses **role-based access control (RBAC)**:

- `Role` enum on `SessionUser`
- Navigation filtered via `canAccessNavItem(roles, userRole, orgType)`
- Dashboard access via `canAccessDashboard(path, role)`
- Component gating via `PermissionGate roles={[...]}`

**Target:** Permission strings from API (`donations:create`, `expenses:approve`) with `hasPermission(user, permission)` — role maps to permission set server-side.

See [AUTHORIZATION_MODEL.md](./AUTHORIZATION_MODEL.md).

---

## 10. Organization Context

| User type | Org resolution |
|-----------|----------------|
| Tenant user | `user.organizationId` from session |
| Super admin | `platform-store.selectedOrganizationId` |

```ts
// useApiContext()
organizationId = user.role === "SUPER_ADMIN"
  ? selectedOrganizationId
  : user.organizationId;
```

Org switcher shows current org; multi-org switching is placeholder until backend supports membership list + switch endpoint.

---

## 11. Component Inventory

| Component | Status | Location |
|-----------|--------|----------|
| LoginForm | ✅ | `components/auth/login-form.tsx` |
| RegisterForm | ✅ | `components/auth/register-form.tsx` |
| AuthSlider | ✅ | `components/auth/auth-slider.tsx` |
| ForgotPasswordForm | 🔲 | Target |
| ResetPasswordForm | 🔲 | Target |
| MFAChallenge | 🔲 | Target |
| OrganizationSelector | 🔲 | Post-login + switcher |
| AuthGuard | ✅ | `components/auth/auth-guard.tsx` |
| PermissionGate | ✅ | `components/security/permission-gate.tsx` |
| SessionTimeoutDialog | 🔲 | Target |
| UserMenu | ✅ | `components/layout/header/user-menu.tsx` |

Forms should use Phase 07 `TextField`, `PasswordField`, `EmailField`.

---

## 12. Related Documents

| Document | Contents |
|----------|----------|
| [LOGIN_FLOW.md](./LOGIN_FLOW.md) | Login UI, validation, redirect |
| [SESSION_MANAGEMENT.md](./SESSION_MANAGEMENT.md) | Tokens, timeout, refresh, logout |
| [AUTHORIZATION_MODEL.md](./AUTHORIZATION_MODEL.md) | Roles, permissions, gating |
| [ROUTE_PROTECTION.md](./ROUTE_PROTECTION.md) | Public, protected, restricted routes |
| [MFA_GUIDE.md](./MFA_GUIDE.md) | MFA flows, recovery codes |
| [ERROR_HANDLING.md](./ERROR_HANDLING.md) | User-facing auth errors |
| Phase 07 [ENTERPRISE_FORM_SYSTEM.md](../phase-07/ENTERPRISE_FORM_SYSTEM.md) | Form patterns for auth forms |
| Phase 03 [APPLICATION_SHELL.md](../phase-03/APPLICATION_SHELL.md) | Shell after auth |

---

## 13. Acceptance Criteria

- [x] Auth architecture documented
- [x] Login flow documented
- [x] Session lifecycle documented
- [x] Authorization model documented
- [x] Route protection documented
- [x] MFA strategy documented
- [x] Error handling documented
- [ ] Forgot / reset password implemented
- [ ] MFA challenge implemented
- [ ] Refresh token rotation implemented
- [ ] Session timeout dialog implemented
- [ ] Multi-org selection implemented
- [ ] Fine-grained permissions from API

---

## 14. Governance

Do not proceed to Phase 10 until this architecture is reviewed and approved.

New pages must use existing guards — no custom `if (!token)` checks in page components.
