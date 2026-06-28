// Dev helper: (re)create a known admin user for local QA / screenshots.
//   docker compose exec app npx tsx scripts/seed-admin.mjs
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const payload = await getPayload({ config: await config })
const email = 'dev@payloadcms.com'
const password = 'test'

await payload.delete({ collection: 'users', where: { email: { equals: email } } }).catch(() => {})
await payload.create({ collection: 'users', data: { email, password, role: 'admin', name: 'Dev' } })
console.log('Seeded admin:', email, '/', password)
process.exit(0)
