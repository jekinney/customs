// End-to-end test of the estimate pipeline (config -> total -> Gemini narrative).
//   docker compose exec app npx tsx scripts/test-estimate.mjs
import { estimateBuild } from '../src/app/(frontend)/actions/estimateBuild.ts'

const r = await estimateBuild({
  platform: 'Ford F-150',
  year: 2015,
  features: ['4" Suspension lift', '20" street wheels', 'All-terrain tires', 'Cat-back exhaust', 'LED lighting package'],
})
console.log('total:', r.total, 'range:', r.low, '-', r.high)
console.log('lineItems:', r.lineItems.length)
console.log('narrative:', r.narrative)
console.log('error:', r.error)
process.exit(0)
