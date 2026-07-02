# MFA Guide

**Phase:** 09 — Authentication & Identity Experience  
**Status:** Planned — not yet implemented in frontend

---

## 1. Purpose

Multi-Factor Authentication adds a second verification step after valid credentials. FundFlow supports MFA for organizations that require enhanced security.

---

## 2. Supported Methods

| Method | Priority | Status |
|--------|----------|--------|
| Authenticator app (TOTP) | P0 | Target |
| Email OTP | P0 | Target |
| SMS OTP | P2 | Future |
| Hardware key (WebAuthn) | P3 | Future |

Users enroll via Security settings; org admins may enforce MFA policy.

---

## 3. Login Flow with MFA

```
POST /api/v1/auth/login { email, password }
    ↓
Response A — success (no MFA):
  { accessToken, userId, role, ... }
    ↓
  setSession → dashboard

Response B — MFA required:
  { requiresMfa: true, mfaToken: "...", methods: ["totp", "email"] }
    ↓
  Store mfaToken in sessionStorage (short-lived, not persisted)
    ↓
  router.replace("/mfa")
    ↓
MFAChallenge component
    ↓
POST /api/v1/auth/mfa/verify { mfaToken, code, method }
    ↓
  { accessToken, ... } → setSession → dashboard
```

---

## 4. MFAChallenge Component (target)

**Route:** `/mfa`  
**Guard:** Requires valid `mfaToken` in memory — redirect to `/login` if missing/expired

### UI elements

| Element | Detail |
|---------|--------|
| Title | "Verify your identity" |
| Method tabs | TOTP / Email (if multiple available) |
| Code input | 6-digit OTP, `inputMode="numeric"` |
| Submit | Verify button with loading state |
| Resend | Email OTP only — 60s cooldown |
| Recovery | "Use recovery code" link |
| Cancel | Return to login (clear mfaToken) |

### TOTP input

```tsx
// 6 separate boxes or single input with pattern
<Input
  maxLength={6}
  inputMode="numeric"
  autoComplete="one-time-code"
  aria-label="Authentication code"
/>
```

### Email OTP

- "We sent a code to j***@example.com"
- Resend button with countdown timer

---

## 5. Recovery Codes

Generated at MFA enrollment:

- 10 single-use codes
- Displayed once — user must save
- Input on `/mfa` via "Use recovery code" — accepts 8-char alphanumeric

```tsx
POST /api/v1/auth/mfa/verify
{ mfaToken, recoveryCode: "ABCD-1234" }
```

Each code invalidated after use.

---

## 6. MFA Enrollment (Security Settings)

**Route:** `/settings/security` (target)

### TOTP setup flow

```
User clicks "Enable authenticator app"
    ↓
GET /api/v1/auth/mfa/setup/totp
    ↓
Display QR code + manual secret
    ↓
User enters code from app to confirm
    ↓
POST /api/v1/auth/mfa/confirm { code }
    ↓
Display recovery codes → user acknowledges saved
    ↓
mfaEnabled: true on profile
```

### Email OTP setup

Verify email ownership before enabling.

---

## 7. Organization MFA Policy (target)

Org admin setting:

| Policy | Behaviour |
|--------|-----------|
| Optional | Users may enroll voluntarily |
| Required for admins | `ORG_ADMIN`, `FINANCE_MANAGER` must enroll |
| Required for all | All users must complete MFA at next login |

Login response includes `requiresMfa: true` when policy applies and user has MFA enrolled.

---

## 8. API Contracts (target)

### Login response (MFA branch)

```json
{
  "success": true,
  "data": {
    "requiresMfa": true,
    "mfaToken": "eyJ...",
    "availableMethods": ["totp", "email"],
    "maskedEmail": "j***@example.com"
  }
}
```

### Verify MFA

```
POST /api/v1/auth/mfa/verify
{
  "mfaToken": "eyJ...",
  "method": "totp",
  "code": "123456"
}
```

### Errors

| Code | Message |
|------|---------|
| `MFA_INVALID_CODE` | Invalid code. Try again. |
| `MFA_EXPIRED` | Session expired. Sign in again. |
| `MFA_LOCKED` | Too many attempts. Try again in 15 minutes. |
| `RECOVERY_CODE_USED` | This recovery code has already been used. |

---

## 9. State Management

```ts
// Short-lived — sessionStorage only
interface MfaState {
  mfaToken: string | null;
  methods: ("totp" | "email")[];
  maskedEmail?: string;
  setMfaChallenge: (data: MfaChallengeResponse) => void;
  clearMfaChallenge: () => void;
}
```

Never persist MFA tokens in `localStorage` alongside access tokens.

---

## 10. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Code input | `aria-label`, `autoComplete="one-time-code"` |
| Error | `role="alert"` on failed verification |
| Focus | Auto-focus code input on mount |
| Screen reader | Announce method ("Enter the 6-digit code from your authenticator app") |

---

## 11. Mobile

- SMS/email OTP benefits from mobile delivery
- TOTP works with any authenticator app
- Large touch targets on code input
- Paste support for 6-digit codes from clipboard

---

## 12. Security Notes

- Rate limit verification attempts (server)
- `mfaToken` expires in 5 minutes
- Do not reveal whether email exists during MFA — generic errors on login
- Recovery codes are hashed server-side
- Log MFA events in audit trail

---

## 13. Implementation Roadmap

| Step | Deliverable |
|------|-------------|
| 1 | `MfaChallenge` component + `/mfa` route |
| 2 | Login form MFA branch + mfa session store |
| 3 | TOTP enrollment in security settings |
| 4 | Email OTP + resend |
| 5 | Recovery code flow |
| 6 | Org MFA policy UI (admin) |

---

## 14. Checklist

- [ ] MFA challenge page after login
- [ ] TOTP 6-digit input with validation
- [ ] Email OTP with resend cooldown
- [ ] Recovery code alternative
- [ ] mfaToken in sessionStorage only
- [ ] Clear error messages without leaking info
- [ ] Accessible code input
- [ ] Enrollment flow in settings
