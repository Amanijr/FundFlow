# FRONTEND ARCHITECTURE

## Repository location

All frontend code lives in **`frontend/`** at the repository root. This is a monorepo: Spring Boot backend in `src/main/java/`, Next.js UI in `frontend/`.

```
daisyFoDonation/
├── frontend/          ← this document applies here
├── src/main/java/     ← backend
├── docs/
└── pom.xml
```

Run the dev server from `frontend/`:

```bash
cd frontend && npm run dev
```

---

## Technology Stack

Framework:

* Next.js App Router

Language:

* TypeScript

Styling:

* Tailwind CSS

Components:

* shadcn/ui

Accessibility:

* Radix UI

Forms:

* React Hook Form
* Zod

Tables:

* TanStack Table

State:

* Zustand

Charts:

* Recharts

Icons:

* Lucide React

---

## Folder Structure

All paths below are relative to `frontend/src/`.

```
frontend/
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── .env.local
├── public/
└── src/
    ├── app/
    │   ├── (auth)/
    │   ├── (app)/
    │   ├── platform/
    │   └── layout.tsx
    ├── features/
    │   ├── dashboard/
    │   ├── donors/
    │   ├── campaigns/
    │   ├── donations/
    │   ├── funds/
    │   ├── budgets/
    │   ├── expenses/
    │   ├── accounting/
    │   ├── reporting/
    │   └── administration/
    ├── components/
    │   ├── ui/
    │   ├── layout/
    │   ├── tables/
    │   ├── forms/
    │   └── charts/
    ├── lib/
    │   ├── api/
    │   ├── auth/
    │   └── utils/
    ├── stores/
    ├── hooks/
    └── types/
```

---

## Component Rules

Shared Components:

`frontend/src/components/ui`

Business Components:

`frontend/src/features/{module}/components`

Page Components:

`frontend/src/app/**/page.tsx`

---

## State Management

Global State:

Zustand (`frontend/src/stores/`)

Server State:

TanStack Query

Never store API data in Zustand.

---

## Data Table Strategy

All tables must use:

DataTable

Built on:

TanStack Table

No custom table implementations.

---

## Form Strategy

All forms must use:

React Hook Form
+
Zod

No uncontrolled forms.

---

## Routing Strategy

Use:

Next.js App Router under `frontend/src/app/`

Example:

/donors
/donors/new
/donors/[id]

/campaigns
/campaigns/new
/campaigns/[id]

/platform/dashboard   (SUPER_ADMIN)

---

## Environment

`frontend/.env.local`:

```env
API_URL=http://localhost:8080
NEXT_PUBLIC_API_BASE=
```

`NEXT_PUBLIC_API_BASE` stays empty in development so requests use the Next.js `/api` rewrite proxy.

## Authentication (F1)

- JWT stored in Zustand + `localStorage` (`fundflow-auth` key)
- Login/register call `/api/v1/auth/*` through the proxy
- `AuthGuard` protects tenant routes under `(app)/`
- `PlatformAuthGuard` protects `/platform/*` for `SUPER_ADMIN` only

---

## Permission Strategy

Permissions should be enforced:

1. Backend
2. API Layer
3. UI Layer

Never rely on frontend only.
