# Route Protection

**Phase:** 09 — Authentication & Identity Experience  
**Framework:** Next.js 15 App Router route groups

---

## 1. Route Categories

| Category | Auth required | Example routes |
|----------|---------------|----------------|
| **Public** | No | `/login`, `/register` |
| **Protected** | Yes | `/dashboard/*`, `/donations`, `/reports` |
| **Role restricted** | Yes + role | `/dashboard/finance`, `/admin/*` |
| **Platform** | Yes + `SUPER_ADMIN` | `/platform/dashboard` |
| **Permission restricted** | Yes + permission (target) | `/admin/users`, audit logs |

---

## 2. App Router Structure

```
app/
├── (auth)/              # GuestGuard in layout
│   ├── login/
│   └── register/
├── (app)/               # AuthGuard in layout
│   ├── layout.tsx       # → AuthGuard → AppShell
│   ├── dashboard/
│   ├── donations/
│   └── admin/
└── platform/            # PlatformAuthGuard per layout/page
    ├── dashboard/
    └── bootstrap/
```

---

## 3. Layout-Level Guards

### Protected app `(app)/layout.tsx`

```tsx
export default function AppLayout({ children }) {
  return <AuthGuard>{children}</AuthGuard>;
}
```

`AuthGuard` behaviour:

1. Wait for `isReady` (store hydration)
2. If not authenticated → `router.replace("/login")`
3. If authenticated → render `AppShell` + children

### Public auth `(auth)/layout.tsx`

```tsx
export default function AuthLayout({ children }) {
  return (
    <GuestGuard>
      <div className="flex min-h-screen ...">{children}</div>
    </GuestGuard>
  );
}
```

`GuestGuard`: if authenticated → `router.replace("/")`.

---

## 4. Page-Level Guards

Use when layout guard is insufficient:

```tsx
// app/(app)/admin/settings/page.tsx
export default function AdminSettingsPage() {
  return (
    <AdminGuard>
      <OrganizationSettingsForm />
    </AdminGuard>
  );
}
```

```tsx
// app/(app)/dashboard/finance/page.tsx
export default function FinanceDashboardPage() {
  return (
    <DashboardGuard path="/dashboard/finance">
      <FinanceDashboardView />
    </DashboardGuard>
  );
}
```

```tsx
// app/platform/dashboard/page.tsx
export default function PlatformDashboardPage() {
  return (
    <PlatformAuthGuard>
      <PlatformDashboard />
    </PlatformAuthGuard>
  );
}
```

---

## 5. Guard Decision Tree

```
Request route
    ↓
Is (auth)/* ?
    Yes → GuestGuard
    No ↓
Is /platform/* ?
    Yes → PlatformAuthGuard (SUPER_ADMIN)
    No ↓
Is (app)/* ?
    Yes → AuthGuard (authenticated)
    No ↓
Public marketing page (no guard)
```

Within `(app)/*`, additional guards per page as needed.

---

## 6. Redirect Behaviour

| Scenario | Redirect |
|----------|----------|
| Unauthenticated → protected | `/login` |
| Authenticated → login | `/` (home → default dashboard) |
| Wrong dashboard role | `getDefaultDashboardPath(role)` |
| Non-admin → admin page | `/` |
| Non-super-admin → platform | `/` |
| Session expired (target) | `/login?reason=session_expired` |
| Unauthorized permission (target) | `/403` or fallback page |

### returnUrl (target)

```tsx
// AuthGuard when redirecting to login
router.replace(`/login?returnUrl=${encodeURIComponent(pathname)}`);

// LoginForm after success
const returnUrl = searchParams.get("returnUrl");
router.replace(returnUrl && isAllowedPath(returnUrl) ? returnUrl : defaultPath);
```

`isAllowedPath` prevents open redirect attacks — only internal paths allowed.

---

## 7. Loading States During Guard Evaluation

All guards show loading while evaluating — never flash protected content:

```tsx
if (!isReady || !isAuthenticated) {
  return <LoadingState variant="brand" label="Loading workspace…" />;
}
```

Use `variant="brand"` for full-screen auth transitions; `variant="page"` for inline guards.

---

## 8. Middleware (target)

Optional Next.js middleware for edge-level protection:

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token");
  if (!token && isProtectedPath(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
}
```

**Current:** Client-side guards only (Zustand localStorage token).  
**Target:** Complement with middleware reading httpOnly session cookie.

---

## 9. API Route Protection

Frontend BFF routes (if any) must validate JWT server-side. ERP data flows directly to backend API with Bearer token — no Next.js API proxy today.

---

## 10. Public Routes Reference

| Route | Guard | Notes |
|-------|-------|-------|
| `/login` | GuestGuard | Auth slider |
| `/register` | GuestGuard | Org registration |
| `/forgot-password` | GuestGuard | Target |
| `/reset-password` | GuestGuard | Target — token in query |
| `/mfa` | Partial auth | Target — mfaToken in session |

---

## 11. Protected Routes Reference

All routes under `(app)/` require authentication. Notable role-restricted:

| Route | Additional guard |
|-------|------------------|
| `/dashboard/executive` | `DashboardGuard` |
| `/dashboard/finance` | `DashboardGuard` |
| `/dashboard/fundraising` | `DashboardGuard` |
| `/admin/settings` | `AdminGuard` |
| `/admin/users` | `AdminGuard` |
| `/platform/*` | `PlatformAuthGuard` |

---

## 12. 403 Unauthorized Page (target)

```tsx
// app/(app)/unauthorized/page.tsx
export default function UnauthorizedPage() {
  return (
    <EmptyState
      title="Access denied"
      description="You don't have permission to view this page."
      action={<Button asChild><Link href="/">Go to dashboard</Link></Button>}
    />
  );
}
```

Use when user is authenticated but lacks permission — distinct from login redirect.

---

## 13. Navigation vs Route Protection

Hiding a nav item does **not** protect the route. Always:

1. Filter nav via `canAccessNavItem`
2. Guard page via layout or page-level guard

Users can bookmark URLs directly.

---

## 14. Checklist

- [ ] `(app)` layout uses `AuthGuard`
- [ ] `(auth)` layout uses `GuestGuard`
- [ ] Platform routes use `PlatformAuthGuard`
- [ ] Admin pages use `AdminGuard`
- [ ] Dashboard pages use `DashboardGuard`
- [ ] Loading state during guard evaluation
- [ ] No protected content flash before redirect
- [ ] returnUrl support (target)
- [ ] 403 page for authenticated denial (target)
- [ ] Middleware complement (target)
