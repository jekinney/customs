# 02 — Target Architecture

The rewrite is a **Next.js 15 (App Router)** application. This doc covers the recommended
stack, the one open fork (data + CMS), hosting, image storage, auth, and email.

> **Hosting (current decision, 2026-06-28):** production runs on **DigitalOcean App Platform**
> (builds our Dockerfile from GitHub), with **DO Managed Postgres** and **DO Spaces** (S3) for media;
> local runs in **Docker**. This **supersedes the earlier Cloud Run and Vercel notes** in this doc.
> See [07-engineering-rules.md](07-engineering-rules.md) Rule 3 and
> [docs/workflows/deploy.md](../docs/workflows/deploy.md).

## Recommended stack at a glance

| Concern | Recommendation | Why |
| --- | --- | --- |
| Framework | **Next.js 15**, App Router, React 19, TypeScript | Server rendering for SEO (goal #1), one app for site + admin |
| Styling | **Tailwind CSS v4** | Port the existing dark/gold design 1:1 |
| Local hosting | **Docker Compose** (app + Postgres) | Set up first; one-command local stack, matches prod |
| Production hosting | **DigitalOcean App Platform** | Builds our Dockerfile from GitHub; container on `$PORT`/`http_port` 8080 |
| Content / CMS | **Payload CMS 3** (see fork below) | Real admin UI "for free"; runs inside the same Next.js app |
| Database | **DO Managed Postgres** | Same provider as the app; TLS (`DATABASE_SSL=true`). Local = Postgres container |
| Image storage | **DigitalOcean Spaces** (S3-compatible) | Real files via Payload `@payloadcms/storage-s3`; not base64. Local = local-disk |
| Image delivery | **next/image** (in-container sharp) | Automatic resizing, AVIF/WebP, lazy-load; optional Spaces CDN |
| Admin auth | **Payload built-in auth** + roles | Email+password; admin/owner roles for the private ledger |
| Transactional email | **Resend** | Provider-agnostic; emails you when a new inquiry arrives |
| AI (estimator + invoices) | **Gemini via Next.js route handlers** | Keep features; key stays server-side |
| Tests | **Vitest + RTL + Playwright** | TDD red→green (Rule 1); Playwright e2e against the Docker stack |
| CI/CD | **GitHub Actions → DO App Platform** | Tests gate deploy; `doctl apps create-deployment` on green `main` |

## The fork: data + CMS layer

Everything else above is settled. This is the decision to make.

> **DECIDED (2026-06-28): Option A — Payload CMS 3 + Neon Postgres.** Option B is kept below
> for context only.

### Option A — Payload CMS 3 + Postgres  ✅ CHOSEN

Payload is an open-source, **Next.js-native** headless CMS. You define "collections"
(Vehicles, Inquiries, Media, plus a Settings global) in code, and Payload generates a
polished admin panel at `/admin` automatically — with image uploads, drag-to-reorder
galleries, rich-text editing, and access control built in.

- **Pros**
  - Delivers the "edit like a CMS" ask directly — you write almost **zero admin UI code**.
  - Galleries, media uploads, reordering, rich text, validation: all out of the box.
  - Lives in the **same Next.js app** — one deploy, one repo, fully owned by you (self-hosted,
    no SaaS fees, no vendor lock-in).
  - Type-safe: generates TypeScript types for your content used by the public site.
- **Cons**
  - Requires a Postgres database (Neon free tier covers this).
  - One-time **data migration** off Firestore (small — a handful of vehicles + one story).
  - Slight learning curve for Payload config.

### Option B — Keep Firebase + custom admin

Stay on **Firestore + Firebase Auth (Google)** exactly as today, but rebuilt inside Next.js
with a hand-built admin area.

- **Pros**
  - **No data migration** — existing Firestore content stays put.
  - Reuse the existing Google-login-locked-to-your-email auth and `firestore.rules`.
  - No new database to run.
- **Cons**
  - You **build and maintain the entire admin UI yourself** (forms, galleries, reordering,
    uploads) — this is most of the work, and it's exactly what Payload gives for free.
  - Firestore image storage must still move to Firebase Storage (base64 fix applies either way).
  - NoSQL modeling for relations (vehicle ↔ photos ↔ inquiries) is clumsier.

### Recommendation

**Go with Option A (Payload + Postgres).** The stated goal is "easily edit like a CMS," and
Payload is purpose-built for exactly that — it removes the single biggest chunk of custom
work (the admin UI) and gives better media/gallery handling than a hand-rolled panel. The
migration cost is low because there's only a small amount of content today.

Choose Option B only if avoiding any data migration or staying 100% on Firebase is a hard
requirement. The rest of these docs are written to work with either; where they differ, both
are noted.

## Hosting & environments

- **Local: Docker Compose** (`app` + Postgres `db`) — set up first; `docker compose up` →
  `localhost:3000`. See [07-engineering-rules.md](07-engineering-rules.md) Rule 3.
- **Production: DigitalOcean App Platform** — builds the Dockerfile from the GitHub repo (spec at
  `.do/app.yaml`). Container listens on `$PORT`; App Platform routes to `http_port` 8080. Deployed
  via `deploy.sh` (doctl) / GitHub Actions.
- Custom domain `120customs.com` mapped to the App Platform app (DO provisions TLS; update DNS at cutover).
- **Secrets as App-level encrypted env vars** (`PAYLOAD_SECRET`, `GEMINI_API_KEY`, Spaces `S3_*`);
  `DATABASE_URI` injected from the managed DB (`${db.DATABASE_URL}`). Nothing sensitive in the repo or image.

## Image storage & delivery

1. Owner uploads full-resolution photos in the admin.
2. Files are stored in **DigitalOcean Spaces** (S3-compatible) via Payload's **`@payloadcms/storage-s3`**
   adapter. The **database stores only the URL + alt text + order**, never base64. Private ledger
   files (invoices/receipts) use a **private** Space with signed URLs. *(Local dev uses Payload
   local-disk storage.)*
3. Public pages render through **next/image** (in-container `sharp`, optionally fronted by the
   **Spaces CDN**) for responsive sizing and modern formats. Sharp galleries, fast loads.

## Auth model

Single owner. Option A uses Payload's built-in auth (your email + password; you can add 2FA).
Option B keeps Google sign-in restricted to your email(s). Either way, **only you** can reach
the admin and write content; the public site is read-only.

## Keeping the cost estimator

Port the existing Gemini-powered estimator. Move the API call into a **Next.js route handler
/ server action** so `GEMINI_API_KEY` never ships to the browser (an improvement over the
current setup). The estimator's option data (platforms, build features, pricing) becomes
CMS-managed content so you can tune prices without code changes.
