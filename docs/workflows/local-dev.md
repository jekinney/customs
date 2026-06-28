# Workflow: Local development

How to run, QA, and test the app locally. Everything runs in Docker — no host Node/Postgres needed.

## Start the stack

```bash
docker compose up           # foreground (logs visible)
docker compose up -d        # detached
```

Services:

- **app** — Next.js + Payload dev server (hot reload), `node:22-alpine`, runs `npm install && npm run dev`.
- **postgres** — `postgres:16-alpine`, data in the `pgdata` volume, healthchecked.

First boot installs deps in the container and Payload pushes its schema to Postgres automatically
(dev mode), so the first `/admin` load takes a few seconds.

## QA in the browser (do this after every step — Rule 4)

- Public site: http://localhost:3000
- Admin CMS: http://localhost:3000/admin

On first visit to `/admin`, Payload prompts you to **create the first admin user**. After that you
log in there to manage content.

## Run tests (Rule 1 — TDD red → green)

```bash
docker compose exec app npm run test:int     # Vitest integration (boots Payload + DB)
```

Integration tests connect to the `postgres` service, so run them via `docker compose exec` (inside
the network), not on the host. e2e (Playwright) runs in CI on a browser-capable image.

## Common commands

```bash
docker compose logs app -f               # follow app logs
docker compose exec app npm run generate:types       # regenerate payload-types.ts after schema changes
docker compose exec app npm run generate:importmap   # regenerate admin import map after adding admin components
docker compose down                       # stop (keep data)
docker compose down -v                    # stop + wipe DB + node_modules volumes
```

## Troubleshooting

- **500 with `Hierarchy*` / stale import errors after editing collections:** clear the Next cache
  and restart — `rm -rf .next` then `docker compose restart app`.
- **DB connection refused:** ensure the `postgres` container is healthy (`docker compose ps`); the
  app waits on its healthcheck.
- **Schema out of sync:** dev uses Payload's auto-push. For real migrations later we'll add
  `payload migrate` (tracked in the roadmap).
