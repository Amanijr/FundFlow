# Real-Time Strategy

**Phase:** 10 — Notification & Activity Center

---

## 1. Goals

- Deliver new notifications without manual refresh
- Update unread badge count in real time
- Optionally append activity timeline events on open pages
- Degrade gracefully when WebSocket/SSE unavailable

---

## 2. Transport Options

| Transport | Pros | Cons | FundFlow recommendation |
|-----------|------|------|-------------------------|
| **WebSocket** | Bidirectional, low latency | Infra complexity, reconnect logic | **Primary** when backend supports |
| **Server-Sent Events (SSE)** | Simple, HTTP-native, auto-reconnect | Unidirectional only | **Good alternative** for notification push |
| **Polling** | Works everywhere | Higher load, delay | **Fallback** always available |

---

## 3. Recommended Architecture

```
                    ┌─────────────────┐
                    │  Backend        │
                    │  Notification   │
                    │  Service        │
                    └────────┬────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         WebSocket         SSE          REST poll
              │              │              │
              └──────────────┼──────────────┘
                             ▼
              frontend/hooks/use-notification-socket.ts
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
        Invalidate        Append         Update
        TanStack Query    to cache       unread count
                             │
                             ▼
              NotificationBell + NotificationCenter
```

**Single hook** abstracts transport — UI never branches on WebSocket vs SSE.

---

## 4. Connection Lifecycle

```
disconnected → connecting → connected
       ↑            │            │
       └────────────┴────────────┘
              (error / close)
                    ↓
              polling fallback
```

### Connection states (UI)

| State | Bell indicator | Behaviour |
|-------|----------------|-----------|
| `connected` | Normal | Live updates |
| `polling` | None (or subtle) | Poll every 30–60s |
| `disconnected` | Amber dot | Show retry in center |

---

## 5. WebSocket Protocol (target)

**Endpoint:** `wss://{api}/ws/notifications?token={jwt}`

**Subscribe message (client → server):**

```json
{
  "type": "subscribe",
  "organizationId": 1
}
```

**Event message (server → client):**

```json
{
  "type": "notification.created",
  "payload": { /* Notification */ }
}
```

**Other event types:**

| Type | Action |
|------|--------|
| `notification.created` | Prepend to list, increment unread |
| `notification.updated` | Patch item (read, archived) |
| `notification.deleted` | Remove from cache |
| `unread.count` | Set badge count directly |
| `activity.created` | Invalidate activity query if on entity page |

---

## 6. SSE Alternative (target)

**Endpoint:** `GET /api/v1/notifications/stream`

Headers: `Authorization`, `X-Organization-Id`, `Accept: text/event-stream`

```
event: notification
data: {"id":"...","title":"..."}

event: unread-count
data: {"count":5}
```

Use `EventSource` with polyfill for auth (token via query param or cookie session).

---

## 7. Polling Fallback

When WebSocket/SSE fails after N retries:

```ts
const POLL_INTERVAL_MS = 30_000;

useQuery({
  queryKey: ["notifications", "unread-count", orgId],
  queryFn: fetchUnreadCount,
  refetchInterval: connectionStatus === "polling" ? POLL_INTERVAL_MS : false,
});
```

Full list refetch on panel open — not continuous polling of full list.

| Query | Poll when disconnected? |
|-------|-------------------------|
| Unread count | Yes (30s) |
| Full notification list | No — refetch on open only |
| Activity feed | No — refetch on focus |

---

## 8. Hook Design

```ts
// hooks/use-notification-socket.ts

interface UseNotificationSocketOptions {
  enabled?: boolean;
  onNotification?: (n: Notification) => void;
}

export function useNotificationSocket(options?: UseNotificationSocketOptions) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<ConnectionStatus>("disconnected");

  useEffect(() => {
    if (!enabled || !token) return;

    const transport = createNotificationTransport({
      url: getWsUrl(),
      token,
      organizationId,
      onMessage: handleMessage,
      onStatusChange: setStatus,
    });

    transport.connect();
    return () => transport.disconnect();
  }, [enabled, token, organizationId]);

  return { connectionStatus: status };
}
```

### Cache updates on push

```ts
function handleNotificationCreated(n: Notification) {
  queryClient.setQueryData(["notifications", orgId], (old) =>
    old ? [n, ...old] : [n],
  );
  queryClient.setQueryData(["notifications", "unread-count", orgId], (c) => (c ?? 0) + 1);

  // Optional: toast for critical only
  if (n.severity === "critical") {
    toast({ title: n.title, variant: "destructive" });
  }
}
```

---

## 9. Integration Points

| Location | Real-time behaviour |
|----------|---------------------|
| `AppProviders` or `AuthGuard` | Start socket when authenticated |
| `NotificationDropdown` / `NotificationCenter` | Subscribe while open (optional second channel) |
| `ActivityTimeline` on detail page | Invalidate on `activity.created` for matching entity |
| `SessionTimeoutDialog` | Not via notification socket — separate timer (Phase 09) |

Start connection once per authenticated session — not per dropdown open.

---

## 10. Reconnection Strategy

```ts
const RECONNECT_DELAYS = [1000, 2000, 5000, 10000, 30000]; // ms

function reconnect(attempt: number) {
  const delay = RECONNECT_DELAYS[Math.min(attempt, RECONNECT_DELAYS.length - 1)];
  setTimeout(() => connect(), delay);
}
```

After 5 failed attempts → switch to `polling` mode.

On tab focus (`visibilitychange`): attempt reconnect if `disconnected`.

---

## 11. Security

- Authenticate WebSocket with short-lived JWT or session cookie
- Validate `organizationId` on server — never trust client subscribe alone
- Do not send notification body for records user cannot access
- Rate-limit connection attempts

---

## 12. Performance

| Concern | Mitigation |
|---------|------------|
| Notification flood | Debounce badge updates (100ms) |
| Large lists | Paginate; push only appends to first page |
| Memory | Cap client cache to 100 items; refetch on scroll |
| Duplicate events | Dedupe by `notification.id` on insert |

---

## 13. Mock / Dev Mode

When `NEXT_PUBLIC_API_MOCK=true`:

- No WebSocket — use polling simulation or MSW push
- MSW handler can expose `POST /mock/notifications/push` for dev testing
- `connectionStatus` always `polling` in mock

---

## 14. Accessibility

New notifications via push:

```tsx
<div aria-live="polite" aria-atomic="false" className="sr-only">
  {announcement}
</div>
```

Set `announcement` briefly when `notification.created` received: "New notification: {title}".

Do not steal focus on push — announce only.

---

## 15. Checklist

- [ ] `useNotificationSocket` hook
- [ ] Transport abstraction (WS / SSE / poll)
- [ ] Reconnection with exponential backoff
- [ ] Polling fallback for unread count
- [ ] Cache invalidation / append on events
- [ ] Connection status on bell icon
- [ ] Live region announcements
- [ ] Mock dev push endpoint
- [ ] Backend WebSocket or SSE endpoint documented for API team
