#!/usr/bin/env bash
# Deploy 120 Customs to DigitalOcean App Platform.
# App Platform builds the Dockerfile from the connected GitHub repo. This script
# creates the app the first time, or pushes spec changes + triggers a deployment after.
#
# Prerequisites (one-time):
#   - doctl installed + `doctl auth init` (DigitalOcean API token)
#   - Edit .do/app.yaml: set github.repo to your repo slug
#   - After first create, set the app secrets in the dashboard (or `doctl apps update`):
#       PAYLOAD_SECRET, GEMINI_API_KEY, and the S3_* Spaces keys
#
# Usage:
#   ./deploy.sh create          # first time — creates the app + managed DB
#   ./deploy.sh update <APP_ID>  # push .do/app.yaml changes
#   ./deploy.sh deploy <APP_ID>  # trigger a new deployment (build latest main)
set -euo pipefail

CMD="${1:-deploy}"
APP_ID="${2:-${DO_APP_ID:-}}"

case "$CMD" in
  create)
    doctl apps create --spec .do/app.yaml
    ;;
  update)
    [ -n "$APP_ID" ] || { echo "Usage: ./deploy.sh update <APP_ID>"; exit 1; }
    doctl apps update "$APP_ID" --spec .do/app.yaml
    ;;
  deploy)
    [ -n "$APP_ID" ] || { echo "Usage: ./deploy.sh deploy <APP_ID>  (or set DO_APP_ID)"; exit 1; }
    doctl apps create-deployment "$APP_ID" --wait
    ;;
  *)
    echo "Unknown command '$CMD' (use: create | update <APP_ID> | deploy <APP_ID>)"; exit 1
    ;;
esac
