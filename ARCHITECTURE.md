 # ARCHITECTURE.md

## ARCHITECTURE STYLE

Modular Monolith

Reason:

* Faster development
* Easier maintenance
* Simpler deployment
* Lower operational cost

Microservices are NOT allowed at this stage.

---

# MODULES

auth
organization
user
donor
donation
payment
campaign
expense
budget
fund
accounting
reporting
notification
audit

Future:

attendance
volunteer
asset
grant
program

---

# DEPENDENCY RULES

Allowed:

donation → accounting

expense → accounting

campaign → donation

reporting → accounting

Forbidden:

accounting → donation

accounting → campaign

accounting → expense

Accounting must remain independent.

---

# DATABASE STRATEGY

Database:

PostgreSQL

Migration Tool:

Flyway

Rules:

* No schema recreation
* No dropping tables
* Migration-based evolution only

---

# ACCOUNTING PRINCIPLES

Double-entry accounting required.

Every financial transaction generates:

Journal Entry
Journal Lines
Ledger Impact

Balances are calculated.

Balances are never stored.

---

# AUDIT PRINCIPLES

Every important action is logged.

Examples:

Donation Created
Expense Approved
Budget Modified
User Login

Financial records must be traceable.

---

# TENANCY MODEL

Organization-Based Multi-Tenancy

All business entities must contain:

organization_id

No cross-organization access allowed.

---

# API STANDARDS

Controllers:

/api/v1

Examples:

/api/v1/donations
/api/v1/expenses
/api/v1/campaigns

---

# CODE STANDARDS

Business Logic:
Service Layer

Persistence:
Repository Layer

Validation:
DTO Layer

Controllers:
Thin Controllers

No business logic in controllers.

No business logic in repositories.

---

# PACKAGE STRUCTURE

Feature-based modules only. Each domain owns its layers:

```
com.project.daisyDonation
├── auth/              # controller, dto, entity, repository, service
├── organization/
├── donor/
├── donation/
├── payment/
├── campaign/
├── collection/
├── pledge/
├── recurring/
├── expense/
├── fund/
├── accounting/
├── reporting/         # controller, dto, service (read-only)
└── common/            # config, security, exceptions, shared entity bases
    └── entity/        # Abstract, TenantEntity
```

Rules:

* No top-level `Entity/`, `repository/`, `service/`, or `Dto/` folders
* Domain entities live in `{module}/entity/`
* Domain repositories live in `{module}/repository/`
* Shared JPA base classes live in `common/entity/`
* Cross-module imports are allowed at service and entity relationship boundaries only

Example:

```
donation/
├── controller/DonationController.java
├── dto/DonationCreateRequest.java
├── entity/Donation.java
├── entity/DonationStatus.java
├── repository/DonationRepository.java
└── service/DonationService.java
```

---

# REPORTING PRINCIPLES

Reporting is a first-class concern.

Every module must be designed with reporting in mind.

Questions the system must answer:

* Who donated?
* How much was donated?
* What was spent?
* Where was it spent?
* Which fund paid for it?
* What is the organization's financial position?
* Can auditors verify it?

If a feature cannot contribute to accountability, reporting, governance, or financial management, it is lower priority.
