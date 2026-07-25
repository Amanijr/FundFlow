# Transaction Reference Standard

**Phase:** 13 — Financial UX & Data Standards

---

## 1. Purpose

Financial records must use stable, human-readable reference numbers instead of raw database IDs. References should be consistent, searchable, clickable, and auditable.

Current code often displays raw IDs such as `#1042` or `Journal entry #220`. Phase 13 standardizes prefixed references across modules.

---

## 2. Reference Format

Pattern:

```text
{PREFIX}-{YEAR}-{SEQUENCE}
```

Examples:

| Entity | Reference |
|--------|-----------|
| Donation | `DON-2026-000145` |
| Expense | `EXP-2026-001120` |
| Budget | `BGT-2026-000031` |
| Journal entry | `JRN-2026-002451` |
| Fund transfer | `XFR-2026-000018` |
| Payment | `PAY-2026-000902` |
| Grant | `GRT-2026-000014` |

Rules:

- Prefix is uppercase.
- Year is fiscal or calendar year based on backend policy.
- Sequence is zero-padded to 6 digits by default.
- Reference is immutable once issued.
- Reversal creates a new reference; it does not rewrite the original.

---

## 3. Formatter API (Target)

```ts
type ReferencePrefix = "DON" | "EXP" | "BGT" | "JRN" | "XFR" | "PAY" | "GRT";

function formatReference(
  value: string | number,
  prefix: ReferencePrefix,
  year?: number,
): string;

function parseReference(value: string): {
  prefix: ReferencePrefix;
  year: number;
  sequence: number;
} | null;
```

Examples:

```ts
formatReference(145, "DON", 2026); // "DON-2026-000145"
parseReference("EXP-2026-001120");
```

If backend already returns `referenceNumber`, display it directly. Do not reformat unless normalizing legacy data.

---

## 4. `TransactionReference` Component

```tsx
interface TransactionReferenceProps {
  reference: string;
  href?: string;
  monospace?: boolean;
  copyable?: boolean;
  className?: string;
}
```

Display rules:

- Use monospace or `tabular-nums` styling.
- Render as link when `href` is provided.
- Support copy-to-clipboard in detail views.
- Truncate only in very narrow table cells; full value on hover.

Example:

```tsx
<TransactionReference
  reference="EXP-2026-001120"
  href="/expenses/1120"
  copyable
/>
```

---

## 5. Payment and External References

Some records also carry external references:

| Field | Example | Use |
|-------|---------|-----|
| System reference | `EXP-2026-001120` | Primary in-app identifier |
| Payment reference | `TRX-88442211` | Bank/check/mobile money reference |
| Vendor invoice | `INV-4421` | Supporting document reference |

Display hierarchy:

1. System reference as primary link
2. External references as secondary muted text in detail view

Do not use external payment references as the primary navigation key unless no system reference exists.

---

## 6. Search and Filters

Search should match:

- Full reference
- Prefix + sequence fragment
- External payment reference when indexed

Examples:

| Query | Matches |
|-------|---------|
| `EXP-2026-001120` | Exact expense |
| `001120` | Sequence fragment |
| `TRX-88442211` | Payment reference |

List filters may expose prefix chips: Donations, Expenses, Budgets, Journals.

---

## 7. Table Usage

```ts
{
  accessorKey: "referenceNumber",
  header: "Reference",
  cell: ({ row }) => (
    <TransactionReference
      reference={row.original.referenceNumber ?? formatReference(row.original.id, "EXP")}
      href={`/expenses/${row.original.id}`}
    />
  ),
  meta: { type: "reference" },
}
```

Fallback to formatted ID only when backend reference is unavailable.

---

## 8. Detail Page Usage

Detail headers should prefer reference over internal ID:

```text
Expense EXP-2026-001120
Submitted · Mar 15, 2026
```

Breadcrumbs:

```text
Expenses / EXP-2026-001120
```

---

## 9. Validation

Client-side:

- Uppercase alphanumeric segments only in manual entry fields.
- Max length per segment documented per field.

Server-side:

- Uniqueness per organization and entity type
- No reuse after cancellation unless policy allows
- Immutable after posting

Error examples:

| Error | Message |
|-------|---------|
| Duplicate reference | `Reference EXP-2026-001120 already exists.` |
| Invalid format | `Enter a reference in the form EXP-YYYY-######.` |
| Closed period | `References cannot be changed for posted records in a closed period.` |

---

## 10. API Contracts (Target)

Responses should include:

```json
{
  "id": 1120,
  "referenceNumber": "EXP-2026-001120",
  "paymentReference": "TRX-88442211"
}
```

Generation endpoint:

```http
POST /api/v1/references/generate
{
  "entityType": "expense",
  "organizationId": 1
}
```

---

## 11. Accessibility

- Link text is the full reference, not `View`.
- Copy button uses `aria-label="Copy reference EXP-2026-001120"`.
- Screen readers should hear prefix and digits distinctly.

---

## 12. Checklist

- [ ] Add `formatReference` and `parseReference`
- [ ] Add `TransactionReference` component
- [ ] Replace raw `#id` in journal and finance tables
- [ ] Show reference in page headers and breadcrumbs
- [ ] Support payment reference as secondary metadata
- [ ] Add reference search to finance lists
