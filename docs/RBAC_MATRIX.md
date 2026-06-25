# RBAC Permission Matrix

FundFlow ERP uses **JWT authentication** plus **role-based access control** (`@PreAuthorize`) on write operations. All data is **tenant-scoped** to the user's organization.

## Roles

| Role | Description |
|------|-------------|
| `ORG_ADMIN` | Organization owner; broadest access; manages users and org settings |
| `FINANCE_MANAGER` | Funds, expenses, budgets, accounting, financial approvals |
| `FUNDRAISING_MANAGER` | Donors, donations, campaigns, pledges, collections |
| `PROGRAM_MANAGER` | Programs, grants, beneficiaries, school sponsorships |
| `STAFF` | Day-to-day data entry |
| `ACCOUNTANT` | Chart of accounts creation; read access to accounting |
| `SUPER_ADMIN` | Platform-wide operator; manages all organizations and users |
| `VOLUNTEER`, `AUDITOR`, `DONOR`, `VIEW_ONLY` | Defined for future use; not enforced on endpoints yet |

**Legend:** **Auth** = any authenticated user · **Public** = no JWT required · ✓ = role allowed · ✗ = forbidden (403)

User management (`/api/v1/users`) is **ORG_ADMIN only**.  
Platform management (`/api/v1/platform`) is **SUPER_ADMIN only**.

---

## Platform — `/api/v1/platform`

| Endpoint | SUPER_ADMIN | Others |
|----------|-------------|--------|
| POST `/bootstrap` | Public with bootstrap secret (first super admin only) | — |
| POST `/super-admins` | ✓ | ✗ |
| GET `/stats` | ✓ | ✗ |
| GET `/organizations`, `/{id}` | ✓ | ✗ |
| PUT `/organizations/{id}/status` | ✓ | ✗ |
| GET `/users` | ✓ | ✗ |

**Acting on an organization:** super admins have no default tenant. For org-scoped APIs, pass header `X-Organization-Id: <orgId>`.

---

## Module summary

| Module | Create / Write | Approve / Pay / Close | Delete | Read |
|--------|----------------|------------------------|--------|------|
| Auth | Public: register, login | — | — | Auth: `/me` |
| Users | ORG_ADMIN: invite | ORG_ADMIN: update role | — | ORG_ADMIN |
| Organization | ORG_ADMIN: update | — | — | Auth |
| Donors | ADMIN, FUNDRAISING, FINANCE, STAFF | — | ADMIN, FUNDRAISING | Auth |
| Donations | ADMIN, FUNDRAISING, FINANCE, STAFF | — | — | Auth |
| Payments | Gateway: +FUNDRAISING, STAFF; Manual: ADMIN, FINANCE | — | — | — |
| Pledges | ADMIN, FUNDRAISING, STAFF | — | — | Auth |
| Recurring | ADMIN, FUNDRAISING, STAFF | — | — | Auth |
| Campaigns | ADMIN, FUNDRAISING, STAFF | — | ADMIN, FUNDRAISING | Auth |
| Collections | ADMIN, FUNDRAISING, STAFF | Verify/deposit: ADMIN, FINANCE | — | Auth |
| Communications | ADMIN, FINANCE, FUNDRAISING | — | — | Auth |
| Funds | ADMIN, FINANCE | — | — | Auth |
| Expenses | Create/submit: ADMIN, FINANCE, STAFF | Approve/pay: ADMIN, FINANCE | — | Auth |
| Budgets | ADMIN, FINANCE | Approve/activate/close: ADMIN, FINANCE | Lines: ADMIN, FINANCE | Auth |
| Accounting | Init: ADMIN, FINANCE; COA: +ACCOUNTANT | — | — | Auth |
| Reports | — | — | — | Auth |
| Analytics | — | — | — | Auth |
| Programs | ADMIN, FINANCE, PROGRAM | — | — | Auth |
| Grants | ADMIN, FINANCE, PROGRAM | Activate/close: ADMIN, FINANCE | — | Auth |
| Beneficiaries | ADMIN, FINANCE, PROGRAM, STAFF | — | — | Auth (+ NGO/School vertical) |
| Church | ADMIN, FINANCE, STAFF | — | — | Auth (+ Church vertical) |
| School | ADMIN, FINANCE, PROGRAM, STAFF | — | — | Auth (+ School vertical) |

*ADMIN = ORG_ADMIN*

---

## User management — `/api/v1/users`

| Endpoint | ORG_ADMIN | Others |
|----------|-----------|--------|
| POST `/` (invite user) | ✓ | ✗ |
| GET `/` (list org users) | ✓ | ✗ |
| GET `/{id}` | ✓ | ✗ |
| PUT `/{id}/role` | ✓ | ✗ |

Assignable roles: all except `SUPER_ADMIN` and `DONOR`. Admins cannot change their own role.

---

## Authentication — `/api/v1/auth`

| Endpoint | Public | Auth |
|----------|--------|------|
| POST `/register` | ✓ | — |
| POST `/login` | ✓ | — |
| GET `/me` | — | ✓ |

---

## Organization — `/api/v1/organizations`

| Endpoint | ORG_ADMIN | Other roles |
|----------|-----------|-------------|
| GET `/me` | Auth | Auth |
| PUT `/me` | ✓ | ✗ |

---

## Donors — `/api/v1/donors`

| Endpoint | ORG_ADMIN | FINANCE | FUNDRAISING | STAFF |
|----------|-----------|---------|-------------|-------|
| POST `/`, PUT `/{id}` | ✓ | ✓ | ✓ | ✓ |
| DELETE `/{id}` | ✓ | ✗ | ✓ | ✗ |
| GET `/`, GET `/{id}` | Auth | Auth | Auth | Auth |

---

## Donations — `/api/v1/donations`

| Endpoint | ORG_ADMIN | FINANCE | FUNDRAISING | STAFF |
|----------|-----------|---------|-------------|-------|
| POST `/` | ✓ | ✓ | ✓ | ✓ |
| GET `/`, GET `/{id}` | Auth | Auth | Auth | Auth |

---

## Payments — `/api/v1/donations/{id}/payments`

| Endpoint | ORG_ADMIN | FINANCE | FUNDRAISING | STAFF |
|----------|-----------|---------|-------------|-------|
| POST `/gateway` | ✓ | ✓ | ✓ | ✓ |
| POST `/manual` | ✓ | ✓ | ✗ | ✗ |

---

## Expenses — `/api/v1/expenses`

| Endpoint | ORG_ADMIN | FINANCE | STAFF |
|----------|-----------|---------|-------|
| POST `/`, PUT `/{id}`, POST `/{id}/submit` | ✓ | ✓ | ✓ |
| POST `/{id}/approve`, `/reject`, `/pay`, `/reconcile` | ✓ | ✓ | ✗ |
| GET `/`, `/report`, `/{id}` | Auth | Auth | Auth |

---

## Church — `/api/v1/church` (CHURCH org types only)

| Endpoint | ORG_ADMIN | FINANCE | STAFF |
|----------|-----------|---------|-------|
| POST `/ministries`, PUT `/ministries/{id}` | ✓ | ✓ | ✓ |
| POST `/attendance` | ✓ | ✓ | ✓ |
| GET `/ministries`, `/attendance`, `/attendance/summary` | Auth | Auth | Auth |

---

## Vertical access (in addition to RBAC)

| Feature | Allowed organization types |
|---------|---------------------------|
| Church modules | `CHURCH`, `RELIGIOUS_INSTITUTION` |
| NGO beneficiaries | `NGO`, `FOUNDATION`, `CHARITY`, `COMMUNITY_ORGANIZATION` |
| School sponsorships | `SCHOOL` |
| Student beneficiaries | `SCHOOL` only |

---

## ORG_ADMIN exclusive capabilities

- Update organization profile (`PUT /api/v1/organizations/me`)
- Invite and manage organization users (`/api/v1/users`)
- Included on nearly every other write operation alongside specialist roles

---

## See also

- [SWAGGER.md](./SWAGGER.md) — interactive API docs
- [PHASE1_IMPLEMENTATION.md](./PHASE1_IMPLEMENTATION.md) — auth foundation
