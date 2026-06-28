# 03 — Data Model

Proposed content model for the rewrite. Described in collection/field terms (maps directly to
Payload collections in Option A, or Firestore collections in Option B).

## Collections / content types

### `vehicles` (the showroom builds) — the core content

| Field | Type | Notes |
| --- | --- | --- |
| `title` | text | e.g. "1993 Chevy C1500 OBS" |
| `slug` | text (unique) | URL: `/vehicles/1993-chevy-c1500-obs`. Auto-generated from title, editable. **SEO.** |
| `status` | select | `draft` / `published` / `for-sale` / `sold` (supports the showroom + future "for sale") |
| `category` | select | `lifts` / `street` / `overland` / `performance` (carry over) |
| `categoryLabel` | text | Display label |
| `clientTruck` | text | Owner / vehicle descriptor |
| `year` | number | Build/model year |
| `coverImage` | upload (media) | The card + hero image |
| `gallery` | array of media | **Ordered photo gallery shown on the spec-sheet page.** Drag-to-reorder; each item has image + optional caption + alt text |
| `beforeImage` / `afterImage` | upload (media) | Optional — keeps the before/after slider feature |
| `summary` | text | Short blurb for the showroom card |
| `description` | rich text | Full write-up |
| `challenge` | rich text | "The challenge" |
| `solution` | rich text | "The solution" |
| `specs` | group | See spec fields below |
| `estimatedCost` | number | Optional |
| `salePrice` | number | Shown only when `status = for-sale` |
| `completionTime` | text | e.g. "6 months" |
| `featured` | checkbox | Pin to top of showroom |
| `order` | number | Manual sort within showroom |
| `owner` | relation → users | Who owns this vehicle + its private ledger; enables ownership transfer |
| `budgetTarget` | number | Optional build budget for the running-total dashboard (private) |
| `publishedAt` | date | For sitemap + ordering |

**`specs` group:** `stance, wheels, engine, transmission, drivetrain, gearRatio,
differential, performance` (carried over from the current `ProjectSpec`, all optional text).

### `media` (images)

Managed by the CMS upload system. Stores the **file in object storage** + `url`, `alt`,
`width`, `height`, auto-generated responsive sizes. Referenced by `vehicles.coverImage` and
`vehicles.gallery`. **No base64 anywhere.**

### `inquiries` (contact form submissions) — new

| Field | Type | Notes |
| --- | --- | --- |
| `name` | text | |
| `email` | email | |
| `phone` | text | optional |
| `vehicle` | relation → vehicles | optional — "I'm interested in this build" |
| `message` | textarea | |
| `status` | select | `new` / `read` / `replied` / `archived` |
| `source` | text | which page/form it came from |
| `createdAt` | date | auto |

Read-only in the admin (you triage; you don't create these). New submissions trigger an
**email to you** (Resend). Spam protection: honeypot field + rate limit (+ optional
Cloudflare Turnstile).

### `users` — accounts + roles (new)

Supports admin + vehicle owners + future ownership transfer. Fields: `email`, `password`
(Payload-managed), `name`, `role` (`admin` / `owner`). Each `vehicle` gets an **`owner`**
relation → `users`. See [06-build-budget-and-parts.md](06-build-budget-and-parts.md) for the
full access model. (Public visitors have no account.)

### Private "Garage Ledger" collections (new — admin/owner only)

`partCategories`, `stores`, `parts`, `invoices`, `maintenanceRecords` — the budget/parts/
maintenance subsystem. **Never public**; access scoped to `vehicle.owner` or admin. Fully
specified in [06-build-budget-and-parts.md](06-build-budget-and-parts.md), not repeated here.

### `settings` (global / singleton)

The site-wide content currently in `settings/shop`, expanded:

- `storyTitle`, `storyContent` (rich text), `storyImage` (media) — the "My Story" block
- `tagline`, `heroHeadline`, `heroImage`
- `contactEmail`, `phone`, `location`, `socialLinks[]`
- `seoDefaults` — default meta title/description, social share image

### `estimatorConfig` (global) — powers the cost estimator

CMS-editable so prices change without code: `truckPlatforms[]` (name, basePrice, year range,
type), `buildFeatures[]` (name, price, description, group), and any base modifiers. Mirrors
the existing `TruckPlatform` / `BuildFeature` types.

## Page → data mapping

| Page | Route | Reads |
| --- | --- | --- |
| Home | `/` | `settings`, featured `vehicles` |
| Showroom | `/vehicles` (or `#showroom`) | published `vehicles` (filter by category) |
| **Vehicle spec sheet** | `/vehicles/[slug]` | one `vehicle` + its **gallery**, before/after, specs |
| Estimator | `/estimator` | `estimatorConfig` |
| Contact | `/contact` | writes an `inquiry` |
| Admin | `/admin` | everything (owner only) |

## Notes for migration (Option A only)

- Export current Firestore `projects` → map each to a `vehicle` (`clientTruck`, `year`,
  `description`, `challenge`, `solution`, `specs` map straight across).
- Re-upload photos at full resolution (current ones are 800px base64 — usable as a
  placeholder, but you'll want originals for the new galleries).
- `settings/shop` → `settings.storyTitle` / `storyContent` / `storyImage`.
