// Smoke test: send one email via Resend using the env config, to confirm the key works.
// Run:  docker compose exec app node scripts/test-resend.mjs
import 'dotenv/config'
import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  console.error('RESEND_API_KEY not set.')
  process.exit(1)
}

const resend = new Resend(process.env.RESEND_API_KEY)
const { data, error } = await resend.emails.send({
  from: process.env.RESEND_FROM || '120 Customs <onboarding@resend.dev>',
  to: process.env.INQUIRY_NOTIFY_EMAIL || 'delivered@resend.dev',
  subject: '120 Customs — Resend smoke test',
  text: 'If you received this, the contact-form email pipeline is wired up correctly.',
})

if (error) {
  console.error('SEND FAILED:', JSON.stringify(error))
  process.exit(2)
}
console.log('SENT OK, id =', data?.id)
