# Deploy 120 Customs to DigitalOcean App Platform (Windows / PowerShell).
# App Platform builds the Dockerfile from the connected GitHub repo.
#
# Prerequisites (one-time):
#   - doctl installed + `doctl auth init`
#   - Edit .do/app.yaml: set github.repo to your repo slug
#   - After first create, set app secrets (dashboard or doctl): PAYLOAD_SECRET, GEMINI_API_KEY, S3_*
#
# Usage:
#   ./deploy.ps1 create            # first time
#   ./deploy.ps1 update <APP_ID>   # push .do/app.yaml changes
#   ./deploy.ps1 deploy <APP_ID>   # trigger a new deployment
param(
  [string]$Command = 'deploy',
  [string]$AppId = $env:DO_APP_ID
)
$ErrorActionPreference = 'Stop'

switch ($Command) {
  'create' { doctl apps create --spec .do/app.yaml }
  'update' {
    if (-not $AppId) { throw 'Usage: ./deploy.ps1 update <APP_ID>' }
    doctl apps update $AppId --spec .do/app.yaml
  }
  'deploy' {
    if (-not $AppId) { throw 'Usage: ./deploy.ps1 deploy <APP_ID>  (or set $env:DO_APP_ID)' }
    doctl apps create-deployment $AppId --wait
  }
  default { throw "Unknown command '$Command' (use: create | update <APP_ID> | deploy <APP_ID>)" }
}
