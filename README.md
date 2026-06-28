# 120 Customs

Truck build showroom (public) + private "Garage Ledger" (budget, parts, AI invoice ingestion,
maintenance). Built with **Next.js 16 + Payload CMS 3 + Postgres**, runs locally in **Docker**,
deploys to **DigitalOcean App Platform** (Docker build from GitHub).

Planning docs and the phased roadmap live in [`Claude-docs/`](Claude-docs/). Start with
[Claude-docs/README.md](Claude-docs/README.md) and the engineering rules in
[Claude-docs/07-engineering-rules.md](Claude-docs/07-engineering-rules.md).

## Local development (Docker)

Prerequisites: Docker Desktop. That's it — Node/Postgres run inside containers.

```bash
cp .env.example .env        # first time only (already present in dev)
docker compose up           # builds + starts app and Postgres
```

- App / showroom: http://localhost:3000
- Admin (Payload CMS): http://localhost:3000/admin  (create the first admin user on first visit)

The `app` container hot-reloads from your local files; Postgres data persists in the `pgdata`
volume. In the compose network the app reaches the DB at host `postgres` (see `DATABASE_URI`).

## Tests (TDD: red → green)

```bash
docker compose exec app npm run test:int    # Vitest integration tests
docker compose exec app npm run test         # int + e2e (e2e needs a Playwright-capable runner)
```

> e2e (Playwright) runs in CI on a Playwright Docker image; the slim Alpine dev container does not
> ship browsers. See [Claude-docs/07-engineering-rules.md](Claude-docs/07-engineering-rules.md).

## Deploy (DigitalOcean App Platform)

App Platform builds the Dockerfile from the GitHub repo (spec: [.do/app.yaml](.do/app.yaml)).
Deploys are gated by CI — tests must pass on `main` before a deployment is triggered.

```bash
./deploy.sh create            # first time (app + managed Postgres); or ./deploy.ps1
./deploy.sh deploy <APP_ID>   # trigger a build+deploy of latest main
```

Requires `doctl` auth. App secrets (`PAYLOAD_SECRET`, `GEMINI_API_KEY`, Spaces `S3_*`) are set on
the app; `DATABASE_URI` is injected from the managed DB. See
[docs/workflows/deploy.md](docs/workflows/deploy.md).

## Project layout

- `src/payload.config.ts` — Payload config (collections, db, admin)
- `src/collections/` — content collections (currently `Users`, `Media`; build collections added per
  [Claude-docs/03-data-model.md](Claude-docs/03-data-model.md))
- `src/app/(frontend)/` — public site · `src/app/(payload)/` — admin + API (generated)
- `tests/int` — Vitest integration · `tests/e2e` — Playwright
- `Dockerfile` — production (standalone) image for Cloud Run · `docker-compose.yml` — local stack
