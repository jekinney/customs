import React from 'react'
import type { Metadata } from 'next'
import { ContactForm } from '@/components/site/ContactForm'
import { getPayload } from 'payload'
import configPromise from '@payload-config'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Get in touch with 120 Customs about a custom truck build or a vehicle in the showroom.',
  alternates: { canonical: '/contact' },
}

interface PageProps {
  searchParams: Promise<{ vehicle?: string }>
}

export default async function ContactPage({ searchParams }: PageProps) {
  const { vehicle } = await searchParams
  const payload = await getPayload({ config: configPromise })
  const settings = await payload.findGlobal({ slug: 'settings' })

  let targetVehicle = null
  if (vehicle) {
    const { docs } = await payload.find({
      collection: 'vehicles',
      where: { slug: { equals: vehicle } },
      limit: 1,
    })
    if (docs.length > 0) {
      targetVehicle = docs[0]
    }
  }

  return (
    <>
      <section className="hero" style={{ padding: '4.5rem 0 3rem' }}>
        <div className="container" style={{ maxWidth: '42rem' }}>
          <span className="badge">Get in Touch</span>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: 'clamp(2.5rem, 6vw, 4rem)',
              lineHeight: 0.9,
              margin: '1rem 0 1.5rem',
            }}
          >
            Contact <span className="accent">The Shop</span>
          </h1>
          <p style={{ color: '#cbd0d6', fontSize: '1.1rem', margin: '0 auto' }}>
            {targetVehicle
              ? `Inquiring about ${targetVehicle.title}. Fill out the form below and we will get back to you.`
              : 'Interested in a custom build, or have questions about one of the vehicles in the showroom? Reach out below.'}
          </p>
        </div>
      </section>

      <section className="section" style={{ paddingTop: '2rem' }}>
        <div className="container" style={{ maxWidth: '42rem' }}>
          <ContactForm vehicleId={targetVehicle?.id} />

          {(settings.contactEmail || settings.phone || settings.location) && (
            <div
              style={{
                marginTop: '4rem',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                gap: '2rem',
                textAlign: 'center',
                borderTop: '1px solid var(--border)',
                paddingTop: '3rem',
              }}
            >
              {settings.contactEmail && (
                <div>
                  <h4
                    style={{
                      color: 'var(--muted)',
                      fontSize: '0.62rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      margin: '0 0 0.5rem',
                    }}
                  >
                    Email
                  </h4>
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    style={{ color: 'var(--gold)', fontWeight: 700 }}
                  >
                    {settings.contactEmail}
                  </a>
                </div>
              )}
              {settings.phone && (
                <div>
                  <h4
                    style={{
                      color: 'var(--muted)',
                      fontSize: '0.62rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      margin: '0 0 0.5rem',
                    }}
                  >
                    Phone
                  </h4>
                  <a
                    href={`tel:${settings.phone}`}
                    style={{ color: 'var(--text)', fontWeight: 700 }}
                  >
                    {settings.phone}
                  </a>
                </div>
              )}
              {settings.location && (
                <div>
                  <h4
                    style={{
                      color: 'var(--muted)',
                      fontSize: '0.62rem',
                      textTransform: 'uppercase',
                      letterSpacing: '0.15em',
                      margin: '0 0 0.5rem',
                    }}
                  >
                    Location
                  </h4>
                  <span style={{ color: 'var(--text)', fontWeight: 700 }}>{settings.location}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
