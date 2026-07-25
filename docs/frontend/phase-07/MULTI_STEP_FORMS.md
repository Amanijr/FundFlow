# Multi-Step Forms

**Phase:** 07 — Enterprise Form System  
**Use cases:** Grant applications, vendor onboarding, campaign setup, year-end close checklists

---

## 1. When to Use a Wizard

| Use wizard | Use single-page form |
|------------|---------------------|
| 20+ fields across distinct domains | ≤15 related fields |
| User may pause and resume | Quick create flows |
| Logical review step before submit | Settings toggles |
| Different validation per stage | All fields visible aids comparison |

Examples:

```
Grant Application
  → Applicant
  → Project
  → Budget
  → Documents
  → Review

Vendor Onboarding
  → Company details
  → Banking
  → Tax documents
  → Review
```

---

## 2. Wizard Architecture

```
FormWizard
  ├── StepIndicator (progress)
  ├── step state (current index)
  ├── per-step Zod schema
  ├── single useForm OR per-step form merge
  └── FormActions (Back | Next | Submit)
```

### State machine

```
[Step 0] ──Next──▶ [Step 1] ──Next──▶ … ──▶ [Review] ──Submit──▶ Done
    ▲                  │
    └──── Previous ────┘
```

---

## 3. Step Indicator

**Existing (workflow display):** `components/workflow/workflow-stepper.tsx` — shows approval workflow status, not form navigation.

**Target:** `StepIndicator` for form wizards — similar visual language, different behaviour:

| Feature | WorkflowStepper | StepIndicator |
|---------|-----------------|---------------|
| Purpose | Read-only status | Interactive progress |
| Click step | No | Optional (completed steps only) |
| Rejected state | Yes | No |
| Validation gate | N/A | Blocks forward navigation |

### Visual spec

- Horizontal step list on desktop; compact numbered pills on mobile
- States: `complete` | `current` | `upcoming`
- `aria-current="step"` on active step
- `nav aria-label="Form progress"`

Reuse tokens from `WorkflowStepper`: `border-primary`, step number badges.

---

## 4. Schema Strategy

### Option A — Single schema, step fields (recommended)

```ts
const grantSchema = z.object({
  // step 1
  applicantName: z.string().min(1),
  applicantEmail: z.string().email(),
  // step 2
  projectTitle: z.string().min(1),
  projectSummary: z.string().max(2000),
  // step 3
  budgetLines: z.array(budgetLineSchema).min(1),
  // step 4
  attachments: z.array(z.instanceof(File)).optional(),
});

type GrantFormValues = z.infer<typeof grantSchema>;
```

Derive step schemas with `.pick`:

```ts
const stepSchemas = [
  grantSchema.pick({ applicantName: true, applicantEmail: true }),
  grantSchema.pick({ projectTitle: true, projectSummary: true }),
  grantSchema.pick({ budgetLines: true }),
  grantSchema.pick({ attachments: true }),
] as const;
```

Validate only current step fields before advancing:

```ts
async function goNext() {
  const fields = stepFieldNames[currentStep];
  const valid = await trigger(fields);
  if (valid) setCurrentStep((s) => s + 1);
}
```

### Option B — Separate schemas merged at submit

Use when steps are truly independent modules. Merge values in parent state object.

---

## 5. FormWizard Component (target API)

```tsx
const steps = [
  { id: "applicant", title: "Applicant", fields: ["applicantName", "applicantEmail"] as const },
  { id: "project", title: "Project", fields: ["projectTitle", "projectSummary"] as const },
  { id: "budget", title: "Budget", fields: ["budgetLines"] as const },
  { id: "documents", title: "Documents", fields: ["attachments"] as const },
  { id: "review", title: "Review", fields: [] as const },
];

<FormWizard
  steps={steps}
  schema={grantSchema}
  defaultValues={draft ?? undefined}
  onSubmit={handleSubmit}
  onSaveDraft={handleSaveDraft}
  renderStep={(stepId, form) => {
    switch (stepId) {
      case "applicant": return <ApplicantStep form={form} />;
      // …
    }
  }}
/>
```

`FormWizard` owns:

- `currentStep` index
- `StepIndicator` rendering
- `trigger` validation before next
- `FormActions` with Back / Next / Submit labels

Step content components receive `form` methods — they do not create their own `useForm`.

---

## 6. Review Step

Final step before submit — read-only summary of all values:

```
┌─ Applicant ──────────────────────── [Edit] ─┐
│  Jane Doe · jane@example.org                 │
├─ Project ────────────────────────── [Edit] ─┤
│  Youth literacy program                      │
├─ Budget ─────────────────────────── [Edit] ─┤
│  3 line items · Total $45,000                │
└──────────────────────────────────────────────┘
```

- **[Edit]** jumps to step index without losing data
- Group by section matching wizard steps
- Format currency/dates with Phase 06 formatters
- Show validation errors if user bypassed (should not happen)

---

## 7. Navigation Rules

| Action | Behaviour |
|--------|-----------|
| **Next** | Validate current step fields → advance |
| **Previous** | No validation; preserve values |
| **Step click** | Allow only on completed steps |
| **Submit** | Full schema validation on review step |
| **Cancel** | Confirm if `isDirty` |

Do not use browser multi-page routes for steps — single route, client step state (or query `?step=2` for deep-link optional).

---

## 8. Draft Saving

Large wizards should support pause and resume.

### Draft storage options

| Storage | Use when |
|---------|----------|
| `localStorage` | Anonymous or single-device draft |
| Server draft API | Cross-device, authenticated users |

### Draft behaviour

```tsx
const { isDirty } = formState;

// Auto-save every 30s when dirty
useEffect(() => {
  if (!isDirty || !onSaveDraft) return;
  const id = setInterval(() => onSaveDraft(getValues()), 30_000);
  return () => clearInterval(id);
}, [isDirty, onSaveDraft, getValues]);
```

| Feature | UI |
|---------|-----|
| Auto-save | Subtle "Draft saved" toast or timestamp in footer |
| Manual save | "Save draft" secondary button |
| Resume | Page loads draft id → `reset(draftValues)` |
| Conflict | Server wins or show merge dialog (server decision) |

Form state flags: `isSavingDraft` disables draft button; distinct from `isSubmitting`.

---

## 9. Confirmation After Submit

After successful submit:

1. Toast success message
2. Redirect to detail page **or**
3. Inline confirmation step with reference number

Do not clear wizard silently — user must see confirmation.

---

## 10. Example Step Component

```tsx
function ApplicantStep({ form }: { form: UseFormReturn<GrantFormValues> }) {
  const { control, formState: { errors } } = form;

  return (
    <FormSection title="Applicant information" description="Primary contact for this grant.">
      <TextField control={control} name="applicantName" label="Full name" required />
      <EmailField control={control} name="applicantEmail" label="Email" required />
    </FormSection>
  );
}
```

---

## 11. Accessibility

| Requirement | Implementation |
|-------------|----------------|
| Step progress | `aria-current="step"` |
| Step count | `Step 2 of 5` in visually hidden text |
| Focus management | Move focus to step heading on advance |
| Error on Next | Focus first invalid field |
| Review | Definition lists or tables for screen readers |

---

## 12. Mobile Wizard

- Step indicator scrolls horizontally
- One section visible per step
- Sticky footer: `[Back]` `[Next]` full width
- Review step stacks summary cards vertically

---

## 13. Relationship to WorkflowStepper

| Component | Context |
|-----------|---------|
| `StepIndicator` | User filling out a form |
| `WorkflowStepper` | Record moving through approval states |

A grant may use **both**: wizard at creation, workflow stepper on detail page after submit.

---

## 14. Implementation Roadmap

| Phase | Deliverable |
|-------|-------------|
| 1 | `StepIndicator` component |
| 2 | `useWizardSteps` hook (index, next, prev, goTo) |
| 3 | `FormWizard` shell + step validation via `trigger` |
| 4 | Review step template |
| 5 | Draft save hook + localStorage adapter |
| 6 | Server draft API integration (feature teams) |
| 7 | Reference implementation: grant application form |

---

## 15. Checklist

- [ ] Each step has its own `FormSection`(s)
- [ ] Forward navigation validates current step only
- [ ] Full validation on final submit
- [ ] Review step with edit links
- [ ] Back does not clear data
- [ ] Draft save for 20+ field wizards
- [ ] `StepIndicator` accessible
- [ ] Mobile sticky actions
