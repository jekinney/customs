import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ShopTruck } from '@/components/brand/ShopTruck'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { ShowroomGrid } from '@/components/site/ShowroomGrid'
import { SITE_URL } from '@/lib/site'

// ISR: cache the home page, revalidate periodically so CMS edits appear within ~a minute.
export const revalidate = 60

export default async function HomePage() {
  const payload = await getPayload({ config: configPromise })

  const settings = await payload.findGlobal({ slug: 'settings' })
  const { docs: vehicles } = await payload.find({
    collection: 'vehicles',
    where: { status: { in: ['published', 'for-sale', 'sold'] } },
    sort: 'order',
  })

  // Extract variables, falling back to static text if CMS is empty
  const tagline = settings.tagline || '★ Precision Resto-Mods & Heavy-Duty Off-Road Builds'
  const heroHeadline =
    settings.heroHeadline || 'Trucks Built\n<span class="accent">For The Show</span>'
  const storyTitle = settings.storyTitle || 'The Shop'

  const mappedVehicles = vehicles.map(v => ({
    id: v.id,
    slug: v.slug as string,
    title: v.title,
    category: v.category,
    year: v.year,
    status: v.status,
    summary: v.summary,
    coverUrl: v.coverImage && typeof v.coverImage === 'object' && v.coverImage.url ? v.coverImage.url : null
  }))

  // Local SEO: a LocalBusiness so 120 Customs can surface in local/map results.
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'AutoRepair',
    name: '120 Customs',
    description:
      'Custom truck builds, suspension drops, resto-mods and frame-off fabrication since 2012.',
    url: SITE_URL,
    foundingDate: '2012',
    ...(settings.contactEmail ? { email: settings.contactEmail } : {}),
    ...(settings.phone ? { telephone: settings.phone } : {}),
    ...(settings.location ? { address: settings.location } : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="badge">{tagline}</span>
          <h2 dangerouslySetInnerHTML={{ __html: heroHeadline }} />
          <p>
            A personal collection of elite suspension drops, custom resto-mods and frame-off builds
            — crafted for regional car shows, the drive, and the love of classic oil-and-steel
            culture.
          </p>
          <Link href="/#showroom" className="btn btn--gold">
            Examine The Showroom
          </Link>
          <div className="hero__truck">
            {settings.heroImage &&
            typeof settings.heroImage === 'object' &&
            settings.heroImage.url ? (
              <img src={settings.heroImage.url} alt={settings.heroImage.alt || 'Hero truck'} />
            ) : (
              <ShopTruck />
            )}
          </div>
        </div>
      </section>

      {/* Showroom */}
      <section id="showroom" className="section section--center">
        <div className="container">
          <span className="section__eyebrow">Craftsmanship Showroom</span>
          <h3 className="section__title">Personal Build Archives</h3>
          <p style={{ color: 'var(--muted)', maxWidth: '40rem', margin: '0 auto 2rem' }}>
            Each build will show before/after, a full photo gallery and a complete spec sheet.
          </p>

          <ShowroomGrid vehicles={mappedVehicles} />
        </div>
      </section>

      {/* The Shop / story */}
      <section id="shop" className="section">
        <div className="container">
          <div className="shop-grid">
            <div className="card shop-truck-frame">
              <span className="shop-truck-frame__tag">Archive Spec // No. 01 OBS</span>
              {settings.storyImage &&
              typeof settings.storyImage === 'object' &&
              settings.storyImage.url ? (
                <img
                  src={settings.storyImage.url}
                  alt={settings.storyImage.alt || 'The shop'}
                  style={{ borderRadius: '0.75rem' }}
                />
              ) : (
                <ShopTruck />
              )}
            </div>
            <div>
              <span className="section__eyebrow">— Cores &amp; Craftsmanship</span>
              <h3 className="section__title">{storyTitle}</h3>
              {settings.storyContent ? (
                <div style={{ color: '#cbd0d6', marginBottom: '1.5rem' }}>
                  <RichText data={settings.storyContent} />
                </div>
              ) : (
                <p style={{ color: '#cbd0d6' }}>
                  I build and customize trucks as a personal passion project — from classic
                  frame-off teardowns to lowering setups and vintage body fittings. The objective is
                  absolute mechanical integrity and high-impact aesthetics.
                </p>
              )}
              <div className="code-list">
                <div className="code-list__head">⛉ My Build Code</div>
                <ul>
                  <li>
                    <span>01.</span> Perfect structural frame welds only — no half-measures.
                  </li>
                  <li>
                    <span>02.</span> Match axle ratios precisely for vibration-free highway
                    cruising.
                  </li>
                  <li>
                    <span>03.</span> Every project gets deep testing and car-show detailing.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
