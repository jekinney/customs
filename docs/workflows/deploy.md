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
3. Create the app + managed database:
   ```bash
   ./deploy.sh create     # doctl apps create --spec .do/app.yaml
   ```
   Note the printed **App ID**.
4. Set the app secrets (dashboard → app → Settings → env vars, or `doctl apps update`):
   - `PAYLOAD_SECRET` — long random string
   - `GEMINI_API_KEY` — for AI features
   - `S3_ACCESS_KEY_ID` / `S3_SECRET_ACCESS_KEY` and the `S3_ENDPOINT` / `S3_BUCKET` values for
     **Spaces** (media)
   `DATABASE_URI` is injected automatically from the managed DB (`${db.DATABASE_URL}`), and
   `DATABASE_SSL=true` is set in the spec (managed PG requires TLS).

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
