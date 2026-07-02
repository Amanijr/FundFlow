# Notification Preferences

**Phase:** 10 — Notification & Activity Center

---

## 1. Purpose

Users configure **which notifications they receive**, **how they are delivered**, and **how often** — without each module implementing its own settings screen.

Preferences are stored **per user**, scoped to organization context where applicable.

---

## 2. Preference Model

```ts
type DeliveryChannel = "in_app" | "email" | "sms" | "push";

interface CategoryPreference {
  category: NotificationCategory;
  enabled: boolean;
  channels: DeliveryChannel[];
  minSeverity?: NotificationSeverity;  // only notify at this level and above
}

interface DigestPreference {
  enabled: boolean;
  frequency: "daily" | "weekly";
  time?: string;           // HH:mm local
  dayOfWeek?: number;      // 0–6 for weekly
}

interface QuietHours {
  enabled: boolean;
  start: string;           // HH:mm
  end: string;             // HH:mm
  timezone: string;        // IANA, e.g. America/New_York
}

interface NotificationPreferences {
  userId: number;
  organizationId?: number;
  categories: CategoryPreference[];
  digest: DigestPreference;
  quietHours?: QuietHours;       // future
  globalEnabled: boolean;
  updatedAt: string;
}
```

---

## 3. Default Preferences

New users receive sensible defaults:

| Category | In-app | Email | Min severity |
|----------|--------|-------|--------------|
| `financial` | ✅ | ✅ | `warning` |
| `donations` | ✅ | ✅ | `info` |
| `campaigns` | ✅ | ❌ | `info` |
| `budgets` | ✅ | ✅ | `warning` |
| `expenses` | ✅ | ✅ | `info` |
| `users` | ✅ | ✅ | `info` |
| `security` | ✅ | ✅ | `info` |
| `workflow` | ✅ | ✅ | `info` |
| `reports` | ✅ | ❌ | `info` |
| `system` | ✅ | ✅ | `warning` |

**Critical** notifications always deliver in-app regardless of category toggle (cannot disable security critical alerts).

---

## 4. API Contracts (target)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/notifications/preferences` | GET | Load user preferences |
| `/api/v1/notifications/preferences` | PUT | Update preferences |

**PUT body:** partial `NotificationPreferences` — server merges.

**Response:**

```json
{
  "success": true,
  "data": { /* NotificationPreferences */ }
}
```

---

## 5. UI Component

**Target:** `NotificationPreferences` — settings page or dialog section.

**Route:** `/settings/notifications` (under user settings)

### Layout

```
┌─ Notification preferences ─────────────────────┐
│                                                 │
│  [Switch] Enable notifications                  │
│                                                 │
│  Categories                                     │
│  ┌─────────────────────────────────────────┐   │
│  │ Donations          [In-app] [Email]     │   │
│  │ Expenses           [In-app] [Email]     │   │
│  │ Security           [In-app] [Email]     │   │
│  │ ...                                     │   │
│  └─────────────────────────────────────────┘   │
│                                                 │
│  Email digest                                   │
│  [Switch] Send digest    [Daily ▼] at [9:00 AM] │
│                                                 │
│  [Save preferences]                             │
└─────────────────────────────────────────────────┘
```

### Form components (reuse Phase 07)

- `SwitchField` — global enable, per-category enable
- `SelectField` — digest frequency
- `CheckboxField` — channel toggles per row

Validation via Zod:

```ts
const preferencesSchema = z.object({
  globalEnabled: z.boolean(),
  categories: z.array(categoryPreferenceSchema),
  digest: digestPreferenceSchema,
});
```

---

## 6. Hook

```ts
export function useNotificationPreferences() {
  return useQuery({
    queryKey: ["notifications", "preferences", organizationId],
    queryFn: fetchNotificationPreferences,
    enabled: Boolean(token),
  });
}

export function useUpdateNotificationPreferences() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateNotificationPreferences,
    onSuccess: (data) => {
      queryClient.setQueryData(["notifications", "preferences", organizationId], data);
      toast({ title: "Preferences saved" });
    },
  });
}
```

---

## 7. Enforcement Layers

| Layer | Responsibility |
|-------|----------------|
| **Backend** | Primary — do not create notification if user opted out |
| **Frontend** | Hide disabled categories in filter defaults |
| **Real-time** | Still receive push for in-app if enabled; filter on display optional |

Frontend preferences UI is not a security boundary — backend must enforce.

---

## 8. Channel Availability

| Channel | Phase 10 | Notes |
|---------|----------|-------|
| `in_app` | ✅ | Always available |
| `email` | 🔜 Backend | Show toggle; disabled if org has no email config |
| `sms` | Future | Grayed out |
| `push` | Future | Grayed out |

Display helper text when channel unavailable: "Contact your administrator to enable email notifications."

---

## 9. Digest Preferences

Digest bundles non-urgent notifications into a single email:

- **Daily:** Send at configured time with previous 24h summary
- **Weekly:** Monday (configurable) with week summary

In-app notifications still appear immediately — digest is email-only.

---

## 10. Quiet Hours (future)

When `quietHours.enabled`:

- Suppress non-critical push/email during window
- In-app center still receives items (user checks when available)
- Critical severity bypasses quiet hours

UI placeholder: collapsed "Quiet hours (coming soon)" section.

---

## 11. Admin Overrides

Org admins may set **minimum channels** for security category:

```ts
interface OrgNotificationPolicy {
  security: { emailRequired: true };
  system: { minSeverity: "warning" };
}
```

User cannot disable below org policy — show lock icon on locked toggles.

---

## 12. Integration with User Settings

Add nav item under settings shell (Phase 03):

```
Settings
├── Profile
├── Security
├── Notifications   ← new
└── Organization (admin)
```

Link from notification center footer: "Notification settings".

---

## 13. Empty / First Visit

On first visit, show defaults pre-populated. No empty form — all categories visible with defaults checked.

---

## 14. Accessibility

- Each category row: `fieldset` + `legend` for screen readers
- Channel checkboxes: explicit labels "Email notifications for Donations"
- Save button: `aria-busy` during mutation

---

## 15. Checklist

- [ ] `NotificationPreferences` type
- [ ] API GET/PUT client functions
- [ ] `useNotificationPreferences` hook
- [ ] Settings page `/settings/notifications`
- [ ] Category × channel matrix UI
- [ ] Digest configuration
- [ ] Save with toast confirmation
- [ ] Org policy lock indicators (when backend supports)
- [ ] Link from notification center
