# Legacy data export (from the current live site)

Snapshot of the **current** 120customs.com Firestore content, captured during Phase 0 to migrate
into the new Payload/Postgres model. Produced by
[`scripts/export-legacy-firestore.mjs`](../scripts/export-legacy-firestore.mjs).

## Contents

- `legacy-firestore.json` — full export:
  - `projects` — **1 project** ("Shop Truck", 1990 Chevrolet GMT400, category `street`).
  - `settings.shop` — **null** (the live site had no custom shop doc; it used the hardcoded default
    story in code).
- `images/` — the project's before/after photos **decoded from base64** to real JPGs
  (~110–125 KB each). These are the only surviving copies and were downscaled to ~800 px wide by
  the old admin, so re-shoot/re-upload at full resolution when you can.

## Why this exists

The old site stored images as base64 **inside** the Firestore documents (the main flaw we're
fixing). This export preserves that content as files + JSON so nothing is lost at cutover.

## Migration plan (Phase 2)

Map this into the new `vehicles` collection per
[`Claude-docs/03-data-model.md`](../Claude-docs/03-data-model.md): fields like `clientTruck`,
`year`, `category`, `description`, `specs` map directly; upload the decoded images to the new media
store (GCS) as the cover/gallery. To re-run the export later:
`npm i firebase && node scripts/export-legacy-firestore.mjs migration/legacy-firestore.json`.
