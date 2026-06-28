// Dev helper: remove the seeded Shop Truck vehicle + all media docs so the
// seed can re-run and re-upload images to the configured storage (e.g. Spaces).
//   docker compose exec app node scripts/reset-shop-truck.mjs
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const payload = await getPayload({ config: await config })

const v = await payload.delete({
  collection: 'vehicles',
  where: { slug: { equals: 'shop-truck' } },
})
const m = await payload.delete({
  collection: 'media',
  where: { id: { exists: true } },
})

console.log(`Deleted vehicles: ${v.docs?.length ?? 0}, media: ${m.docs?.length ?? 0}`)
process.exit(0)
