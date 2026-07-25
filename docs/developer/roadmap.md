# ROADMAP.md

## CURRENT STAGE

Project Status:
Early Donation Management System

Current Domains:

* Donor
* Donation
* Payment

Current Goal:

Transform into a Nonprofit Financial Management ERP.

---

# PHASE 1 — FOUNDATION

Status: Complete

Priority: Critical

Objectives:

* Complete Authentication
* Complete Authorization
* Organization Management
* Multi-Tenancy
* Database Migrations
* API Standardization

Deliverables:

* JWT Authentication
* RBAC
* Organization Entity
* User Entity
* Tenant Isolation

Exit Criteria:

Organizations can operate independently.

---

# PHASE 2 — CORE FUNDRAISING

Status: Complete

Priority: Critical

Objectives:

* Donor CRM
* Donation Tracking
* Campaign Management
* Recurring Donations
* Pledges

Deliverables:

* Donor Profiles
* Donation Workflows
* Campaign Dashboard

Exit Criteria:

Organizations can manage fundraising activities.

---

# PHASE 2.5 — HYBRID & PHYSICAL COLLECTIONS

Status: Complete

Priority: Critical

Objectives:

* Manual payment recording (cash, cheque, in-person)
* Collection sessions for group/church collections
* Anonymous physical payment support
* Finance Manager verification workflow

Deliverables:

* Payment channel: `MANUAL` vs `GATEWAY`
* `CollectionSession` entity and API
* One consolidated donation per verified session
* Revenue recognition at count (`VERIFIED`)
* Reporting by `collectionType`

Decisions:
See ADR-007 through ADR-013 in `docs/DECISIONS.md`

Exit Criteria:

Organizations can record cash offerings, group collections, and manual payments with finance accountability.

---

# PHASE 3 — FINANCIAL OPERATIONS

Status: Complete

Priority: Critical

Objectives:

* Expense Management
* Approval Workflows
* Fund Management

Deliverables:

* Expense Requests
* Expense Approval
* Expense Reporting

Exit Criteria:

Organizations can track money leaving the organization.

---

# PHASE 4 — ACCOUNTING

Status: Complete

Priority: Critical

Objectives:

* Chart of Accounts
* Journal Entries
* General Ledger
* Trial Balance

Deliverables:

* Double Entry Accounting
* Accounting Engine

Exit Criteria:

Every transaction posts accounting entries.

---

# PHASE 5 — FINANCIAL REPORTING

Status: Complete

Priority: Critical

Deliverables:

* Income & Expenditure
* Balance Sheet
* Cash Flow
* Budget Reports
* Fund Reports

Exit Criteria:

Financial statements can be generated.

---

# PHASE 6 — BUDGETING

Status: Complete

Priority: High

Deliverables:

* Annual Budgets
* Department Budgets
* Budget Variance Analysis

Exit Criteria:

Budget planning and monitoring available.

---

# PHASE 7 — GRANTS & PROGRAMS

Status: Complete

Priority: High

Deliverables:

* Grant Tracking
* Program Tracking
* Program Budgets

Exit Criteria:

Grant-funded organizations supported.

---

# PHASE 8 — COMMUNICATIONS

Status: Complete

Priority: Medium

Deliverables:

* Email
* SMS
* WhatsApp
* Receipts

Exit Criteria:

Automated communication available.

---

# PHASE 9 — ORGANIZATION-SPECIFIC MODULES

Status: Complete

Priority: Medium

Examples:

Church:

* Attendance
* Ministries
* Pledges

NGO:

* Beneficiaries
* Impact Tracking

School:

* Student Sponsorship

Exit Criteria:

Vertical-specific features available.

---

# PHASE 10 — ADVANCED ANALYTICS

Status: Complete

Priority: Low

Deliverables:

* Forecasting
* AI Insights
* Trend Analysis

Exit Criteria:

Executive intelligence available.
