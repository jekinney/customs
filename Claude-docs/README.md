# 120 Customs — Site Rewrite Plan

Planning docs for the upgrade/rewrite of **120customs.com** (current repo:
`github.com/jekinney/120-port`).

These are reference docs: the agreed direction, target architecture, and phased build plan.

> **Build status (2026-06-28): Phases 0–6 are built and verified** — the site is feature-complete
> for a public launch (showroom, vehicle spec-sheet galleries, contact/inquiries, build estimator,
> CMS with roles, SEO, next/image + ISR). Infra wired: Resend, DO Spaces, Gemini. Production build
> passes; tests 16/16. Remaining: Phase 7 deploy (DigitalOcean) + optional Garage Ledger (8–12).
> See [05-implementation-roadmap.md](05-implementation-roadmap.md) for the detailed status.

## Decisions locked in (from planning Q&A)

| Decision | Choice |
| --- | --- |
| **Approach** | Full rewrite on **Next.js** (App Router), reusing the existing Tailwind dark/gold design |
| **Primary goal** | **Get found on Google + generate inquiries** (SEO + lead capture come first) |
| **Admin/CMS scope** | Vehicle **photo galleries**, **inquiries/contact form**, keep the **cost estimator** |
| **Data + CMS** | **Payload CMS 3 + Postgres** (Option A, confirmed; prod = DO Managed Postgres) |
| **Private Garage Ledger** | Per-vehicle **running budget + parts list + AI invoice ingestion + maintenance log** — admin/owner only ([06](06-build-budget-and-parts.md)) |
| **Multi-user** | Vehicles have an **owner**; future **ownership transfer** of a vehicle + its ledger to a new user |
| **Hosting** | **DigitalOcean App Platform** (builds Dockerfile from GitHub) + **DO Managed Postgres** + **DO Spaces** for media — supersedes earlier Cloud Run/Vercel ideas |
| **Local + deploy** | **Docker Compose** local (set up first) + `deploy.sh` (doctl) to App Platform, test-gated CI ([07](07-engineering-rules.md)) |
| **Engineering rules** | TDD red→green · documented as we go · Docker-first · **browser-QA after every step** ([07](07-engineering-rules.md)) |
| **Dropped for now** | Testimonials/reviews (can add later) |

## Data + CMS layer — DECIDED ✅ Option A

The data/CMS fork is settled: **Option A — Payload CMS 3 + Postgres** (confirmed
2026-06-28). A Next.js-native CMS that gives a polished admin panel "for free" — best editing
experience, least custom admin code, images stored as real files (not base64). Option B (keep
Firebase + custom admin) was the rejected alternative; it's retained in
[02-target-architecture.md](02-target-architecture.md) only for context.

## Document index

1. [01-current-state-audit.md](01-current-state-audit.md) — what exists today, what works,
   what to fix
2. [02-target-architecture.md](02-target-architecture.md) — recommended stack, the data/CMS
   fork, hosting, images, auth
3. [03-data-model.md](03-data-model.md) — proposed content model (vehicles, galleries,
   inquiries, settings)
4. [04-admin-cms-and-leadgen.md](04-admin-cms-and-leadgen.md) — admin/CMS design, contact
   form + inquiries, SEO plan
5. [05-implementation-roadmap.md](05-implementation-roadmap.md) — phased build plan with
   milestones and a "definition of done" per phase
6. [06-build-budget-and-parts.md](06-build-budget-and-parts.md) — **private** Garage Ledger:
   running budget, parts list, AI invoice ingestion, maintenance log, roles + ownership transfer
7. [07-engineering-rules.md](07-engineering-rules.md) — **read first** — TDD, docs-as-we-go,
   Docker-local + DigitalOcean deploy, browser-QA after every step

## TL;DR recommendation

Rewrite as a **Next.js app on DigitalOcean App Platform**, use **Payload CMS** for the admin/content (so
you edit vehicles and your story in a real CMS UI), store **photos as real image files**
(not base64 in the database — the biggest flaw today), and add a **contact form that emails
you and logs inquiries**. Build SEO in from day one (server-rendered pages, per-vehicle
metadata, sitemap, structured data) since being found on Google is goal #1.
