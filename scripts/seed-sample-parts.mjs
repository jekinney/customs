// Seed a few sample parts on the Shop Truck so the budget panel has data (idempotent).
//   docker compose exec app npx tsx scripts/seed-sample-parts.mjs
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const payload = await getPayload({ config: await config })

const v = (
  await payload.find({ collection: 'vehicles', where: { slug: { equals: 'shop-truck' } }, limit: 1, overrideAccess: true })
).docs[0]
if (!v) {
  console.log('No shop-truck vehicle found.')
  process.exit(0)
}

const existing = await payload.find({ collection: 'parts', where: { vehicle: { equals: v.id } }, limit: 1, overrideAccess: true })
if (existing.docs.length) {
  console.log('Shop Truck already has parts; skipping.')
  process.exit(0)
}

const catId = async (name) =>
  (await payload.find({ collection: 'part-categories', where: { name: { equals: name } }, limit: 1, overrideAccess: true })).docs[0]?.id
const storeId = async (name) =>
  (await payload.find({ collection: 'stores', where: { name: { equals: name } }, limit: 1, overrideAccess: true })).docs[0]?.id

const samples = [
  { name: 'Currie 9" rear end', category: await catId('Differential'), store: await storeId('Summit Racing'), quantity: 1, unitPrice: 1850, status: 'installed' },
  { name: 'Drop spindles (3")', category: await catId('Suspension'), store: await storeId('LMC Truck'), quantity: 1, unitPrice: 420, status: 'installed' },
  { name: '20" billet wheels', category: await catId('Wheels & Tires'), store: await storeId('Summit Racing'), quantity: 4, unitPrice: 520, status: 'received' },
  { name: 'Cat-back exhaust', category: await catId('Exhaust'), store: await storeId('JEGS'), quantity: 1, unitPrice: 1100, status: 'ordered' },
  { name: 'LED headlights', category: await catId('Electrical'), store: await storeId('RockAuto'), quantity: 1, unitPrice: 340, status: 'wishlist' },
]

for (const s of samples) {
  await payload.create({ collection: 'parts', data: { ...s, vehicle: v.id }, overrideAccess: true })
}
await payload.update({ collection: 'vehicles', id: v.id, data: { budgetTarget: 8000 }, overrideAccess: true })

console.log(`Seeded ${samples.length} parts on Shop Truck; budgetTarget=8000.`)
process.exit(0)
