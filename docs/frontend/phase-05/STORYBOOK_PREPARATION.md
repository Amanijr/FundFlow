# Phase 05 — Storybook Preparation

**Date:** 2026-06-30  
**Status:** Documentation only — Storybook not yet installed  
**Goal:** Every UI component is designed for deterministic, isolated documentation.

---

## 1. Purpose

Storybook will become the visual regression and documentation surface for `components/ui/` and enterprise display components. This document defines structure, conventions, and setup requirements so components can be documented without refactoring when Storybook is adopted.

---

## 2. Installation Plan (future)

```bash
cd frontend
npx storybook@latest init
```

### Expected configuration

| File | Purpose |
|------|---------|
| `frontend/.storybook/main.ts` | Framework: `@storybook/nextjs` |
| `frontend/.storybook/preview.ts` | Global decorators, theme toggle |
| `frontend/src/**/*.stories.tsx` | Co-located with components |

### Dependencies

- `@storybook/nextjs`
- `@storybook/addon-essentials` (controls, actions, docs)
- `@storybook/addon-a11y` (accessibility audit)
- `@storybook/addon-themes` (light/dark toggle)

---

## 3. Story File Conventions

### Location

Co-locate stories with components:

```
components/ui/button.tsx
components/ui/button.stories.tsx

components/display/empty-state.tsx
components/display/empty-state.stories.tsx
```

### Naming

| Item | Convention |
|------|------------|
| File | `component-name.stories.tsx` |
| Title | `UI/Button`, `Display/EmptyState`, `Enterprise/KpiCard` |
| Story names | PascalCase describing state: `Primary`, `WithLoading`, `Disabled` |

### Template

```tsx
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["default", "outline", "ghost", "destructive", "secondary", "link"] },
    size: { control: "select", options: ["default", "sm", "lg", "icon"] },
    disabled: { control: "boolean" },
    loading: { control: "boolean" },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: { children: "Save donor" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Cancel" },
};

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete" },
};

export const Loading: Story = {
  args: { loading: true, children: "Saving…" },
};

export const IconOnly: Story = {
  args: { variant: "ghost", size: "icon", "aria-label": "Edit", children: "✎" },
};
```

---

## 4. Global Decorators

### Theme decorator

Wrap all stories with AppProviders for token context:

```tsx
// .storybook/preview.ts
import { ThemeProvider } from "next-themes";
import "../src/app/globals.css";

export const decorators = [
  (Story) => (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <div className="bg-background p-6 text-foreground">
        <Story />
      </div>
    </ThemeProvider>
  ),
];
```

### Theme switcher addon

```tsx
export const parameters = {
  themes: {
    default: "light",
    list: [
      { name: "light", class: "", color: "#fafaf9" },
      { name: "dark", class: "dark", color: "#09090b" },
    ],
  },
};
```

---

## 5. Story Categories

Mirror component folder structure:

| Storybook title prefix | Source folder |
|------------------------|---------------|
| `UI/` | `components/ui/` |
| `Display/` | `components/display/` |
| `Enterprise/` | `components/enterprise/` |
| `Tables/` | `components/tables/` |
| `Forms/` | `components/forms/` |
| `Feedback/` | `components/feedback/` |
| `Navigation/` | `components/navigation/` |

---

## 6. Deterministic Data Rules

Stories must not depend on:

- API calls or TanStack Query
- Zustand stores (unless mocked)
- Next.js router (use `parameters.nextjs.router` mock)
- Random values (`Math.random()`, `Date.now()`)

### Use fixed fixtures

```ts
// stories/fixtures/donors.ts
export const sampleDonor = {
  id: 1,
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.org",
  lifetimeValue: 12500,
};

export const sampleTableData = [
  { id: 1, name: "General Fund", balance: 125000 },
  { id: 2, name: "Building Fund", balance: 45000 },
];
```

### Mock dates

```ts
// Freeze time in stories
parameters: {
  date: new Date("2026-01-15T10:00:00Z"),
}
```

---

## 7. Required Stories Per Component

### Primitives (UI/)

Minimum stories per component:

| Story | Purpose |
|-------|---------|
| Default | Base appearance |
| All variants | One story per variant OR single story with controls |
| All sizes | sm, default, lg |
| Disabled | Non-interactive state |
| Focus | `parameters: { pseudo: { focus: true } }` via addon |
| Dark | `globals: { theme: "dark" }` |

### Composite components

| Component | Required stories |
|-----------|------------------|
| DataTable | Empty, with data, with selection, loading |
| EmptyState | With action, without action |
| StatusBadge | All workflow statuses |
| KpiCard | With trend, without trend, all variants |
| PageSkeleton | list, detail, dashboard layouts |
| CommandPalette | Default open state |

---

## 8. Accessibility Addon

Enable `@storybook/addon-a11y` on all stories. CI should fail on critical violations.

```tsx
export const parameters = {
  a11y: {
    config: {
      rules: [{ id: "color-contrast", enabled: true }],
    },
  },
};
```

Manual checks from [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) supplement automated audit.

---

## 9. Controls & Args Mapping

Map props directly to Storybook controls:

| Prop type | Control |
|-----------|---------|
| `variant` enum | `select` |
| `size` enum | `select` |
| `boolean` | `boolean` |
| `string` | `text` |
| `number` | `number` |
| `ReactNode` children | `text` or slot |
| `onClick` / events | `action` logger |

```tsx
argTypes: {
  onClick: { action: "clicked" },
  onValueChange: { action: "valueChanged" },
}
```

---

## 10. Documentation Pages (autodocs)

Enable `tags: ["autodocs"]` on each meta export. Include in component source:

```tsx
/**
 * Primary action control. Use `default` for main CTAs,
 * `outline` for secondary, `destructive` for irreversible actions.
 */
export function Button(...) {}
```

Autodocs generates API tables from TypeScript types automatically.

---

## 11. Visual Regression (optional)

When Chromatic or Percy is adopted:

- Capture light + dark variants for each primitive
- Capture responsive breakpoints via `parameters.viewport`
- Baseline on merge to main

```tsx
export const parameters = {
  chromatic: { viewports: [375, 768, 1280] },
};
```

---

## 12. Implementation Priority

| Wave | Components to story | Count |
|------|---------------------|-------|
| Wave 1 | Button, Input, Badge, Card, Avatar, Checkbox | 6 |
| Wave 2 | Dialog, Sheet, DropdownMenu, Table, EmptyState | 5 |
| Wave 3 | DataTable, StatusBadge, KpiCard, PageSkeleton | 4 |
| Wave 4 | Remaining primitives as adopted | — |

---

## 13. CI Integration (target)

```yaml
# .github/workflows/storybook.yml
- run: npm run build-storybook
- run: npx chromatic --exit-zero-on-changes  # optional
```

Add scripts to `package.json`:

```json
{
  "storybook": "storybook dev -p 6006",
  "build-storybook": "storybook build"
}
```

---

## 14. Do / Don't

### Do

- Co-locate stories with components
- Use fixed fixture data
- Test light and dark themes
- Document all variants
- Run a11y addon on every story

### Don't

- Fetch API data in stories
- Import from feature modules
- Use random IDs or timestamps
- Skip disabled/error states
- Hardcode colours outside token system

---

## 15. Related Documents

- [CORE_UI_COMPONENTS.md](./CORE_UI_COMPONENTS.md) — component catalog
- [COMPONENT_API.md](./COMPONENT_API.md) — props for controls mapping
- [COMPONENT_VARIANTS.md](./COMPONENT_VARIANTS.md) — variant stories to create
- [ACCESSIBILITY_GUIDE.md](./ACCESSIBILITY_GUIDE.md) — a11y addon rules

---

## 16. Governance

Storybook installation is deferred until Phase 05 documentation is approved. New UI components merged after approval should include a `.stories.tsx` file when Storybook is active.
