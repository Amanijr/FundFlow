# Phase 2 Implementation — Core Fundraising

**Status:** Implemented

## Objectives Delivered

| Deliverable | Status |
|-------------|--------|
| Donor CRM (profiles, history, lifetime value) | Done |
| Donation tracking (one-time, in-kind, anonymous) | Done |
| Payment workflow (create → pay → complete) | Done |
| Campaign management | Done |
| Campaign dashboard (raised, goal %, recent donations) | Done |
| Recurring donations (schedule + manual generate) | Done |
| Pledges (create, track fulfillment) | Done |
| Payment method enum | Done |
| Flyway V2 migration | Done |

## API Endpoints

### Donors — `/api/v1/donors`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create donor |
| GET | `/` | List donors |
| GET | `/{id}` | Donor profile + donation history + KPIs |
| PUT | `/{id}` | Update donor |
| DELETE | `/{id}` | Soft delete donor |

### Campaigns — `/api/v1/campaigns`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create campaign |
| GET | `/` | List campaigns |
| GET | `/{id}` | Get campaign |
| GET | `/{id}/dashboard` | Campaign performance dashboard |
| PUT | `/{id}` | Update campaign |
| DELETE | `/{id}` | Soft delete campaign |

### Donations — `/api/v1/donations`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create donation |
| GET | `/` | List donations |
| GET | `/{id}` | Get donation detail |

### Payments — `/api/v1/donations/{donationId}/payments`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Process payment for pending donation |

### Pledges — `/api/v1/pledges`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create pledge |
| GET | `/` | List pledges |
| GET | `/{id}` | Get pledge |

### Recurring — `/api/v1/recurring-donations`
| Method | Path | Description |
|--------|------|-------------|
| POST | `/` | Create recurring schedule |
| GET | `/` | List schedules |
| GET | `/{id}` | Get schedule |
| POST | `/{id}/generate-donation` | Generate a pending donation from schedule |

## Donation Types

| Type | Behavior |
|------|----------|
| `ONE_TIME` | Created as `PENDING`, requires payment |
| `RECURRING` | Linked to recurring schedule, `PENDING` until paid |
| `PLEDGE` | Linked to pledge; fulfillment tracked on completion |
| `IN_KIND` | Auto-completed, no payment required |

## Payment Methods

`CASH`, `BANK_TRANSFER`, `MOBILE_MONEY`, `CARD`, `CHEQUE`

## Example Flow

```bash
# 1. Login (after register)
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@hope.org","password":"password123"}' \
  | jq -r '.data.accessToken')

# 2. Create donor
curl -X POST http://localhost:8080/api/v1/donors \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Mary","lastName":"Donor","email":"mary@example.com","phone":"+15551234567"}'

# 3. Create campaign
curl -X POST http://localhost:8080/api/v1/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Building Fund","targetAmount":10000,"status":"ACTIVE"}'

# 4. Create donation
curl -X POST http://localhost:8080/api/v1/donations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"donorId":1,"amount":250,"donationType":"ONE_TIME","campaignId":1}'

# 5. Process payment
curl -X POST http://localhost:8080/api/v1/donations/1/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"paymentMethod":"CARD"}'

# 6. Campaign dashboard
curl http://localhost:8080/api/v1/campaigns/1/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## Exit Criteria

- [x] Organizations can manage donor profiles
- [x] Organizations can run fundraising campaigns
- [x] Donations can be tracked end-to-end
- [x] Payments update donation status
- [x] Campaign dashboard shows performance KPIs
- [x] Pledges and recurring donations supported

## Next: Phase 3 — Financial Operations

1. Expense requests and approval workflow
2. Fund management (restricted/unrestricted)
3. Expense reporting
