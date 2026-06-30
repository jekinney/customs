import 'dotenv/config'
import { getPayload } from 'payload'
import configPromise from '../src/payload.config.ts'

async function run() {
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'estimator-config' })
  console.log(JSON.stringify(settings, null, 2))
  process.exit(0)
}

run()
