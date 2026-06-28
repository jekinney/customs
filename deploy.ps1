# Deploy 120customs to Google Cloud Run (Windows / PowerShell) — same Google service as the current site.
# Builds the production Docker image via Cloud Build (./Dockerfile) and deploys it.
#
# Prerequisites (one-time):
#   - gcloud CLI installed + `gcloud auth login`
#   - Secrets in Secret Manager: DATABASE_URI, PAYLOAD_SECRET (later GEMINI_API_KEY, RESEND_API_KEY)
#   - Cloud Run + Cloud Build + Secret Manager APIs enabled
#
# Usage: ./deploy.ps1   (override via env vars, e.g. $env:REGION='us-west1'; ./deploy.ps1)
$ErrorActionPreference = 'Stop'

$ProjectId = if ($env:PROJECT_ID) { $env:PROJECT_ID } else { 'gen-lang-client-0797455311' }
$Region    = if ($env:REGION)     { $env:REGION }     else { 'us-central1' }
$Service   = if ($env:SERVICE)    { $env:SERVICE }    else { '120customs' }

Write-Host "==> Deploying '$Service' to Cloud Run (project=$ProjectId region=$Region)"

gcloud run deploy $Service `
  --source . `
  --project $ProjectId `
  --region $Region `
  --platform managed `
  --allow-unauthenticated `
  --port 8080 `
  --memory 1Gi `
  --set-secrets "DATABASE_URI=DATABASE_URI:latest,PAYLOAD_SECRET=PAYLOAD_SECRET:latest"

Write-Host "==> Done. Service URL:"
gcloud run services describe $Service --project $ProjectId --region $Region --format 'value(status.url)'
