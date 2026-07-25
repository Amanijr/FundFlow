# Session Management

**Phase:** 09 — Authentication & Identity Experience  
**Store:** `stores/auth-store.ts`  
**Persistence:** Zustand `persist` → `localStorage` key `fundflow-auth`

---

## 1. Session Model

A session consists of:

| Artifact | Storage | Lifetime |
|----------|---------|----------|
| Access token | Zustand persist (localStorage) | Short-lived (JWT exp) |
| User profile | Zustand persist (localStorage) | Session |
| Refresh token | **Target:** httpOnly cookie | Long-lived |
| Hydration flag | Memory only (`_hasHydrated`) | Tab |

```ts
interface AuthState {
  accessToken: string | null;
  user: SessionUser | null;
  _hasHydrated: boolean;
}
```

---

## 2. Session Lifecycle

```
Login success
    ↓
setSession(AuthResponse) — token + user written to store
    ↓
Persist middleware saves to localStorage
    ↓
App loads → rehydrate from localStorage
    ↓
_hasHydrated = true → guards evaluate isAuthenticated
    ↓
API calls include Bearer token
    ↓
Token expires / 401 → refresh or logout
    ↓
clearSession() → localStorage cleared → redirect /login
```

---

## 3. Hydration & Ready State

**Problem:** On first paint, persisted state may not be loaded yet.

**Solution:**

```ts
onRehydrateStorage: () => (state) => {
  state?.setHasHydrated(true);
}
```

Guards wait for `isReady` (`_hasHydrated`) before redirecting:

```tsx
// AuthGuard
if (!isReady) return <LoadingState variant="brand" />;
if (!isAuthenticated) router.replace("/login");
```

Avoids flash redirect to login when user has valid persisted session.

---

## 4. Token Usage

Every authenticated API call:

```ts
apiRequest(path, {
  token: accessToken,
  organizationId,
});
```

Client sets:

```
Authorization: Bearer {accessToken}
X-Organization-Id: {organizationId}
```

**401 handling (target):** Intercept in `apiRequest` → attempt refresh → retry once → `clearSession` on failure.

---

## 5. Refresh Token Strategy (target)

```
Access token expires (or proactive refresh at 80% TTL)
    ↓
POST /api/v1/auth/refresh (refresh token in httpOnly cookie)
    ↓
New access token + rotated refresh token
    ↓
setSession(updatedAuth)
    ↓
Retry queued API requests
```

| Rule | Detail |
|------|--------|
| Rotation | Each refresh invalidates previous refresh token |
| Concurrent tabs | Broadcast channel syncs token across tabs |
| Failure | All tabs logout on refresh failure |

**Do not** store refresh tokens in `localStorage`.

---

## 6. Remember Me (target)

| Remember me | Behaviour |
|-------------|-----------|
| Unchecked | Session ends on browser close (sessionStorage or short refresh TTL) |
| Checked | Persistent refresh token (30 days) in httpOnly cookie |

Login form checkbox → `rememberMe: boolean` on login request body.

---

## 7. Session Timeout

### Idle timeout (target)

```
User inactive for N minutes
    ↓
SessionTimeoutDialog — "Your session will expire in 60 seconds"
    ↓
User clicks "Stay signed in" → refresh token
    ↓
No action → clearSession() → /login?reason=timeout
```

Default idle: 30 minutes (configurable per org policy).

### Absolute timeout

Server-enforced max session duration regardless of activity. Client shows message on 401 with `code: SESSION_EXPIRED`.

---

## 8. Logout

**Current implementation** (`UserMenu`):

```tsx
function handleLogout() {
  clearSession();
  router.replace("/login");
}
```

**Target:**

```tsx
async function handleLogout() {
  try {
    await logout(accessToken); // POST /api/v1/auth/logout
  } finally {
    clearSession();
    queryClient.clear(); // TanStack Query cache
    router.replace("/login");
  }
}
```

Logout must:

- Clear auth store
- Clear React Query cache (prevent data leak to next user)
- Invalidate refresh cookie (server)
- Redirect to login

---

## 9. Concurrent Sessions (target)

Server may limit active sessions per user. On login from new device:

- Option A: Invalidate other sessions
- Option B: Allow concurrent with session list in Security settings

Frontend displays active sessions in user profile (future).

---

## 10. Profile Refresh

On app focus or interval, refresh user profile:

```tsx
const { data } = useQuery({
  queryKey: ["auth", "me"],
  queryFn: () => getCurrentUser(token!),
  enabled: Boolean(token),
  staleTime: 5 * 60_000,
});
```

Update store when role or org changes: `setUser(data)`.

---

## 11. Super Admin Org Context

`platform-store.selectedOrganizationId` persists separately from auth store.

On org switch:

```tsx
setSelectedOrganizationId(id);
queryClient.invalidateQueries(); // all tenant-scoped data
```

Session token unchanged — only `X-Organization-Id` header changes.

---

## 12. Security Checklist

| Rule | Status |
|------|--------|
| No passwords in store | ✅ |
| Access token not in URL | ✅ |
| HTTPS in production | Required |
| Clear cache on logout | Target |
| Refresh in httpOnly cookie | Target |
| Token refresh on 401 | Target |
| Idle timeout warning | Target |
| Cross-tab session sync | Target |

---

## 13. Loading Experience

| Moment | UI |
|--------|-----|
| Rehydrating auth | `LoadingState variant="brand"` |
| Profile fetch | Skeleton in user menu (target) |
| Token refresh | Silent — no UI unless fails |
| Post-login redirect | Brief loading in guard |

Never show blank white screen during auth transitions.

---

## 14. Implementation Roadmap

| Step | Deliverable |
|------|-------------|
| 1 | 401 interceptor + refresh in `apiRequest` |
| 2 | `logout()` API call + query cache clear |
| 3 | `SessionTimeoutDialog` + idle timer hook |
| 4 | Remember me on login |
| 5 | Cross-tab `BroadcastChannel` for token sync |
| 6 | `useSession` hook exposing `status: authenticated \| refreshing \| expired` |
