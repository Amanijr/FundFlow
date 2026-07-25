# Form Layout Guide

**Phase:** 07 — Enterprise Form System  
**Audience:** Frontend developers building ERP create/edit flows

---

## 1. Layout Hierarchy

Every ERP form follows this structure — **never skip levels**:

```
Page
  └── Form Card (optional wrapper for visual grouping)
        └── Form Section(s)
              └── Form Field(s)
                    └── Input primitive
        └── Form Actions (footer)
```

### Visual diagram

```
┌─────────────────────────────────────────────────────────┐
│ PageHeader: Create Donation                    [Cancel] │
├─────────────────────────────────────────────────────────┤
│ ┌─ ErrorAlert (server) ───────────────────────────────┐ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─ FormSection: Donor Information ────────────────────┐ │
│ │  [Donor        ] [Campaign      ]                   │ │
│ │  [Anonymous □]                                       │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─ FormSection: Donation Details ─────────────────────┐ │
│ │  [Amount       ] [Type          ]                   │ │
│ │  [Notes — full width ———————————————————————————— ] │ │
│ └─────────────────────────────────────────────────────┘ │
│                              [Cancel]  [Save Donation]  │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Page Level

Use `PageLayout` + `PageHeader` from Phase 03:

```tsx
<PageLayout>
  <PageHeader
    title="Create donation"
    description="Record a new gift from a donor or anonymous source."
    actions={<Button variant="ghost" onClick={() => router.back()}>Cancel</Button>}
  />
  <DonationForm onSubmit={handleCreate} />
</PageLayout>
```

**Rules:**

- Title describes the action (`Create`, `Edit`, `Configure`)
- Description is one sentence — what the user is doing
- Destructive navigation (leave with unsaved changes) uses `beforeunload` or route guard when `isDirty`

---

## 3. Form Container

Target component: `FormContainer` — wraps `<form>` with consistent spacing and optional `id` for external submit.

```tsx
interface FormContainerProps {
  id?: string;
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  className?: string;
}

// Default: space-y-6 between sections
<form onSubmit={onSubmit} className={cn("space-y-6", className)}>
  {children}
</form>
```

Until `FormContainer` exists, use `<form className="space-y-6">` directly (current pattern in domain forms).

---

## 4. Form Card

Use `FormCard` when a form sits inside a dashboard panel or needs elevation separate from the page background.

```tsx
<FormCard title="Organization settings" description="Applies to the current tenant.">
  <FormSection title="General">…</FormSection>
  <FormSection title="Branding">…</FormSection>
</FormCard>
```

**When to use:**

- Settings pages with multiple unrelated groups
- Modal / drawer forms
- Embedded forms in split layouts

**When to skip:**

- Full-page create flows (sections alone are sufficient)

Styling: `rounded-md border border-border bg-surface` — matches `FormSection`.

---

## 5. Form Section

**Current implementation:** `components/forms/form-section.tsx`

```tsx
<FormSection
  title="Donation details"
  description="Link a donor, campaign, and gift amount"
>
  {/* fields */}
</FormSection>
```

### Section rules

| Rule | Detail |
|------|--------|
| One topic per section | "Donor Information", not "Donor and Payment" |
| 3–8 fields ideal | Split when more than ~10 fields |
| Title = noun phrase | "Payment Information", "Receipt Settings" |
| Description = helper | One line explaining why the section exists |

### Grid layout

- Default: `grid gap-3 p-4 sm:grid-cols-2`
- Full-width fields: `className="sm:col-span-2"` on `FormField`
- Odd single fields on desktop: leave one column empty or span full width intentionally

### Section ordering (create flows)

1. Identity / who (donor, vendor, employee)
2. What / details (amount, dates, description)
3. Classification (fund, campaign, account)
4. Attachments / documents
5. Review / confirmation (wizard only)

---

## 6. Form Field

**Current implementation:** `components/forms/form-field.tsx`

Every field exposes:

| Element | Required | Notes |
|---------|----------|-------|
| Label | Yes | `Label` from `ui/label` |
| Control | Yes | Input, Select, custom field |
| Description | Optional | Shown when no error |
| Error message | When invalid | `text-danger`, from RHF `errors` |
| Required indicator | When schema requires | `*` in label or `aria-required` |

```tsx
<FormField label="Amount" error={errors.amount?.message} htmlFor="amount">
  <Controller
    control={control}
    name="amount"
    render={({ field }) => <CurrencyInput {...field} />}
  />
</FormField>
```

**Do not** put validation messages in `description` — use `error` prop only.

---

## 7. Form Actions (Footer)

Target: `FormActions` — sticky on mobile, right-aligned on desktop.

```tsx
<div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
  <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
  <Button type="button" variant="secondary" onClick={handleSaveDraft} disabled={isSavingDraft}>
    Save draft
  </Button>
  <Button type="submit" disabled={isSubmitting}>
    {isSubmitting ? "Saving…" : "Save"}
  </Button>
</div>
```

### Mobile sticky bar (target)

```tsx
<div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface p-4 sm:static sm:border-0 sm:p-0">
  {/* buttons */}
</div>
```

Add `pb-24` padding to form content when sticky bar is active.

---

## 8. Error Placement

| Error type | Location |
|------------|----------|
| Field validation | Inline under field via `FormField` `error` |
| Server / API | `ErrorAlert` at top of form |
| Multi-field / refine | First field in `path`, optional `ValidationSummary` |
| Auth / permission | Page-level alert above form |

Never show generic "Something went wrong" — map API error codes to human messages in the parent page.

---

## 9. Loading & Read-Only

| Mode | Pattern |
|------|---------|
| Loading defaults | Skeleton sections or `disabled` form with spinner in header |
| Read-only view | `fieldset disabled` or per-field `readOnly`; hide submit |
| Partial edit | Disable fields user cannot change; show value as text |

---

## 10. Examples by Module

### Simple form (3–5 fields)

```
PageHeader
  FormSection "Details"
    fields…
  FormActions
```

### Standard ERP form (10–20 fields)

```
PageHeader
  ErrorAlert?
  FormSection "Donor Information"
  FormSection "Donation Details"
  FormSection "Receipt Settings"
  FormActions
```

### Settings form (multiple domains)

```
PageHeader
  FormCard "General"
    FormSection …
  FormCard "Notifications"
    FormSection …
  FormActions (single save for all — or per card)
```

See [MULTI_STEP_FORMS.md](./MULTI_STEP_FORMS.md) for grant applications and long wizards.

---

## 11. Anti-Patterns

| Avoid | Use instead |
|-------|-------------|
| Fields directly on page | `FormSection` wrapper |
| Raw `<select>` with inline classes | `SelectField` + `ui/select` |
| Validation in `onChange` handlers | Zod schema + resolver |
| Inline `margin-top` per field | `FormSection` grid gap |
| Multiple submit buttons without type | `type="button"` on non-submit actions |
| Business rules in JSX | Service layer + schema `.refine` for UX-only rules |

---

## 12. Checklist

Before merging a new form:

- [ ] Uses `PageHeader` + page layout
- [ ] All fields inside `FormSection`
- [ ] Every input wrapped in `FormField` with label + error
- [ ] `FormActions` with Cancel + Submit
- [ ] Server errors in `ErrorAlert`
- [ ] Responsive: full-width fields use `sm:col-span-2`
- [ ] Submit disabled while `isSubmitting`
