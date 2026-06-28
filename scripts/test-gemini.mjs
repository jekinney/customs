// Smoke test: confirm the Gemini key + model work.
//   docker compose exec app node scripts/test-gemini.mjs
import 'dotenv/config'
import { GoogleGenAI } from '@google/genai'

if (!process.env.GEMINI_API_KEY) {
  console.error('GEMINI_API_KEY not set.')
  process.exit(1)
}

const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

try {
  const res = await ai.models.generateContent({
    model,
    contents: 'In one short sentence, confirm you are working.',
  })
  console.log(`MODEL ${model} OK:`, res.text)
} catch (e) {
  console.error('GEMINI ERROR:', e?.status || '', e?.message || String(e))
}
process.exit(0)
