# Validation Strategy

**Phase:** 07 — Enterprise Form System  
**Stack:** Zod 4 + React Hook Form + `@hookform/resolvers/zod`

---

## 1. Three Validation Layers

```
┌─────────────────────────────────────────────────────────┐
│  CLIENT (Zod + RHF)                                     │
│  Required, format, length, ranges, cross-field UX rules │
├─────────────────────────────────────────────────────────┤
│  BUSINESS (services / API)                                │
│  Fund balance, budget caps, approval state, permissions │
├─────────────────────────────────────────────────────────┤
│  SERVER (API final)                                     │
│  Authoritative validation, conflicts, security          │
└─────────────────────────────────────────────────────────┘
```

| Layer | Owner | When | User sees |
|-------|-------|------|-----------|
| Client | Zod schema in frontend | On blur / submit | Inline field errors |
| Business | Service called before or during submit | On submit | Field or summary error |
| Server | API response | After submit | `ErrorAlert` + field map |

**Never trust client validation alone.**

---

## 2. Where Schemas Live

### Current state

Schemas are **inline** in form components (e.g. `donationSchema` in `donation-form.tsx`).

### Target state (Phase 02)

```
features/
  fundraising/
    schemas/
      donation.schema.ts
    components/
      donation-form.tsx
```

### Shared primitives

```
lib/validation/
  common.ts       # email, phone, uuid, pagination
  financial.ts    # amount, currency, percentage
  dates.ts        # date ranges, fiscal periods
```

---

## 3. Schema Definition Patterns

### Basic object

```ts
import { z } from "zod";

export const donationSchema = z.object({
  donorId: z.string().optional(),
  amount: z.number().positive("Amount must be greater than zero"),
  donationType: z.enum(["ONE_TIME", "RECURRING", "PLEDGE", "IN_KIND", "COLLECTION"]),
  anonymous: z.boolean(),
  notes: z.string().max(1000, "Notes cannot exceed 1000 characters").optional(),
});

export type DonationFormValues = z.infer<typeof donationSchema>;
```

### Optional strings from empty inputs

RHF often yields `""` for empty text. Normalize in schema:

```ts
const optionalString = z
  .string()
  .transform((s) => (s.trim() === "" ? undefined : s))
  .optional();

// Or at form defaultValues: use undefined not ""
```

### Cross-field rules (client UX only)

```ts
export const donationSchema = z
  .object({ /* … */ })
  .refine((v) => v.anonymous || Boolean(v.donorId), {
    message: "Select a donor or mark as anonymous",
    path: ["donorId"],
  });
```

Use `.refine` / `.superRefine` for rules the user can fix in the form. Fund availability belongs on the server.

### Conditional fields

```ts
.superRefine((data, ctx) => {
  if (data.donationType === "IN_KIND" && !data.itemDescription) {
    ctx.addIssue({
      code: "custom",
      message: "Item description is required for in-kind gifts",
      path: ["itemDescription"],
    });
  }
});
```

Or split into step schemas for wizards (see [MULTI_STEP_FORMS.md](./MULTI_STEP_FORMS.md)).

---

## 4. React Hook Form Setup

```tsx
const {
  register,
  control,
  handleSubmit,
  setError,
  formState: { errors, isSubmitting, isDirty, isValid },
} = useForm<DonationFormValues>({
  resolver: zodResolver(donationSchema),
  defaultValues: { /* … */ },
  mode: "onSubmit",       // default — validate on submit
  // mode: "onBlur",      // stricter UX for long forms
  reValidateMode: "onChange", // re-validate after first submit
});
```

### Mode guidance

| `mode` | Use when |
|--------|----------|
| `onSubmit` | Default ERP forms |
| `onBlur` | Long forms, reduce noise |
| `onChange` | Short forms, instant feedback (use sparingly) |

---

## 5. Server Error Mapping

API returns structured errors — map to RHF `setError`:

```tsx
async function handleCreate(values: DonationFormValues) {
  try {
    await createDonation(values);
  } catch (err) {
    if (isApiValidationError(err)) {
      for (const { field, message } of err.details) {
        setError(field as keyof DonationFormValues, { message });
      }
      return;
    }
    setServerError(mapErrorMessage(err));
  }
}
```

### Error shape (target API contract)

```json
{
  "code": "VALIDATION_ERROR",
  "message": "Request validation failed",
  "details": [
    { "field": "amount", "message": "Exceeds available fund balance" },
    { "field": "campaignId", "message": "Campaign is closed" }
  ]
}
```

Business rule failures on a specific field → `setError`. Global failures → `ErrorAlert` + `serverError` prop.

---

## 6. Error Display Rules

| Source | Display |
|--------|---------|
| Zod field error | `FormField` `error={errors.field?.message}` |
| Zod root / refine | First `path` field + optional `ValidationSummary` |
| Server field error | Same as Zod — `setError` |
| Server global | `ErrorAlert` at form top |
| Network / 500 | `ErrorAlert` with retry action |

### ValidationSummary (target)

```tsx
<ValidationSummary errors={errors} />
// Lists unique error messages above form after failed submit
// aria-live="polite" for screen readers
```

**Never** display: "Something went wrong" without context.

---

## 7. Client vs Server Rule Split

| Rule type | Client (Zod) | Server |
|-----------|--------------|--------|
| Required field | ✅ | ✅ |
| Email format | ✅ | ✅ |
| Max length | ✅ | ✅ |
| Positive amount | ✅ | ✅ |
| Donor required if not anonymous | ✅ (refine) | ✅ |
| Fund has sufficient balance | ❌ | ✅ |
| User has permission | ❌ (gate UI) | ✅ |
| Unique reference number | ❌ | ✅ |
| Fiscal period open | ❌ | ✅ |
| Password strength policy | ✅ (basic) | ✅ (authoritative) |

---

## 8. Reusable Schema Fragments

```ts
// lib/validation/common.ts
export const requiredString = (label: string) =>
  z.string().min(1, `${label} is required`);

export const optionalNotes = z.string().max(2000).optional();

// lib/validation/financial.ts
export const positiveAmount = z
  .number({ error: "Amount is required" })
  .positive("Amount must be greater than zero");

export const money = positiveAmount.max(999_999_999.99);
```

Compose in feature schemas:

```ts
export const expenseSchema = z.object({
  vendorId: requiredString("Vendor"),
  amount: money,
  description: optionalNotes,
  receiptDate: z.coerce.date(),
});
```

---

## 9. Type Safety End-to-End

```ts
// Form values = schema infer
type DonationFormValues = z.infer<typeof donationSchema>;

// API request may differ — map in submit handler
async function handleFormSubmit(values: DonationFormValues) {
  await onSubmit({
    donorId: values.donorId ? Number(values.donorId) : undefined,
    amount: values.amount,
    // …
  });
}
```

Keep form types (string ids from selectors) separate from API types (numeric ids) — map at boundary.

---

## 10. Async Validation

Avoid async Zod in most cases — use submit-time server check.

When needed (e.g. username availability):

```ts
// onBlur handler in parent — not in schema
async function checkUsername(name: string) {
  const taken = await api.head(`/users?name=${name}`);
  if (taken) setError("username", { message: "Username already taken" });
}
```

Debounce 300ms. Show field-level loading indicator.

---

## 11. Testing Validation

| Test | Approach |
|------|----------|
| Schema unit tests | `expect(schema.safeParse(input).success)` |
| Form integration | RTL: submit empty → see error text |
| Server mapping | Mock API error → assert `setError` fields |

Schemas are the single source of truth — test schemas directly.

---

## 12. Checklist

- [ ] Schema in `features/*/schemas/` (not inline)
- [ ] `zodResolver` on every form
- [ ] Cross-field rules use `.refine` with `path`
- [ ] Server errors mapped via `setError` or `ErrorAlert`
- [ ] No validation logic in JSX event handlers
- [ ] No business rules pretending to be client-only security
- [ ] Sensitive fields validated server-side
