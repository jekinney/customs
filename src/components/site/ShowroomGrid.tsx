'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { MediaImage } from './MediaImage'

type VehicleProps = {
  id: string | number
  slug: string
  title: string
  category?: string | null
  year?: number | null
  status: string
  summary?: string | null
  coverUrl?: string | null
}

export function ShowroomGrid({ vehicles }: { vehicles: VehicleProps[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('all')

  const categories = [
    'all',
    ...Array.from(new Set(vehicles.map((v) => v.category).filter(Boolean))),
  ]

  const filtered =
    activeCategory === 'all' ? vehicles : vehicles.filter((v) => v.category === activeCategory)

  return (
    <div>
      {categories.length > 1 && (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            justifyContent: 'center',
            marginBottom: '2.5rem',
            flexWrap: 'wrap',
          }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat!)}
              style={{
                background: activeCategory === cat ? 'var(--gold)' : 'transparent',
                color: activeCategory === cat ? '#000' : 'var(--text)',
                border: `1px solid ${activeCategory === cat ? 'var(--gold)' : 'var(--border)'}`,
                padding: '0.4rem 1.2rem',
                borderRadius: '999px',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              {cat === 'all' ? 'All Builds' : cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '2rem',
            textAlign: 'left',
          }}
        >
          {filtered.map((v) => (
            <Link
              href={`/vehicles/${v.slug}`}
              key={v.id}
              className="card"
              style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}
            >
              <div
                style={{
                  position: 'relative',
                  aspectRatio: '4/3',
                  borderRadius: '0.5rem',
                  overflow: 'hidden',
                  background: '#232326',
                }}
              >
                {v.coverUrl ? (
                  <MediaImage
                    src={v.coverUrl}
                    alt={v.title}
                    fill
                    sizes="(max-width: 700px) 100vw, 350px"
                  />
                ) : (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '100%',
                      color: 'var(--muted)',
                    }}
                  >
                    No Image
                  </div>
                )}
                {v.status !== 'published' && (
                  <span className="shop-truck-frame__tag" style={{ top: '0.5rem', left: '0.5rem' }}>
                    {v.status}
                  </span>
                )}
              </div>
              <div>
                <span
                  style={{
                    color: 'var(--gold)',
                    fontSize: '0.62rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                >
                  {v.category || 'Build'} {v.year ? `// ${v.year}` : ''}
                </span>
                <h4
                  style={{
                    margin: '0.25rem 0 0',
                    fontSize: '1.25rem',
                    fontFamily: 'var(--font-display)',
                    fontStyle: 'italic',
                    textTransform: 'uppercase',
                  }}
                >
                  {v.title}
                </h4>
                {v.summary && (
                  <p style={{ fontSize: '0.85rem', color: 'var(--muted)', margin: '0.5rem 0 0' }}>
                    {v.summary}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="placeholder">No builds found for this category.</div>
      )}
    </div>
  )
}
