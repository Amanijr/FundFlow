# Fiscal Period Guide

**Phase:** 13 — Financial UX & Data Standards

---

## 1. Purpose

Financial screens must clearly communicate the active fiscal year, quarter, month, and accounting period. Users should always know which period they are viewing or editing.

Current state:

- Budgets expose `fiscalYear` on create and display `FY {year}` on detail.
- Journal entries may expose `fiscalPeriodName` read-only.
- Reports and general ledger use custom date ranges.
- No shared fiscal period selector exists yet.

---

## 2. Fiscal Model

```ts
type FiscalPeriodStatus = "open" | "closed" | "locked";

interface FiscalYear {
  id: string;
  label: string;           // "FY 2026"
  startDate: string;
  endDate: string;
  status: FiscalPeriodStatus;
}

interface FiscalQuarter {
  id: string;
  fiscalYearId: string;
  label: string;           // "Q1 2026"
  startDate: string;
  endDate: string;
  status: FiscalPeriodStatus;
}

interface FiscalMonth {
  id: string;
  fiscalYearId: string;
  label: string;           // "Mar 2026"
  startDate: string;
  endDate: string;
  status: FiscalPeriodStatus;
}

interface FiscalPeriodContext {
  fiscalYear?: FiscalYear;
  fiscalQuarter?: FiscalQuarter;
  fiscalMonth?: FiscalMonth;
  accountingPeriodId?: string;
}
```

---

## 3. Active Period Display

Every financial screen should show the active period context near the header or filters.

Examples:

```text
FY 2026 · Q1 · Open
Mar 1, 2026 – Mar 31, 2026
```

Placement:

| Screen | Placement |
|--------|-----------|
| Dashboard | Below page title or inside filter bar |
| Reports | Above report filters |
| General ledger | Beside account selector |
| Budget detail | In page header description |
| Journal detail | Metadata panel |

---

## 4. `FiscalPeriodSelector` (Target)

```tsx
interface FiscalPeriodSelectorProps {
  value: FiscalPeriodContext;
  onChange: (value: FiscalPeriodContext) => void;
  granularity?: "year" | "quarter" | "month" | "custom";
  allowCustomRange?: boolean;
  disabled?: boolean;
}
```

Supported modes:

| Mode | Use |
|------|-----|
| Fiscal year | Budget summaries, annual reports |
| Quarter | Management reporting |
| Month | Operational accounting |
| Custom date range | Exception reporting only |

Default to organization primary fiscal calendar from backend settings.

---

## 5. Closed Period Rules

When a period is `closed` or `locked`:

| Action | UI behavior |
|--------|-------------|
| View records | Allowed |
| Create/edit transactions | Disabled with explanation |
| Post journal entry | Disabled |
| Export/report | Allowed |
| Reopen period | Admin-only action, not default UI |

Message example:

```text
This fiscal period is closed. New transactions cannot be posted to Mar 2026.
```

Use non-blocking banner or inline alert; do not fail silently.

---

## 6. Date Types

Financial records may carry multiple dates:

| Date type | Meaning | Display label |
|-----------|---------|---------------|
| Transaction date | Business event date | `Transaction date` |
| Posting date | Ledger posting date | `Posting date` |
| Approval date | Workflow approval timestamp | `Approved` |
| Value date | Effective value for banking | `Value date` |
| Due date | Payment due date | `Due date` |

Standards:

- Use `formatDate` / `formatDateTime` from `lib/utils/dates.ts`.
- Empty dates render as `—`.
- Do not mix date formats within one screen.

---

## 7. Forms

### Budget create

Current:

```tsx
fiscalYear: z.number().int().min(2000).max(2100)
```

Target:

- `FiscalYearField` populated from `/api/v1/fiscal-periods`
- Prevent selection of closed fiscal years for new editable budgets unless admin override

### Journal entry

Target:

- Auto-assign open period based on posting date
- Show selected period read-only after post
- Block save when posting date falls in closed period

### Reports

Target:

- Primary filter = fiscal period
- Secondary fallback = custom date range

---

## 8. Dashboards and KPIs

KPI cards should declare the comparison period:

```text
Cash position
TZS 4,500,000.00
vs previous quarter +8.2%
Period: Q1 2026
```

Welcome banners and finance widgets may accept:

```ts
fiscalPeriod?: string;
fromDate?: string;
toDate?: string;
```

Do not show KPI deltas without stating the comparison period.

---

## 9. Validation

Target validators in `lib/validation/dates.ts`:

```ts
function assertOpenFiscalPeriod(periodId: string): Promise<void>;
function assertDateWithinFiscalYear(date: string, fiscalYearId: string): boolean;
```

Client checks are advisory; server enforces closed-period edits.

Error examples:

| Case | Message |
|------|---------|
| Closed period edit | `This fiscal period is closed.` |
| Date outside selected FY | `Date must fall within FY 2026.` |
| Missing fiscal year on budget | `Select a fiscal year.` |

---

## 10. API Contracts (Target)

| Endpoint | Purpose |
|----------|---------|
| `GET /api/v1/fiscal-periods` | List years/quarters/months |
| `GET /api/v1/fiscal-periods/current` | Active open period |
| `GET /api/v1/financial-settings` | Fiscal calendar config |

Example response:

```json
{
  "current": {
    "fiscalYear": { "id": "fy-2026", "label": "FY 2026", "status": "open" },
    "fiscalQuarter": { "id": "fy-2026-q1", "label": "Q1 2026", "status": "open" }
  },
  "years": []
}
```

---

## 11. State Management

```ts
["fiscal-periods", organizationId]
["financial-settings", organizationId]
```

Recommended hook:

```ts
function useFiscalPeriodContext() {
  return {
    periods,
    current,
    setSelection,
    isClosed,
  };
}
```

Persist user selection per org in URL query or session storage if helpful, but default to backend current period on first load.

---

## 12. Accessibility

- Period selector buttons have clear labels (`Fiscal year 2026`).
- Closed period warnings use `role="status"` or `role="alert"` depending on severity.
- Date pickers are keyboard accessible.

---

## 13. Checklist

- [ ] Add fiscal period types
- [ ] Add `FiscalPeriodSelector`
- [ ] Add `useFiscalPeriodContext`
- [ ] Show active period on finance/accounting screens
- [ ] Block edits in closed periods
- [ ] Add `lib/validation/dates.ts`
- [ ] Wire current period into dashboards and reports
