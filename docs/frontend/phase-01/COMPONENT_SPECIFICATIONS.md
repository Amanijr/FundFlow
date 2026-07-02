# FundFlow ERP — Component Specifications

**Phase:** 01  
**Source:** Material + shadcn template (`material-shadcn-1.0.0/client/src/components/ui/`)  
**Target:** `frontend/src/components/ui/` (implementation in Phase 02+)

Each specification defines purpose, variants, states, accessibility, and usage. All components use Radix UI primitives where noted.

---

## Button

**File:** `button.tsx`  
**Primitive:** `@radix-ui/react-slot` (for `asChild`)

### Purpose
Primary interactive control for actions, form submission, and navigation triggers.

### Variants

| Variant | Visual | Usage |
|---------|--------|-------|
| `default` | Stone Material gradient (`stone-700` → `stone-800`), inset highlight, `shadow-sm` | Primary CTAs: Save, Submit, Create |
| `secondary` | Transparent, warm border, stone text | Secondary actions: Cancel adjacent, Export |
| `destructive` | `--color-danger` fill | Delete, Reject, irreversible actions |
| `outline` | Border `--border`, transparent bg | Tertiary actions, toolbar buttons |
| `ghost` | No border, hover accent bg | Icon buttons, table actions, nav |
| `link` | Primary color, underline on hover | Inline text actions |

### Sizes

| Size | Height | Padding | Usage |
|------|--------|---------|-------|
| `default` | 36px (`h-9`) | `px-3` | ERP default |
| `sm` | 32px (`h-8`) | `px-2.5` | Dense tables, toolbars |
| `lg` | 40px (`h-10`) | `px-4` | Auth pages, marketing CTAs |
| `icon` | 36×36px (`h-9 w-9`) | — | Icon-only actions |

### States

| State | Behavior |
|-------|----------|
| Default | Base variant styles |
| Hover | Gradient shift, `shadow-md` on primary; accent bg on ghost |
| Focus | `ring-2 ring-ring ring-offset-2` |
| Active | Slightly darker gradient |
| Disabled | `opacity-50`, `cursor-not-allowed`, no shadow |
| Loading | `disabled` + spinner icon, preserve label width |

### Accessibility
- Use `<button>` element or `asChild` with semantic child
- `disabled` attribute prevents interaction
- Focus ring always visible on keyboard navigation
- Loading state: `aria-busy="true"`, `aria-disabled="true"`
- Icon-only buttons require `aria-label`

### Usage

```tsx
<Button>Save Donor</Button>
<Button variant="outline">Cancel</Button>
<Button variant="destructive" size="sm">Delete</Button>
<Button variant="ghost" size="icon" aria-label="Edit">
  <Pencil className="h-4 w-4" />
</Button>
```

---

## Input

**File:** `input.tsx`  
**Primitive:** Native `<input>`

### Purpose
Single-line text, email, password, number, and search fields.

### Variants
Single visual style. Type attribute determines behavior (`text`, `email`, `password`, `number`, `search`, `tel`, `url`).

### Dimensions
- Height: `h-9` (36px) ERP / `h-10` (40px) auth pages
- Padding: `px-3`
- Border radius: `rounded-md`
- Font: `text-sm`

### States

| State | Style |
|-------|-------|
| Default | `border-input bg-background` |
| Focus | `ring-2 ring-ring ring-offset-2` |
| Disabled | `opacity-50 cursor-not-allowed` |
| Error | `border-destructive ring-destructive` (via parent FormItem) |
| Placeholder | `text-muted-foreground` |

### Accessibility
- Always pair with `<Label htmlFor={id}>`
- Error messages linked via `aria-describedby`
- `aria-invalid="true"` when validation fails
- `autocomplete` attributes on auth fields

### Usage

```tsx
<div className="space-y-1.5">
  <Label htmlFor="email">Email</Label>
  <Input id="email" type="email" placeholder="name@org.org" />
</div>
```

---

## Select

**File:** `select.tsx`  
**Primitive:** `@radix-ui/react-select`

### Purpose
Single-choice dropdown from a predefined list (status, role, fund type).

### Parts
`Select` → `SelectTrigger` → `SelectValue` + `SelectContent` → `SelectItem`

### Dimensions
- Trigger height: `h-9` (ERP) / `h-10` (template)
- Content: `min-w-[8rem]`, `shadow-md`, animated open/close

### States
Same as Input for trigger. Items highlight on keyboard focus.

### Accessibility
- Radix manages `aria-expanded`, `aria-activedescendant`
- Arrow keys navigate items
- Type-ahead search built-in
- Label required via surrounding FormItem

### Usage

```tsx
<Select value={status} onValueChange={setStatus}>
  <SelectTrigger>
    <SelectValue placeholder="Select status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="active">Active</SelectItem>
    <SelectItem value="inactive">Inactive</SelectItem>
  </SelectContent>
</Select>
```

---

## Checkbox

**File:** `checkbox.tsx`  
**Primitive:** `@radix-ui/react-checkbox`

### Purpose
Boolean selection, multi-select in tables, consent toggles.

### Dimensions
`h-4 w-4`, `rounded-sm`

### States

| State | Style |
|-------|-------|
| Unchecked | `border-primary` |
| Checked | `bg-primary text-primary-foreground` + Check icon |
| Indeterminate | Dash icon (DataTable header) |
| Disabled | `opacity-50` |
| Focus | `ring-2 ring-ring ring-offset-2` |

### Accessibility
- Radix provides `role="checkbox"`, `aria-checked`
- Label click toggles via `htmlFor` + `id`
- Group label for checkbox lists

---

## Radio

**File:** `radio-group.tsx`  
**Primitive:** `@radix-ui/react-radio-group`

### Purpose
Mutually exclusive options (payment method, report format).

### Parts
`RadioGroup` → `RadioGroupItem` + `Label`

### Dimensions
`h-4 w-4`, `rounded-full`

### States
Unchecked: border primary. Checked: filled circle indicator. Focus ring on keyboard nav.

### Accessibility
- `role="radiogroup"` with `aria-labelledby` for group label
- Arrow keys navigate within group
- Only one item tabbable per group (roving tabindex)

---

## Switch

**File:** `switch.tsx`  
**Primitive:** `@radix-ui/react-switch`

### Purpose
Immediate on/off toggles (settings, feature flags).

### Dimensions
Track: `h-6 w-11`. Thumb: `h-5 w-5`.

### States
Unchecked: `bg-input`. Checked: `bg-primary`. Thumb slides with `translate-x-5`.

### Accessibility
- `role="switch"`, `aria-checked`
- Label required describing what the switch controls
- Space/Enter toggles

---

## Card

**File:** `card.tsx`

### Purpose
Content container for data panels, dashboard widgets, form sections.

### Parts
`Card` → `CardHeader` → `CardTitle` + `CardDescription` → `CardContent` → `CardFooter`

### Variants

| Variant | Style | Usage |
|---------|-------|-------|
| Default | `rounded-lg border border-border bg-card` | Standard data container |
| Compact | Header `px-4 py-2.5`, content `px-4 py-3` | ERP list/detail pages |
| Interactive | Hover border → primary | Clickable summary cards |

### ERP density overrides (vs template)

| Part | Template | ERP standard |
|------|----------|-------------|
| CardTitle | `text-2xl` | `text-sm font-semibold` |
| CardHeader padding | `p-6` | `px-4 py-2.5 border-b` |
| CardContent padding | `p-6 pt-0` | `px-4 py-3` |

### Accessibility
- Use semantic heading for CardTitle (`<h3>`)
- CardDescription provides context via `id` for `aria-describedby`

---

## Badge

**File:** `badge.tsx`

### Purpose
Status indicators, role labels, category tags.

### Variants

| Variant | Style | Usage |
|---------|-------|-------|
| `default` | `bg-primary text-primary-foreground` | Primary status |
| `secondary` | `bg-secondary text-secondary-foreground` | Neutral tags |
| `destructive` | `bg-destructive text-destructive-foreground` | Error status |
| `outline` | `border text-foreground` | Subtle tags |
| `success` | `bg-success/10 text-success border-success/30` | Approved, active |
| `warning` | `bg-warning/10 text-warning border-warning/30` | Pending, draft |

### Dimensions
`text-xs font-semibold`, `px-2.5 py-0.5`, `rounded-full`

### Accessibility
- Decorative when adjacent to descriptive text
- If standalone status: wrap in element with `aria-label` describing full status

---

## Avatar

**File:** `avatar.tsx`  
**Primitive:** `@radix-ui/react-avatar`

### Purpose
User profile images, donor initials, org logos.

### Sizes

| Size | Dimensions | Usage |
|------|------------|-------|
| `sm` | 24px | Table rows |
| `default` | 32px | Nav bar, lists |
| `lg` | 40px | Profile headers |

### States
Image loaded → display image. Fallback → initials on `bg-muted`.

### Accessibility
- `alt` text on image describing the person
- Fallback initials are decorative if name is adjacent

---

## Alert

**File:** `alert.tsx`

### Purpose
Inline page-level messages (errors, warnings, info banners).

### Variants

| Variant | Style | Usage |
|---------|-------|-------|
| `default` | `bg-background border` | Neutral info |
| `destructive` | `border-destructive/50 text-destructive` | Error messages |
| `success` | Green tint border + text | Confirmation |
| `warning` | Amber tint border + text | Caution |

### Parts
`Alert` → icon + `AlertTitle` + `AlertDescription`

### Accessibility
- `role="alert"` for important messages
- `role="status"` for non-critical info
- Icon is decorative when title conveys meaning

### Usage

```tsx
<Alert variant="destructive">
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Error</AlertTitle>
  <AlertDescription>Failed to save donor record.</AlertDescription>
</Alert>
```

---

## Dialog

**File:** `dialog.tsx`  
**Primitive:** `@radix-ui/react-dialog`

### Purpose
Modal overlays for confirmations, quick forms, detail previews.

### Parts
`Dialog` → `DialogTrigger` → `DialogContent` → `DialogHeader` / `DialogFooter`

### Dimensions
- Max width: `max-w-lg` (512px) default
- Padding: `p-6`
- Overlay: `bg-black/80`
- Animation: fade + zoom 200ms

### Accessibility
- Focus trapped inside dialog
- Escape closes
- `DialogTitle` required (Radix enforces)
- `DialogDescription` for context
- Return focus to trigger on close

### Usage

```tsx
<Dialog>
  <DialogTrigger asChild>
    <Button variant="outline">Delete</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Confirm deletion</DialogTitle>
      <DialogDescription>This action cannot be undone.</DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="outline">Cancel</Button>
      <Button variant="destructive">Delete</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

---

## Drawer

**File:** `drawer.tsx`  
**Primitive:** `vaul`

### Purpose
Bottom sheet on mobile, side panel alternative for filters and quick actions.

### Parts
`Drawer` → `DrawerTrigger` → `DrawerContent` → `DrawerHeader` / `DrawerFooter`

### Dimensions
- Bottom sheet: `rounded-t-[10px]`, drag handle `h-2 w-[100px]`
- Overlay: `bg-black/80`

### Accessibility
- Same focus trap as Dialog
- Drag handle is visual only; close via button or overlay click
- Prefer Dialog on desktop; Drawer on mobile breakpoints

---

## Tooltip

**File:** `tooltip.tsx`  
**Primitive:** `@radix-ui/react-tooltip`

### Purpose
Brief contextual help on icon buttons and truncated text.

### Dimensions
`text-sm`, `px-3 py-1.5`, `shadow-md`, `sideOffset: 4`

### Accessibility
- Content available on hover and focus
- `TooltipProvider` with `delayDuration={300}` at app root
- Never put essential information only in tooltips
- Not keyboard-discoverable on touch devices — provide alternative

---

## Popover

**File:** `popover.tsx`  
**Primitive:** `@radix-ui/react-popover`

### Purpose
Floating content panels (date pickers, filter menus, action menus).

### Dimensions
`w-72` default, `shadow-md`, animated open/close

### Accessibility
- Focus trapped when containing interactive elements
- Escape closes
- Trigger must be keyboard accessible

---

## Breadcrumb

**File:** `breadcrumb.tsx`

### Purpose
Hierarchical navigation trail (Dashboard → Donors → John Smith).

### Parts
`Breadcrumb` → `BreadcrumbList` → `BreadcrumbItem` → `BreadcrumbLink` / `BreadcrumbPage`

### Style
`text-sm text-muted-foreground`, separator `ChevronRight h-4 w-4`

### Accessibility
- `<nav aria-label="breadcrumb">`
- Current page: `aria-current="page"`, not a link
- `BreadcrumbEllipsis` for collapsed paths

---

## Tabs

**File:** `tabs.tsx`  
**Primitive:** `@radix-ui/react-tabs`

### Purpose
Module sub-navigation (Accounting: Chart of Accounts | Journal Entries | GL).

### Parts
`Tabs` → `TabsList` → `TabsTrigger` → `TabsContent`

### Style
- List: `bg-muted h-10 p-1 rounded-md`
- Active trigger: `bg-background shadow-sm`
- Content: `mt-2`

### Accessibility
- Arrow keys switch tabs
- `aria-selected` on active trigger
- Tab panel labelled by trigger

---

## Accordion

**File:** `accordion.tsx`  
**Primitive:** `@radix-ui/react-accordion`

### Purpose
Collapsible sections (report filters, FAQ, settings groups).

### Parts
`Accordion` → `AccordionItem` → `AccordionTrigger` + `AccordionContent`

### Style
- Item border-bottom
- Chevron rotates 180° on open
- Animation: `accordion-down` / `accordion-up` 200ms

### Accessibility
- `aria-expanded` on trigger
- Space/Enter toggles
- Single or multiple expand via `type` prop

---

## Skeleton

**File:** `skeleton.tsx`

### Purpose
Loading placeholders matching content layout.

### Style
`animate-pulse rounded-md bg-muted`

### ERP enhancement
Use `.skeleton-shimmer` from `globals.css` for branded shimmer effect on page skeletons.

### Accessibility
- Wrap in container with `aria-busy="true"` and `aria-label="Loading"`
- Replace with real content when loaded; don't leave skeletons indefinitely

---

## Spinner

**File:** Custom (`components/feedback/fundflow-loader.tsx`)

### Purpose
Full-page and inline loading indicators.

### Variants

| Variant | Usage |
|---------|-------|
| Inline | 16px spinner in button or table cell |
| Page | `FundFlowLoader` centered in content area |
| Overlay | Full-screen with backdrop during mutations |

### Accessibility
- `role="status"`, `aria-label="Loading"`
- Paired with visible text for page-level loading

---

## Table

**File:** `table.tsx`

### Purpose
Base table primitives. ERP uses these inside `DataTable` composite.

### Parts
`Table` → `TableHeader` → `TableBody` → `TableRow` → `TableHead` / `TableCell`

### ERP density overrides

| Element | Template | ERP standard |
|---------|----------|-------------|
| TableHead height | `h-12` | `h-9` |
| TableHead text | `font-normal` | `text-xs uppercase tracking-wider font-semibold` |
| TableCell padding | `p-4` | `px-4 py-2` |
| TableHead padding | `px-4` | `px-4` |

### States
- Row hover: `hover:bg-muted/50`
- Row selected: `data-[state=selected]:bg-muted`
- Sorted column: indicator icon in header

### Accessibility
- `<th scope="col">` for column headers
- `<caption>` for table description when needed
- Sort buttons in headers: `aria-sort="ascending|descending|none"`

---

## Form

**File:** `form.tsx`  
**Integration:** React Hook Form + Zod

### Purpose
Structured form layout with validation, labels, and error messages.

### Parts
`Form` → `FormField` → `FormItem` → `FormLabel` + `FormControl` + `FormDescription` + `FormMessage`

### Accessibility
- `FormLabel` linked to control via `htmlFor`
- `FormMessage` linked via `aria-describedby`
- `aria-invalid="true"` on invalid fields
- Error messages announced to screen readers

### Usage

```tsx
<Form {...form}>
  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
    <FormField control={form.control} name="name" render={({ field }) => (
      <FormItem>
        <FormLabel>Name</FormLabel>
        <FormControl>
          <Input {...field} />
        </FormControl>
        <FormMessage />
      </FormItem>
    )} />
  </form>
</Form>
```

---

## Navigation Component Styles

### Sidebar item

```
Default:  text-sm text-stone-700 px-3 py-2 rounded-lg border border-transparent
Hover:    hover:bg-stone-100 transition-colors duration-200
Active:   stone gradient (same as Button default), text-stone-50, shadow-sm
Group:    text-xs font-semibold uppercase tracking-wide text-stone-500
```

### Top bar action button

```
Ghost variant, icon-sm, aria-label required
```

### Command palette item

```
text-sm px-3 py-2 hover:bg-accent rounded-md
Shortcut: text-xs text-muted-foreground ml-auto
```
