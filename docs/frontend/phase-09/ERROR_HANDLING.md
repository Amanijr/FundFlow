# Error Handling

**Phase:** 09 — Authentication & Identity Experience  
**Components:** `ErrorAlert`, form field errors (Phase 07)

---

## 1. Principles

| Rule | Detail |
|------|--------|
| **Actionable** | Tell user what to do next |
| **Safe** | Never expose stack traces, SQL, or internal IDs |
| **Specific** | "Invalid email or password" not "Error 401" |
| **Consistent** | Same tone and placement across auth flows |
| **Accessible** | Errors announced to screen readers |

---

## 2. Error Categories

| Category | HTTP | User action |
|----------|------|-------------|
| Validation | 400 | Fix form fields |
| Authentication | 401 | Re-enter credentials or re-login |
| Authorization | 403 | Contact admin or go back |
| Account state | 403/423 | Contact support |
| Rate limit | 429 | Wait and retry |
| Server | 5xx | Retry later |
| Network | — | Check connection |

---

## 3. Error Mapping Utility (target)

Centralize in `lib/auth/error-messages.ts`:

```ts
import { ApiError } from "@/types/api";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_CREDENTIALS: "Invalid email or password. Please try again.",
  ACCOUNT_LOCKED: "Your account has been locked. Contact your administrator.",
  ACCOUNT_DISABLED: "This account has been disabled.",
  PASSWORD_EXPIRED: "Your password has expired. Reset your password to continue.",
  MFA_INVALID_CODE: "Invalid verification code. Please try again.",
  MFA_EXPIRED: "Verification session expired. Sign in again.",
  MFA_LOCKED: "Too many attempts. Try again in 15 minutes.",
  TOKEN_EXPIRED: "Your session has expired. Sign in again.",
  TOKEN_INVALID: "Your session is invalid. Sign in again.",
  EMAIL_NOT_FOUND: "If an account exists, a reset link has been sent.", // forgot password — no enumeration
  RESET_TOKEN_EXPIRED: "This reset link has expired. Request a new one.",
  RESET_TOKEN_INVALID: "This reset link is invalid. Request a new one.",
  NETWORK_ERROR: "Unable to connect. Check your internet connection and try again.",
};

export function mapAuthError(error: unknown): string {
  if (error instanceof ApiError) {
    const code = error.code; // target: ApiError carries code from API
    if (code && AUTH_ERROR_MESSAGES[code]) {
      return AUTH_ERROR_MESSAGES[code];
    }
    if (error.status === 401) return AUTH_ERROR_MESSAGES.INVALID_CREDENTIALS;
    if (error.status === 429) return "Too many attempts. Please wait a moment and try again.";
    if (error.status >= 500) return "Something went wrong on our end. Please try again later.";
    return error.message || "Unable to complete this action.";
  }
  if (error instanceof TypeError) {
    return AUTH_ERROR_MESSAGES.NETWORK_ERROR;
  }
  return "An unexpected error occurred. Please try again.";
}
```

---

## 4. Login Errors

**Current:**

```tsx
catch (err) {
  setError(err instanceof ApiError ? err.message : "Unable to sign in");
}
```

**Target:** `setError(mapAuthError(err))`

### Display

- Form-level: `ErrorAlert` above fields
- Field-level: Zod validation under inputs

```
┌─ ErrorAlert ─────────────────────────────────────┐
│  Invalid email or password. Please try again.   │
└─────────────────────────────────────────────────┘
  Email    [________________]
  Password [________________]
```

### Do not reveal

- Whether email exists in system (login)
- Password requirements beyond policy hint
- Whether account is locked vs wrong password (optional — security vs UX tradeoff; use generic message)

---

## 5. Registration Errors

| Error | Message |
|-------|---------|
| Email taken | "An account with this email already exists." |
| Weak password | Server message or "Password must be at least 12 characters…" |
| Invalid org slug | "Organization URL is already taken." |
| Validation | Field-level Zod errors |

---

## 6. Password Recovery Errors

### Forgot password

Always show success — prevent email enumeration:

```
"If an account exists for that email, we've sent password reset instructions."
```

Even on 404 from API (server should return 200 always).

### Reset password

| State | Message |
|-------|---------|
| Expired token | "This reset link has expired." + link to request new |
| Invalid token | "This reset link is invalid." |
| Password mismatch | "Passwords do not match." |
| Weak password | Policy message from server |

---

## 7. Session Errors

### Expired session (401 on API call)

**Target interceptor behaviour:**

1. Attempt token refresh
2. On failure → `clearSession()`
3. Toast: "Your session has expired. Please sign in again."
4. Redirect: `/login?reason=session_expired`

Login page shows banner when `reason=session_expired`:

```tsx
{reason === "session_expired" && (
  <WarningAlert message="Your session has expired. Sign in to continue." />
)}
```

### Idle timeout

`SessionTimeoutDialog` before forced logout — not an error, proactive warning.

---

## 8. MFA Errors

| Error | Display |
|-------|---------|
| Wrong code | Inline under input + shake animation |
| Expired mfaToken | Redirect to login with message |
| Locked | Full-page message with countdown |

Clear code input on failed attempt; focus input.

---

## 9. Authorization Errors (403)

When authenticated user hits forbidden route:

- Redirect to `/unauthorized` (target)
- Or show inline `ErrorAlert`: "You don't have permission to access this resource."

Do not redirect to login — user is authenticated.

---

## 10. Network Errors

```tsx
catch (err) {
  if (!navigator.onLine) {
    setError("You appear to be offline. Check your connection.");
    return;
  }
  setError(mapAuthError(err));
}
```

Retry button on transient failures.

---

## 11. Loading vs Error States

| State | UI |
|-------|-----|
| Submitting | Button disabled + "Signing in…" |
| Guard loading | `LoadingState` — not an error |
| API error | `ErrorAlert` — replaces or supplements loading |
| Empty | N/A for auth forms |

Never show error and loading simultaneously.

---

## 12. ApiError Enhancement (target)

```ts
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly details?: { field: string; message: string }[],
  ) {}
}
```

Parse from API envelope:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "INVALID_CREDENTIALS",
  "data": null
}
```

---

## 13. Accessibility

```tsx
<ErrorAlert message={error} role="alert" aria-live="assertive" />
```

- Assertive live region for auth failures (immediate announcement)
- Associate field errors with `aria-describedby`
- Focus `ErrorAlert` on server error (target)

---

## 14. Development vs Production

| Environment | Behaviour |
|-------------|-------------|
| Development | `console.error` full error for debugging |
| Production | User-safe message only |
| Mock API | Demo credentials hint on login panel |

Never show `NEXT_PUBLIC_*` secrets or tokens in error UI.

---

## 15. Checklist

- [ ] Central `mapAuthError` utility
- [ ] Login uses safe credential message
- [ ] Forgot password prevents email enumeration
- [ ] Reset password handles expired/invalid tokens
- [ ] Session expired banner on login
- [ ] 403 distinct from 401
- [ ] Network offline message
- [ ] `role="alert"` on error components
- [ ] No sensitive data in error messages
