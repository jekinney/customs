// Idempotent seed: migrate the legacy "Shop Truck" (from migration/legacy-firestore.json
// + decoded images) into a Payload `vehicle`, owned by the first admin user.
// Run inside the app container:
//   docker compose exec app node scripts/seed-shop-truck.mjs
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'
import { readFileSync } from 'node:fs'
import path from 'node:path'

const payload = await getPayload({ config: await config })

const legacy = JSON.parse(readFileSync('migration/legacy-firestore.json', 'utf8'))
const p = legacy.projects?.[0]
if (!p) {
  console.log('No legacy project found; nothing to seed.')
  process.exit(0)
}

const slug = 'shop-truck'
const existing = await payload.find({ collection: 'vehicles', where: { slug: { equals: slug } }, limit: 1, overrideAccess: true })
if (existing.docs.length) {
  console.log('Shop Truck already seeded; skipping.')
  process.exit(0)
}

// Owner = first admin user (if any).
const admins = await payload.find({ collection: 'users', where: { role: { equals: 'admin' } }, limit: 1, overrideAccess: true })
const owner = admins.docs[0]?.id

const uploadImage = async (file, alt) => {
  const media = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.resolve('migration/images', file),
    overrideAccess: true,
  })
  return media.id
}

const beforeId = await uploadImage('shop-truck-imageBefore.jpg', 'Shop Truck — before')
const afterId = await uploadImage('shop-truck-imageAfter.jpg', 'Shop Truck — after')

const vehicle = await payload.create({
  collection: 'vehicles',
  overrideAccess: true,
  data: {
    title: p.title || 'Shop Truck',
    slug,
    status: 'published',
    category: p.category || 'street',
    clientTruck: p.clientTruck || '',
    year: p.year,
    summary: p.description || '',
    coverImage: afterId,
    beforeImage: beforeId,
    afterImage: afterId,
    gallery: [{ image: beforeId, caption: 'Before' }, { image: afterId, caption: 'After' }],
    specs: {
      engine: p.specs?.engine || '',
      transmission: p.specs?.transmission || '',
      drivetrain: p.specs?.drivetrain || '',
      performance: p.specs?.performance || '',
    },
    estimatedCost: p.estimatedCost || 0,
    owner,
  },
})

console.log(`Seeded vehicle "${vehicle.title}" (slug=${vehicle.slug}, id=${vehicle.id}).`)
process.exit(0)
