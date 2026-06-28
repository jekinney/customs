'use server'

import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { Resend } from 'resend'

export type InquiryState = {
  success: boolean
  error: string | null
}

// In-memory simple rate limiting
const rateLimitMap = new Map<string, number>()

export async function submitInquiry(
  prevState: InquiryState,
  formData: FormData,
): Promise<InquiryState> {
  const name = formData.get('name')?.toString().trim()
  const email = formData.get('email')?.toString().trim()
  const phone = formData.get('phone')?.toString().trim()
  const message = formData.get('message')?.toString().trim()
  const vehicle = formData.get('vehicle')?.toString() || undefined
  const source = formData.get('source')?.toString() || 'contact-form'

  // Honeypot field (hidden from real users)
  const honeypot = formData.get('address')?.toString()

  if (honeypot) {
    // Silently succeed for bots
    console.warn('Honeypot filled, ignoring inquiry.')
    return { success: true, error: null }
  }

  if (!name || !email || !message) {
    return { success: false, error: 'Name, email, and message are required.' }
  }

  // Rate Limiting (1 per 60 seconds per IP, or email as fallback if IP isn't easily accessible here)
  const rlKey = email.toLowerCase()
  const now = Date.now()
  const lastSubmit = rateLimitMap.get(rlKey)
  if (lastSubmit && now - lastSubmit < 60000) {
    return { success: false, error: 'Please wait a minute before submitting another inquiry.' }
  }
  rateLimitMap.set(rlKey, now)

  try {
    const payload = await getPayload({ config: configPromise })

    // Save to Payload CMS
    const newInquiry = await payload.create({
      collection: 'inquiries',
      data: {
        name,
        email,
        phone,
        message,
        source,
        ...(vehicle && vehicle !== '' ? { vehicle: parseInt(vehicle, 10) || undefined } : {}),
      },
    })

    // Email notification — best-effort. A failure here must NOT fail the submission
    // (the inquiry is already saved and visible in the admin inbox).
    if (process.env.RESEND_API_KEY) {
      try {
        const settings = await payload.findGlobal({ slug: 'settings' })
        const notifyEmail = process.env.INQUIRY_NOTIFY_EMAIL || settings.contactEmail
        const from = process.env.RESEND_FROM || '120 Customs <onboarding@resend.dev>'
        if (notifyEmail) {
          const resend = new Resend(process.env.RESEND_API_KEY)
          const { error: emailError } = await resend.emails.send({
            from,
            to: notifyEmail,
            replyTo: email,
            subject: `New inquiry from ${name}`,
            text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nVehicle ID: ${vehicle || 'None'}\n\nMessage:\n${message}`,
          })
          if (emailError) console.error('Resend send error:', emailError)
        } else {
          console.warn('No notify email configured; skipping email notification.')
        }
      } catch (e) {
        console.error('Failed to send inquiry email:', e)
      }
    } else {
      console.warn('No RESEND_API_KEY set. Skipping email notification.')
    }

    return { success: true, error: null }
  } catch (error) {
    console.error('Error submitting inquiry:', error)
    return { success: false, error: 'An unexpected error occurred. Please try again later.' }
  }
}
