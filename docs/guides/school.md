# School Guide

**Audience:** School administrators and program staff  
**Organization type:** `SCHOOL`  
**Roles:** `ORG_ADMIN`, `FINANCE_MANAGER`, `PROGRAM_MANAGER`, `STAFF`

---

## What FundFlow offers schools

| Feature | Path | Purpose |
|---------|------|---------|
| **Sponsorships** | `/school/sponsorships` | Donor-funded student support |
| **Beneficiaries** | `/beneficiaries` | Student records |
| **Programs** | `/programs` | Educational initiatives |
| **Donations & campaigns** | `/donations`, `/campaigns` | Fees, fundraising drives |
| **Finance** | `/funds`, `/budgets`, `/expenses` | School budgeting and spending |

Schools do **not** see Church menus (ministries, attendance) or NGO **Grants** unless organization type includes those modules.

---

## Getting started (school admin)

1. Register with organization type **School**  
2. Complete [Organization Admin setup](./organization-admin.md)  
3. Create funds, for example:
   - General Operations  
   - Scholarship Fund (restricted)  
   - Capital / Infrastructure  
4. Invite Finance Manager (bursar) and Program Manager  
5. Set up **programs** for major initiatives  

---

## Guide 1 — Create a sponsorship program

1. **Programs → Programs → New** — e.g. "Student Sponsorship 2026"  
2. Link to a **restricted fund** (Scholarship Fund)  
3. Finance creates a **budget** for the program  

---

## Guide 2 — Add a student beneficiary

1. **Programs → Beneficiaries → New** (`/beneficiaries/new`)  
2. Enter student identifier, grade, and program link  
3. **Save**  

Maintain student records on the beneficiary detail page. Use edit for status changes (active, graduated, withdrawn).

---

## Guide 3 — Record a sponsorship

When a donor sponsors a student:

1. **Fundraising → Donors** — create or select donor  
2. **Fundraising → Donations → Record donation**  
   - Amount = sponsorship fee  
   - Fund = Scholarship / sponsorship fund  
   - Notes = student reference  
3. **Record payment** when received  

### Track sponsorship detail

1. **Verticals → Sponsorships** (`/school/sponsorships`)  
2. **New sponsorship** (`/school/sponsorships/new`)  
3. Link **donor**, **student (beneficiary)**, amount, and term  
4. Open `/school/sponsorships/[id]` for history  

---

## Guide 4 — Run a school fundraising campaign

1. **Fundraising → Campaigns → New** — e.g. "Library Build 2026"  
2. Set target and dates  
3. Record donations linked to campaign  
4. Report via **Reports → Campaigns**  

See [Fundraising Guide](./fundraising.md) for full steps.

---

## Guide 5 — School expenses

1. Staff submit **expenses** (supplies, transport, events) per [Finance Guide](./finance.md)  
2. Tag expenses to **program** or **fund** (scholarship disbursements, capital project)  
3. Finance approves and pays  
4. Review **Budget reports** for each term  

---

## Guide 6 — Term reporting for leadership

| Report | Use |
|--------|-----|
| Donation reports | Sponsorship income, campaign gifts |
| Budget reports | Per-program spending vs. plan |
| Financial reports | Overall school financial position |
| Beneficiary list | Students currently supported |

---

## Permissions summary

| Action | Program Manager | Staff |
|--------|-----------------|-------|
| Manage sponsorships | ✓ | ✓ |
| Manage beneficiaries | ✓ | ✓ |
| Approve expenses | ✗ | ✗ |

Expense approval stays with Finance Manager / Org Admin.

---

**Related:** [Programs & Grants](./programs-and-grants.md) · [Fundraising Guide](./fundraising.md) · [Finance Guide](./finance.md)
