# FundFlow ERP

## Financial Accountability & Resource Management Platform for Nonprofits

FundFlow ERP is a multi-tenant SaaS platform designed to help nonprofit organizations manage donations, expenses, budgeting, accounting, campaigns, reporting, and organizational accountability.

The platform is being built to serve:

* Churches
* NGOs
* Charities
* Foundations
* Community Organizations
* Religious Institutions
* Educational Nonprofits
* Donor-Funded Projects

FundFlow ERP combines donor management, financial management, fund accounting, budgeting, reporting, and governance tools into a single platform.

---

## Vision

Nonprofit organizations often struggle with:

* Fragmented financial records
* Spreadsheet-based accounting
* Poor donation tracking
* Weak budgeting processes
* Limited transparency
* Difficult audit preparation
* Inconsistent reporting

FundFlow ERP aims to provide a centralized system that improves accountability, transparency, and operational efficiency.

---

## Core Principles

### Accountability First

Every financial transaction must be traceable.

### Reporting Driven

Every module should contribute to meaningful reporting.

### Audit Ready

Financial activities should be verifiable by auditors.

### Multi-Tenant

Each organization operates independently and securely.

### Modular

Organizations can enable only the features they need.

---

# Current Development Status

Current Stage:

Donation Management Foundation

Implemented:

* Donation Domain
* Donor Domain
* Payment Domain
* Repository Layer
* DTO Layer
* Service Layer

Planned:

* Authentication
* Organization Management
* Campaign Management
* Expense Tracking
* Accounting
* Budgeting
* Reporting
* Audit Logging

---

# Platform Modules

## Organization Management

* Organizations
* Branches
* Departments
* Programs

---

## User & Access Management

* Authentication
* Authorization
* Role Management
* Permissions

---

## Donor CRM

* Donor Profiles
* Donation History
* Donor Segmentation
* Donor Analytics

---

## Donation Management

* One-Time Donations
* Recurring Donations
* Pledges
* In-Kind Donations

---

## Campaign Management

* Fundraising Campaigns
* Campaign Targets
* Campaign Analytics

---

## Expense Management

* Expense Requests
* Expense Approvals
* Reimbursements
* Expense Reporting

---

## Budgeting

* Annual Budgets
* Program Budgets
* Department Budgets
* Variance Analysis

---

## Fund Accounting

* Restricted Funds
* Unrestricted Funds
* Fund Transfers
* Fund Balances

---

## Accounting

* Chart of Accounts
* Journal Entries
* General Ledger
* Trial Balance

---

## Financial Reporting

Generate:

* Statement of Financial Position
* Statement of Activities
* Income & Expenditure Statement
* Cash Flow Statement
* Budget Variance Reports
* Fund Reports

---

## Grant Management

* Grant Tracking
* Grant Compliance
* Grant Utilization Reporting

---

## Attendance Management

Applicable to:

* Churches
* Membership Organizations

Features:

* Service Attendance
* Event Attendance
* Participation Analytics

---

## Communication Center

* Email
* SMS
* WhatsApp Notifications
* Automated Receipts

---

## Audit & Compliance

* Audit Logs
* Activity History
* Financial Traceability

---

# Multi-Tenant Architecture

Each organization operates in an isolated environment.

Examples:

Organization A

* Donations
* Expenses
* Reports

Organization B

* Donations
* Expenses
* Reports

No cross-organization access is permitted.

---

# Technology Stack

## Backend

* Spring Boot
* Spring Security
* JWT
* PostgreSQL
* Flyway
* Redis
* MapStruct

## Frontend

* Next.js
* TypeScript
* TailwindCSS
* ShadCN UI
* Zustand
* TanStack Query

## Infrastructure

* Docker
* Docker Compose

---

# Development Roadmap

Phase 1

* Authentication
* Multi-Tenancy
* Organization Management

Phase 2

* Donor CRM
* Donations
* Campaigns

Phase 3

* Expense Management

Phase 4

* Accounting Engine

Phase 5

* Financial Statements

Phase 6

* Budgeting

Phase 7

* Grant Management

Phase 8

* Communications

Phase 9

* Organization-Specific Extensions

---

# Long-Term Goal

Become the leading nonprofit financial accountability and resource management platform for organizations across Africa.

The platform should enable organizations to answer:

* How much money was received?
* Where did it come from?
* How was it spent?
* Which fund owns it?
* Which campaign generated it?
* What is the current financial position?
* Can auditors verify every transaction?

FundFlow ERP is not just a donation system.

It is a complete accountability, financial management, and governance platform for nonprofit organizations.

---

# Documentation

User guides and developer docs are published with [MkDocs](https://www.mkdocs.org/) (Material theme).

```bash
pip install -r requirements-docs.txt
mkdocs serve    # http://127.0.0.1:8000
mkdocs build    # static site in site/
```

- **User manual:** [docs/USER_MANUAL.md](docs/USER_MANUAL.md)
- **Role guides:** [docs/guides/](docs/guides/getting-started.md)
- **Site setup:** [docs/documentation-site.md](docs/documentation-site.md)
