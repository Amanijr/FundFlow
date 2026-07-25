# Field Components

**Phase:** 07 — Enterprise Form System  
**Location (target):** `frontend/src/components/forms/fields/`

---

## 1. Field Anatomy

Every field component must support:

```
Label *
[ Control — input / select / custom ]
Helper description (optional)
Error message (when invalid)
```

### Shared props interface

```tsx
interface BaseFieldProps<T> {
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  // RHF integration — field components accept control + name OR value/onChange
  control?: Control<FieldValues>;
  error?: string;
}
```

**Presentation** lives in field components. **Validation** lives in Zod schemas.

---

## 2. Integration with React Hook Form

### Pattern A — Controller wrapper (recommended for custom inputs)

```tsx
<FormField label="Amount" error={errors.amount?.message}>
  <Controller
    control={control}
    name="amount"
    render={({ field }) => (
      <CurrencyInput
        value={field.value}
        onChange={field.onChange}
        onBlur={field.onBlur}
        disabled={field.disabled}
      />
    )}
  />
</FormField>
```

### Pattern B — Field component owns Controller (target)

```tsx
<CurrencyField
  control={control}
  name="amount"
  label="Amount"
  required
/>
```

### Pattern C — register (native inputs only)

```tsx
<FormField label="Source" error={errors.source?.message}>
  <Input placeholder="e.g. Online" {...register("source")} />
</FormField>
```

Migrate custom inputs to Pattern B as field components are built.

---

## 3. Component Catalogue

### Layout primitives (existing)

| Component | Path | Status |
|-----------|------|--------|
| FormField | `forms/form-field.tsx` | ✅ |
| FormSection | `forms/form-section.tsx` | ✅ |

### Text inputs

| Component | Wraps | Status | Notes |
|-----------|-------|--------|-------|
| TextField | `ui/input` | 🔲 Target | Default text |
| TextareaField | `ui/textarea` | 🔲 Target | Notes, descriptions |
| PasswordField | `ui/input type=password` | 🔲 Target | Show/hide toggle |
| EmailField | `ui/input type=email` | 🔲 Target | `inputMode="email"` |
| PhoneField | `ui/input` | 🔲 Target | Format mask (display only) |

### Numeric & financial

| Component | Wraps | Status | Notes |
|-----------|-------|--------|-------|
| NumberField | `ui/input inputMode=decimal` | 🔲 Target | Integer / decimal |
| CurrencyInput | `forms/currency-input.tsx` | ✅ | Promote to CurrencyField |
| AmountField | CurrencyInput + schema | 🔲 Target | Non-negative, max digits |
| PercentageField | NumberField + `%` suffix | 🔲 Target | 0–100 |
| ExchangeRateField | NumberField | 🔲 Target | Precision rules in schema |
| ReferenceNumberField | TextField | 🔲 Target | Alphanumeric pattern |
| ControlNumberField | TextField | 🔲 Target | Server-validated |

**CurrencyInput today:** dollar prefix, strips non-numeric. Target: locale-aware symbol from org settings.

### Date & time

| Component | Wraps | Status | Notes |
|-----------|-------|--------|-------|
| DateInput | `forms/date-input.tsx` | ✅ | Native `type=date` |
| DateField | DateInput + Controller | 🔲 Target | |
| DateRangeField | Two DateInputs | 🔲 Target | Start ≤ end in schema |
| TimeField | `ui/input type=time` | 🔲 Target | |
| MonthPicker | Select 1–12 + year | 🔲 Target | Reporting |
| QuarterPicker | Q1–Q4 + year | 🔲 Target | |
| FiscalYearField | Org fiscal calendar | 🔲 Target | Business service provides bounds |
| FinancialPeriodField | Lookup | 🔲 Target | Closed periods disabled |

### Selection

| Component | Wraps | Status | Notes |
|-----------|-------|--------|-------|
| SelectField | `ui/select` | 🔲 Target | Replace raw `<select>` |
| MultiSelect | `ui/select` / cmdk | 🔲 Target | Tags for selected |
| Combobox | cmdk + popover | 🔲 Target | Searchable single |
| Autocomplete | Debounced search | 🔲 Target | Large datasets |
| CheckboxGroup | `ui/checkbox` | 🔲 Target | |
| RadioGroup | `ui/radio-group` | 🔲 Target | |
| SwitchField | `ui/switch` | 🔲 Target | Boolean toggles |
| TagInput | Chip input | 🔲 Target | Free-form tags |

### Lookup / entity selectors

| Component | Status | Notes |
|-----------|--------|-------|
| EntitySelector | ✅ `forms/entity-selector.tsx` | Generic search list |
| OrganizationSelector | 🔲 | Wrap EntitySelector + org API hook |
| UserSelector | 🔲 | Avatar + name |
| FundSelector | 🔲 | Fund code + name |
| CampaignSelector | 🔲 | Used in donation-form today |
| ApprovalSelector | 🔲 | Workflow assignee |
| VendorSelector | 🔲 | AP module |
| DonorSelector | 🔲 | Fundraising |
| BudgetSelector | 🔲 | Budget module |
| LedgerAccountSelector | 🔲 | Chart of accounts tree |

**Lookup field contract:**

```tsx
interface LookupFieldProps extends BaseFieldProps<string> {
  options: EntityOption[];
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
}
```

Parent page fetches options via React Query; field stays presentational.

### Files & media

| Component | Status | Notes |
|-----------|--------|-------|
| FileUploader | ✅ `forms/file-uploader.tsx` | Basic drag-drop |
| FileUploadField | 🔲 | RHF + validation |
| AvatarUpload | 🔲 | Image crop preview |

### Rich content

| Component | Status | Notes |
|-----------|--------|-------|
| RichText | 🔲 | Lazy-loaded editor |
| RichTextField | 🔲 | HTML or markdown storage |

---

## 4. FormField Enhancement (target)

Extend existing `FormField` for accessibility:

```tsx
<FormField
  label="Donor"
  htmlFor="donorId"
  required
  description="Search by name or email"
  error={errors.donorId?.message}
>
  …
</FormField>
```

- `required` → append `*` and `aria-required="true"` on control
- `error` → `aria-invalid="true"`, `aria-describedby` linking error id
- `htmlFor` must match control `id`

---

## 5. SelectField Example (target implementation)

```tsx
export function SelectField<T extends FieldValues>({
  control,
  name,
  label,
  options,
  placeholder,
  description,
  required,
}: SelectFieldProps<T>) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          required={required}
          description={description}
          error={fieldState.error?.message}
          htmlFor={name}
        >
          <Select value={field.value} onValueChange={field.onChange}>
            <SelectTrigger id={name}>
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FormField>
      )}
    />
  );
}
```

---

## 6. Financial Field Schemas (Zod companions)

Keep co-located with fields in docs; implement in `features/*/schemas/`:

```ts
export const amountSchema = z
  .number({ error: "Amount is required" })
  .positive("Amount must be greater than zero")
  .max(999_999_999.99, "Amount exceeds maximum");

export const percentageSchema = z
  .number()
  .min(0)
  .max(100);

export const currencyCodeSchema = z.string().length(3);
```

---

## 7. Styling Standards

| Token | Usage |
|-------|-------|
| `text-muted-foreground` | Labels (`text-xs font-medium`) |
| `text-danger` | Error text |
| `border-input` | Control borders |
| `bg-surface` | Section backgrounds |
| `h-9` | Default control height (matches `ui/input`) |

Labels: `text-xs font-medium text-muted-foreground` (current `FormField`).

Errors: `text-xs text-danger`.

---

## 8. Accessibility Requirements

| Requirement | Implementation |
|-------------|----------------|
| Labels | Every control has visible label or `aria-label` |
| Errors | `role="alert"` on error text; announced on submit |
| Focus | Visible ring from `ui` focus styles |
| Keyboard | Tab order follows visual order; combobox arrow keys |
| Required | `aria-required` + visual asterisk |
| Disabled | `aria-disabled` + reduced opacity |

---

## 9. Performance

| Scenario | Approach |
|----------|----------|
| Large option lists | Virtualize or server search (`onSearch`) |
| Autocomplete | `useDebouncedValue` (300ms) — see Phase 06 hook |
| Rich text | `dynamic(() => import(...), { ssr: false })` |
| Heavy refine validation | Validate on blur/submit, not every keystroke |

---

## 10. Migration Path

1. **Now:** Use `FormField` + `Controller` + existing inputs (donation-form pattern)
2. **Next:** Add `SelectField`, `TextField` wrapping register/Controller
3. **Then:** Rename `CurrencyInput` → internal primitive; expose `CurrencyField`
4. **Finally:** Replace raw `<select>` across ~15 domain forms

**Do not** create module-specific input variants — extend the catalogue here.

---

## 11. Export Barrel (target)

```ts
// components/forms/index.ts
export { FormField, FormSection } from "./layout";
export { TextField, CurrencyField, DateField, SelectField, LookupField } from "./fields";
export { FileUploadField } from "./fields/file-upload-field";
export { FormWizard, StepIndicator } from "./wizard";
```
