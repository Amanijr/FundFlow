# Phase 07 — Enterprise Form System

**Date:** 2026-06-30  
**Status:** Approved (documentation)  
**Dependencies:** Phase 00–06  
**Stack:** React Hook Form, Zod, shadcn/ui, Tailwind CSS 4

---

## 1. Executive Summary

Forms are the primary interaction surface in FundFlow ERP. Every donation, expense, journal entry, budget, campaign, and setting is created or edited through a form. This phase defines a **unified Enterprise Form Framework** so modules share layouts, fields, validation, error handling, and multi-step patterns — instead of inventing forms per feature.

**Rule:** Build forms from reusable framework pieces + Zod schemas. Never duplicate field controls or validation logic inside feature pages.

---

## 2. Design Philosophy

| Principle | Application |
|-----------|-------------|
| **Consistency** | Budget creation feels like donation creation — same layout, labels, errors, buttons |
| **Separation** | Schemas validate; services enforce business rules; components render |
| **Accessibility** | Every field labelled, errors announced, keyboard complete |
| **Progressive disclosure** | Sections and wizards for large forms; single card for simple forms |
| **Trust but verify** | Client Zod + server API validation always |

---

## 3. Technology Standards

| Layer | Technology | Responsibility |
|-------|------------|----------------|
| Form state | React Hook Form 7 | Register fields, dirty/touched, submit |
| Validation | Zod 4 | Schema definitions, inferred types |
| Resolver | `@hookform/resolvers/zod` | Connect Zod to RHF |
| UI primitives | `components/ui/*` | Input, Select, Checkbox, etc. |
| Form chrome | `components/forms/*` | FormField, FormSection, field wrappers |
| Business rules | Feature services / API | Fund limits, approvals — not in UI |

---

## 4. Form Architecture

```
Page (app route)
    ↓
Feature form component (DonationForm, ExpenseForm)
    ↓
useForm + zodResolver(schema)
    ↓
FormContainer / <form>
    ↓
FormSection[] (grouped fields)
    ↓
FormField + Field component (TextField, CurrencyField, …)
    ↓
ui/* primitive (Input, Select)
    ↓
onSubmit → parent → service/API (outside form component)
```

**Forms never call APIs directly** — they receive `onSubmit` callbacks from pages that own React Query mutations.

---

## 5. Current vs Target

### Implemented today

| Piece | Path | Status |
|-------|------|--------|
| FormField | `components/forms/form-field.tsx` | Exists |
| FormSection | `components/forms/form-section.tsx` | Exists |
| CurrencyInput | `components/forms/currency-input.tsx` | Exists |
| DateInput | `components/forms/date-input.tsx` | Exists |
| EntitySelector | `components/forms/entity-selector.tsx` | Exists (lookup placeholder) |
| FileUploader | `components/forms/file-uploader.tsx` | Exists (basic) |
| Domain forms | `components/*/**-form.tsx` | ~15 forms with RHF + Zod |
| Workflow stepper | `components/workflow/workflow-stepper.tsx` | Status display (not form wizard) |

### Target structure

```
components/forms/
├── layout/
│   ├── form-container.tsx
│   ├── form-section.tsx      # migrate existing
│   ├── form-card.tsx
│   ├── form-footer.tsx
│   └── form-actions.tsx
├── fields/
│   ├── form-field.tsx        # migrate existing
│   ├── text-field.tsx
│   ├── currency-field.tsx
│   ├── date-field.tsx
│   ├── select-field.tsx
│   └── lookup-field.tsx
├── wizard/
│   ├── form-wizard.tsx
│   └── step-indicator.tsx
├── validation/
│   └── validation-summary.tsx
└── index.ts
```

Schemas target location: `features/{domain}/schemas/*.ts` (per Phase 02).

---

## 6. Standard Form Page Layout

```
PageHeader (title, breadcrumbs, optional cancel link)
    ↓
ErrorAlert / ValidationSummary (server or form-level errors)
    ↓
<form>
  FormSection (section 1)
  FormSection (section 2)
  FormActions (Cancel | Save Draft | Submit)
</form>
```

Never place bare `Input` elements directly on the page without `FormField` + section wrapper.

Reference: `components/donations/donation-form.tsx`.

---

## 7. Form States

| State | RHF signal | UI behaviour |
|-------|------------|--------------|
| Pristine | `!formState.isDirty` | No unsaved indicator |
| Dirty | `formState.isDirty` | Optional "unsaved changes" warning on navigate |
| Valid | `formState.isValid` | Submit enabled |
| Invalid | `errors` populated | Inline field errors |
| Submitting | `formState.isSubmitting` | Submit button loading/disabled |
| Submitted | `formState.isSubmitSuccessful` | Redirect or success toast |
| Saving draft | Custom `isSavingDraft` | Draft button loading |
| Disabled | `readOnly` / permission | Fields disabled, actions hidden |

---

## 8. Button Conventions

| Action | Variant | Position |
|--------|---------|----------|
| Save / Submit | `default` (primary) | Right |
| Cancel | `outline` | Left of primary |
| Save draft | `secondary` / `outline` | Left of primary |
| Delete | `destructive` | Separated, left or confirm dialog |

```tsx
<div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
  {onCancel && <Button variant="outline" onClick={onCancel}>Cancel</Button>}
  <Button type="submit" disabled={isSubmitting}>Save</Button>
</div>
```

---

## 9. Responsive Strategy

| Viewport | Layout |
|----------|--------|
| Desktop | `FormSection` grid `sm:grid-cols-2`; full-width fields `sm:col-span-2` |
| Tablet | Same grid, reduced padding |
| Mobile | Single column; sticky `FormActions` at bottom (target) |

`FormSection` already uses `grid gap-3 p-4 sm:grid-cols-2`.

---

## 10. Security

- Client validation is UX only — server always validates
- Sensitive fields: password, bank details, control numbers — server-side rules required
- Never log form values containing PII in client console
- Permission-gate submit actions with `PermissionGate` at page level

---

## 11. Related Documents

| Document | Contents |
|----------|----------|
| [FORM_LAYOUT_GUIDE.md](./FORM_LAYOUT_GUIDE.md) | Page → card → section → field hierarchy |
| [FIELD_COMPONENTS.md](./FIELD_COMPONENTS.md) | Field catalogue and RHF integration |
| [VALIDATION_STRATEGY.md](./VALIDATION_STRATEGY.md) | Zod, client/server, error display |
| [FILE_UPLOAD_GUIDE.md](./FILE_UPLOAD_GUIDE.md) | Upload UX and validation |
| [MULTI_STEP_FORMS.md](./MULTI_STEP_FORMS.md) | Wizards, steps, review |
| Phase 05 [CORE_UI_COMPONENTS.md](../phase-05/CORE_UI_COMPONENTS.md) | UI primitives |
| Phase 06 [ENTERPRISE_DATA_EXPERIENCE.md](../phase-06/ENTERPRISE_DATA_EXPERIENCE.md) | List pages complement forms |

---

## 12. Acceptance Criteria

- [x] Form architecture documented
- [x] Layout hierarchy defined
- [x] Field component catalogue defined
- [x] Validation strategy documented
- [x] File upload guide documented
- [x] Multi-step form strategy documented
- [ ] FormContainer / FormActions extracted
- [ ] Field components wrap RHF Controller pattern
- [ ] Schemas moved to feature folders
- [ ] All domain forms use SelectField (not raw `<select>`)
- [ ] Draft save pattern implemented
- [ ] FormWizard component implemented

---

## 13. Governance

Do not proceed to Phase 08 until this framework is reviewed and approved.

New forms must use `FormSection` + `FormField` + shared field components. Custom inputs require design system approval.
