# Design

<!-- impeccable:design-schema 1 -->

## World

Light-mode premium fintech SaaS for nonprofit ERP operations. Flat surfaces, crisp gray borders, high-contrast navy type, solid cyan primary actions. Structure comes from alignment and borders—not shadows or dark chrome.

## Palette

| Role | Token | Value |
|------|-------|-------|
| Canvas | `--background` | `#F2F4F7` |
| Surface / cards / sidebar | `--card`, `--sidebar-background` | `#FFFFFF` |
| Type / headings | `--brand-navy`, `--foreground` | `#0B1C2C` |
| Primary CTA | `--brand-cyan` / `--primary` | `#0B8EC9` |
| Primary hover | `--brand-cyan-hover` | `#0978AB` |
| On primary (button label) | `--primary-foreground` | `#FFFFFF` |
| Borders | `--border` | `#D9DEE5` |
| Muted text | `--muted-foreground` | `#5B6B7C` |
| Soft cyan wash (nav active) | `--brand-pale` | `#E7F5FB` |
| Success surface / text | `--color-success-soft` / `--color-success` | `#E4F2EA` / `#1F7A54` |
| Warning surface / text | `--color-warning-soft` / `--color-warning` | `#F8EFD9` / `#B8862E` |
| Danger surface / text | `--color-danger-soft` / `--color-danger` | `#F9E8EA` / `#C44B55` |
| Destructive fill / on-fill | `--destructive` / `--destructive-foreground` | `#C44B55` / `#FFFFFF` |
| Status icons | `--color-status-icon` | `#64748B` |

Authority: `frontend/src/app/globals.css`. Stale Graphite/CrossLife docs do not override.

### Color meaning (green / red / blue / cyan)

Derived from Google Material 3 roles and Meta Horizon button semantics. Semantic color is meaning, not decoration.

| Color | Job | Use for | Do not use for |
|-------|-----|---------|----------------|
| **Cyan / blue** `#0B8EC9` | Go / recommended / interactive | Primary CTAs, links, focus ring, nav accent | Success or error meaning alone |
| **Green** `#1F7A54` on soft `#E4F2EA` | Good / done / safe outcome | Completed, Paid, Approved, Active badges/alerts | Primary Save/Submit; brand chrome |
| **Red** `#C44B55` | Stop / harm / failure | Delete/Void/Reject confirm; Failed status; error alerts | Cancel, Back, branding |
| **Amber** `#B8862E` on soft `#F8EFD9` | Caution / needs attention | Pending, Draft, warnings | Primary or destructive actions |
| **Navy / gray** | Content / structure | Body text, supporting text, borders, cards | Success/danger meaning |

**Approve vs Delete:** Approve/Complete → cyan primary button; green badge after success. Delete/Void → red destructive confirm. Cancel → outline/ghost (never red or green).

**Money:** green may tint positive/completed amounts; red for negative/failed/overdue — always with sign, label, or icon (never hue alone).

## Interaction legend (buttons & status)

Aligned with [Material Design 3 buttons](https://m3.material.io/components/all-buttons) and [Meta Horizon buttons](https://developers.meta.com/horizon/design/buttons_bp/). Showcase: `/dev/components`.

| Emphasis | FundFlow API | Color / words | Typical ops | Meta / M3 |
|----------|--------------|---------------|-------------|-----------|
| High (Primary) | `Button` default | Cyan fill + white label | Save, Continue, Confirm | Primary / filled |
| Medium (Secondary) | `outline` / `secondary` | Border or muted + navy label | Cancel, Back, See all | Secondary / outlined |
| Low (Borderless) | `ghost` / `link` | No fill; navy or cyan text | Header icons, row actions | Borderless / text |
| Destructive | `destructive` | Crimson fill + white label | Delete, Void, Reject confirm | Destructive |
| Status | `Badge` semantic | Soft container + semantic text | Completed, Failed, Pending | Containers |
| Feedback | `Alert` semantic | Soft container + title/body | Errors, success banners | Error/success containers |

Hard rules:

- Max **one** filled primary in a footer, toolbar, or dialog action row.
- Never paint Cancel/Back as destructive red.
- Never use success green as brand primary for CTAs.
- Void/Delete: outline/ghost trigger OK; confirm button is destructive filled.
- Labels: verb-first and specific (“Record gift”, not “OK”).
- `Button` supports `loading` for in-flight submits (spinner, disabled, stable width).

## Typography

Inter (400 / 500 / 600) for UI, headings, and nav. Navy headings; slate secondary copy. Tabular numerals for money.

## Layout & components

- **Shell:** Pure white left sidebar on gray canvas; white header with 1px border.
- **Nav:** Soft cyan active chip; slate icons that tint cyan when active/hover. No outline borders on links.
- **Cards:** White bento containers, 1px `#D9DEE5` border, ~10px radius, no elevation shadow.
- **Buttons:** Default = solid cyan + white label; outline/secondary = border + navy; destructive = crimson + white; ghost/link = low emphasis.
- **Badges / Alerts:** Soft emerald / crimson / amber / cyan containers; status text on tint (not white-on-saturated).
- **Depth:** Borders first; shadows only for floating layers (menus, popovers).

## Mode

**Operate** — scanability and task clarity over expression. Light mode is primary; dark is a secondary navy/cyan adaptation.

## Anti-references

Graphite/charcoal filled sidebar links, heavy Material elevation, CrossLife orange, cream+serif fintech clichés, purple gradients.
