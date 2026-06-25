# Phase 2.5 Implementation — Hybrid & Physical Collections

**Status:** Implemented

## Objectives Delivered

| Deliverable | Status |
|-------------|--------|
| Payment channel `MANUAL` vs `GATEWAY` | Done |
| Manual payment recording (Finance Manager) | Done |
| Gateway payment endpoint (automated) | Done |
| `CollectionSession` entity and workflow | Done |
| One consolidated donation per verified session | Done |
| Revenue at count (`VERIFIED`) | Done |
| Reporting by `collectionType` | Done |
| Anonymous physical payment rules | Done |

## ADRs Implemented

ADR-007 through ADR-013 — see `docs/DECISIONS.md`

## API Endpoints

### Payments — `/api/v1/donations/{donationId}/payments`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/gateway` | Staff+ | Automated card/mobile payment |
| POST | `/manual` | Finance Manager, Org Admin | Record cash/cheque payment |

### Collection Sessions — `/api/v1/collection-sessions`

| Method | Path | Role | Description |
|--------|------|------|-------------|
| POST | `/` | Staff+ | Create draft session |
| GET | `/` | Authenticated | List sessions |
| GET | `/dashboard` | Authenticated | Totals by `collectionType` |
| GET | `/{id}` | Authenticated | Session detail |
| PUT | `/{id}/count` | Staff+ | Submit counted total → `COUNTED` |
| POST | `/{id}/verify` | Finance Manager | Verify → `VERIFIED` + one donation |
| POST | `/{id}/deposit` | Finance Manager | Mark bank deposited (no new revenue) |

## Workflow

### Individual cash donation
```
Create donation (PENDING) → Finance Manager records manual payment → COMPLETED
```

### Church group collection
```
Create session (DRAFT) → Submit count (COUNTED) → Finance Manager verifies (VERIFIED)
  → One anonymous COLLECTION donation + manual payment at count time
```

## Collection Types

`SERVICE_OFFERING`, `EVENT`, `DEPARTMENT`, `PROJECT`, `SPECIAL_APPEAL`

## Example: Sunday offering

```bash
# Create session
curl -X POST http://localhost:8080/api/v1/collection-sessions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"collectionType":"SERVICE_OFFERING","title":"Sunday Offering","location":"Main Sanctuary"}'

# Submit count
curl -X PUT http://localhost:8080/api/v1/collection-sessions/1/count \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"totalAmount":5000,"paymentMethod":"CASH","collectedAt":"2026-06-24T12:00:00"}'

# Finance Manager verifies (revenue recognized here)
curl -X POST http://localhost:8080/api/v1/collection-sessions/1/verify \
  -H "Authorization: Bearer $TOKEN"

# Dashboard by collection type
curl http://localhost:8080/api/v1/collection-sessions/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## Database

Migration: `V3__hybrid_collections.sql`

## Next: Phase 3 — Financial Operations

Expense management, fund allocation, approval workflows.
