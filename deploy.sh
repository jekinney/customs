#!/usr/bin/env bash
# Deploy 120customs to Google Cloud Run — the same Google service the current site uses.
# Builds the production Docker image via Cloud Build (using ./Dockerfile) and deploys it.
#
# Prerequisites (one-time):
#   - gcloud CLI installed + `gcloud auth login`
#   - Secrets created in Secret Manager: DATABASE_URI, PAYLOAD_SECRET (and later GEMINI_API_KEY, RESEND_API_KEY)
#       printf '%s' "$VALUE" | gcloud secrets create DATABASE_URI --data-file=- --project gen-lang-client-0797455311
#   - Cloud Run + Cloud Build + Secret Manager APIs enabled
#
# Usage: ./deploy.sh   (override defaults via env vars, e.g. REGION=us-west1 ./deploy.sh)
set -euo pipefail

PROJECT_ID="${PROJECT_ID:-gen-lang-client-0797455311}"
REGION="${REGION:-us-central1}"
SERVICE="${SERVICE:-120customs}"

echo "==> Deploying '$SERVICE' to Cloud Run (project=$PROJECT_ID region=$REGION)"

gcloud run deploy "$SERVICE" \
  --source . \
  --project "$PROJECT_ID" \
  --region "$REGION" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080 \
  --memory 1Gi \
  --set-secrets "DATABASE_URI=DATABASE_URI:latest,PAYLOAD_SECRET=PAYLOAD_SECRET:latest"

echo "==> Done. Service URL:"
gcloud run services describe "$SERVICE" --project "$PROJECT_ID" --region "$REGION" --format 'value(status.url)'
