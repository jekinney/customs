# 04 — Admin / CMS, Lead Capture, and SEO

How you edit the site, how inquiries come in, and how the site gets found on Google
(goal #1).

## Admin / CMS experience

Goal: **you, on a phone or laptop, can add a build with photos and publish it in a couple of
minutes** — no code, no redeploy.

### With Payload (Option A — recommended)

- Polished admin at `/admin`, generated from the collections in
  [03-data-model.md](03-data-model.md). You get for free:
  - **Vehicle editor** with all fields, validation, and live URL slug.
  - **Photo gallery management** — drag-and-drop upload, **drag-to-reorder**, set the cover
    image, add captions/alt text. (This is what powers the gallery on the spec-sheet page.)
  - **Rich-text** editing (Lexical) for description / challenge / solution / story.
  - **Draft vs published** so you can stage a build before it goes live.
  - **Inquiries inbox** — a filtered list view (`new` first), open to read, change status.
  - **Settings** + **Estimator config** as simple global forms.
- Mobile-friendly admin out of the box.

### With custom admin (Option B)

Same capabilities, but each screen is hand-built in Next.js: a vehicles list + form, a
gallery uploader with reordering (e.g. dnd-kit), an inquiries table, and settings forms.
More code to write and maintain; same end result for you as the editor.

## Vehicle spec-sheet page (with photo gallery)

Per the requirement, the **`/vehicles/[slug]` spec-sheet page includes a photo gallery.**
Proposed layout:

1. **Hero / cover** — `coverImage`, title, year, category badge, status (e.g. "For Sale").
2. **Photo gallery** — responsive grid of the `gallery` images; click to open a full-screen
   **lightbox** with swipe/arrow navigation. Lazy-loaded via `next/image`. This is the
   centerpiece of the page.
3. **Before / After slider** — the existing draggable comparison, if both images are set.
4. **Spec sheet** — the `specs` group rendered as a clean table (engine, transmission,
   stance, wheels, gear ratio, etc.).
5. **The story** — description / challenge / solution rich text.
6. **CTA** — "Interested in a build like this?" → contact form prefilled with this vehicle.

## Lead capture (contact form → inquiries)

1. **Contact form** on a `/contact` page and as a CTA on each vehicle page. Fields: name,
   email, phone (optional), message, hidden `vehicle` reference when launched from a build.
2. On submit (Next.js **server action / route handler**):
   - Validate (zod), check honeypot + rate limit.
   - Save an `inquiry` record.
   - **Email you** via Resend ("New inquiry from {name} about {vehicle}").
   - Show a success state.
3. You triage in the admin inbox (`new → read → replied → archived`).
4. Optional later: auto-reply email to the sender.

Spam defense: honeypot + server-side rate limiting now; add **Cloudflare Turnstile**
(invisible CAPTCHA) if spam appears.

## SEO plan (goal #1: get found on Google)

This is why we're on Next.js. Build it in from the start:

- **Server-rendered pages** — every vehicle and the showroom render on the server with real
  HTML, so Google indexes full content (the current SPA does not).
- **Per-page metadata** — Next.js `generateMetadata`: unique title + description per vehicle
  (e.g. "1993 Chevy C1500 OBS Build — Lowered Resto-Mod | 120 Customs").
- **Clean URLs** — `/vehicles/[slug]`, human- and search-friendly.
- **Structured data (JSON-LD)** — `LocalBusiness` / `AutoRepair` on the home page (name,
  location, phone, hours) so you can appear in local/map results; `Vehicle`/`Product` schema
  on builds, and `Offer` when `status = for-sale`.
- **Sitemap + robots** — auto-generated `sitemap.xml` (Next.js `sitemap.ts`) listing all
  published vehicles; `robots.txt`.
- **Open Graph / Twitter cards** — per-vehicle share images so links look good when shared.
- **Image SEO** — descriptive `alt` text (entered in the gallery), `next/image` for fast
  loads (Core Web Vitals = ranking signal).
- **Local SEO** — consistent name/address/phone (NAP) in the footer + structured data; this
  matters most for a local custom shop. Pair with a Google Business Profile (off-site).
- **Performance** — Vercel CDN + ISR keeps pages fast, which Google rewards.

## Analytics

Add **Google Analytics** (or privacy-friendly self-hosted Plausible) to see which builds get
traffic and where inquiries come from. Plus **Google Search Console** to monitor indexing +
queries. (Not Vercel Analytics — we're on Cloud Run, see
[07-engineering-rules.md](07-engineering-rules.md) Rule 3.)
