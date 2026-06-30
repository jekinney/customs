import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config.ts'

async function run() {
  const payload = await getPayload({ config: configPromise })

  await payload.updateGlobal({
    slug: 'settings',
    data: {
      tagline: 'Test Update',
      heroHeadline: 'Testing the update',
    },
  })

  const settings = await payload.findGlobal({ slug: 'settings' })
  console.log(JSON.stringify(settings, null, 2))
  process.exit(0)
}

run()
