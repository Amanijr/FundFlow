# Platform Owner Guide

**Audience:** `SUPER_ADMIN` only — FundFlow SaaS operators, not nonprofit staff  
**Console:** `/platform/dashboard`

---

## What you do

Super admins manage the **entire FundFlow installation**:

- All **organizations** (tenants)  
- Cross-tenant **user directory**  
- **System health**, logs, and security alerts  
- **Bootstrap** the first super admin on a new deployment  

Day-to-day nonprofit work (donations, expenses) happens in the **organization app** at `/dashboard/*`, not here.

---

## First-time bootstrap

On a fresh server, create the first super admin **once**:

### Option A — Web UI (development)

1. Open `/platform/bootstrap`  
2. Enter bootstrap secret (matches server config `app.platform.bootstrap-secret`)  
3. Create super admin account  

### Option B — API

```http
POST /api/v1/platform/bootstrap
```

With bootstrap secret in the request body per API docs.

After bootstrap, use normal **login** — you redirect to `/platform/dashboard`.

---

## Navigation

| Screen | Path |
|--------|------|
| Overview | `/platform/dashboard` |
| Organizations | `/platform/dashboard/organizations` |
| Organization detail | `/platform/dashboard/organizations/[id]` |
| Users | `/platform/dashboard/users` |
| System logs | `/platform/dashboard/logs` |
| Log detail | `/platform/dashboard/logs/[id]` |

---

## Guide 1 — Platform dashboard overview

1. Sign in as super admin  
2. Open `/platform/dashboard`  

Snapshot includes:

- Total organizations and users  
- Recent platform events  
- Active **alerts** (errors, security issues)  
- Quick links to orgs and logs  

---

## Guide 2 — Manage organizations

1. **Organizations** (`/platform/dashboard/organizations`)  
2. Browse or search tenants  
3. Open organization detail (`/platform/dashboard/organizations/[id]`)  
4. Actions:
   - View status and metadata  
   - **Enable / disable** organization (`PUT .../status`)  

Disabled organizations cannot operate until re-enabled.

---

## Guide 3 — Manage platform users

1. **Users** (`/platform/dashboard/users`)  
2. View cross-tenant user directory  
3. **Create super admin** — promote trusted operators only  

Organization-level users are still managed by each org's `ORG_ADMIN` at `/admin/users`.

---

## Guide 4 — System logs and alerts

**Path:** `/platform/dashboard/logs`

| Log type | Meaning |
|----------|---------|
| `EVENT` | Normal operations |
| `SECURITY` | Auth failures, access issues |
| `ERROR` | Handled application errors (4xx) |
| `EXCEPTION` | Unhandled / 5xx errors |
| `ALERT` | Actionable items for you |

### Filter logs

Use query filters: `type`, `severity`, `category`, `organizationId`, `alertsOnly`, `from`, `to`.

### Resolve alerts

1. Open log detail (`/platform/dashboard/logs/[id]`)  
2. Investigate root cause  
3. **Resolve** when addressed  

---

## Guide 5 — Act on behalf of a tenant

Super admins have **no default organization**. To call org-scoped APIs (donations, expenses, church, etc.):

```http
X-Organization-Id: <organizationId>
Authorization: Bearer <super-admin-token>
```

Use this for support investigations — document actions in your internal procedures.

---

## Guide 6 — API exploration

- **Swagger UI:** http://localhost:8080/swagger-ui.html  
- **Platform tag:** `/api/v1/platform/*`  
- See [SWAGGER.md](../SWAGGER.md) and [RBAC_MATRIX.md](../RBAC_MATRIX.md)  

---

## Security practices

- Rotate `JWT_SECRET` and `PLATFORM_BOOTSTRAP_SECRET` in production  
- Limit super admin accounts to essential operators  
- Review `SECURITY` and `ALERT` logs daily in production  
- Never share bootstrap secret in client-side code  

---

## Observability

See [PLATFORM_OBSERVABILITY.md](../PLATFORM_OBSERVABILITY.md) for health endpoints, log categories, and alert automation.

---

**Related:** [Getting Started](./getting-started.md) · [SWAGGER.md](../SWAGGER.md) · [RBAC_MATRIX.md](../RBAC_MATRIX.md)
