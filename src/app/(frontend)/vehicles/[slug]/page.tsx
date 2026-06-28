import React from 'react'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { Gallery } from '@/components/site/Gallery'
import { MediaImage } from '@/components/site/MediaImage'
import { absoluteUrl } from '@/lib/site'

// ISR: cache the page, revalidate periodically (CMS edits appear within ~a minute).
export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

async function findVehicle(slug: string) {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'vehicles',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  return docs[0] ?? null
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const vehicle = await findVehicle(slug)
  if (!vehicle) return { title: 'Build not found' }

  const title = `${vehicle.title}${vehicle.year ? ` (${vehicle.year})` : ''}`
  const description =
    vehicle.summary || `A custom ${vehicle.category || 'truck'} build by 120 Customs.`
  const cover =
    vehicle.coverImage && typeof vehicle.coverImage === 'object' ? vehicle.coverImage.url : null
  const ogImage = absoluteUrl(cover)

  return {
    title,
    description,
    alternates: { canonical: `/vehicles/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      images: ogImage ? [ogImage] : undefined,
    },
  }
}

export default async function VehiclePage({ params }: PageProps) {
  const { slug } = await params

  const vehicle = await findVehicle(slug)

  if (!vehicle) {
    notFound()
  }

  const galleryImages = (vehicle.gallery || [])
    .map((item) => item.image)
    .filter((img) => typeof img === 'object' && img !== null && img.url)
    .map((img) => ({ url: (img as any).url, alt: (img as any).alt }))

  const coverImg = vehicle.coverImage && typeof vehicle.coverImage === 'object' ? vehicle.coverImage : null
  const beforeImg = vehicle.beforeImage && typeof vehicle.beforeImage === 'object' ? vehicle.beforeImage : null
  const afterImg = vehicle.afterImage && typeof vehicle.afterImage === 'object' ? vehicle.afterImage : null
  const coverUrl = coverImg?.url ?? null
  const beforeUrl = beforeImg?.url ?? null
  const afterUrl = afterImg?.url ?? null

  // Structured data: Product (+ Offer when the build is for sale) for rich results.
  const jsonLd: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: vehicle.title,
    ...(vehicle.summary ? { description: vehicle.summary } : {}),
    ...(coverUrl ? { image: [absoluteUrl(coverUrl)] } : {}),
    brand: { '@type': 'Brand', name: '120 Customs' },
    ...(vehicle.status === 'for-sale' && vehicle.salePrice
      ? {
          offers: {
            '@type': 'Offer',
            price: vehicle.salePrice,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          },
        }
      : {}),
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Hero */}
      <section className="hero" style={{ padding: '6rem 0 4rem' }}>
        <div className="container">
          <Link
            href="/#showroom"
            style={{
              color: 'var(--gold)',
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: '1rem',
              display: 'inline-block',
            }}
          >
            &larr; Back to Showroom
          </Link>
          <div style={{ marginBottom: '2rem' }}>
            <span className="badge">
              {vehicle.category || 'Build'} {vehicle.year ? `// ${vehicle.year}` : ''}
            </span>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              textTransform: 'uppercase',
              fontSize: 'clamp(3rem, 8vw, 5.5rem)',
              lineHeight: 0.9,
              margin: '0 0 1.5rem',
            }}
          >
            {vehicle.title}
          </h1>
          {vehicle.summary && (
            <p
              style={{ color: '#cbd0d6', fontSize: '1.25rem', maxWidth: '48rem', margin: '0 auto' }}
            >
              {vehicle.summary}
            </p>
          )}
        </div>
      </section>

      {/* Cover Image */}
      {coverUrl && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container">
            <MediaImage
              src={coverUrl}
              alt={vehicle.title}
              width={coverImg?.width}
              height={coverImg?.height}
              priority
              sizes="(max-width: 1100px) 100vw, 1100px"
              style={{ borderRadius: '1rem', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}
            />
          </div>
        </section>
      )}

      {/* Story & Specs */}
      <section className="section">
        <div
          className="container"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '4rem',
          }}
        >
          <div>
            <h3 className="section__title" style={{ fontSize: '2rem', marginBottom: '2rem' }}>
              The Build
            </h3>

            {vehicle.description && (
              <div style={{ color: '#cbd0d6', marginBottom: '2rem' }}>
                <RichText data={vehicle.description} />
              </div>
            )}

            {vehicle.challenge && (
              <div style={{ color: '#cbd0d6', marginBottom: '2rem' }}>
                <h4
                  style={{
                    color: 'var(--text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  The Challenge
                </h4>
                <RichText data={vehicle.challenge} />
              </div>
            )}

            {vehicle.solution && (
              <div style={{ color: '#cbd0d6', marginBottom: '2rem' }}>
                <h4
                  style={{
                    color: 'var(--text)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  The Solution
                </h4>
                <RichText data={vehicle.solution} />
              </div>
            )}
          </div>

          <div>
            <div className="card">
              <h3
                style={{
                  margin: '0 0 1.5rem',
                  fontFamily: 'var(--font-display)',
                  fontStyle: 'italic',
                  textTransform: 'uppercase',
                  fontSize: '1.5rem',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '0.75rem',
                }}
              >
                Spec Sheet
              </h3>

              {vehicle.specs ? (
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                  }}
                >
                  {Object.entries(vehicle.specs).map(([key, value]) => {
                    if (!value) return null
                    // Format key
                    const formattedKey = key
                      .replace(/([A-Z])/g, ' $1')
                      .replace(/^./, (str) => str.toUpperCase())
                    return (
                      <li
                        key={key}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          borderBottom: '1px dashed var(--border)',
                          paddingBottom: '0.5rem',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--muted)',
                            fontSize: '0.8rem',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                          }}
                        >
                          {formattedKey}
                        </span>
                        <span style={{ fontWeight: 700 }}>{String(value)}</span>
                      </li>
                    )
                  })}
                </ul>
              ) : (
                <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>No specs available.</p>
              )}
            </div>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link
                href={`/contact?vehicle=${slug}`}
                className="btn btn--gold"
                style={{ width: '100%' }}
              >
                Inquire About This Build
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Before / After */}
      {(beforeUrl || afterUrl) && (
        <section className="section section--center" style={{ background: 'var(--bg-elev)' }}>
          <div className="container">
            <span className="section__eyebrow">Transformation</span>
            <h3 className="section__title" style={{ fontSize: '2.5rem', marginBottom: '3rem' }}>
              Before & After
            </h3>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
              }}
            >
              {beforeUrl && (
                <div>
                  <h4
                    style={{
                      color: 'var(--muted)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '1rem',
                    }}
                  >
                    Before
                  </h4>
                  <MediaImage
                    src={beforeUrl}
                    alt={`${vehicle.title} Before`}
                    width={beforeImg?.width}
                    height={beforeImg?.height}
                    sizes="(max-width: 700px) 100vw, 50vw"
                    style={{ borderRadius: '0.5rem', filter: 'grayscale(0.5)' }}
                  />
                </div>
              )}
              {afterUrl && (
                <div>
                  <h4
                    style={{
                      color: 'var(--gold)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.1em',
                      marginBottom: '1rem',
                    }}
                  >
                    After
                  </h4>
                  <MediaImage
                    src={afterUrl}
                    alt={`${vehicle.title} After`}
                    width={afterImg?.width}
                    height={afterImg?.height}
                    sizes="(max-width: 700px) 100vw, 50vw"
                    style={{ borderRadius: '0.5rem', boxShadow: '0 10px 30px rgba(234, 179, 8, 0.15)' }}
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <section className="section">
          <div className="container">
            <span className="section__eyebrow">Visuals</span>
            <h3 className="section__title" style={{ fontSize: '2.5rem', marginBottom: '2rem' }}>
              Gallery
            </h3>
            <Gallery images={galleryImages} />
          </div>
        </section>
      )}
    </>
  )
}
