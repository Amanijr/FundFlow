# MODULES.md

## Core Modules

### Authentication

Status: Planned

Responsibilities:

* Login
* JWT
* Refresh Tokens
* Role Management
* Permissions

Dependencies:

* Organization
* User

---

### Organization Management

Status: Planned

Responsibilities:

* Organizations
* Branches
* Departments
* Programs

Dependencies:

* Authentication

---

### Donor CRM

Status: Existing

Responsibilities:

* Donor Profiles
* Donor History
* Donor Analytics

Current Entity:

* Donor

---

### Donation Management

Status: Existing

Responsibilities:

* Donations
* Recurring Donations
* Pledges

Current Entity:

* Donation

Dependencies:

* Donor
* Campaign

---

### Payment Management

Status: Existing

Responsibilities:

* Payment Processing
* Payment Tracking

Current Entity:

* Payment

---

### Campaign Management

Status: Planned

Responsibilities:

* Fundraising Campaigns
* Targets
* Progress Tracking

Dependencies:

* Donation

---

### Expense Management

Status: Planned

Responsibilities:

* Expense Requests
* Approvals
* Reimbursements

Dependencies:

* Accounting

---

### Accounting

Status: Planned

Responsibilities:

* Journal Entries
* Ledger
* Trial Balance
* Financial Statements

Dependencies:

* Donation
* Expense

---

### Budgeting

Status: Planned

Responsibilities:

* Annual Budgets
* Department Budgets
* Variance Analysis

Dependencies:

* Accounting

---

### Reporting

Status: Planned

Responsibilities:

* Financial Reports
* Donation Reports
* Campaign Reports

Dependencies:

* All Financial Modules
