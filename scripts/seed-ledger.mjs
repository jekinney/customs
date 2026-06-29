// Seed the Garage Ledger reference data: part categories + stores (idempotent).
//   docker compose exec app npx tsx scripts/seed-ledger.mjs
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const payload = await getPayload({ config: await config })

const categories = [
  'Driveline', 'Differential', 'Engine', 'Transmission', 'Suspension', 'Brakes',
  'Body', 'Paint', 'Interior', 'Electrical', 'Wheels & Tires', 'Fuel', 'Cooling',
  'Exhaust', 'Fabrication', 'Misc',
]

const stores = [
  { name: 'RockAuto', website: 'https://www.rockauto.com', aliases: [{ value: 'ROCKAUTO' }] },
  { name: 'Summit Racing', website: 'https://www.summitracing.com', aliases: [{ value: 'SUMMIT RACING EQUIP' }, { value: 'SUMMIT' }] },
  { name: 'JEGS', website: 'https://www.jegs.com', aliases: [{ value: 'JEGS HIGH PERFORMANCE' }] },
  { name: 'LMC Truck', website: 'https://www.lmctruck.com', aliases: [{ value: 'LMC' }] },
  { name: 'Amazon', website: 'https://www.amazon.com', aliases: [{ value: 'AMZN' }, { value: 'AMAZON.COM' }] },
  { name: 'eBay', website: 'https://www.ebay.com' },
  { name: 'Local / Other', website: '' },
]

let cAdded = 0
for (let i = 0; i < categories.length; i++) {
  const name = categories[i]
  const existing = await payload.find({ collection: 'part-categories', where: { name: { equals: name } }, limit: 1, overrideAccess: true })
  if (!existing.docs.length) {
    await payload.create({ collection: 'part-categories', data: { name, sortOrder: i }, overrideAccess: true })
    cAdded++
  }
}

let sAdded = 0
for (const store of stores) {
  const existing = await payload.find({ collection: 'stores', where: { name: { equals: store.name } }, limit: 1, overrideAccess: true })
  if (!existing.docs.length) {
    await payload.create({ collection: 'stores', data: store, overrideAccess: true })
    sAdded++
  }
}

console.log(`Seeded ${cAdded} categories, ${sAdded} stores.`)
process.exit(0)
