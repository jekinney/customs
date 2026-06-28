'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { GoogleGenAI } from '@google/genai'

export type EstimateInput = {
  platform: string
  year?: number
  features: string[]
}

export type EstimateResult = {
  total: number
  low: number
  high: number
  lineItems: { label: string; price: number }[]
  narrative: string | null
  error: string | null
}

// Deterministic pricing computed from the CMS estimator config; Gemini adds a
// friendly narrative (best-effort — the estimate always returns even if AI fails).
export async function estimateBuild(input: EstimateInput): Promise<EstimateResult> {
  const payload = await getPayload({ config: configPromise })
  const cfg = await payload.findGlobal({ slug: 'estimator-config' })

  const platform = (cfg.platforms || []).find((p) => p.name === input.platform)
  const selected = (cfg.features || []).filter((f) => input.features.includes(f.name))

  const lineItems: { label: string; price: number }[] = []
  if (platform) lineItems.push({ label: `${platform.name} (base)`, price: platform.basePrice || 0 })
  for (const f of selected) lineItems.push({ label: f.name, price: f.price || 0 })

  const total = lineItems.reduce((s, li) => s + li.price, 0)
  const pct = (cfg.contingencyPct ?? 15) / 100
  const low = Math.round(total * (1 - pct))
  const high = Math.round(total * (1 + pct))

  let narrative: string | null = null
  let error: string | null = null

  if (process.env.GEMINI_API_KEY && total > 0) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
      const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'
      const prompt = `You are an estimator for "120 Customs", a custom truck shop.
A customer configured this build:
Platform: ${input.platform}${input.year ? ` (${input.year})` : ''}
Selected work:
${selected.map((f) => `- ${f.name}: $${f.price}`).join('\n') || '- (none)'}
Rough subtotal: $${total} (range $${low}–$${high}).

Write a friendly 2-3 sentence summary of this build: what it will feel/look like, one
practical consideration, and a reminder it's a ballpark pending an in-person inspection.
Plain text only (no markdown). Do not restate exact prices beyond the range.`
      const res = await ai.models.generateContent({ model, contents: prompt })
      narrative = res.text?.trim() || null
    } catch (e) {
      console.error('Gemini estimate error:', e)
      error = 'AI summary is unavailable right now — your estimate above still stands.'
    }
  }

  return { total, low, high, lineItems, narrative, error }
}
