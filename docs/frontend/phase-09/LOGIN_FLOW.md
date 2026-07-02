# Login Flow

**Phase:** 09 — Authentication & Identity Experience  
**Routes:** `/login`, `/register`  
**Layout:** `(auth)/layout.tsx` with `GuestGuard`

---

## 1. Flow Overview

```
User visits /login
    ↓
GuestGuard — redirect to / if already authenticated
    ↓
AuthSlider (sign-in panel)
    ↓
LoginForm — email + password
    ↓
POST /api/v1/auth/login
    ↓
Success → setSession → router.replace(getDefaultDashboardPath(role))
Failure → ErrorAlert with safe message
```

---

## 2. Page Structure

### Login route

```tsx
// app/(auth)/login/page.tsx
export default function LoginPage() {
  return <AuthSlider initialMode="sign-in" />;
}
```

### Auth layout

- Centered full-screen layout (`min-h-screen`, `bg-muted/30`)
- Wrapped in `GuestGuard` — authenticated users redirect to `/`

### AuthSlider

Split-panel experience (Material template pattern):

| Viewport | Behaviour |
|----------|-----------|
| Desktop | Side-by-side sign-in / sign-up panels with slide animation |
| Mobile | Tab switcher between Sign in and Create account |

Reuses `LoginForm variant="panel"` and `RegisterForm variant="panel"`.

---

## 3. LoginForm Specification

**Location:** `components/auth/login-form.tsx`

### Fields

| Field | Type | Validation |
|-------|------|------------|
| Email | `email` | Zod `.email()` |
| Password | `password` | Required, min 1 char (server enforces policy) |

### Target additions

| Field | Notes |
|-------|-------|
| Show/hide password | Use Phase 07 `PasswordField` |
| Remember me | Checkbox → extended refresh token (target) |
| Forgot password | Link to `/forgot-password` |
| Environment badge | `Development` / `Staging` when `NODE_ENV !== production` |

### Submit behaviour

```tsx
async function onSubmit(values: LoginFormValues) {
  setError(null);
  try {
    const response = await login(values);
    setSession(response.data);

    // Target: if response.requiresMfa → router.replace("/mfa")
    // Target: if response.organizations.length > 1 → router.replace("/select-organization")

    router.replace(getDefaultDashboardPath(response.data.role));
  } catch (err) {
    setError(mapAuthError(err));
  }
}
```

### Loading state

- Submit button: `disabled={isSubmitting}`, label `"Signing in…"`
- No full-page spinner on submit — form stays visible

---

## 4. Post-Login Redirect

| Role | Default destination |
|------|---------------------|
| `SUPER_ADMIN` | `/platform/dashboard` |
| `FINANCE_MANAGER`, `ACCOUNTANT` | `/dashboard/finance` |
| `FUNDRAISING_MANAGER` | `/dashboard/fundraising` |
| `ORG_ADMIN`, `PROGRAM_MANAGER`, `STAFF`, others | `/dashboard/executive` |

Defined in `lib/navigation/permissions.ts` → `getDefaultDashboardPath(role)`.

**Preserve intended destination:** Target — store `?returnUrl=` from guard redirect, navigate there after login if allowed.

---

## 5. Register Flow

```
/register → AuthSlider initialMode="sign-up"
    ↓
RegisterForm — org details + user credentials
    ↓
POST /api/v1/auth/register
    ↓
setSession → dashboard redirect (same as login)
```

Registration creates organization + `ORG_ADMIN` user in one request.

---

## 6. Branding & Visual Language

Match Material + shadcn stone palette (Phase 01):

- `Card` / panel with `border-border bg-surface`
- Primary CTA: `Button` default variant, full width on mobile
- Muted background for auth pages
- Logo / product name in slider hero panel

**Demo mode indicator** (when `isMockApiEnabled()`):

```
Demo mode: use admin@demo.local with password {MOCK_DEMO_PASSWORD}
```

---

## 7. Validation (Zod)

```ts
const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
```

Server may return additional errors (account locked, password expired) — map in error handler.

---

## 8. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Labels | `Label` + `htmlFor` on every input |
| Errors | Inline under field + `ErrorAlert` for server errors |
| Focus | First invalid field on failed submit |
| Autocomplete | `email`, `current-password` |
| Keyboard | Enter submits form; tab order logical |
| Announcements | `role="alert"` on `ErrorAlert` |

---

## 9. Mobile Experience

- Full-width form on narrow screens
- Tab switcher for sign-in / sign-up (`lg:hidden`)
- Touch targets: submit button min height 44px (`h-11` on mobile)
- Password manager compatible (`autoComplete` attributes)
- No horizontal scroll on auth slider

---

## 10. Platform Login

Separate route: `/platform/login` for super-admin entry (if distinct branding needed).

Platform routes use `PlatformAuthGuard` requiring `SUPER_ADMIN` role.

---

## 11. Security Notes

- Never log passwords or tokens to console
- Clear password field on failed login (optional — balance with UX)
- Rate limiting is server-side — show generic message on 429
- HTTPS required in production (`NEXT_PUBLIC_API_BASE`)

---

## 12. Target Login Flow (with MFA + Org)

```
LoginForm submit
    ↓
API returns { requiresMfa: true, mfaToken }
    ↓
/mfa — MFAChallenge component
    ↓
POST /api/v1/auth/mfa/verify
    ↓
API returns AuthResponse OR { organizations: [...] }
    ↓
If multi-org → /select-organization
    ↓
setSession → dashboard
```

---

## 13. Checklist

- [ ] Email + password with Zod validation
- [ ] Loading state on submit button
- [ ] Safe error messages (no stack traces)
- [ ] Redirect to role-appropriate dashboard
- [ ] GuestGuard on auth layout
- [ ] Accessible labels and errors
- [ ] Responsive auth slider
- [ ] Forgot password link (target)
- [ ] Remember me (target)
- [ ] MFA redirect (target)
- [ ] returnUrl support (target)
