// Smoke-test the Gemini invoice extraction pipeline (multimodal call + JSON parse).
//   docker compose exec app npx tsx scripts/test-extract.mjs [path-to-invoice]
import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { extractInvoice } from '../src/lib/invoiceAI.ts'

const file = process.argv[2] || 'migration/images/shop-truck-imageBefore.jpg'
const buf = readFileSync(file)
const mime = file.toLowerCase().endsWith('.pdf') ? 'application/pdf' : file.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg'
const categories = ['Engine', 'Body', 'Wheels & Tires', 'Exhaust', 'Suspension', 'Brakes', 'Electrical', 'Driveline']

console.log(`Extracting ${file} (${mime}, ${buf.length} bytes)…`)
const result = await extractInvoice(buf.toString('base64'), mime, categories)
console.log(JSON.stringify(result, null, 2))
process.exit(0)
