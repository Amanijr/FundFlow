# Swagger / OpenAPI Documentation

FundFlow ERP uses [SpringDoc OpenAPI](https://springdoc.org/) for interactive API documentation.

## URLs

| Resource | URL |
|----------|-----|
| Swagger UI | http://localhost:8080/swagger-ui.html |
| OpenAPI JSON | http://localhost:8080/v3/api-docs |

## Quick start

1. Start the application: `./mvnw spring-boot:run`
2. Open Swagger UI in your browser
3. Register via **Authentication → POST /api/v1/auth/register** (no token required)
4. Copy `accessToken` from the response
5. Click **Authorize** and enter: `Bearer <accessToken>`
6. Explore and test any endpoint with **Try it out**

## API coverage

All **21 controllers** and **~114 endpoints** are documented with:

- `@Tag` — grouped by domain (Authentication, Donors, Expenses, Analytics, etc.)
- `@Operation` — summary and description per endpoint
- `@Parameter` — path and query parameter descriptions
- `@SecurityRequirement` — JWT bearer auth (except public auth endpoints)
- `@Schema` — request/response DTO descriptions

## Tag groups

| Tag | Base path |
|-----|-----------|
| Authentication | `/api/v1/auth` |
| Platform | `/api/v1/platform` |
| Users | `/api/v1/users` |
| Organization | `/api/v1/organizations` |
| Donors | `/api/v1/donors` |
| Donations | `/api/v1/donations` |
| Payments | `/api/v1/donations/{donationId}/payments` |
| Pledges | `/api/v1/pledges` |
| Recurring Donations | `/api/v1/recurring-donations` |
| Campaigns | `/api/v1/campaigns` |
| Collection Sessions | `/api/v1/collection-sessions` |
| Communications | `/api/v1/communications` |
| Funds | `/api/v1/funds` |
| Expenses | `/api/v1/expenses` |
| Budgets | `/api/v1/budgets` |
| Accounting | `/api/v1/accounting` |
| Financial Reports | `/api/v1/reports` |
| Analytics | `/api/v1/analytics` |
| Programs | `/api/v1/programs` |
| Grants | `/api/v1/grants` |
| Beneficiaries | `/api/v1/beneficiaries` |
| Church | `/api/v1/church` |
| School Sponsorships | `/api/v1/school/sponsorships` |

## Configuration

- OpenAPI bean: `common/config/OpenApiConfig.java`
- Security permit list: `common/config/SecurityConfig.java`
- SpringDoc properties: `application.properties` (`springdoc.*`)

## Notes

- Responses are wrapped in `ApiResponse<T>` with `success`, `message`, `data`, and `timestamp`.
- Role-restricted endpoints show `403 Forbidden` when the JWT user lacks the required role.
- Public endpoints: `POST /api/v1/auth/register`, `POST /api/v1/auth/login`, Swagger UI, and health check.
