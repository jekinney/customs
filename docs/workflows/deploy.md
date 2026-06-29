# Workflow: Deploy to DigitalOcean App Platform

Production runs on **DigitalOcean App Platform**, which builds our `./Dockerfile` (Next.js
standalone) straight from the connected GitHub repo, with **DigitalOcean Managed Postgres** and
**DigitalOcean Spaces** (S3-compatible) for media. The spec lives in
[`.do/app.yaml`](../../.do/app.yaml). Container listens on `$PORT` (App Platform routes to
`http_port` 8080).

## One-time setup

1. Install `doctl` and authenticate:
   ```bash
   doctl auth init        # paste a DigitalOcean API token
   ```
2. In `.do/app.yaml`, set `services[0].github.repo` to your repo slug (e.g. `jekinney/120customs`)
   and authorize DigitalOcean's GitHub app for the repo.
3. Create the app:
   ```bash
   ./deploy.sh create     # doctl apps create --spec .do/app.yaml
   ```
   Note the printed **App ID**. (The spec uses our **existing** DO Managed Postgres — it does not
   create a new one.)
4. **Database — existing DO Managed Postgres** (`ny-120-customs`, region NYC):
   - On the database: **Settings → Trusted Sources → add this App** so it can connect privately.
   - Set the `DATABASE_URI` app secret to the **PRIVATE/VPC** connection string (the
     `…l.db.ondigitalocean.com` host), e.g.
     `postgresql://doadmin:<password>@<private-host>:25060/defaultdb?sslmode=require`.
     The private host is only reachable from inside DO (which is what the App uses).
   - `DATABASE_SSL=true` is already in the spec.
5. Set the other app secrets (dashboard → app → Settings, or `doctl apps update`):
   - `PAYLOAD_SECRET` — long random string (≥32 chars)
   - `GEMINI_API_KEY` — AI features
   - `RESEND_API_KEY` — contact-form email
   - `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` — Spaces (the non-secret `S3_*` values are in the spec)
6. **First deploy — create the schema:** production does not auto-push. For the very first deploy
   against the empty DB, set **`PAYLOAD_DB_PUSH=true`** in the app env, deploy, let it boot (Payload
   creates all tables), then **set it back to `false`** and redeploy. *(Long-term: replace this with
   committed `payload migrate` migrations.)*
   After the first boot, visit `/admin` to create your owner user; re-seed content as needed
   (`scripts/seed-*` can be run with `DATABASE_URI` pointed at the DB from a machine with access).

## How deploys happen (test-gated)

`deploy_on_push` is **false** in the spec, so App Platform does not deploy on every push.
Instead, on push to `main`, **GitHub Actions runs the tests** and only then triggers a deployment:

```
push to main → CI: npm ci + lint + Vitest (gate) → doctl apps create-deployment <APP_ID> --wait
```

This needs two repo secrets: `DIGITALOCEAN_ACCESS_TOKEN` and `DO_APP_ID`.

## Manual deploy / spec changes

```bash
./deploy.sh deploy <APP_ID>    # trigger a build+deploy of latest main
./deploy.sh update <APP_ID>    # push .do/app.yaml changes (size, env, etc.)
```

(`./deploy.ps1 ...` on Windows.)

## Database migrations

Dev uses Payload's auto-push. For production on managed PG we'll switch to committed migrations
(`payload migrate`) run as a pre-deploy step — tracked in the roadmap before go-live.

## Domain

Add `120customs.com` in the App Platform app (Settings → Domains); DigitalOcean provisions TLS.
Update DNS to the provided records. Keep the old site live until verified.
