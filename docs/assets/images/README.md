# Screenshot gallery

Reusable figures for user guides and the manual. Regenerate with:

```bash
# Terminal 1 — frontend (mock mode)
cd frontend && npm run dev

# Terminal 2 — capture
cd docs/scripts && npm install && npx playwright install chromium
node capture-screenshots.mjs
```

Images are saved to `docs/assets/images/screenshots/`.

## Available screenshots

| File | Screen |
|------|--------|
| `login.png` | Sign-in page |
| `executive-dashboard.png` | Executive dashboard |
| `finance-dashboard.png` | Finance dashboard |
| `fundraising-dashboard.png` | Fundraising dashboard |
| `donors-list.png` | Donors list |
| `donations-list.png` | Donations list |
| `record-donation.png` | Record donation form |
| `campaigns-list.png` | Campaigns list |
| `funds-list.png` | Funds list |
| `expenses-list.png` | Expenses list |
| `budgets-list.png` | Budgets list |
| `chart-of-accounts.png` | Chart of accounts |
| `reports-hub.png` | Reports hub |
| `approvals.png` | Approvals inbox |
| `admin-users.png` | User management |
| `notifications.png` | Notification center |

## Embed in Markdown

```markdown
![Executive dashboard](../assets/images/screenshots/executive-dashboard.png)
*Figure: Executive dashboard — KPIs and quick actions.*
```

Use paths relative to the markdown file location.
