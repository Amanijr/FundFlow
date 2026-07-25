# Authorization Model

**Phase:** 09 — Authentication & Identity Experience  
**Current model:** Role-Based Access Control (RBAC)  
**Target model:** RBAC + fine-grained permissions from API

---

## 1. Overview

Authorization answers: **what can this user see and do?**

| Layer | Mechanism | Enforces |
|-------|---------|----------|
| Route | Guards (`AuthGuard`, `AdminGuard`, …) | Page access |
| Navigation | `canAccessNavItem` | Sidebar / command palette |
| Dashboard | `canAccessDashboard` | Dashboard routes |
| Component | `PermissionGate` | Buttons, sections, widgets |
| API | Server | All mutations and sensitive reads |

**Frontend authorization is UX only** — API always validates.

---

## 2. Roles

Defined in `types/api.ts`:

```ts
type Role =
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
```

Stored on `SessionUser.role` after login.

---

## 3. Role Capability Matrix (summary)

| Capability | Typical roles |
|------------|---------------|
| Full org admin | `ORG_ADMIN` |
| Finance operations | `FINANCE_MANAGER`, `ACCOUNTANT` |
| Fundraising | `FUNDRAISING_MANAGER`, `STAFF` |
| Read-only audit | `AUDITOR`, `VIEW_ONLY` |
| Platform ops | `SUPER_ADMIN` |
| Program delivery | `PROGRAM_MANAGER`, `STAFF` |

Exact mappings live in `lib/navigation/navigation.ts` per nav item `roles[]`.

---

## 4. Navigation Authorization

```ts
// lib/navigation/permissions.ts
export function canAccessNavItem(
  roles: Role[],
  userRole: Role | undefined,
  organizationType?: OrganizationType,
  requiredOrgTypes?: OrganizationType[],
): boolean
```

Each nav item declares:

```ts
{
  id: "donations",
  label: "Donations",
  href: "/donations",
  roles: ["ORG_ADMIN", "FUNDRAISING_MANAGER", "STAFF", "VIEW_ONLY"],
  organizationTypes: ["NGO", "CHURCH", ...], // optional
}
```

Filtered in `sidebar-nav.tsx` and `buildCommandActions()`.

---

## 5. Dashboard Authorization

```ts
export const EXECUTIVE_DASHBOARD_ROLES: Role[] = [
  "ORG_ADMIN", "PROGRAM_MANAGER", "STAFF", "VIEW_ONLY", "AUDITOR",
];

export function canAccessDashboard(path: string, role?: Role): boolean
```

`DashboardGuard` redirects unauthorized users to `getDefaultDashboardPath(role)`.

---

## 6. Component-Level Gating

### PermissionGate

```tsx
<PermissionGate roles={["ORG_ADMIN", "FINANCE_MANAGER"]}>
  <Button>Approve expense</Button>
</PermissionGate>
```

```tsx
<PermissionGate roles={["ORG_ADMIN"]} fallback={<p>Contact your administrator</p>}>
  <AdminSettings />
</PermissionGate>
```

### useHasRole hook

```tsx
const canApprove = useHasRole("ORG_ADMIN", "FINANCE_MANAGER");
```

Use for conditional logic; prefer `PermissionGate` for render gating.

---

## 7. Specialized Guards

| Guard | Rule | Use case |
|-------|------|----------|
| `AuthGuard` | `isAuthenticated` | Entire app shell |
| `GuestGuard` | `!isAuthenticated` | Login/register |
| `AdminGuard` | `role === ORG_ADMIN` | `/admin/*` settings |
| `PlatformAuthGuard` | `role === SUPER_ADMIN` | `/platform/*` |
| `DashboardGuard` | `canAccessDashboard` | Role dashboards |

---

## 8. Organization Type Gating

Some features apply only to certain org types (church ministries, school sponsorships):

```ts
canAccessNavItem(item.roles, userRole, orgType, item.organizationTypes)
```

Org type from `AuthResponse.organizationType` or organization API.

---

## 9. Target: Permission Strings

Move from role checks to capability checks:

```ts
type Permission =
  | "donations:read"
  | "donations:create"
  | "expenses:approve"
  | "users:manage"
  | "audit:read"
  // ...
```

**API response:**

```json
{
  "user": { "role": "STAFF", "permissions": ["donations:read", "donations:create"] }
}
```

**Frontend helpers:**

```ts
function hasPermission(user: SessionUser, permission: Permission): boolean {
  return user.permissions?.includes(permission) ?? false;
}

function hasAnyPermission(user: SessionUser, permissions: Permission[]): boolean {
  return permissions.some((p) => hasPermission(user, p));
}
```

**PermissionGate v2:**

```tsx
<PermissionGate permission="expenses:approve">
  <ApproveButton />
</PermissionGate>
```

Roles remain for broad defaults; permissions refine within role.

---

## 10. Dashboard Widget Authorization

Phase 08 widget registry supports `requiredRole` / `requiredPermission`:

```ts
{
  id: "pending-approvals",
  type: "table",
  requiredPermission: "expenses:approve",
}
```

`WidgetRenderer` returns `null` when unauthorized.

---

## 11. Form & Action Authorization

| Pattern | Example |
|---------|---------|
| Hide create button | `PermissionGate` on page header action |
| Disable field | `readOnly` when user lacks `budgets:edit` |
| Hide row action | Filter `RowActionsMenu` items by permission |
| Block route | Guard on `/admin/users` page |

Never rely on hidden UI alone — API returns 403 on unauthorized mutation.

---

## 12. Super Admin Impersonation (future)

Platform admin viewing tenant data:

- `X-Organization-Id` set via `TenantSwitcher`
- Banner: "Viewing as Acme Foundation"
- Actions restricted to read-only unless elevated

---

## 13. Anti-Patterns

| Avoid | Use instead |
|-------|-------------|
| `if (user.role === "X")` scattered in pages | `PermissionGate` or `canAccessNavItem` |
| Hardcoded role strings | `Role` type + shared constants |
| Client-only security | API authorization |
| Duplicate permission logic | Central `permissions.ts` |
| Checking token in every component | `useAuth()` + guards at layout level |

---

## 14. Checklist

- [ ] Nav items declare `roles` (and `organizationTypes` if needed)
- [ ] Sensitive pages wrapped in appropriate guard
- [ ] Destructive actions behind `PermissionGate`
- [ ] Dashboard widgets declare access requirements
- [ ] API returns 403 for unauthorized operations
- [ ] Permission strings from API (target)
- [ ] `hasPermission` utility (target)
