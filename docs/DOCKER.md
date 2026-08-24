# Docker (VM deploy)

Run FundFlow with Docker Compose. Three images: **DB**, **API**, and **web**.

## Prerequisites

- Docker Engine 24+
- Docker Compose v2 (`docker compose`)
- Several GB free disk (the first image build is large)

## Images

| Image | Dockerfile | Role |
|-------|------------|------|
| `fundflow-db:local` | `docker/postgres/Dockerfile` | PostgreSQL 16 |
| `fundflow-api:local` | `./Dockerfile` | Spring Boot API |
| `fundflow-web:local` | `./frontend/Dockerfile` | Next.js (live API) |
| `fundflow-web:mock` | `./frontend/Dockerfile` | Next.js (frontend mock data) |

## 1. Live platform (DB + API + web)

Uses the real backend. No dummy CrossLife users.

```bash
cp .env.example .env
# Local default uses the test JWT and bootstrap secrets. Rotate them on a shared VM.

docker compose build
docker compose up -d
```

| Service | URL |
|---------|-----|
| Web UI | http://localhost:3000 |
| API | http://localhost:8080 |
| Health | http://localhost:8080/actuator/health |

Register an organization at `/register`, or bootstrap a platform owner.

## 2. Frontend mock API (web only)

Uses the mock data already in the frontend. **Does not start** Postgres or the API.

```bash
docker compose -f docker-compose.mock.yml up --build -d
```

Open http://localhost:3000. Sign in with any email and password `demo`.

Stop: `docker compose -f docker-compose.mock.yml down`

Do not run this at the same time as the live stack on port 3000.

## 3. Live API + dummy seed

Real backend, with CrossLife demo users (`admin@demo.local` / `demo`):

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
```

## Common commands

```bash
docker compose ps
docker compose logs -f api web
docker compose down          # stop; keep DB volume
docker compose down -v       # stop and delete DB data
docker compose build --no-cache
```

Build images without starting:

```bash
docker compose build
```

## Notes for VMs

- Open firewall ports `3000` and `8080` (or put a reverse proxy in front and only expose 80/443).
- Change `POSTGRES_PASSWORD`, `JWT_SECRET`, and `PLATFORM_BOOTSTRAP_SECRET` before sharing the VM. Local `.env.example` uses the test-suite secrets.
- Default Compose is production (`SPRING_PROFILES_ACTIVE=prod`): no dummy seed, Swagger disabled.
- Switching to prod does **not** delete data already in Postgres; use `docker compose down -v` for a clean database.
- First build downloads Maven/npm dependencies and can take several minutes.
