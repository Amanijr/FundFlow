# Platform Owner Dashboard

The **platform owner dashboard** (`SUPER_ADMIN`) is the single control center for full cross-tenant access. Everything except one-time bootstrap lives under `/api/v1/platform/dashboard`.

## Bootstrap (one-time)

```http
POST /api/v1/platform/bootstrap
X-Platform-Bootstrap-Secret: <secret>
```

After the first super admin exists, sign in and use the dashboard for all platform operations.

## Unified dashboard

```http
GET /api/v1/platform/dashboard
Authorization: Bearer <super-admin-token>
```

Returns in **one response**:

| Section | Contents |
|---------|----------|
| `platformStats` | Organizations, users, super-admin counts |
| `inactiveOrganizations` | Deactivated tenants |
| Observability | `logsLast24Hours`, `errorsLast24Hours`, `securityEventsLast24Hours`, `unresolvedAlerts` |
| `organizations` | Full tenant directory |
| `users` | All users across every organization |
| `recentActivity` | Latest 50 system log entries |
| `recentAlerts` / `recentErrors` | Actionable and critical items |

## Dashboard sub-resources

All require `SUPER_ADMIN` JWT.

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/v1/platform/dashboard/stats` | Quick stats refresh |
| GET | `/api/v1/platform/dashboard/organizations` | List tenants |
| GET | `/api/v1/platform/dashboard/organizations/{id}` | Tenant detail |
| PUT | `/api/v1/platform/dashboard/organizations/{id}/status` | Activate/deactivate tenant |
| GET | `/api/v1/platform/dashboard/users` | Cross-tenant user directory |
| POST | `/api/v1/platform/dashboard/super-admins` | Add platform owner |
| GET | `/api/v1/platform/dashboard/logs` | Search system logs |
| GET | `/api/v1/platform/dashboard/logs/{id}` | Log detail |
| PUT | `/api/v1/platform/dashboard/logs/{id}/resolve` | Resolve alert |

### Log search parameters

- `type` — `EVENT`, `ERROR`, `EXCEPTION`, `ALERT`, `SECURITY`
- `severity` — `INFO`, `WARNING`, `ERROR`, `CRITICAL`
- `category` — e.g. `API`, `AUTH`, `PLATFORM`
- `organizationId` — filter by tenant
- `alertsOnly` — unresolved alerts only
- `from` / `to` — date range (default: last 7 days)

## Acting inside a tenant

Super admins are not bound to one organization. To work with tenant data (donations, church modules, analytics, etc.):

```http
X-Organization-Id: 42
Authorization: Bearer <super-admin-token>
```

## What gets logged automatically

| Source | Category |
|--------|----------|
| All API requests | `API` |
| Exceptions | `APPLICATION`, `VALIDATION`, `SECURITY`, `SYSTEM` |
| Auth | `AUTH`, `TENANT` |
| Platform actions | `PLATFORM` |

Failed logins and 5xx errors auto-create **ALERT** rows visible on the dashboard.

See also: [RBAC_MATRIX.md](RBAC_MATRIX.md)
