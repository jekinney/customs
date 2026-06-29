import 'dotenv/config'
import { generateRecommendations } from '../src/lib/maintenanceAI.ts'
const recs = await generateRecommendations(
  { title: '1990 Chevy C1500', year: 1990 },
  [{ type: 'oil-change', date: '2026-01-15', mileage: 80000 }, { type: 'brake-service', date: '2025-06-01', mileage: 72000 }],
  84000,
)
console.log(JSON.stringify(recs, null, 2))
process.exit(0)
