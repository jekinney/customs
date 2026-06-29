// Server-only: ask Gemini for next-service recommendations from a vehicle's history.
import { GoogleGenAI } from '@google/genai'

export type Recommendation = {
  service?: string
  dueAtMileage?: number
  dueByDate?: string
  reason?: string
}
type HistoryEntry = { type?: string; date?: string | null; mileage?: number | null }

export async function generateRecommendations(
  vehicle: { title?: string | null; year?: number | null },
  history: HistoryEntry[],
  currentMileage?: number | null,
): Promise<Recommendation[]> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  const historyText = history.length
    ? history.map((h) => `- ${h.type} on ${h.date || 'unknown date'} at ${h.mileage ?? '?'} mi`).join('\n')
    : '- (no prior records)'

  const prompt = `You are a maintenance advisor for a custom/older truck.
Vehicle: ${vehicle.title || 'truck'}${vehicle.year ? ` (${vehicle.year})` : ''}.
Current odometer: ${currentMileage ?? 'unknown'} miles.
Service history (most recent first):
${historyText}

Recommend the next upcoming maintenance as STRICT JSON only — an array of 3 to 6 items, each:
{"service":"","dueAtMileage":0,"dueByDate":"YYYY-MM-DD","reason":""}
Base intervals on typical guidance for this kind of vehicle. dueAtMileage relative to the current odometer.
Keep "reason" to one short sentence. Output ONLY the JSON array.`

  const res = await ai.models.generateContent({
    model,
    contents: prompt,
    config: { responseMimeType: 'application/json' },
  })

  const text = res.text || '[]'
  try {
    const parsed = JSON.parse(text)
    return Array.isArray(parsed) ? parsed : parsed?.recommendations || []
  } catch {
    const m = text.match(/\[[\s\S]*\]/)
    return m ? JSON.parse(m[0]) : []
  }
}
