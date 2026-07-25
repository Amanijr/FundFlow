# CrossLife ERP — Backend Phase Plan (Notus Frontend)

**Version:** 1.0  
**Status:** In progress  
**Pairs with:** [FRONTEND_NOTUS_PHASE_PLAN.md](./FRONTEND_NOTUS_PHASE_PLAN.md)  
**Backend:** Spring Boot (`src/main/java`) · APIs under `/api/v1`

---

## Overview

The Spring Boot backend already implements Phases 1–10 (auth, fundraising, finance, accounting, reporting, verticals, platform). This plan maps **backend enablement work** to each **Notus frontend phase** so `frontend-notus/` can switch from mock API to live data incrementally.

| Backend phase | Supports Notus | Focus |
|---------------|----------------|-------|
| **B-N1** | N1–N2 | CORS, health, dev demo seed, env wiring |
| **B-N2** | N2 | Register + org profile (already exists; verify contracts) |
| **B-N3** | N3 | Role/org-type in session payloads for nav gating |
| **B-N4** | N4 | Analytics dashboards (executive/trends/insights — exists) |
| **B-N5** | N5 | Fundraising list pagination + filters |
| **B-N6** | N6 | Expense workflow hardening + fund transfers |
| **B-N7** | N7 | Accounting initialize guard + ledger date filters |
| **B-N8** | N8 | Report export endpoints |
| **B-N9** | N9 | User invite + org settings |
| **B-N10** | N10 | Church/school/grant modules |
| **B-N11** | N11 | Platform owner APIs |
| **B-N12** | N12 | Observability, rate limits, production config |

---

## B-N1 — API foundation for frontends ✅

**Goal:** Browser clients on ports 3000/3001 can call the API with demo data.

### Deliverables

| Item | Endpoint / config | Status |
|------|-------------------|--------|
| CORS for local frontends | `app.cors.allowed-origins` | Done |
| Health check | `GET /actuator/health` | Done |
| Dev demo seed | `app.dev.seed-enabled=true` | Done |
| Demo credentials | See below | Done |

### Demo accounts (when seed enabled)

| Email | Password | Role |
|-------|----------|------|
| `admin@demo.local` | `demo` | ORG_ADMIN |
| `finance@demo.local` | `demo` | FINANCE_MANAGER |
| `fundraising@demo.local` | `demo` | FUNDRAISING_MANAGER |
| `super@demo.local` | `demo` | SUPER_ADMIN |

Demo org: **CrossLife Mission Network** (`slug=crosslife`, type `CHURCH`).

### Run with live API

```bash
# Terminal 1 — database
docker compose up -d

# Terminal 2 — backend with demo seed
DEV_SEED_ENABLED=true ./mvnw spring-boot:run

# Terminal 3 — Notus frontend (disable mock)
cd frontend-notus
# .env.local: NEXT_PUBLIC_MOCK_API=false
#            NEXT_PUBLIC_API_URL=http://localhost:8080
npm run dev
```

### Exit criteria

- [x] Login from `localhost:3001` succeeds without CORS errors
- [x] `/dashboard` loads KPIs from seeded donations/expenses
- [x] Seed is idempotent (restart safe)

---

## B-N2 — Auth & onboarding

**Goal:** N2 register + org setup screens use real APIs.

### Existing APIs

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/v1/auth/register` | Org + ORG_ADMIN user |
| POST | `/api/v1/auth/login` | JWT |
| GET | `/api/v1/auth/me` | Current user |
| GET | `/api/v1/organizations/me` | Org profile |
| PUT | `/api/v1/organizations/me` | Org setup wizard |

### Backend tasks

- [ ] Verify `RegisterRequest` matches Notus register form fields
- [ ] Add `onboardingCompleted` flag on organization (optional)
- [ ] Integration test: register → update org → login

---

## B-N3 — Navigation context

**Goal:** Frontend can filter sidebar by role + org type without extra round-trips.

### Backend tasks

- [ ] Extend `UserResponse` with `organizationType` (denormalized)
- [ ] Or document that clients must call `GET /organizations/me` after auth
- [ ] Role home redirect data: executive vs finance vs fundraising (client-side today)

---

## B-N4 — Role dashboards

**Goal:** N4 HeaderStats + charts use live analytics.

### Existing APIs

| Method | Path |
|--------|------|
| GET | `/api/v1/analytics/dashboard` |
| GET | `/api/v1/analytics/trends` |
| GET | `/api/v1/analytics/insights` |
| GET | `/api/v1/analytics/forecast` |

Finance and fundraising dashboards reuse executive + trends endpoints (same as main `frontend/`).

### Backend tasks

- [ ] Ensure seeded data produces non-zero chart series
- [ ] Optional: role-scoped dashboard DTOs if KPI sets diverge later

---

## B-N5 — Fundraising module

### Existing APIs

`/api/v1/donors`, `/campaigns`, `/donations`, `/donations/{id}/payments/gateway`

### Backend tasks

- [ ] Paginated list endpoints (`page`, `size`, `sort`)
- [ ] Donor search filter (`q` on name/email)
- [ ] Campaign status filter
- [ ] Receipt preview endpoint verification

---

## B-N6 — Finance module

### Existing APIs

`/api/v1/funds`, `/budgets`, `/expenses` (+ workflow actions)

### Backend tasks

- [ ] Expense list filters (status, date range)
- [ ] Fund transfer validation messages for UI
- [ ] Budget variance endpoint used by finance dashboard cards

---

## B-N7 — Accounting module

### Existing APIs

`/api/v1/accounting/*`

### Backend tasks

- [ ] Idempotent `initialize` response when COA already exists
- [ ] GL query params: `from`, `to`, `accountId`

---

## B-N8 — Reporting

### Existing APIs

`/api/v1/reports/*`

### Backend tasks

- [ ] CSV/PDF export headers for download buttons
- [ ] Date-range validation errors as `400` with clear messages

---

## B-N9 — Administration

### Existing APIs

`/api/v1/users`, `/organizations/me`

### Backend tasks

- [ ] User invite email stub / audit log entry
- [ ] Org settings validation (slug uniqueness on update)

---

## B-N10 — Vertical modules

Church, school, grants, programs — APIs exist per Phase 8–9 docs.

---

## B-N11 — Platform owner

`/api/v1/platform/*` — bootstrap + dashboard. Super admin uses `super@demo.local` when seeded.

---

## B-N12 — Production readiness

- [ ] Disable `app.dev.seed-enabled` in production profiles
- [ ] Restrict CORS to deployed frontend origins
- [ ] JWT secret rotation docs
- [ ] Request logging correlation IDs for frontend error reporting

---

## Current status

| Phase | Status | Notes |
|-------|--------|-------|
| B-N1 | ✅ Complete | CORS, actuator health, dev seed |
| B-N2 | 🔶 Partial | Auth APIs exist; `organizationType` added to auth payloads |
| B-N3 | 🔶 Partial | `organizationType` on `/auth/me` for nav gating |
| B-N4–B-N12 | ⬜ Planned | See sections above |

**Next action:** **B-N5** — paginated donor/campaign list APIs for Notus fundraising screens.
