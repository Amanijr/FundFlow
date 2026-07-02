# Toast & Alert Guide

**Phase:** 10 — Notification & Activity Center

---

## 1. Purpose

FundFlow uses **three distinct surfaces** for user communication. This guide prevents duplication and defines when to use each.

| Surface | Duration | Use for |
|---------|----------|---------|
| **Toast** | 3–5 seconds, auto-dismiss | Confirmations, quick feedback |
| **Notification center** | Persistent until read/archived | Events requiring awareness |
| **Banner** | Until dismissed or condition clears | System-wide announcements |

**Rule:** One toast implementation — Sonner via `hooks/use-toast.ts`. Do not add react-hot-toast, custom snackbars, or module-specific toast wrappers.

---

## 2. Current Implementation

### Toast (Sonner)

| Piece | Path |
|-------|------|
| Provider | `components/providers/app-providers.tsx` — `<Toaster />` |
| Hook | `hooks/use-toast.ts` |
| Underlying | `sonner` |

```ts
// hooks/use-toast.ts (pattern)
import { toast as sonnerToast } from "sonner";

export function toast({
  title,
  description,
  variant = "default",
}: ToastOptions) {
  if (variant === "destructive") {
    return sonnerToast.error(title, { description });
  }
  return sonnerToast.success(title, { description });
}
```

### Banners (existing)

| Banner | Path | Trigger |
|--------|------|---------|
| `MockModeBanner` | `components/layout/banners/mock-mode-banner.tsx` | `NEXT_PUBLIC_API_MOCK` |
| `TenantContextBanner` | `components/layout/banners/tenant-context-banner.tsx` | Org context switch |

### Notification center (placeholder)

`components/layout/notifications/notification-dropdown.tsx` — not a toast; persistent inbox.

---

## 3. Decision Matrix

| Scenario | Surface | Example |
|----------|---------|---------|
| Form saved successfully | Toast | "Donation saved" |
| Export completed | Toast | "Report exported" |
| Validation error on submit | Inline field error + optional toast | "Fix errors before saving" |
| Another user approved your expense | Notification center | Inbox item + badge |
| Payment failed | Notification center (critical) | May also toast if user online |
| Scheduled maintenance tonight | Banner | Top of app shell |
| Session expiring soon | Dialog (Phase 09) | `SessionTimeoutDialog` |
| Unauthorized access | Full page | `UnauthorizedView` |
| API connection lost (notifications) | Bell indicator + center error | Not toast |

---

## 4. Toast Variants

Map to Sonner methods:

| Variant | Sonner | When |
|---------|--------|------|
| `default` / success | `toast.success` | Completed actions |
| `destructive` | `toast.error` | Failed actions user initiated |
| `info` | `toast.info` | Neutral information |
| `warning` | `toast.warning` | Reversible issues |

```ts
toast({ title: "Changes saved" });
toast({ title: "Export failed", description: "Try again.", variant: "destructive" });
```

### Duration

| Type | Duration |
|------|----------|
| Success | 3000ms |
| Error | 5000ms (user may need to read) |
| With action button | `duration: Infinity` until dismissed |

---

## 5. Toast with Actions

```ts
sonnerToast("Expense submitted", {
  action: {
    label: "View",
    onClick: () => router.push(`/expenses/${id}`),
  },
});
```

Use sparingly — prefer notification center for items user may act on later.

---

## 6. Do Not Toast

| Case | Instead |
|------|---------|
| Cross-user business events | Notification center (backend) |
| Critical security alerts | Notification center + optional modal |
| Long-running job progress | Inline progress / status panel |
| Every keystroke autosave | Silent or subtle "Saved" debounced |
| Duplicate of inbox item | Center only |

---

## 7. BannerAlert Component (target)

**Purpose:** Persistent system-wide messages below header.

```tsx
interface BannerAlertProps {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  description?: string;
  dismissible?: boolean;
  href?: string;
  onDismiss?: (id: string) => void;
}
```

### Visual spec

- Full width below `Header`
- `info`: `bg-info/10 border-info/30`
- `warning`: `bg-warning/10 border-warning/30`
- `critical`: `bg-danger/10 border-danger/30`
- Dismiss button: `X` icon, `aria-label="Dismiss announcement"`

### Placement in shell

```tsx
// components/layout/app-shell.tsx
<Header />
<BannerStack />   {/* MockMode + Tenant + system announcements */}
<main>{children}</main>
```

### Data source

```ts
GET /api/v1/announcements/active
```

Or static config for maintenance windows. Dismissed IDs stored in `localStorage` per user.

---

## 8. Relationship to Notifications

```
User action (save form)
    → toast("Saved")

Backend event (approval)
    → notification service
    → notification center (+ optional toast if severity >= warning AND user online)

System announcement (maintenance)
    → banner API
    → BannerAlert (NOT notification center)
```

---

## 9. Module Integration

### Forms (Phase 07)

```ts
const onSubmit = async (data) => {
  try {
    await saveDonation(data);
    toast({ title: "Donation saved" });
    router.push(`/donations/${id}`);
  } catch {
    toast({ title: "Save failed", variant: "destructive" });
  }
};
```

### Data tables (Phase 06)

```ts
// Bulk delete
toast({ title: `${count} records deleted` });
```

### Auth (Phase 09)

```ts
// Login success — no toast; redirect
// Session expired banner on login page — inline Alert, not toast
// Logout — optional brief toast "Signed out"
```

### Dashboard (Phase 08)

`DashboardInsights` shows operational alerts as widgets — not toasts. Click insight → navigate.

---

## 10. Styling Consistency

Toasts inherit Sonner theme from app. Ensure `Toaster` in `AppProviders` uses:

```tsx
<Toaster
  position="top-right"
  richColors
  closeButton
  toastOptions={{
    classNames: {
      toast: "bg-surface border-border text-foreground",
    },
  }}
/>
```

Match design tokens from Phase 04 — do not hardcode colors in module code.

---

## 11. Accessibility

| Surface | Requirement |
|---------|-------------|
| Toast | Sonner handles `role="status"`; keep messages concise |
| Banner | `role="alert"` for critical; `role="status"` for info |
| Notification center | Separate from toast — `aria-live` on new items only |

Avoid stacking multiple toasts — Sonner queues automatically.

---

## 12. Mobile

- Toasts: top-center on mobile (`position="top-center"` media query or Sonner `mobileOffset`)
- Banners: full width, larger tap target for dismiss
- Notification center: full-screen drawer (not toast)

---

## 13. Testing Checklist

- [ ] Single `Toaster` in provider tree
- [ ] All modules import from `@/hooks/use-toast`
- [ ] No duplicate toast libraries in `package.json`
- [ ] Success/error toasts on form submit paths
- [ ] No toast for server-pushed business events
- [ ] Banner dismiss persists across navigation
- [ ] Critical banner not dismissible without acknowledgment

---

## 14. Migration Notes

If a module uses `alert()` or `window.confirm`:

| Replace with |
|--------------|
| `alert()` for success | `toast()` |
| `alert()` for errors | `toast({ variant: "destructive" })` |
| `confirm()` for destructive | `AlertDialog` (Phase 05) |

Search codebase periodically:

```bash
rg "react-hot-toast|alert\(" frontend/src
```

---

## 15. Summary

| Need | Use |
|------|-----|
| "Done!" feedback | Toast |
| "Something happened" (persistent) | Notification center |
| "Everyone needs to know" | Banner |
| "Are you sure?" | Dialog |
| "You cannot access this" | Unauthorized page |
| Entity history | Activity timeline |

**One toast. One center. One banner stack.**
