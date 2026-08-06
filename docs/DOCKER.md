# Docker (VM deploy)

Run FundFlow on a VM with Docker Compose: Postgres + Spring API + Next.js web.

## Prerequisites

- Docker Engine 24+
- Docker Compose v2 (`docker compose`)
- At least ~2 GB RAM free for the first image build

## Quick start

```bash
cp .env.example .env
# Edit .env — set strong passwords, JWT_SECRET, and CORS_ALLOWED_ORIGINS
# For a remote VM, include http://<vm-ip>:3000 in CORS_ALLOWED_ORIGINS

docker compose up --build -d
```

| Service | URL |
|---------|-----|
| Web UI | http://\<vm-ip\>:3000 |
| API | http://\<vm-ip\>:8080 |
| Swagger | http://\<vm-ip\>:8080/swagger-ui.html |
| Health | http://\<vm-ip\>:8080/actuator/health |

## Images

| Image | Dockerfile | Role |
|-------|------------|------|
| `fundflow-api:local` | `./Dockerfile` | Spring Boot 3 / Java 17 |
| `fundflow-web:local` | `./frontend/Dockerfile` | Next.js standalone |
| `postgres:16-alpine` | upstream | Database |

The web container proxies `/api/*` to the `api` service on the Compose network (`INTERNAL_API_URL`).

## Common commands

```bash
docker compose ps
docker compose logs -f api web
docker compose down          # stop; keep DB volume
docker compose down -v       # stop and delete DB data
docker compose build --no-cache
```

## Build only (no start)

```bash
docker compose build
```

## Notes for VMs

- Open firewall ports `3000` and `8080` (or put a reverse proxy in front and only expose 80/443).
- Change `POSTGRES_PASSWORD`, `JWT_SECRET`, and `PLATFORM_BOOTSTRAP_SECRET` before sharing the VM.
- Set `DEV_SEED_ENABLED=false` once you no longer want demo seed data.
- First build downloads Maven/npm dependencies and can take several minutes.
