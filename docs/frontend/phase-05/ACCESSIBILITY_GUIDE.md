# Phase 05 — Accessibility Guide

**Date:** 2026-06-30  
**Standard:** WCAG 2.1 Level AA  
**Stack:** Radix UI primitives, semantic HTML, keyboard-first interaction

---

## 1. Principles

| Principle | Application |
|-----------|-------------|
| **Perceivable** | Sufficient contrast, text alternatives, no colour-only status |
| **Operable** | Full keyboard access, visible focus, no seizure triggers |
| **Understandable** | Consistent patterns, clear labels, error identification |
| **Robust** | Semantic HTML, ARIA only when necessary, screen reader tested |

Every component in the library must meet these requirements before approval.

---

## 2. Global Requirements

### Focus management

All interactive elements use the standard focus ring:

```tsx
className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
```

- Focus ring colour: `--ring` (black light / white dark)
- Never remove focus styles without replacement
- Skip link in AppShell: `href="#main-content"`

### Colour contrast

| Pair | Minimum | Verified |
|------|---------|----------|
| Body text on background | 4.5:1 | ✅ |
| Muted text on background | 4.5:1 | ✅ |
| Primary button text on gradient | 4.5:1 | ✅ |
| Status badge text on tint | 4.5:1 | Verify per variant |

Never convey status by colour alone — always include text label.

### Reduced motion

All animations respect `prefers-reduced-motion: reduce` (implemented in `globals.css`). Components must not add animations that bypass this media query.

### Touch targets

Minimum interactive target: **32×32px** (`h-8 w-8`). Preferred: **36×36px** (`h-9`).

---

## 3. Keyboard Navigation

### Global shortcuts

| Key | Action |
|-----|--------|
| `Tab` / `Shift+Tab` | Move focus forward/backward |
| `Enter` / `Space` | Activate button, toggle checkbox |
| `Escape` | Close overlay (dialog, sheet, popover, dropdown) |
| `Cmd+K` / `Ctrl+K` | Open command palette |
| Arrow keys | Navigate within menus, tabs, radio groups, command list |

### Focus trap

Overlays (Dialog, Sheet, AlertDialog) trap focus inside while open. Radix handles this — do not override unless using custom overlay.

### Roving tabindex

Radio groups, toolbar button groups, and command palette use roving tabindex (Radix default).

---

## 4. ARIA Landmarks

Application shell provides:

```html
<a href="#main-content">Skip to content</a>
<aside aria-label="Main navigation">...</aside>
<header>...</header>
<main id="main-content">...</main>
<footer>...</footer>
```

Feature pages must not duplicate `main` landmarks.

---

## 5. Component Accessibility Reference

### Button

| Requirement | Implementation |
|-------------|----------------|
| Semantic element | `<button>` or `asChild` with `<a>` |
| Icon-only label | `aria-label="Edit donor"` required |
| Loading state | `aria-busy="true"` + `disabled` |
| Disabled | `disabled` attribute (not just styling) |

```tsx
<Button variant="ghost" size="icon" aria-label="Delete expense">
  <Trash2 className="h-4 w-4" />
</Button>
```

---

### Input / Textarea / Select

| Requirement | Implementation |
|-------------|----------------|
| Label association | `<Label htmlFor={id}>` + matching `id` |
| Error state | `aria-invalid="true"` |
| Error message | `aria-describedby={errorId}` |
| Required | `required` + visual indicator |
| Autocomplete | `autoComplete` on auth fields |

```tsx
<FormField label="Email" htmlFor="email" error={errors.email?.message}>
  <Input id="email" type="email" aria-invalid={!!errors.email} />
</FormField>
```

---

### Checkbox / Radio / Switch

| Component | ARIA | Keyboard |
|-----------|------|----------|
| Checkbox | `role="checkbox"`, `aria-checked` | Space toggles |
| Radio | `role="radiogroup"`, `aria-labelledby` | Arrow keys within group |
| Switch | `role="switch"`, `aria-checked` | Space toggles |

Group labels required for radio/checkbox lists.

---

### Dialog / Sheet

| Requirement | Implementation |
|-------------|----------------|
| Title | `DialogTitle` — required |
| Description | `DialogDescription` when context needed |
| Close | Visible close button + Escape |
| Focus | Auto-focus first focusable; restore on close |
| Background | `aria-hidden` on inert content (Radix) |

```tsx
<Dialog>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Delete donor</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    ...
  </DialogContent>
</Dialog>
```

---

### DropdownMenu / Popover

| Requirement | Implementation |
|-------------|----------------|
| Trigger | `aria-expanded`, `aria-haspopup` |
| Items | Arrow key navigation |
| Type-ahead | Built into Radix |
| Dismiss | Escape, outside click |

---

### Tabs

| Requirement | Implementation |
|-------------|----------------|
| Tab list | `role="tablist"` |
| Active tab | `aria-selected="true"` |
| Panel | `role="tabpanel"`, `aria-labelledby` |
| Keyboard | Arrow keys switch tabs |

---

### Table / DataTable

| Requirement | Implementation |
|-------------|----------------|
| Semantic table | `<table>`, `<thead>`, `<tbody>`, `<th>`, `<td>` |
| Column headers | `<th scope="col">` |
| Sortable columns | `aria-sort="ascending|descending|none"` |
| Select all | Checkbox with `aria-label="Select all"` |
| Row select | `aria-label="Select row"` |
| Empty state | Announced via visible text (not aria-live unless dynamic) |

---

### Badge / StatusBadge

| Context | ARIA |
|---------|------|
| Adjacent to descriptive text | Decorative — no ARIA |
| Standalone in table cell | Text content sufficient |
| Icon-only status | `aria-label="Status: Approved"` |

---

### Avatar

| Requirement | Implementation |
|-------------|----------------|
| Image | `alt="Jane Doe"` on `AvatarImage` |
| Fallback initials | Decorative if name adjacent |
| Standalone | `aria-label` on Avatar root |

---

### Alert

| Variant | Role |
|---------|------|
| Error / destructive | `role="alert"` |
| Info / success | `role="status"` |

```tsx
<Alert variant="destructive" role="alert">
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Failed to save record.</AlertDescription>
</Alert>
```

---

### Toast (target)

| Requirement | Implementation |
|-------------|----------------|
| Role | `role="status"` for info; `role="alert"` for errors |
| Duration | Auto-dismiss with sufficient read time (≥5s) |
| Pause | Hover pauses dismiss timer |
| Stacking | `aria-live="polite"` on container |

---

### CommandPalette

| Requirement | Implementation |
|-------------|----------------|
| Search input | `aria-label="Search commands"` |
| Results | Arrow key navigation |
| Groups | `aria-labelledby` per group heading |
| Empty | Visible "No results" text |

---

### EmptyState / ErrorState

| Component | Requirements |
|-----------|--------------|
| EmptyState | Heading (`h3`) for title; button for action |
| ErrorState | `role="alert"` when error appears dynamically |
| Actions | Retry/Refresh as `<Button>`, not `<div onClick>` |

---

### Skeleton / Loading

| Requirement | Implementation |
|-------------|----------------|
| Page skeleton | `aria-busy="true"` on loading container |
| Spinner | `role="status"` + sr-only "Loading…" |
| Button loading | `aria-busy="true"` on button |

```tsx
<div aria-busy="true" aria-label="Loading page content">
  <PageSkeleton layout="list" />
</div>
```

---

### Timeline

| Requirement | Implementation |
|-------------|----------------|
| List semantics | `<ol>` for ordered events |
| Decorative line | `aria-hidden` on connector |
| Timestamps | Visible text — no relative-only tooltips |

---

## 6. Form Validation Accessibility

1. Error summary at form top for ≥3 errors (target pattern).
2. First invalid field receives focus on submit.
3. Error messages use `text-destructive` + `aria-describedby`.
4. Success confirmation via Toast or Alert — not colour change alone.

---

## 7. Screen Reader Testing Checklist

Test with VoiceOver (macOS) or NVDA (Windows) before approving new components:

- [ ] All interactive elements reachable by Tab
- [ ] Focus order matches visual order
- [ ] Overlay titles announced on open
- [ ] Form errors announced on submit
- [ ] Table headers associated with cells
- [ ] Icon-only buttons have accessible names
- [ ] Loading states announce busy status
- [ ] Skip link works on first Tab press

---

## 8. Common Violations to Avoid

| Violation | Fix |
|-----------|-----|
| `<div onClick={...}>` | Use `<Button>` or add `role="button"` + keyboard handler |
| Placeholder as only label | Add visible `<Label>` |
| `outline: none` without ring | Add `focus-visible:ring-*` |
| Status colour only | Add text label in Badge |
| `tabIndex={0}` on non-interactive | Remove or use semantic element |
| Auto-playing animation | Respect reduced motion |
| Multiple `<main>` elements | One per page in shell |

---

## 9. Component Approval Checklist

Before merging a new UI component:

- [ ] Keyboard operable
- [ ] Focus visible
- [ ] ARIA roles correct (or semantic HTML sufficient)
- [ ] Colour contrast verified
- [ ] Works with 200% zoom
- [ ] Reduced motion respected
- [ ] Screen reader tested
- [ ] Documented in COMPONENT_API.md

---

## 10. Related Documents

- [COMPONENT_API.md](./COMPONENT_API.md) — props including aria props
- [CORE_UI_COMPONENTS.md](./CORE_UI_COMPONENTS.md) — component catalog
- Phase 03 [LAYOUT_SPECIFICATION.md](../phase-03/LAYOUT_SPECIFICATION.md) — shell landmarks
- Phase 04 [THEME_ARCHITECTURE.md](../phase-04/THEME_ARCHITECTURE.md) — contrast in both themes
- [Radix Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)
