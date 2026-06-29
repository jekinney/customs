// Server-only: read an uploaded invoice file and extract structured data via Gemini.
import { GoogleGenAI } from '@google/genai'

export type ExtractedLine = {
  description?: string
  partNumber?: string
  quantity?: number
  unitPrice?: number
  lineTotal?: number
  suggestedCategory?: string
}
export type ExtractedInvoice = {
  store?: string
  invoiceNumber?: string
  invoiceDate?: string
  subtotal?: number
  tax?: number
  shipping?: number
  total?: number
  lineItems?: ExtractedLine[]
}

type InvoiceFile = { filename: string; mimeType?: string | null }

/** Read the uploaded file bytes from Spaces (S3) or local disk → base64. */
export async function readInvoiceFile(invoice: InvoiceFile): Promise<{ base64: string; mimeType: string }> {
  const mimeType = invoice.mimeType || 'application/octet-stream'
  if (process.env.S3_BUCKET) {
    const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3')
    const s3 = new S3Client({
      endpoint: process.env.S3_ENDPOINT,
      region: process.env.S3_REGION,
      credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
      },
    })
    const obj = await s3.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: invoice.filename }))
    const bytes = await (obj.Body as { transformToByteArray: () => Promise<Uint8Array> }).transformToByteArray()
    return { base64: Buffer.from(bytes).toString('base64'), mimeType }
  }
  const fs = await import('node:fs/promises')
  const path = await import('node:path')
  const buf = await fs.readFile(path.join(process.cwd(), 'invoices', invoice.filename))
  return { base64: buf.toString('base64'), mimeType }
}

/** Send the invoice file to Gemini and return structured line items. */
export async function extractInvoice(
  base64: string,
  mimeType: string,
  categoryNames: string[],
): Promise<ExtractedInvoice> {
  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY not set')
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash'

  const prompt = `You parse parts invoices/receipts for a custom truck shop. Extract the data as STRICT JSON only (no markdown), with exactly this shape:
{"store":"","invoiceNumber":"","invoiceDate":"YYYY-MM-DD","subtotal":0,"tax":0,"shipping":0,"total":0,"lineItems":[{"description":"","partNumber":"","quantity":0,"unitPrice":0,"lineTotal":0,"suggestedCategory":""}]}
"store" is the vendor/seller name. For each line item, set "suggestedCategory" to the SINGLE best match from this list, or "" if none fits: ${categoryNames.join(', ')}.
Use 0 for missing numbers and "" for missing strings. Skip non-part lines (tax, shipping, totals) from lineItems. Output ONLY the JSON object.`

  const res = await ai.models.generateContent({
    model,
    contents: [{ role: 'user', parts: [{ inlineData: { mimeType, data: base64 } }, { text: prompt }] }],
    config: { responseMimeType: 'application/json' },
  })

  const text = res.text || '{}'
  try {
    return JSON.parse(text)
  } catch {
    const m = text.match(/\{[\s\S]*\}/)
    return m ? JSON.parse(m[0]) : {}
  }
}
