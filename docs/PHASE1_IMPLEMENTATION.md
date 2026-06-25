# Phase 1 Implementation — Foundation

**Status:** Implemented (pending local verification with Java 17)

## Objectives Delivered

| Deliverable | Status |
|-------------|--------|
| JWT Authentication | Done |
| RBAC (role enum + `@PreAuthorize`) | Done |
| Organization entity & API | Done |
| User entity & auth API | Done |
| Tenant isolation (`organization_id`) | Done on Donor, Donation, Payment |
| Flyway migrations | Done (`V1__foundation_schema.sql`) |
| API standardization (`/api/v1`, `ApiResponse`) | Done |
| PostgreSQL (per ADR-002) | Done |
| Audit fields + soft delete base | Done on `Abstract` |

## Package Structure

```
com.project.daisyDonation
├── auth/           # User, Role, AuthController, AuthService
├── organization/   # Organization, OrganizationController
├── common/         # Security, exceptions, ApiResponse, config, entity bases
│   └── entity/     # Abstract, TenantEntity
├── donor/          # entity, repository, service, controller, dto
├── donation/
├── payment/
└── ...             # other feature modules follow the same layout
```

Legacy top-level `Entity/`, `repository/`, `service/`, and `Dto/` folders have been removed.

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/v1/auth/register` | Register organization + ORG_ADMIN user |
| POST | `/api/v1/auth/login` | Login and receive JWT |

### Protected
| Method | Path | Role | Description |
|--------|------|------|-------------|
| GET | `/api/v1/auth/me` | Any authenticated | Current user profile |
| POST | `/api/v1/users` | ORG_ADMIN | Invite user with role |
| GET | `/api/v1/users` | ORG_ADMIN | List organization users |
| GET | `/api/v1/users/{id}` | ORG_ADMIN | Get user by ID |
| PUT | `/api/v1/users/{id}/role` | ORG_ADMIN | Update user role |
| GET | `/api/v1/organizations/me` | Any authenticated | Current organization |
| PUT | `/api/v1/organizations/me` | ORG_ADMIN | Update organization |

## Run Locally

```bash
# 1. Start PostgreSQL
docker compose up -d

# 2. Run with Java 17
./mvnw spring-boot:run

# 3. Register an organization
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "organization": {
      "name": "Grace Community Church",
      "slug": "grace-community",
      "type": "CHURCH",
      "email": "admin@grace.org"
    },
    "email": "admin@grace.org",
    "password": "password123",
    "firstName": "Jane",
    "lastName": "Admin"
  }'
```

Set `JWT_SECRET` in production (minimum 256-bit key).

## Exit Criteria (Phase 1)

- [x] Organizations can be registered independently
- [x] Users authenticate with JWT
- [x] Tenant context flows from JWT to `TenantContext`
- [x] Donor/Donation/Payment scoped by `organization_id`
- [ ] Full verification on Java 17 runtime

## Next: Phase 2 — Core Fundraising

1. Donor CRUD API (tenant-scoped)
2. Donation workflow API (create → pay → complete)
3. Payment method enum + status sync
4. Campaign entity (foundation for Module 5)
5. Recurring donations & pledges (initial models)
