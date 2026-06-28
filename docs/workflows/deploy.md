# Workflow: Deploy to Google Cloud Run

Production runs on **Google Cloud Run** in project `gen-lang-client-0797455311` — the same Google
service the current 120customs.com site uses. The container is built from `./Dockerfile`
(Next.js standalone output) and listens on `$PORT` (Cloud Run injects 8080).

## One-time setup

1. Install the `gcloud` CLI and authenticate:
   ```bash
   gcloud auth login
   gcloud config set project gen-lang-client-0797455311
   ```
2. Enable APIs: Cloud Run, Cloud Build, Secret Manager.
3. Create secrets (values not stored in the repo):
   ```bash
   printf '%s' "$PROD_DATABASE_URI" | gcloud secrets create DATABASE_URI --data-file=-
   printf '%s' "$PROD_PAYLOAD_SECRET" | gcloud secrets create PAYLOAD_SECRET --data-file=-
   ```
   Use the **Neon** production connection string for `DATABASE_URI` (decided in the plan). Add
   `GEMINI_API_KEY` and `RESEND_API_KEY` later when those features land.

## Deploy

```bash
./deploy.sh            # macOS/Linux
./deploy.ps1           # Windows PowerShell
```

Override defaults via env vars, e.g. `REGION=us-west1 SERVICE=120customs ./deploy.sh`.

The script runs `gcloud run deploy --source .`, which uses Cloud Build to build the Docker image,
push it, and roll out a new revision with the secrets wired in. It prints the service URL at the end.

## Domain

At cutover, map `120customs.com` to the Cloud Run service (Cloud Run domain mapping or a load
balancer) and update DNS. Keep the old site live until the new one is verified.

## CI/CD (to be added in Phase 0 finish)

GitHub Actions: run `npm run test:int` + Playwright e2e on every push; on green `main`, run the
deploy. Until that's wired, deploy manually with the script above.
