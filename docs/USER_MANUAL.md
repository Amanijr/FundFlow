# FundFlow ERP — User Manual

**Version:** 1.0  
**Last updated:** July 2026  
**Audience:** New users, organization administrators, finance staff, fundraising teams, and platform operators

> **Role-based guides:** For shorter, task-focused walkthroughs see **[User Guides](guides/getting-started.md)** (Getting Started, Organization Admin, Fundraising, Finance, Accounting, Reports, Church, School, Platform Owner, and more).

---

## Table of contents

1. [Introduction](#1-introduction)
2. [Who FundFlow is for](#2-who-fundflow-is-for)
3. [Key concepts](#3-key-concepts)
4. [Getting started](#4-getting-started)
5. [Signing in and your first session](#5-signing-in-and-your-first-session)
6. [Navigating the application](#6-navigating-the-application)
7. [User roles and permissions](#7-user-roles-and-permissions)
8. [Organization setup](#8-organization-setup)
9. [Dashboards](#9-dashboards)
10. [Fundraising — donors, campaigns, and donations](#10-fundraising--donors-campaigns-and-donations)
11. [Finance — funds, budgets, and expenses](#11-finance--funds-budgets-and-expenses)
12. [Accounting](#12-accounting)
13. [Reports](#13-reports)
14. [Programs, grants, and beneficiaries](#14-programs-grants-and-beneficiaries)
15. [Organization-specific features](#15-organization-specific-features)
16. [Approvals, notifications, and activity](#16-approvals-notifications-and-activity)
17. [Documents](#17-documents)
18. [Administration](#18-administration)
19. [Platform owner (super admin)](#19-platform-owner-super-admin)
20. [Common workflows (step-by-step)](#20-common-workflows-step-by-step)
21. [Tips, shortcuts, and troubleshooting](#21-tips-shortcuts-and-troubleshooting)
22. [Glossary](#22-glossary)
23. [Related documentation](#23-related-documentation)

---

## 1. Introduction

### What is FundFlow ERP?

**FundFlow ERP** is a multi-tenant financial accountability and resource management platform built for nonprofit organizations. It brings together:

- **Donor and donation management**
- **Fundraising campaigns**
- **Expense tracking and approvals**
- **Fund accounting** (restricted and unrestricted funds)
- **Double-entry accounting**
- **Budgeting and variance analysis**
- **Financial and operational reporting**
- **Grant and program tracking**
- **Organization-specific tools** (church ministries, school sponsorships, NGO beneficiaries)

FundFlow is designed so that every financial transaction is **traceable**, **auditable**, and **reportable**. The platform answers questions such as:

- How much money did we receive?
- Where did it come from?
- How was it spent?
- Which fund owns it?
- Which campaign generated it?
- What is our current financial position?
- Can an auditor verify every transaction?

### What FundFlow is not

FundFlow is not a generic spreadsheet replacement or a simple donation form. It is a governance-focused ERP that connects fundraising, finance, accounting, and reporting into one system.

---

## 2. Who FundFlow is for

FundFlow serves organizations such as:

| Organization type | Examples of use |
|-------------------|-----------------|
| **Church** | Offerings, ministries, attendance, pledges |
| **Religious institution** | Same as church vertical features |
| **NGO** | Programs, grants, beneficiaries, donor CRM |
| **Foundation** | Grant tracking, fund accounting |
| **Charity** | Campaigns, donations, expense control |
| **Community organization** | Local fundraising and accountability |
| **School** | Sponsorships, student beneficiaries, programs |

Each organization operates in its own **isolated workspace**. Data from one organization is never visible to another.

---

## 3. Key concepts

### Organization (tenant)

Your nonprofit is an **organization** in FundFlow. All records — donors, donations, expenses, budgets, funds, and reports — belong to your organization. Users only see data for organizations they belong to.

### Multi-tenancy

FundFlow is a **multi-tenant** platform: many organizations use the same software, but each organization's data is kept separate and secure.

### Roles

Every user has a **role** (for example, Organization Admin, Finance Manager, or Fundraising Manager). Your role controls which menus you see and which actions you can perform.

### Funds

A **fund** is a bucket of money with a purpose — for example, "Building Fund" (restricted) or "General Operations" (unrestricted). Donations and expenses can be assigned to funds so you know how money is allocated.

### Double-entry accounting

When money moves in or out of the organization, FundFlow creates **journal entries** that debit and credit the correct accounts. Balances are calculated from the ledger — they are not edited manually.

### Workflows

Many records move through a **workflow** with statuses such as Draft, Pending Review, Approved, Rejected, Completed, and Archived. Examples include expense approvals and collection session verification.

### Audit trail

Important actions — logins, donations, expense approvals, budget changes — are logged so administrators and auditors can review who did what and when.

---

## 4. Getting started

This section is for **first-time setup** of the application on a computer (local development or evaluation). End users who are invited to an existing organization can skip to [Section 5](#5-signing-in-and-your-first-session).

### Prerequisites

| Component | Requirement |
|-----------|-------------|
| **Database** | PostgreSQL 16 (via Docker or installed locally) |
| **Backend** | Java 17+, Maven (included as `./mvnw`) |
| **Frontend** | Node.js 20+ |

### Step 1 — Start the database

From the project root:

```bash
docker compose up -d
```

This starts PostgreSQL on port `5432` with database name `fundflow`, user `postgres`, password `postgres`.

### Step 2 — Start the backend

```bash
./mvnw spring-boot:run
```

The API runs at **http://localhost:8080**.

- **Swagger UI** (API explorer): http://localhost:8080/swagger-ui.html  
- **Health check**: http://localhost:8080/actuator/health  

On first run, Flyway applies database migrations automatically.

### Step 3 — Start the frontend

```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

Open **http://localhost:3000** in your browser.

**Demo mode (no backend):** If `.env.local` has `NEXT_PUBLIC_MOCK_API=true`, the frontend runs with sample data and does not require the backend. Use this to explore the UI quickly.

**Production-like mode:** Set `NEXT_PUBLIC_MOCK_API=false` and ensure the backend is running on port 8080. API calls are proxied through Next.js so CORS is not an issue in local development.

### Step 4 — Create your organization

1. Open http://localhost:3000/register  
2. Complete the registration form (organization details + your admin account)  
3. You are created as **Organization Admin** (`ORG_ADMIN`)  
4. Complete the [setup wizard](#8-organization-setup)  

Alternatively, use Swagger UI: **Authentication → POST /api/v1/auth/register**.

---

## 5. Signing in and your first session

### Sign in

1. Go to **http://localhost:3000/login**  
2. Enter your **email** and **password**  
3. Click **Sign in**  

After a successful login, you are redirected to a **dashboard matched to your role**:

| Role | Default landing page |
|------|----------------------|
| Super Admin | `/platform/dashboard` |
| Finance Manager, Accountant | `/dashboard/finance` |
| Fundraising Manager | `/dashboard/fundraising` |
| Organization Admin, Program Manager, Staff, and others | `/dashboard/executive` |

### Sign out

Open your **profile menu** in the top header and choose **Sign out**. Your session is cleared and you return to the login page.

### Forgot password

Use **Forgot password** on the login page (`/forgot-password`) if your administrator has enabled password reset.

### Multi-factor authentication (MFA)

MFA is supported in the architecture. If your organization requires it, you may be redirected to `/mfa` after entering your password.

### Platform (super admin) login

Platform operators use the same login page. Super admins are automatically sent to the **Platform Dashboard** at `/platform/dashboard`.

---

## 6. Navigating the application

### Application layout

After sign-in, you see the **application shell**:

| Area | Purpose |
|------|---------|
| **Sidebar** (left) | Main navigation, grouped by module |
| **Header** (top) | Search, notifications, organization switcher, user menu |
| **Main content** | Page you are viewing |
| **Breadcrumbs** | Path back to parent pages |

On mobile, the sidebar opens as a **drawer**. You can collapse the sidebar on desktop; your preference is remembered.

### Sidebar groups

Menus are grouped as follows (items you see depend on your **role** and **organization type**):

| Group | Typical items |
|-------|----------------|
| **Dashboard** | Executive, Finance, Fundraising |
| **Fundraising** | Donors, Campaigns, Donations |
| **Finance** | Funds, Budgets, Expenses, Accounting |
| **Reporting** | Reports hub |
| **Communication** | Approvals, Notifications, Activity, Documents |
| **Programs** | Programs, Grants, Beneficiaries *(NGO-type orgs)* |
| **Verticals** | Ministries, Attendance *(churches)*; Sponsorships *(schools)* |
| **Administration** | Users, Settings *(org admins only)* |

### Command palette

Press **⌘K** (Mac) or **Ctrl+K** (Windows/Linux) to open the **command palette**. Quickly jump to pages and common actions without using the sidebar.

### Search

Use the **search bar** in the header to find records and navigate (where implemented for your role).

---

## 7. User roles and permissions

### Role overview

| Role | Typical responsibilities |
|------|--------------------------|
| **ORG_ADMIN** | Full organization control: users, settings, and most write operations |
| **FINANCE_MANAGER** | Funds, budgets, expenses, accounting, financial approvals, manual payments |
| **ACCOUNTANT** | Chart of accounts, journal entries, ledger, trial balance (read-heavy + COA creation) |
| **FUNDRAISING_MANAGER** | Donors, donations, campaigns, pledges, collections |
| **PROGRAM_MANAGER** | Programs, grants, beneficiaries, school sponsorships |
| **STAFF** | Day-to-day data entry (donors, donations, expenses, attendance, etc.) |
| **AUDITOR** | Read access to reports and activity (future enforcement expanding) |
| **VIEW_ONLY** | Read-only access to dashboards and reports |
| **SUPER_ADMIN** | Platform-wide operator — manages all organizations (separate console) |

Roles such as **VOLUNTEER** and **DONOR** are defined for future use.

### What you can and cannot do

- If you try to open a page or action you are not allowed to use, you may see an **Unauthorized** page or a disabled button.  
- **Navigation filtering** hides menu items you cannot access, but bookmarked URLs may still require permission checks on the server.  
- **Organization Admin** is the only role that can invite users and change organization settings.

For a detailed permission matrix, see [RBAC_MATRIX.md](./RBAC_MATRIX.md).

---

## 8. Organization setup

### Registration creates your organization

When you register, FundFlow creates:

1. Your **organization** (name, type, email)  
2. Your **admin user account** with role `ORG_ADMIN`  

### Setup wizard

New organization admins are guided through **Admin → Setup** (`/admin/setup`):

| Step | What you do |
|------|-------------|
| **1. Profile** | Confirm organization name, type, contact details, and fiscal settings |
| **2. Invite team** | Invite your first team members (Finance Manager, Fundraising Manager, etc.) |
| **3. Get started** | Shortcuts to add donors, create a campaign, set up funds, or initialize accounting |

You can return to any admin page later; the wizard is a one-time onboarding aid.

### Organization settings

Go to **Administration → Settings** (`/admin/settings`) to update:

- Organization profile  
- Contact information  
- Fiscal and display preferences  

Only **Organization Admins** can change these settings.

---

## 9. Dashboards

FundFlow provides **role-based dashboards** so each user sees relevant key performance indicators (KPIs) and quick actions.

### Executive dashboard

**Path:** `/dashboard/executive`  
**Who sees it:** Organization Admin, Program Manager, Staff, Auditor, View Only  

High-level view of organizational health: income, expenses, campaign progress, and recent activity.

### Finance dashboard

**Path:** `/dashboard/finance`  
**Who sees it:** Organization Admin, Finance Manager, Accountant  

Focus on cash position, pending approvals, budget utilization, and accounting health.

### Fundraising dashboard

**Path:** `/dashboard/fundraising`  
**Who sees it:** Organization Admin, Fundraising Manager  

Donor activity, campaign performance, donation trends, and fundraising KPIs.

### Using dashboards

- Review **widgets** for at-a-glance metrics  
- Use **quick action cards** to jump to common tasks (record donation, create expense, etc.)  
- Click through to detailed lists and reports from any metric  

---

## 10. Fundraising — donors, campaigns, and donations

### Donors

**Path:** `/donors`

Donors are people or entities that give to your organization.

#### Add a donor

1. Go to **Fundraising → Donors**  
2. Click **New donor** (or `/donors/new`)  
3. Enter name, contact details, and optional tags or notes  
4. Save  

#### View and edit a donor

1. Click a donor in the list to open their **detail page**  
2. Review donation history, contact information, and activity  
3. Click **Edit** to update profile information  

#### Delete a donor

Organization Admins and Fundraising Managers can remove donors when policy allows. Financial history linked to donations is preserved for audit purposes.

---

### Campaigns

**Path:** `/campaigns`

Campaigns are fundraising drives with goals, dates, and progress tracking.

#### Create a campaign

1. Go to **Fundraising → Campaigns**  
2. Click **New campaign**  
3. Enter title, description, target amount, start and end dates, and linked fund (if applicable)  
4. Save and **activate** the campaign when ready  

#### Manage a campaign

1. Open the campaign **detail page**  
2. Monitor progress toward the target  
3. Link new donations to the campaign  
4. **Close** the campaign when the drive ends  
5. Run **campaign reports** from the Reports section  

---

### Donations

**Path:** `/donations`

A **donation** records money or value received from a donor (or anonymously).

#### Record a donation

1. Go to **Fundraising → Donations**  
2. Click **Record donation** (`/donations/new`)  
3. Select or create the **donor** (or mark as anonymous)  
4. Enter **amount**, **date**, **fund**, and optional **campaign**  
5. Choose payment method context  
6. Save  

#### Donation workflow

```
Donor selected → Donation created → Validated → Receipt generated
    → Accounting entry posted → Included in reports
```

#### Record payment

After creating a donation, record how payment was received:

| Payment type | Who can record | Description |
|--------------|----------------|-------------|
| **Gateway** | Staff, Fundraising, Finance, Admin | Card or mobile money via payment gateway |
| **Manual** | Finance Manager, Org Admin only | Cash, cheque, or in-person payment |

Open the donation detail page and use **Record payment** with the appropriate method.

#### View donation details

The donation detail page (`/donations/[id]`) shows amount, donor, fund, campaign, payment status, receipt, and linked journal entries.

---

### Physical collections (churches and cash offerings)

For **group collections** (for example, Sunday offering), FundFlow supports **collection sessions**. This workflow is especially useful for churches recording counted cash before finance verification.

**Workflow:**

```
Create session (Draft) → Submit count (Counted) → Finance verifies (Verified)
    → One consolidated donation created → Revenue recognized → Optional bank deposit
```

**Collection types:** Service offering, Event, Department, Project, Special appeal.

> **Note:** Collection sessions are primarily managed via the API today (`/api/v1/collection-sessions`). Church finance teams should coordinate with your administrator for UI access or API integration. See [PHASE2_5_IMPLEMENTATION.md](./PHASE2_5_IMPLEMENTATION.md).

---

### Pledges and recurring donations

FundFlow supports **pledges** (commitments to give) and **recurring donations** (scheduled giving). These can be created and managed through the API and are integrated into donor history and reporting.

---

## 11. Finance — funds, budgets, and expenses

### Funds

**Path:** `/funds`

Funds track **restricted** and **unrestricted** money separately.

#### Create a fund

1. Go to **Finance → Funds**  
2. Click **New fund**  
3. Enter fund name, type (restricted/unrestricted), description, and opening balance if applicable  
4. Save  

#### Use funds

- Assign **donations** to a fund when recording gifts  
- Charge **expenses** against a fund  
- Review **fund balance** and transaction history on the fund detail page  

---

### Budgets

**Path:** `/budgets`

Budgets plan expected income and spending for a fiscal period.

#### Create a budget

1. Go to **Finance → Budgets**  
2. Click **New budget**  
3. Enter fiscal year/period, name, and budget lines (accounts or categories)  
4. Save as **Draft**  

#### Budget workflow

```
Budget created (Draft) → Submitted → Approved → Activated
    → Expenses recorded against lines → Utilization tracked → Variance reports
```

#### Approve and activate

**Finance Managers** and **Organization Admins** can approve, activate, and close budgets.

---

### Expenses

**Path:** `/expenses`

Expenses track money leaving the organization.

#### Submit an expense

1. Go to **Finance → Expenses**  
2. Click **New expense** (`/expenses/new`)  
3. Enter description, amount, date, fund, budget line (if applicable), and supporting details  
4. Attach receipts or documents if available  
5. Save and **Submit for approval**  

#### Expense approval workflow

```
Expense created → Submitted → Approved or Rejected → Payment recorded
    → Reconciled → Accounting entry posted → Included in reports
```

| Stage | Who acts |
|-------|----------|
| Create / submit | Staff, Finance Manager, Org Admin |
| Approve / reject | Finance Manager, Org Admin |
| Mark paid / reconcile | Finance Manager, Org Admin |

#### Track an expense

Open the expense **detail page** (`/expenses/[id]`) to see status, approval history, payment details, and linked ledger entries.

Pending items also appear in **Communication → Approvals** (`/approvals`).

---

## 12. Accounting

**Path:** `/accounting/chart-of-accounts` (hub)

FundFlow uses **double-entry accounting**. Financial events from donations and expenses automatically generate journal entries.

### Chart of accounts

**Path:** `/accounting/chart-of-accounts`

The chart of accounts lists all accounts (assets, liabilities, equity, revenue, expenses).

#### Initialize accounting

1. Go to **Accounting → Chart of accounts**  
2. Run **Initialize** (Finance Manager or Org Admin) to create the default account structure  
3. **Accountants** can add or adjust accounts as needed  

### Journal entries

**Path:** `/accounting/journal-entries`

View all journal entries created by the system and manual adjustments. Open an entry to see debit/credit lines and source documents.

### General ledger

**Path:** `/accounting/general-ledger`

The general ledger shows all posted transactions by account over a selected period. Use filters for date range and account.

### Trial balance

**Path:** `/accounting/trial-balance`

The trial balance verifies that total debits equal total credits for a period — a standard accounting control before closing reports.

### Important rules

- **Do not delete** financial records; statuses and audit logs preserve history  
- **Balances are calculated** from ledger entries, not stored as editable totals  
- Every donation and paid expense should produce traceable journal entries  

---

## 13. Reports

**Path:** `/reports`

The **Reports hub** links to specialized report pages. Most reports support **date filters** and **CSV export**.

| Report | Path | Contents |
|--------|------|----------|
| **Financial reports** | `/reports/financial` | Income & expenditure, balance sheet, cash flow summaries |
| **Donation reports** | `/reports/donations` | Donations by period, donor, fund, campaign |
| **Campaign reports** | `/reports/campaigns` | Campaign performance and totals |
| **Budget reports** | `/reports/budgets` | Budget vs. actual, variance analysis |

### How to run a report

1. Go to **Reporting → Reports**  
2. Choose the report type  
3. Set **date range**, **fund**, or other filters  
4. Review on screen or click **Export** for CSV  

Auditors and executives often use financial and donation reports together with the **General Ledger** and **Activity** feed for verification.

---

## 14. Programs, grants, and beneficiaries

These modules appear for **NGO-type** organizations: NGO, Foundation, Charity, Community Organization, and School (programs only).

### Programs

**Path:** `/programs`

Programs are operational initiatives your organization runs (for example, "Clean Water Initiative").

1. Create a program with name, description, dates, and budget link  
2. Track spending and outcomes on the program detail page  
3. Associate grants and beneficiaries where relevant  

### Grants

**Path:** `/grants`

Grants track external funding with compliance and utilization requirements.

1. Create a grant with funder, amount, period, and restrictions  
2. **Activate** when funding is confirmed  
3. Record spending against the grant  
4. **Close** when the grant period ends  
5. Generate utilization reports  

### Beneficiaries

**Path:** `/beneficiaries`

Beneficiaries are individuals or groups served by your programs (common for NGOs and schools).

1. Add beneficiary profiles with program association  
2. Track support history and status  
3. Use in impact and grant reporting  

---

## 15. Organization-specific features

Some features only appear based on your **organization type** at registration.

### Church and religious institution

| Feature | Path | Purpose |
|---------|------|---------|
| **Ministries** | `/church/ministries` | Manage church ministries and departments |
| **Attendance** | `/church/attendance` | Record service or event attendance |

### School

| Feature | Path | Purpose |
|---------|------|---------|
| **Sponsorships** | `/school/sponsorships` | Track student sponsorships and donors |

### NGO, foundation, charity, community organization

| Feature | Path | Purpose |
|---------|------|---------|
| **Programs** | `/programs` | Program management |
| **Grants** | `/grants` | Grant tracking |
| **Beneficiaries** | `/beneficiaries` | Beneficiary records |

If you registered as the wrong organization type, contact your **Organization Admin** to update settings (where supported) or platform support.

---

## 16. Approvals, notifications, and activity

### Approvals inbox

**Path:** `/approvals`

Central place for pending **expense approvals**, budget actions, and other workflow items assigned to you. Open an item, review details, and **Approve** or **Reject** with optional comments.

### Notifications

**Path:** `/notifications`

System and workflow notifications (approvals assigned, payment confirmed, campaign milestones). Configure preferences at **Settings → Notifications** (`/settings/notifications`).

### Activity feed

**Path:** `/activity`

Chronological log of significant events in your organization — useful for managers and auditors reviewing recent changes.

---

## 17. Documents

**Path:** `/documents`

Upload and manage supporting files: receipts, grant letters, bank statements, and policy documents. Link documents to expenses, grants, and other records where the upload workflow is available on detail pages.

---

## 18. Administration

*Available to **Organization Admins** only.*

### User management

**Path:** `/admin/users`

#### Invite a user

1. Go to **Administration → Users**  
2. Click **Invite user** (`/admin/users/new`)  
3. Enter email, name, and **role**  
4. Send invitation  

#### Change a user's role

1. Open the user detail page (`/admin/users/[id]`)  
2. Select a new role and save  

**Note:** You cannot assign the Super Admin role from organization admin. Admins cannot change their own role.

Assignable roles include: Finance Manager, Fundraising Manager, Program Manager, Staff, Accountant, Auditor, View Only, and Volunteer.

### Organization settings

**Path:** `/admin/settings`

Update organization profile, branding fields, and operational preferences.

---

## 19. Platform owner (super admin)

The **Platform Dashboard** is for **FundFlow platform operators** who manage the entire SaaS installation — not for day-to-day nonprofit staff.

**Path:** `/platform/dashboard`  
**Role required:** `SUPER_ADMIN`

### Bootstrap the first super admin

On a new installation, create the first super admin once via:

- **UI:** `/platform/bootstrap` (development)  
- **API:** `POST /api/v1/platform/bootstrap` with the bootstrap secret configured in server settings  

### Platform dashboard features

| Screen | Path | Purpose |
|--------|------|---------|
| Overview | `/platform/dashboard` | Platform stats, alerts, recent activity |
| Organizations | `/platform/dashboard/organizations` | List and manage tenant organizations |
| Users | `/platform/dashboard/users` | Cross-tenant user directory |
| System logs | `/platform/dashboard/logs` | Events, errors, security alerts |

### Acting on behalf of a tenant

Super admins have no default organization. When calling organization-scoped APIs, pass the header:

```
X-Organization-Id: <organizationId>
```

---

## 20. Common workflows (step-by-step)

### Workflow A — First donation from a new donor

1. **Fundraising → Donors → New donor** — create donor profile  
2. **Fundraising → Donations → Record donation** — select donor, amount, fund, optional campaign  
3. **Record payment** — gateway (staff) or manual (finance manager for cash/cheque)  
4. System generates **receipt** and **journal entry**  
5. View in **Reports → Donation reports**  

### Workflow B — Run a fundraising campaign

1. **Finance → Funds** — ensure target fund exists  
2. **Fundraising → Campaigns → New campaign** — set goal and dates  
3. Activate campaign  
4. Record donations linked to the campaign  
5. Monitor **Fundraising dashboard** and **Reports → Campaign reports**  
6. Close campaign when complete  

### Workflow C — Pay an approved expense

1. **Staff** creates expense and submits  
2. **Finance Manager** reviews in **Approvals** or expense detail — approves  
3. **Finance Manager** marks expense as **paid** and reconciles  
4. System posts **journal entry**  
5. Verify in **General Ledger** and **Financial reports**  

### Workflow D — Month-end financial close (simplified)

1. Ensure all donations have payments recorded  
2. Ensure all approved expenses are paid or reconciled  
3. Run **Trial balance** — debits must equal credits  
4. Run **General ledger** for the period  
5. Export **Financial reports** for leadership and auditors  
6. Review **Activity** feed for unusual changes  

### Workflow E — New organization admin onboarding

1. Register at `/register`  
2. Complete **Setup wizard** (`/admin/setup`)  
3. Invite Finance Manager and Fundraising Manager  
4. **Initialize chart of accounts**  
5. Create **funds**  
6. Add first **donors** and **campaign**  
7. Record a test **donation** and verify it appears in reports  

### Workflow F — Sunday offering (church, via API)

1. Staff creates **collection session** (service offering)  
2. After counting, submit **count** with total and payment method  
3. Finance Manager **verifies** session — consolidated donation created  
4. Finance Manager records **bank deposit** when cash is deposited  
5. Review collection dashboard and donation reports  

---

## 21. Tips, shortcuts, and troubleshooting

### Keyboard shortcuts

| Shortcut | Action |
|----------|--------|
| **⌘K / Ctrl+K** | Open command palette |
| **Tab** | Move between form fields |
| **Enter** | Submit forms (when focused on submit button) |

### Sidebar

- Click the collapse control to maximize content area  
- On mobile, tap the menu icon to open the navigation drawer  

### Session timeout

If you are inactive for an extended period, you may see a **session timeout** dialog. Sign in again to continue. Unsaved form data may be lost — save drafts frequently on long forms.

### Unauthorized access

If you see **Unauthorized** (`/unauthorized`), your role does not permit that page. Contact your Organization Admin to request a role change.

### Common issues

| Problem | What to try |
|---------|-------------|
| Cannot sign in | Verify email/password; ask admin to confirm your account is enabled |
| Menu item missing | Your role or organization type may not include that module |
| API errors in dev | Ensure PostgreSQL and backend are running; check `frontend/.env.local` |
| Empty reports | Confirm date range, and that donations/expenses are approved and posted |
| 403 on action | Your role cannot perform that write operation — see [RBAC_MATRIX.md](./RBAC_MATRIX.md) |

### Demo credentials

When running the frontend in **mock API mode** (`NEXT_PUBLIC_MOCK_API=true`), use the demo credentials shown on the login page (typically `admin@demo.local`).

### Getting help

- **Organization issues:** Contact your Organization Admin  
- **Technical / API:** See [SWAGGER.md](./SWAGGER.md) and Swagger UI at http://localhost:8080/swagger-ui.html  
- **Developers:** See [Project overview](developer/project-overview.md), [Architecture](developer/architecture.md), and [Frontend setup](developer/frontend-setup.md)  

---

## 22. Glossary

| Term | Definition |
|------|------------|
| **Audit log** | Record of who performed an action and when |
| **Campaign** | A time-bound fundraising drive with a target |
| **Chart of accounts** | List of all financial accounts used in bookkeeping |
| **Collection session** | A counted group offering (e.g. Sunday service) before finance verification |
| **Donor** | Person or entity that gives to the organization |
| **Double-entry** | Accounting method where every transaction has equal debits and credits |
| **Fund** | Designated pool of money (restricted or unrestricted) |
| **Journal entry** | A posted accounting transaction with debit and credit lines |
| **Ledger** | Running record of all journal entries by account |
| **Multi-tenant** | Many organizations on one platform with isolated data |
| **Organization** | Your nonprofit's workspace in FundFlow |
| **Pledge** | A commitment to give in the future |
| **RBAC** | Role-based access control — permissions by job role |
| **Restricted fund** | Money that must be used for a specific purpose |
| **Tenant** | Same as organization in FundFlow context |
| **Trial balance** | Report listing all account balances to verify debits = credits |
| **Unrestricted fund** | Money available for general organizational use |
| **Workflow** | Defined steps and statuses a record passes through (e.g. expense approval) |

---

## 23. Related documentation

| Document | Audience | Contents |
|----------|----------|----------|
| [guides/getting-started.md](guides/getting-started.md) | Everyone | Short role-based step-by-step guides |
| [developer/project-overview.md](developer/project-overview.md) | Everyone | Project overview and vision |
| [PRD.md](./PRD.md) | Product / stakeholders | Full product requirements |
| [WORKFLOWS.md](./WORKFLOWS.md) | Power users / implementers | Detailed business workflows |
| [RBAC_MATRIX.md](./RBAC_MATRIX.md) | Admins | Permission matrix by role |
| [INFORMATION_ARCHITECTURE.md](./INFORMATION_ARCHITECTURE.md) | UX / admins | Screen and domain map |
| [SWAGGER.md](./SWAGGER.md) | Technical users | API documentation |
| [developer/frontend-setup.md](developer/frontend-setup.md) | Developers | Frontend setup and routes |

---

*FundFlow ERP — Financial accountability and resource management for nonprofits.*
