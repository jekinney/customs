# 06 — Build Budget, Parts List & Maintenance (Private "Garage Ledger")

A **private, admin/owner-only** subsystem for tracking the money and mechanical history of each
vehicle: a running build **budget**, a **parts list**, **AI-assisted invoice ingestion**, and
**maintenance records with AI recommendations**. None of this is ever public — it lives behind
auth and is scoped to the vehicle's owner (or an admin).

This is separate from the public showroom: the showroom shows off the build; the **Garage
Ledger** is the back-office "what did this cost / what's in it / what's been serviced" tooling.

## Why this fits Option A (Payload) well

This feature set is the reason multi-user + access control now matter. Payload gives us, out of
the box: user accounts with **roles**, **per-collection and per-document access rules**, file
uploads (invoices), relationships, and a generated admin UI. We'd be hand-building all of that
in the Firebase option — another point in favor of Option A (already chosen).

## Access model (new — affects the whole app)

Three roles:

| Role | Can see/do |
| --- | --- |
| **admin** (you) | Everything: all vehicles, all ledgers, manage categories/stores, transfer ownership |
| **owner** (a vehicle's owner) | Full access to **their own** vehicles' private ledger (budget, parts, invoices, maintenance) + edit the public build content |
| **public** (no login) | Read-only published showroom content **only** — never any ledger data |

Rules:
- Every `vehicle` gains an **`owner`** field (relation → `users`). For now that's always you;
  the field makes future transfer trivial.
- Private collections (`parts`, `invoices`, `maintenanceRecords`) are readable/writable only if
  `user.role === 'admin'` **OR** `user.id === vehicle.owner`. Enforced in Payload **access
  functions** (server-side — not just hidden in the UI).
- **Ownership transfer** = an admin reassigns `vehicle.owner` to another user. Because the
  ledger records are linked to the vehicle, access recomputes automatically — the new owner
  gains access, the old one loses it. Log each transfer in a `transferLog` for audit.
- Public showroom queries filter to `status = published` and only ever select public fields, so
  ledger data can't leak even for a published vehicle.

## New collections

### `partCategories` — CRUD (req #1)
Admin-managed list, seeded with: driveline, differential, engine, transmission, suspension,
brakes, body, paint, interior, electrical, wheels/tires, fuel, cooling, exhaust, fabrication,
misc. Fields: `name`, `slug`, `description`, `icon` (optional), `sortOrder`. Owners can request
/ admins add new ones.

### `stores` (vendors) — CRUD (req #2)
Seeded with Rock Auto, Summit Racing, Jegs, Amazon, eBay, LMC Truck, local shops, etc. Fields:
`name`, `website`, `phone`, `accountNumber` (optional, private), `notes`, `logo` (optional),
`aliases[]` (alternate names used on invoices, to help AI auto-matching — e.g. "SUMMIT RACING
EQUIP" → Summit). Shared list across the app, admin-managed; owners can add their own.

### `parts` — manual + invoice-sourced (req #3, #4)
The canonical parts list, one row per part. Fields:

| Field | Type | Notes |
| --- | --- | --- |
| `vehicle` | relation → vehicles | which build it belongs to (drives access) |
| `name` | text | "Currie 9-inch rear end" |
| `category` | relation → partCategories | AI attempts this on import; owner confirms |
| `store` | relation → stores | AI auto-matches from invoice vendor |
| `partNumber` | text | optional |
| `quantity` | number | |
| `unitPrice` | number | |
| `lineTotal` | number | qty × unit (auto) |
| `status` | select | `wishlist` / `ordered` / `received` / `installed` / `returned` |
| `purchaseDate` | date | |
| `sourceInvoice` | relation → invoices | set when created from an uploaded invoice |
| `notes` | richtext | |

### `invoices` — AI ingestion + file kept (req #4)
| Field | Type | Notes |
| --- | --- | --- |
| `vehicle` | relation → vehicles | |
| `file` | upload (media, **private**) | the original PDF/image, kept for reference forever |
| `store` | relation → stores | AI-detected, owner-confirmed |
| `invoiceDate` | date | AI-extracted |
| `invoiceNumber` | text | AI-extracted |
| `subtotal`/`tax`/`shipping`/`total` | number | AI-extracted, editable |
| `lineItems` | array | each: description, partNumber, qty, unitPrice, lineTotal, **suggestedCategory** |
| `aiRaw` | json | raw model output, for debugging/re-runs |
| `reviewStatus` | select | `pending-review` / `confirmed` |

On **confirm**, each line item becomes a `parts` row linked back via `sourceInvoice`. The file
stays attached as the receipt of record.

### `maintenanceRecords` — service log + AI advice (req #5)
| Field | Type | Notes |
| --- | --- | --- |
| `vehicle` | relation → vehicles | |
| `type` | select | oil change, brake service, fluid flush, tire rotation, tune-up, inspection, repair, other |
| `date` | date | |
| `mileage` | number | odometer at service |
| `items` | array | parts/consumables used: name, partNumber, brand, spec (e.g. "5W-30 synthetic"), qty, cost |
| `laborCost` | number | optional |
| `totalCost` | number | rolls into budget |
| `file` | upload (media, private) | optional receipt/invoice image |
| `notes` | richtext | |
| `aiRecommendations` | json/richtext | generated next-service suggestions (see below) |
| `nextDueMileage` / `nextDueDate` | number/date | AI-suggested, editable — drives reminders |

## The running budget (the "budget" ask)

Per-vehicle rollup, computed from the ledger (not hand-maintained):

- **Spent to date** = Σ `parts.lineTotal` (received/installed) + Σ `maintenanceRecords.totalCost`.
- Breakdown **by category** (driveline $X, paint $Y, …) and **by store**.
- Optional `budgetTarget` per vehicle → show **remaining / over-budget** and a progress bar.
- Split **planned vs actual** (wishlist/ordered items shown as projected spend).
- A dashboard per vehicle: total spent, target, top categories, recent invoices, upcoming
  maintenance. This is the landing view of the Garage Ledger for a vehicle.

## AI pipelines (Gemini, server-side)

All AI runs in **Next.js route handlers / server actions** — `GEMINI_API_KEY` never reaches the
browser. All AI output is a **draft the owner reviews and confirms**, never auto-committed.

### A. Invoice extraction (req #4)
1. Owner uploads a PDF/image to an invoice draft; file saved to private Blob storage.
2. Server sends the file to **Gemini (multimodal document understanding)** with a strict
   **structured-output schema**: `{ store, invoiceNumber, invoiceDate, subtotal, tax, shipping,
   total, lineItems:[{description, partNumber, qty, unitPrice, lineTotal}] }`.
3. **Auto-match store**: fuzzy-match extracted vendor against `stores` (+ their `aliases`). If no
   match, suggest creating one.
4. **Attempt category** per line: classify each description into a `partCategory` (Gemini
   classification against the category list). Marked as *suggested* — owner confirms/changes.
5. Owner reviews the parsed table (edit any cell), then **confirms** → line items become `parts`,
   invoice marked `confirmed`, file retained.

### B. Maintenance recommendations (req #5)
- After saving a maintenance record, a server action sends the vehicle's **maintenance history +
  current mileage** to Gemini and asks for next-service recommendations (e.g. "Next oil change
  ~3,000 mi or 6 months", "Inspect U-joints by 60k", "Coolant flush overdue").
- Output is structured: a list of `{ service, dueAtMileage, dueByDate, reason }`, stored on the
  record and surfaced as **upcoming-maintenance reminders** on the vehicle dashboard.
- Guardrail: recommendations are **advisory**, clearly labeled as AI-generated, owner-editable.

### Cost / accuracy notes
- Gemini document parsing is cheap per invoice and fast; the review step covers extraction
  errors. Store `aiRaw` so a parse can be re-run without re-uploading.
- Keep originals (PDF/image) permanently — they're the source of truth if AI misreads a row.

## Admin UI additions (Garage Ledger)

Within `/admin`, per vehicle, a **Ledger** section with tabs:
- **Budget** (dashboard: spent vs target, by category/store, charts)
- **Parts** (table; add manually; filter by category/store/status)
- **Invoices** (upload → AI review → confirm; list of past invoices with files)
- **Maintenance** (service log + AI recommendations + upcoming reminders)

Plus global admin screens for **Part Categories** and **Stores** CRUD.

## Privacy guarantees (req #6)

- Ledger collections have **no public read access** — enforced in Payload access functions,
  not just UI hiding.
- Invoice/maintenance **files are private** (signed/short-lived URLs, owner/admin only — never
  on the public CDN path).
- Public site code never imports or queries these collections.
- Designed for **multi-tenant from day one**: data scoped by `vehicle.owner`, so adding more
  owners later (and transferring vehicles) needs no re-architecture.
