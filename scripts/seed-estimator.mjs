// Seed example estimator config (platforms + features) so the estimator has content.
//   docker compose exec app npx tsx scripts/seed-estimator.mjs
import { getPayload } from 'payload'
import config from '../src/payload.config.ts'

const payload = await getPayload({ config: await config })

await payload.updateGlobal({
  slug: 'estimator-config',
  data: {
    intro:
      'Ballpark your build. Pick a platform and the work you want — this is a rough estimate to start the conversation, not a quote.',
    contingencyPct: 15,
    disclaimer:
      'Estimates are approximate and vary with condition, parts availability and scope. Final pricing is set after an in-person inspection.',
    platforms: [
      { name: "Chevy/GMC 1500 — OBS ('88–'98)", basePrice: 3000, minYear: 1988, maxYear: 1998, type: 'classic' },
      { name: "Chevy/GMC 1500 — NBS ('99–'06)", basePrice: 3000, minYear: 1999, maxYear: 2006, type: 'fullsize' },
      { name: 'Ford F-150', basePrice: 3500, minYear: 1997, maxYear: 2024, type: 'fullsize' },
      { name: 'Ram 1500', basePrice: 3500, minYear: 1994, maxYear: 2024, type: 'fullsize' },
      { name: 'Toyota Tacoma', basePrice: 3200, minYear: 1995, maxYear: 2024, type: 'midsize' },
      { name: 'Ford F-250 / F-350', basePrice: 4500, minYear: 1999, maxYear: 2024, type: 'heavy' },
    ],
    features: [
      // lift / stance (single)
      { name: 'Stock height', price: 0, group: 'lift', description: 'No suspension changes.' },
      { name: '2" Leveling kit', price: 800, group: 'lift' },
      { name: '4" Suspension lift', price: 3500, group: 'lift' },
      { name: '6" Suspension lift', price: 6000, group: 'lift' },
      { name: 'Lowered 3"/5" drop', price: 2800, group: 'lift' },
      { name: 'Lowered 4"/6" drop + C-notch', price: 4800, group: 'lift' },
      // wheels (single)
      { name: '17" off-road wheels', price: 1800, group: 'wheels' },
      { name: '20" street wheels', price: 2200, group: 'wheels' },
      { name: '22" billet wheels', price: 3500, group: 'wheels' },
      // tires (single)
      { name: 'Street / performance tires', price: 1200, group: 'tires' },
      { name: 'All-terrain tires', price: 1600, group: 'tires' },
      { name: 'Mud-terrain tires', price: 2000, group: 'tires' },
      // performance (multi)
      { name: 'Cold air intake + tune', price: 900, group: 'performance' },
      { name: 'Cat-back exhaust', price: 1100, group: 'performance' },
      { name: 'Gear ratio swap', price: 2500, group: 'performance' },
      { name: 'Supercharger', price: 8000, group: 'performance' },
      // exterior (multi)
      { name: 'Custom paint (single stage)', price: 5000, group: 'exterior' },
      { name: 'Show paint (multi-stage)', price: 12000, group: 'exterior' },
      { name: 'Roll pan + shaved handles', price: 2800, group: 'exterior' },
      { name: 'LED lighting package', price: 1500, group: 'exterior' },
      // interior (multi)
      { name: 'Custom upholstery', price: 4000, group: 'interior' },
      { name: 'Audio system', price: 2500, group: 'interior' },
    ],
  },
})

console.log('Seeded estimator config.')
process.exit(0)
