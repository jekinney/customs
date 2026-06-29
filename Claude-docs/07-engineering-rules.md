# 07 — Engineering Rules (read first)

Non-negotiable working agreements for building the 120 Customs rewrite. These apply to **every**
phase and feature in [05-implementation-roadmap.md](05-implementation-roadmap.md). Set
2026-06-28.

## Rule 1 — TDD, red → green, on every aspect

Every behavior is built **test-first**. No production code is written without a failing test that
demanded it.

**The cycle (per unit of behavior):**
1. **🔴 Red** — write a test that describes the desired behavior. Run it; watch it fail for the
   right reason.
2. **🟢 Green** — write the minimum code to make it pass. Run it; watch it pass.
3. **♻️ Refactor** — clean up with the test still green.
4. Commit at green. Small commits, each tied to a test.

**What this means concretely here:**
- **Access control is the highest-risk surface** (private Garage Ledger, ownership). Every access
  rule gets explicit tests: "an owner sees only their vehicles' ledger," "a non-owner is denied,"
  "public queries never return ledger fields," "transfer moves access." These are written **red
  first**.
- **AI pipelines are tested against fixtures, not the live model.** Save real example invoices
  (PDF/image) + their expected structured output as fixtures; mock the Gemini client to return
  recorded responses. Test the parsing → store-match → category-suggestion → parts-creation path
  deterministically. (A small separate, non-CI "live" check can exercise the real model manually.)
- **Budget math is unit-tested** (rollups, by-category/store totals, planned-vs-actual,
  over-budget) — pure functions, easy to cover fully.
- **Public pages**: tests assert SEO output (metadata, JSON-LD, sitemap entries) and that
  unpublished/private data never renders.

**Test stack (Next.js 15 + Payload):**
- **Vitest** — unit + integration (business logic, Payload access functions, budget math,
  AI-parse-with-mocks). Fast, default runner.
- **React Testing Library** — component behavior.
- **Playwright** — end-to-end (login, add a vehicle, upload an invoice → review → confirm, submit
  contact form). Runs against the Docker stack.
- **Coverage:** access-control and money/budget logic target **100%**; overall meaningful
  coverage, not vanity numbers. A feature is "done" only when its tests are green in CI.

**CI:** every push runs lint + typecheck + Vitest + Playwright. Red CI blocks merge. No merging on
red. (See Rule 3 for where CI lives.)

## Rule 2 — Documented as we go

Documentation is part of "done," written **alongside** the code, never deferred.

**For every feature/phase, before it's considered complete:**
- Update the relevant **Claude-docs** (data model, architecture, roadmap checkboxes) to match what
  was actually built — docs and code never drift.
- Write/refresh a **workflow doc** describing the developer + user flows it introduces. Workflows
  live in `docs/workflows/` in the app repo, e.g.:
  - `invoice-ingestion.md` — upload → AI parse → review → confirm → parts created (with a diagram).
  - `add-vehicle.md`, `ownership-transfer.md`, `local-dev.md`, `deploy.md`, `running-tests.md`.
- **ADRs** (Architecture Decision Records) in `docs/adr/` for any decision of consequence
  (e.g. "ADR-0001: Payload + DigitalOcean App Platform", "ADR-0002: Spaces for media"). One short file per decision:
  context → decision → consequences.
- **Inline**: doc-comments on Payload collections/access functions and any non-obvious logic;
  typed schemas as living documentation.
- **README** in the app repo kept runnable: how to start the Docker stack, run tests, seed data,
  deploy — copy-pasteable commands that actually work.
- Diagrams where they help (Mermaid in markdown) — data model, access model, invoice pipeline.

**Definition of done = code + passing tests + updated docs + updated workflow.** All three.

## Rule 3 — Docker local first, then a DigitalOcean deploy

**Set up the containerized local environment before building features**, and deploy to
**DigitalOcean App Platform** (decided 2026-06-28) — which builds our Docker image from GitHub.

**Local (set up first, Phase 0/1):**
- **`docker-compose.yml`** brings up the full stack locally:
  - `app` — the Next.js + Payload app (multi-stage `Dockerfile`, `output: 'standalone'`).
  - `db` — Postgres 16 container for local dev/test (so local needs no cloud DB).
  - (optional) a GCS emulator or a dev bucket for media during local work.
- One command to run everything: `docker compose up`. App reachable at `localhost:3000`.
- Tests can run inside the stack (Playwright against the running container; Vitest against `db`).
- Hot reload in dev; production image is the optimized standalone build.

**Production deploy: DigitalOcean App Platform** (decided 2026-06-28, supersedes the earlier Cloud
Run plan)
- App Platform builds our `./Dockerfile` (Next.js standalone) straight from the connected GitHub
  repo. Spec committed at [`.do/app.yaml`](../.do/app.yaml).
- **`deploy.sh`** (+ `deploy.ps1`) wraps `doctl`:
  - `./deploy.sh create` — first-time `doctl apps create --spec .do/app.yaml` (app + managed DB).
  - `./deploy.sh update <APP_ID>` — push spec changes.
  - `./deploy.sh deploy <APP_ID>` — `doctl apps create-deployment` (build latest `main`).
- **Container listens on `$PORT`**; App Platform routes to `http_port` 8080.
- Secrets are **App-level encrypted env vars** (`PAYLOAD_SECRET`, `GEMINI_API_KEY`, Spaces `S3_*`).
  `DATABASE_URI` is injected from the managed DB (`${db.DATABASE_URL}`); `DATABASE_SSL=true`.
- **CI/CD (test-gated):** `deploy_on_push: false`, so GitHub Actions runs tests (Rule 1) on green
  `main` then triggers `doctl apps create-deployment` (needs repo secrets `DIGITALOCEAN_ACCESS_TOKEN`
  + `DO_APP_ID`).

**Hosting stack (DigitalOcean):**
- Hosting: **DO App Platform** (not Cloud Run / Vercel).
- Database: **DO Managed Postgres** (`db` component in the spec; TLS required → `DATABASE_SSL=true`).
  Local always uses the Postgres container. *(Supersedes the earlier Neon choice now that app + DB
  share one provider.)*
- Media storage: **DigitalOcean Spaces** (S3-compatible) via Payload's **`@payloadcms/storage-s3`**
  adapter (not GCS). Local dev uses Payload local-disk.
- Next image optimization runs **in-container** (sharp); optionally front Spaces with the DO CDN.
- Analytics: Google Analytics or self-hosted Plausible.

## Rule 4 — Browser-QA-able after every step

You must be able to **see and click the thing in a browser** at the end of every step/section —
not just "the tests pass." Work is sliced **vertically** so each increment leaves the app in a
runnable, demoable state.

- Every step ends with the **Docker stack running** (`docker compose up`) and a concrete URL +
  what to look at, e.g. "go to `localhost:3000/admin` → add a vehicle → it appears on the
  showroom." No step leaves the app half-wired or unbootable.
- **No big-bang back-end-only steps.** Build in thin vertical slices (data → API → minimal UI) so
  there's always something visible. If a slice is internal (e.g. an access rule), expose a small
  temporary UI/admin view or a seed + page so you can verify it by eye.
- Each step includes a short **"QA this" checklist** in its PR/commit + workflow doc: the exact
  clicks and the expected result, so your manual pass is quick and repeatable.
- Automated tests (Rule 1) and your manual browser QA are complementary — tests prove it keeps
  working; your QA confirms it feels right. A step isn't "done" until **you've eyeballed it in the
  browser** and signed off.
- We progress to the next step only after your browser QA sign-off on the current one.

## How these four interlock

For any step: **write the failing test (1) → make it pass in the Docker stack (3) → leave it
visible/clickable in the browser and you QA it (4) → document the behavior + workflow (2) → green
CI deploys via the script (3).** A step isn't finished until **all four** are satisfied — failing
test made green, runnable in Docker, QA'd in the browser by you, and documented.
