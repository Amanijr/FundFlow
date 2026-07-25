# Programs & Grants Guide

**Audience:** `PROGRAM_MANAGER`, `FINANCE_MANAGER`, `STAFF`, `ORG_ADMIN`  
**Organization types:** NGO, Foundation, Charity, Community Organization, School (programs only)

---

## What you do in FundFlow

- Run **programs** — your organization's initiatives (water project, literacy program, etc.)  
- Track **grants** — external funding with compliance requirements  
- Manage **beneficiaries** — people or groups your programs serve  

These modules appear in the sidebar under **Programs** when your organization type qualifies.

---

## Navigation

| Module | Path |
|--------|------|
| Programs | `/programs` |
| Grants | `/grants` |
| Beneficiaries | `/beneficiaries` |

---

## Guide 1 — Create a program

1. **Programs → Programs → New** (`/programs/new`)  
2. Enter:
   - **Name** and description  
   - **Start** and **end** dates  
   - Linked **budget** or fund (coordinate with finance)  
3. **Save**  

### Manage a program

- Open detail page (`/programs/[id]`) for overview and linked records  
- **Edit** (`/programs/[id]/edit`) to update dates or description  
- Associate expenses and grants to the program for utilization tracking  

---

## Guide 2 — Track a grant

1. **Programs → Grants → New** (`/grants/new`)  
2. Enter:
   - **Grant name** and funder  
   - **Award amount** and **period**  
   - Restrictions or compliance notes  
   - Linked **program** and **fund**  
3. **Save** as draft  

### Grant lifecycle

```
Created → Activated → Expenses/donations tracked → Utilization reported → Closed
```

| Action | Who |
|--------|-----|
| Create grant | Program Manager, Finance Manager, Org Admin |
| Activate / close | Finance Manager, Org Admin |

### Utilization reporting

- Charge **expenses** against the grant's fund/program  
- Run **Financial** and **Budget reports** filtered by fund/program  
- Document compliance in **Documents**  

---

## Guide 3 — Add a beneficiary

1. **Programs → Beneficiaries → New** (`/beneficiaries/new`)  
2. Enter profile details (name, identifiers, contact if appropriate)  
3. Link to **program**(s)  
4. **Save**  

### Maintain records

- Detail page (`/beneficiaries/[id]`) — history and program links  
- Edit (`/beneficiaries/[id]/edit`) — update status or details  

**School organizations** also use beneficiaries for student records; see [School Guide](./school.md) for sponsorships.

---

## Guide 4 — Program budget monitoring

1. Finance creates a **budget** with lines per program (see [Finance Guide](./finance.md))  
2. Staff submit **expenses** tagged to program/fund  
3. Program Manager reviews **Budget reports** (`/reports/budgets`)  
4. Flag variances to Finance Manager before period end  

---

## Guide 5 — Grant compliance checklist

- [ ] Grant activated with correct amount and dates  
- [ ] Dedicated **fund** created or assigned  
- [ ] Expenses use correct fund/program codes  
- [ ] Supporting documents uploaded to **Documents**  
- [ ] Utilization report exported before funder deadline  
- [ ] Grant **closed** when period ends  

---

## Permissions summary

| Action | Program Manager | Staff |
|--------|-----------------|-------|
| Create programs/grants/beneficiaries | ✓ | ✓ (beneficiaries) |
| Activate/close grants | ✗ | ✗ |
| View reports | ✓ | ✓ |

Grant activate/close requires Finance Manager or Org Admin.

---

**Related:** [Finance Guide](./finance.md) · [Reports Guide](./reports.md) · [School Guide](./school.md)
