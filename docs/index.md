# FundFlow ERP Documentation

Welcome to the **FundFlow ERP** documentation site — a financial accountability and resource management platform for nonprofits.

FundFlow helps churches, NGOs, charities, foundations, schools, and community organizations manage **donations**, **expenses**, **funds**, **accounting**, **budgets**, **campaigns**, and **reporting** in one auditable system.

---

## Start here

<div class="grid cards" markdown>

-   :material-rocket-launch-outline:{ .lg .middle } **Getting Started**

    ---

    Install the app, create an account, and learn the basics.

    [:octicons-arrow-right-24: Getting Started guide](guides/getting-started.md)

-   :material-book-open-page-variant:{ .lg .middle } **User Manual**

    ---

    Complete reference for all modules and workflows.

    [:octicons-arrow-right-24: User Manual](USER_MANUAL.md)

-   :material-account-group:{ .lg .middle } **Role Guides**

    ---

    Step-by-step guides by job function.

    [:octicons-arrow-right-24: All guides](guides/getting-started.md)

-   :material-code-braces:{ .lg .middle } **Developer Docs**

    ---

    Architecture, API, and implementation phases.

    [:octicons-arrow-right-24: Architecture](developer/architecture.md)

</div>

---

## User guides by role

| Guide | For |
|-------|-----|
| [Getting Started](guides/getting-started.md) | Everyone — first login and navigation |
| [Organization Admin](guides/organization-admin.md) | Org owners — setup, users, settings |
| [Fundraising](guides/fundraising.md) | Donors, campaigns, donations |
| [Finance](guides/finance.md) | Funds, budgets, expenses |
| [Accounting](guides/accounting.md) | Ledger, trial balance, period close |
| [Reports](guides/reports.md) | Financial and operational reports |
| [Programs & Grants](guides/programs-and-grants.md) | NGOs — programs, grants, beneficiaries |
| [Church](guides/church.md) | Ministries, attendance, offerings |
| [School](guides/school.md) | Sponsorships and student records |
| [Platform Owner](guides/platform-owner.md) | Super admin — multi-tenant management |

---

## Quick links

| Topic | Document |
|-------|----------|
| Product requirements | [PRD](PRD.md) |
| Business workflows | [Workflows](WORKFLOWS.md) |
| Roles & permissions | [RBAC Matrix](RBAC_MATRIX.md) |
| API reference | [Swagger / OpenAPI](SWAGGER.md) |
| Module map | [Modules](MODULES.md) |

---

## Run this site locally

```bash
pip install -r requirements-docs.txt
mkdocs serve
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000).

Build static files for deployment:

```bash
mkdocs build
# Output in site/
```

## Screenshots

UI screenshots live in `docs/assets/images/screenshots/`. Regenerate after UI changes:

```bash
# Terminal 1
cd frontend && npm run dev

# Terminal 2
cd docs/scripts && npm install && npx playwright install chromium
node capture-screenshots.mjs
```

See [assets/images/README.md](assets/images/README.md) for the full file list.

See [Documentation site setup](documentation-site.md) for deployment options.

---

## Screenshots gallery

Click any image to zoom (lightbox).

| | |
|---|---|
| ![Login](assets/images/screenshots/login.png) | ![Executive dashboard](assets/images/screenshots/executive-dashboard.png) |
| Sign in | Executive dashboard |
| ![Donors](assets/images/screenshots/donors-list.png) | ![Record donation](assets/images/screenshots/record-donation.png) |
| Donors | Record donation |
| ![Finance dashboard](assets/images/screenshots/finance-dashboard.png) | ![Approvals](assets/images/screenshots/approvals.png) |
| Finance dashboard | Approvals inbox |

Regenerate screenshots: `node docs/scripts/capture-screenshots.mjs` (frontend must be running).
