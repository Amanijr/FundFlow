# FundFlow ERP — Frontend

Next.js App Router UI for FundFlow ERP. Lives in `frontend/` per [FRONTEND_ARCHITECTURE.md](../FRONTEND_ARCHITECTURE.md).

## Prerequisites

- Node.js 20+
- Backend running on `http://localhost:8080`

## Setup

```bash
cd frontend
cp .env.local.example .env.local
npm install
```

## Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

API calls use the Next.js rewrite proxy (`/api/*` → backend), so CORS is not required in local dev.

## Phase status

**F1 — Foundation:** auth, API client, AppShell, design tokens, light/dark theme.

**F2 — Component library:** DataTable, FilterBar, PageHeader, forms, workflow, charts, command palette.

**F3 — Dashboards & navigation:** role-aware sidebar, three dashboards, Cmd/Ctrl+K actions, login redirect by role.

**F4 — Fundraising module:** donors, campaigns, donations (list, detail, create/edit, record donation workflow).

**F5 — Finance module:** funds, budgets, expenses with approval workflow.

**F6 — Accounting module:** chart of accounts, journal entries, general ledger, trial balance.

**F7 — Reporting center:** financial, donation, campaign, and budget reports with CSV export.

**F8 — Administration:** user management, organization settings, post-register setup wizard.

**F9 — Programs & verticals:** programs, grants, beneficiaries, church ministries/attendance, school sponsorships (org-type gated sidebar).

**F10 — Platform owner dashboard:** super-admin control center at `/platform/dashboard` with organizations, users, logs, tenant context, and bootstrap.

### F10 routes (SUPER_ADMIN only)

| Screen | Route | API |
|--------|-------|-----|
| Overview | `/platform/dashboard` | `GET /api/v1/platform/dashboard` |
| Organizations | `/platform/dashboard/organizations`, `/platform/dashboard/organizations/[id]` | org list, status update |
| Users | `/platform/dashboard/users` | user directory, create super admin |
| System logs | `/platform/dashboard/logs`, `/platform/dashboard/logs/[id]` | search, resolve alert |
| Login redirect | `/platform/login` | redirects to `/login` |
| Bootstrap (dev) | `/platform/bootstrap` | `POST /api/v1/platform/bootstrap` |

### F9 routes (authenticated, org-type gated)

| Module | Routes | Organization types |
|--------|--------|-------------------|
| Programs | `/programs`, `/programs/new`, `/programs/[id]`, `/programs/[id]/edit` | NGO, FOUNDATION, CHARITY, COMMUNITY_ORGANIZATION, SCHOOL |
| Grants | `/grants`, `/grants/new`, `/grants/[id]`, `/grants/[id]/edit` | NGO, FOUNDATION, CHARITY, COMMUNITY_ORGANIZATION |
| Beneficiaries | `/beneficiaries`, `/beneficiaries/new`, `/beneficiaries/[id]`, `/beneficiaries/[id]/edit` | NGO, FOUNDATION, CHARITY, COMMUNITY_ORGANIZATION, SCHOOL |
| Church ministries | `/church/ministries`, `/church/ministries/new`, `/church/ministries/[id]` | CHURCH, RELIGIOUS_INSTITUTION |
| Church attendance | `/church/attendance` | CHURCH, RELIGIOUS_INSTITUTION |
| School sponsorships | `/school/sponsorships`, `/school/sponsorships/new`, `/school/sponsorships/[id]` | SCHOOL |

### F8 routes (ORG_ADMIN only)

| Screen | Route |
|--------|-------|
| Users | `/admin/users`, `/admin/users/new`, `/admin/users/[id]` |
| Organization | `/admin/settings` |
| Setup wizard | `/admin/setup` (after registration) |

### F7 routes (authenticated)

| Screen | Route |
|--------|-------|
| Report hub | `/reports` |
| Financial | `/reports/financial` |
| Donations | `/reports/donations` |
| Campaigns | `/reports/campaigns` |
| Budgets | `/reports/budgets` |

### F6 routes (authenticated)

| Screen | Route |
|--------|-------|
| Chart of accounts | `/accounting/chart-of-accounts` |
| Journal entries | `/accounting/journal-entries`, `/accounting/journal-entries/[id]` |
| General ledger | `/accounting/general-ledger` |
| Trial balance | `/accounting/trial-balance` |

### F5 routes (authenticated)

| Module | Routes |
|--------|--------|
| Funds | `/funds`, `/funds/new`, `/funds/[id]`, `/funds/[id]/edit` |
| Budgets | `/budgets`, `/budgets/new`, `/budgets/[id]` |
| Expenses | `/expenses`, `/expenses/new`, `/expenses/[id]` |

### F4 routes (authenticated)

| Module | Routes |
|--------|--------|
| Donors | `/donors`, `/donors/new`, `/donors/[id]`, `/donors/[id]/edit` |
| Campaigns | `/campaigns`, `/campaigns/new`, `/campaigns/[id]`, `/campaigns/[id]/edit` |
| Donations | `/donations`, `/donations/new`, `/donations/[id]` |

### F3 routes (authenticated)

| Route | Role |
|-------|------|
| `/dashboard/executive` | ORG_ADMIN, PROGRAM_MANAGER, STAFF, VIEW_ONLY, AUDITOR |
| `/dashboard/finance` | ORG_ADMIN, FINANCE_MANAGER, ACCOUNTANT |
| `/dashboard/fundraising` | ORG_ADMIN, FUNDRAISING_MANAGER |

After login, users land on their role default dashboard. Sidebar and command palette filter by role and organization type.

### F2 dev routes (authenticated)

| Route | Purpose |
|-------|---------|
| `/dev/components` | Full component showcase |
| `/dev/reference-list` | Reference list page (Donors) |
| `/dev/reference-form` | Reference form page (Record donation) |

Press **Cmd/Ctrl+K** for the command palette.

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
