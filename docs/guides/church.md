# Church Guide

**Audience:** Church and religious institution staff  
**Organization types:** `CHURCH`, `RELIGIOUS_INSTITUTION`  
**Roles:** `ORG_ADMIN`, `FINANCE_MANAGER`, `STAFF`

---

## What FundFlow offers churches

Beyond standard fundraising and finance, churches get:

| Feature | Path | Purpose |
|---------|------|---------|
| **Ministries** | `/church/ministries` | Departments (youth, worship, outreach, etc.) |
| **Attendance** | `/church/attendance` | Service and event attendance |
| **Donations & funds** | `/donations`, `/funds` | Tithes, offerings, building fund |
| **Collection sessions** | API | Group offerings (Sunday service cash count) |

---

## Getting started (church admin)

1. Register with organization type **Church** or **Religious institution**  
2. Complete [Organization Admin setup](./organization-admin.md)  
3. Create funds typical for churches:
   - General / Operations (unrestricted)  
   - Building Fund (restricted)  
   - Missions (restricted)  
4. Invite **Finance Manager** (treasurer) and **Staff** (ushers, admin)  
5. Set up **ministries** (see below)  

---

## Guide 1 — Manage ministries

1. **Verticals → Ministries** (`/church/ministries`)  
2. **New ministry** (`/church/ministries/new`)  
3. Enter name, description, leader contact  
4. **Save**  

### Ministry detail

- Open `/church/ministries/[id]` for overview  
- Link attendance records and future budget lines to ministries  

---

## Guide 2 — Record attendance

1. **Verticals → Attendance** (`/church/attendance`)  
2. Select **service or event** date  
3. Select **ministry** (if applicable)  
4. Enter **count** or member records  
5. **Save**  

Use attendance summaries for leadership reports and participation trends.

---

## Guide 3 — Record individual tithes and gifts

Standard donation workflow — see [Fundraising Guide](./fundraising.md):

1. Add or select **donor** (member)  
2. **Record donation** — assign to correct **fund** (tithes vs. offering vs. building)  
3. **Record payment** — gateway or manual (treasurer for cash)  

---

## Guide 4 — Sunday offering (group collection)

When cash is collected in bulk (plates, baskets) before individual donor attribution:

### Workflow

```
Staff: Create collection session (Draft)
    ↓
Staff: Submit counted total (Counted)
    ↓
Finance Manager: Verify (Verified) → one consolidated donation created
    ↓
Finance Manager: Record bank deposit when cash is banked
```

### Collection types

- `SERVICE_OFFERING` — regular Sunday service  
- `EVENT` — special event  
- `DEPARTMENT` — ministry-specific collection  
- `PROJECT` — capital campaign collection  
- `SPECIAL_APPEAL` — one-off appeal  

> Collection sessions are managed via API (`/api/v1/collection-sessions`) today. Ask your technical administrator or use Swagger UI. See [PHASE2_5_IMPLEMENTATION.md](../PHASE2_5_IMPLEMENTATION.md).

### Roles

| Step | Role |
|------|------|
| Create session, submit count | Staff, Fundraising, Admin |
| Verify, deposit | Finance Manager, Org Admin |

Revenue is recognized when Finance Manager **verifies** the count — not when cash is physically collected.

---

## Guide 5 — Pledges and recurring giving

FundFlow supports **pledges** (commitment cards) and **recurring donations** via the API. Coordinate with your admin to:

- Record annual pledges  
- Set up recurring schedules  
- Report pledge fulfillment in donation reports  

---

## Guide 6 — Treasurer month-end

- [ ] All service offerings verified or individual gifts recorded  
- [ ] Cash deposited and deposit step completed on collection sessions  
- [ ] Expenses (utilities, staff, missions) approved and paid  
- [ ] Trial balance reviewed with [Accounting Guide](./accounting.md)  
- [ ] Council report from [Reports Guide](./reports.md)  

---

## Typical fund structure

| Fund | Type | Examples |
|------|------|----------|
| General Fund | Unrestricted | Operations, utilities |
| Tithes & Offerings | Unrestricted or designated | Weekly giving |
| Building Fund | Restricted | Capital projects |
| Missions | Restricted | Outreach, missionaries |

---

**Related:** [Fundraising Guide](./fundraising.md) · [Finance Guide](./finance.md) · [Organization Admin](./organization-admin.md)
