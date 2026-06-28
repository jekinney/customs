# 05 — Implementation Roadmap

A phased plan to get from today's SPA to the new Next.js site with minimal risk. Each phase
has a clear "definition of done." Phases are sequential; within a phase, items can overlap.

> **Working rules apply to every phase** — see [07-engineering-rules.md](07-engineering-rules.md):
> TDD red→green (1), documented as we go (2), Docker-local + Cloud Run deploy (3), and **you QA in
> the browser after each step** (4). Each phase's checklist items are themselves browser-QA-able
> steps; **"Done when"** below assumes tests green + your browser sign-off + docs updated.

> **Gate before Phase 1:** ~~confirm the data/CMS fork~~ **DECIDED: Option A (Payload + Postgres)**.
> Roadmap assumes A.

## Phase 0 — Setup, Docker & deploy pipeline  (1 day) — 🟢 mostly done (2026-06-28)

- [x] Fresh repo scaffolded at repo root: **Next.js 16.2.7 + Payload 3.85.1 + Postgres** (blank
      template, pinned to published versions, Node 22, npm).
- [x] **Docker first:** `docker-compose.yml` (Next.js `app` + `postgres:16` with healthcheck) +
      multi-stage `Dockerfile` (`output: 'standalone'`). `docker compose up` → `localhost:3000`.
      ✅ Verified: `/` → 200, `/admin` → 200 (Payload booted, schema pushed to Postgres).
- [x] **`deploy.sh` / `deploy.ps1`** to **Google Cloud Run** (project `gen-lang-client-0797455311`)
      + `.dockerignore`. Scripts written; not yet run (needs gcloud auth + Secret Manager).
- [x] Test harness wired: **Vitest** integration green (3 tests pass in-container). Playwright e2e
      config present (runs in CI).
- [x] **git** initialized + initial commit; `.gitattributes` (LF normalization).
- [x] **GitHub Actions CI** (`.github/workflows/ci.yml`): Postgres service → `npm ci` → lint +
      `test:int` (hard gates) → e2e (non-blocking for now); deploy job to Cloud Run on green `main`.
- [x] **Legacy data exported** → `migration/` (1 project "Shop Truck" + decoded before/after JPGs;
      no custom shop doc). Reusable script at `scripts/export-legacy-firestore.mjs`.
- [x] Docs: app `README.md`, `docs/workflows/local-dev.md`, `docs/workflows/deploy.md`, `migration/README.md`.
- [ ] **Remaining (needs your accounts):** provision **Neon Postgres** + **GCS** bucket access +
      **Resend**; add repo secret `GCP_SA_KEY` + Secret Manager `DATABASE_URI`/`PAYLOAD_SECRET`;
      first real deploy to a live Cloud Run URL; create the GitHub remote and push.
- **Done when:** ✅ hello-world + admin **QA-able at `localhost:3000` in Docker**, ✅ sample test
  green, ✅ CI + export + git in place; ⏳ live Cloud Run URL (pending cloud provisioning).

## Phase 1 — Foundation & design system  (1–2 days) — 🟢 mostly done (2026-06-28)

- [x] Design tokens via CSS custom properties (dark `#070708`, gold `#eab308`, mono/italic display
      type via Anton + Roboto Mono). *(Plain scoped CSS for now, not Tailwind — kept the review step
      low-risk; can add Tailwind v4 later if we want utility classes.)*
- [x] Shared components: **Logo** (inline SVG gear, gold/white, CSS-spinnable), **Header**,
      **Footer**, **Loader** (spinning gold gear), buttons. Logo has component tests (green).
- [x] `(frontend)` layout + homepage shell (hero / showroom placeholder / shop story) + route
      `loading.tsx` = spinning gold logo.
- [x] **Admin branded** — gold gear Logo/Icon graphics, title suffix `— 120 Customs`, favicon.
- [x] Brand assets wired to `public/brand/` (owner to drop in `120-gear-gold/white.png`,
      `120-shoptruck.png`; graceful fallbacks until then).
- **QA in browser:** ✅ verified `/` 200 + `/admin` 200, hero/branding/spinning loader render.
  ⏳ **Owner to add the 3 logo PNGs** and eyeball the look, then sign off.
- **Done when:** home shell + branded admin render on the dark/gold theme, tests green — ✅ pending
  your visual sign-off.

## Phase 2 — CMS + data model + access roles  (3–4 days) — 🟡 in progress (2026-06-28)

- [x] **`vehicles` collection** per [03-data-model.md](03-data-model.md): title/slug (auto), status
      (draft/published/for-sale/sold), category, cover image, **reorderable photo gallery**,
      before/after, richtext story, specs group, pricing, featured/order, `budgetTarget`. Schema
      pushed to Postgres (`vehicles` + `vehicles_gallery`).
- [x] **Roles + ownership (pulled from Phase 8):** `users` gain `admin`/`owner` role + name;
      `vehicle.owner` relation; access helpers (`src/access/roles.ts`) — public reads see published
      only, owners scoped to their own records, admins all. **6 access-control tests green** (red→green).
- [x] **`settings` global** (tabs: hero, story, contact, SEO) — public read, admin write.
- [x] **`inquiries` collection** — public create (contact form), staff-only read/triage; 3 access tests green.
- [x] **Migrated the "Shop Truck"** → published `vehicle` with before/after + 2-photo gallery
      (`scripts/seed-shop-truck.mjs`; photos uploaded to Media). Verified via public API + image serving.
- [ ] `media` **GCS** storage adapter (now: Payload local-disk works for QA; **needs your GCS bucket creds**).
- [ ] `estimatorConfig` global (deferred to Phase 6 with the estimator).
- **QA in browser:** ⏳ log in to `/admin` → see **Shop Truck** under Showroom → Vehicles; create another
      with a gallery; check **Site → Settings** + **Leads → Inquiries**.
- **Done when:** ✅ vehicles/settings/inquiries manageable in `/admin`, ✅ access tests green, ✅ Shop
  Truck migrated — pending GCS for durable media + your QA sign-off.

## Phase 3 — Public site  (3–4 days) — 🟢 done (2026-06-28)

- [x] Home page (hero, story) reading from CMS Settings (with static fallbacks); shows the showroom.
- [x] **Showroom** grid (`ShowroomGrid`) with **category filtering**, reading published vehicles.
- [x] **Vehicle spec-sheet page** `/vehicles/[slug]`: cover, **photo gallery + lightbox** (`Gallery`),
      before/after, spec table, rich-text story, per-vehicle CTA. ✅ Verified rendering the Shop Truck.
- [ ] *Polish carried to Phase 5:* swap `<img>` → `next/image`, ISR instead of `force-dynamic`.
- **Done when:** ✅ every build has its own page with a working gallery — pending your QA sign-off.

## Phase 4 — Lead capture  (1–2 days) — 🟢 mostly done (2026-06-28)

- [x] Contact form (`/contact` + per-vehicle CTA from the spec sheet) → server action `submitInquiry`.
- [x] Saves an `inquiry` + emails via **Resend** (when `RESEND_API_KEY` set); **honeypot + rate limit**.
- [x] Admin inquiries inbox (Leads → Inquiries) with status triage (from Phase 2).
- [ ] **Needs your accounts:** Resend API key + a **verified sending domain** (`from` address); set
      `RESEND_API_KEY` + `settings.contactEmail`. Optional: Cloudflare Turnstile.
- **Done when:** ✅ submission saves + appears in the inbox; ⏳ email delivery once Resend is configured.

## Phase 5 — SEO & polish  (1–2 days) — 🟡 SEO core done (2026-06-28)

- [x] `generateMetadata` per page (unique titles via `%s | 120 Customs`, descriptions, canonical,
      OG), `metadataBase` from `NEXT_PUBLIC_SITE_URL`; `sitemap.ts` (lists published vehicles),
      `robots.ts` (blocks `/admin` + `/api`). Verified at `/sitemap.xml` + `/robots.txt`.
- [x] JSON-LD: **`AutoRepair`/LocalBusiness** on home, **`Product` (+ `Offer` when for-sale)** on builds.
- [x] **Performance pass:** `next/image` via `MediaImage` (showroom cards, gallery, vehicle
      cover/before/after — optimized + lazy + responsive), **ISR** (`revalidate=60`) on home +
      vehicle pages. (Lightbox full-view + conditional brand/settings images stay plain `<img>`.)
- [ ] Analytics (Google Analytics / Plausible) + submit sitemap to Google Search Console *(needs
      your account; optional until launch)*.
- **Done when:** ✅ metadata/sitemap/JSON-LD + next/image + ISR in place; ⏳ analytics at launch.

## Phase 6 — Estimator  (1–2 days) — 🟢 done (2026-06-28)

- [x] `estimator-config` global (CMS-editable platforms, features by group, contingency %,
      disclaimer) + seeded example data (`scripts/seed-estimator.mjs`).
- [x] `/estimator` page + `EstimatorForm` — pick platform/year + lift/wheels/tires/add-ons, **live
      range** computed from CMS pricing; nav link added.
- [x] `estimateBuild` **server action**: deterministic total + range, **Gemini 2.5-flash** narrative
      (key stays server-side, `@google/genai`). Graceful degrade — estimate always returns if AI fails.
- **Done when:** ✅ estimator works, prices CMS-editable, API key server-side. Verified end-to-end
  ($13.4k build + AI summary).

## Phase 7 — Launch  (½–1 day)

- [ ] Final content review; publish builds.
- [ ] Point `120customs.com` DNS at Vercel; verify SSL.
- [ ] Submit sitemap to Google Search Console; set up Google Business Profile.
- [ ] Keep the old site reachable until the new one is verified, then cut over.
- **Done when:** 120customs.com serves the new site and Google can crawl it.

---

## Private Garage Ledger track (budget / parts / invoices / maintenance)

The full subsystem is specified in [06-build-budget-and-parts.md](06-build-budget-and-parts.md).
It's **private (admin/owner only)** and **not required for the public launch**, so by the stated
priority (get found + inquiries first) it lands **after Phase 7**. It can move earlier if you'd
rather have the build-tracking tooling sooner — say the word and we resequence.

> **Foundation note:** the **roles + `owner` + access-control** work (Phase 8) should be done
> before or alongside Phase 2's CMS setup if we know the Ledger is coming — it's cheaper to add
> the `users` role + `vehicle.owner` field up front than to retrofit. Flagged here so it isn't
> missed.

### Phase 8 — Roles, ownership & access control  (1–2 days)

- [ ] `users` collection with `admin`/`owner` roles; add `vehicle.owner` relation.
- [ ] Payload access functions: private collections readable/writable only by admin or
      `vehicle.owner`; public queries locked to published showcase fields.
- [ ] `transferLog` + an admin "transfer vehicle to user" action.
- **Done when:** a non-owner test user cannot see another vehicle's ledger; transfer reassigns access.

### Phase 9 — Categories, stores & parts  (2–3 days)

- [ ] `partCategories` CRUD (seeded: driveline, diff, engine, body, electrical, …).
- [ ] `stores` CRUD with `aliases` (seeded: Rock Auto, Summit, Jegs, …).
- [ ] `parts` collection + manual add/edit UI; filter by category/store/status.
- **Done when:** you can manually build a parts list for a vehicle.

### Phase 10 — Running budget dashboard  (1–2 days)

- [ ] Per-vehicle rollup: spent-to-date, by category, by store, vs `budgetTarget`.
- [ ] Planned vs actual; charts; vehicle Ledger landing view.
- **Done when:** adding/removing parts updates the budget live.

### Phase 11 — AI invoice ingestion  (2–4 days)

- [ ] Private invoice upload → file kept in private Blob storage.
- [ ] Gemini structured extraction (vendor, dates, totals, line items) via server action.
- [ ] Auto-match store (aliases), suggest category per line; owner review/confirm UI.
- [ ] Confirm → line items become `parts` linked via `sourceInvoice`.
- **Done when:** uploading a real invoice produces a reviewable parts table and keeps the PDF.

### Phase 12 — Maintenance log + AI recommendations  (2–3 days)

- [ ] `maintenanceRecords` (type, mileage, items, costs, optional receipt file).
- [ ] Gemini next-service recommendations from history + mileage; upcoming-maintenance reminders.
- **Done when:** logging an oil change records the parts/consumables and surfaces next-due advice.

---

## Rough total

Public site (Phases 0–7): ~**2–3 weeks** part-time, front-loaded on Phases 1–3. Private Garage
Ledger (Phases 8–12): ~**1.5–2.5 weeks** more, with the AI invoice phase the largest single
piece. Phase 8 (roles/ownership) is the one bit worth pulling forward into Phase 2.

## Risks & mitigations

| Risk | Mitigation |
| --- | --- |
| Photo originals lost (current ones are 800px base64) | Re-shoot/re-upload best builds at full res; old images work as placeholders meanwhile |
| Data migration mistakes | Export first, migrate into a preview env, verify before launch |
| SEO dip at cutover | Keep slugs sensible, submit sitemap immediately, 301 any changed URLs |
| Scope creep (testimonials, e-commerce) | Out of scope for v1; the data model leaves room to add later |

## Explicitly out of scope for v1

Testimonials/reviews, full e-commerce/checkout, multi-user roles, blog. All are easy to add
later on this architecture.
