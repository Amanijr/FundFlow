# AGENT.md

## PROJECT OVERVIEW

This repository is evolving from a donation management system into a full nonprofit ERP platform.

The target platform serves:

* Churches
* NGOs
* Charities
* Foundations
* Community Organizations
* Religious Institutions
* Educational Nonprofits

This is NOT a generic CRUD application.

This is a financial accountability and resource management platform.

---

# PRIMARY OBJECTIVE

Build a production-grade SaaS platform focused on:

* Donation Management
* Fund Accounting
* Financial Accountability
* Expense Tracking
* Budgeting
* Campaign Management
* Reporting
* Auditability

All future development decisions must support these goals.

---

# EXISTING CODEBASE RULES

Before making changes:

1. Analyze existing code.
2. Reuse existing entities whenever possible.
3. Extend existing functionality.
4. Avoid duplicate domain models.
5. Avoid replacing working implementations.

DO NOT:

* Rewrite the project from scratch.
* Delete existing modules without justification.
* Create parallel versions of existing entities.
* Introduce breaking database changes unnecessarily.

---

# ARCHITECTURE RULES

Architecture Style:

Modular Monolith

Current Target:

Backend:
Spring Boot

Database:
PostgreSQL

Authentication:
JWT

Future:
Multi-tenant SaaS

DO NOT:

* Introduce microservices.
* Split modules into separate applications.
* Create unnecessary infrastructure complexity.

Prefer simplicity.

---

# DOMAIN-DRIVEN DESIGN

Organize code by business domain.

Preferred Structure:

com.fundflow

├── auth
├── organization
├── donor
├── donation
├── payment
├── campaign
├── fund
├── budget
├── expense
├── accounting
├── reporting
├── notification
├── attendance
├── audit

Each module should contain:

* controller
* service
* repository
* dto
* entity

Avoid cross-module coupling.

---

# MULTI-TENANCY

The platform must support multiple organizations.

Every business record should belong to:

Organization

Future entities must support:

organization_id

Examples:

* Donation
* Expense
* Campaign
* Budget
* Fund
* Asset

must be tenant-aware.

Never introduce functionality that breaks tenant isolation.

---

# ACCOUNTING RULES

Accounting is a core domain.

All financial transactions must be auditable.

Every transaction must create accounting entries.

Examples:

Donation Received

Debit:
Cash

Credit:
Donation Revenue

Expense Paid

Debit:
Expense Account

Credit:
Cash

Never bypass accounting workflows.

Never store balances directly.

Balances should be derived from ledger entries.

---

# FINANCIAL DATA RULES

Financial records must be immutable.

Never permanently delete:

* Donations
* Payments
* Journal Entries
* Expenses

Use:

* status fields
* soft deletes
* audit logs

instead.

---

# REPORTING RULES

Reports are first-class features.

Every financial module should support reporting.

Examples:

* Donation Reports
* Expense Reports
* Budget Reports
* Fund Reports
* Financial Statements

Design modules with reporting requirements in mind.

---

# DATABASE RULES

Use Flyway migrations.

Never:

* Drop tables casually
* Rename tables without migration
* Break existing data

All schema changes must be migration-based.

---

# SERVICE LAYER RULES

Business logic belongs in services.

Controllers should:

* Validate requests
* Delegate to services
* Return responses

Controllers should NOT:

* Calculate business rules
* Access repositories directly

---

# REPOSITORY RULES

Repositories should only:

* Query data
* Persist data

Business logic does not belong in repositories.

---

# SECURITY RULES

All endpoints must be secured.

Use:

* JWT Authentication
* Role-based Authorization

Future roles:

SUPER_ADMIN
ORG_ADMIN
ACCOUNTANT
FINANCE_MANAGER
FUNDRAISING_MANAGER
STAFF
VOLUNTEER
DONOR
AUDITOR

Always consider authorization requirements before implementing features.

---

# IMPLEMENTATION PRIORITY

Highest Priority

1. Authentication
2. Organization Management
3. Donor Management
4. Donation Management
5. Campaign Management
6. Expense Management
7. Accounting
8. Reporting

Medium Priority

9. Budgeting
10. Fund Management
11. Grant Management
12. Notifications

Lower Priority

13. Attendance
14. Volunteer Management
15. Asset Management

Do not prioritize attendance features over accounting features.

---

# WHEN IMPLEMENTING FEATURES

Before coding:

1. Explain design.
2. Identify affected modules.
3. Identify database changes.
4. Identify security implications.
5. Identify reporting implications.

Then implement.

---

# SUCCESS CRITERIA

The platform should eventually be able to answer:

* How much money was received?
* How much money was spent?
* Where was it spent?
* Which campaign generated it?
* Which fund owns it?
* What is the current cash position?
* What are the budget variances?
* Can auditors trace every transaction?

If a feature does not improve accountability, reporting, governance, or operational effectiveness, reconsider its priority.
