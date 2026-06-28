# 01 — Current State Audit

Audit of the existing site (`github.com/jekinney/120-port`, live at 120customs.com) as of
2026-06-28.

## What it is

A single-page React app generated from **Google AI Studio**, deployed via Docker. It shows
a hero, a "showroom" grid of truck builds, a shop story, and has a hidden `/admin` route for
editing.

## Current stack

| Layer | Tech |
| --- | --- |
| Framework | React 19 + **Vite 6** (client-only SPA) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Routing | react-router-dom 7 |
| Data | **Firebase Firestore** |
| Auth | **Firebase Auth** (Google sign-in, locked to 2 emails) |
| Rich text | react-quill (WYSIWYG) |
| AI | `@google/genai` (Gemini) — powers the interactive cost estimator |
| Icons / motion | lucide-react, motion (Framer Motion) |
| Deploy | Dockerfile + Express server; AI Studio hosting |

## Current data model (Firestore)

- **`projects`** collection — one document per build/vehicle:
  `title, category ('lifts'|'street'|'overland'|'performance'), categoryLabel, clientTruck,
  year, imageBefore, imageAfter, description, challenge, solution, specs{stance, wheels,
  engine, transmission, drivetrain, gearRatio, differential, performance}, estimatedCost,
  completionTime`
- **`settings/shop`** document — the "My Story" block: `title, content (HTML), imageUrl`

Types also exist for `TruckPlatform`, `EstimateSelection`, `BuildFeature`, `Testimonial`
(used by the estimator / not all persisted).

## Current admin (`/admin`)

- **Auth:** Google popup sign-in, hard-restricted to `jekinneys@gmail.com` and
  `jason.kinney@120customs.com` (checked both client-side and in `firestore.rules`).
- **Capabilities:** add/edit/delete projects, fill in specs, upload before/after images,
  edit the shop story (WYSIWYG), "Import Defaults" seed button.

## What works well (keep / carry over)

- **The visual design** — dark `#070708` background, gold `#eab308` accent, mono/italic
  uppercase type. Distinctive and on-brand. Port this 1:1.
- **The content model** is basically right: builds with specs + before/after.
- **Single-owner auth model** is the correct security posture for a one-person shop.
- **Firestore rules** correctly lock writes to the owner email(s).

## Problems to fix in the rewrite

1. **🔴 Images are base64 strings inside Firestore documents.** `handleImageUpload` resizes
   to 800px wide and stores a `data:image/jpeg` URL directly in the doc. Consequences:
   - Firestore's 1 MB document cap means photos must stay small/low-quality.
   - Every showroom load downloads all image bytes inline — slow, no CDN, no caching.
   - No way to have a real multi-photo gallery.
   - **Fix:** store real image files in object storage (Vercel Blob / Cloudinary / Firebase
     Storage) and keep only URLs in the database. This is the single most important change.

2. **🔴 Client-only SPA → weak SEO.** Vite renders everything in the browser. For a shop
   whose #1 goal is "get found on Google," this is a real handicap. **Fix:** server-rendered
   pages (Next.js), per-vehicle metadata, sitemap, structured data.

3. **🟠 One before + one after image per build.** No gallery. **Fix:** a proper ordered
   photo set per vehicle with a cover image.

4. **🟠 react-quill + React 19** has known compatibility friction. **Fix:** a modern editor
   (Payload's built-in Lexical rich text, or Tiptap) or plain markdown.

5. **🟠 No lead capture.** There's no contact form or inquiry inbox — a miss given the goal
   is generating inquiries. **Fix:** contact form → DB + email notification.

6. **🟡 Secrets/config in source.** Firebase web config is committed (the API key is safe to
   expose for Firebase web apps, but worth tidying). The Gemini key must stay server-side.

7. **🟡 Monolithic admin component.** One large `Admin.tsx`. The rewrite should split
   concerns (or get them for free from a CMS).

## Data to preserve

The live Firestore `projects` and `settings/shop` are the real content. **Before any
migration, export them** (a small script using the Firebase Admin SDK, or the Firebase
console export) so the existing builds and story text carry into the new site. Photos will
need re-uploading at full resolution since the originals were downscaled to base64.
