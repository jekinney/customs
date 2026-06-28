'use client'

import React, { useState } from 'react'
import { MediaImage } from './MediaImage'

export function Gallery({ images }: { images: { url: string; alt?: string }[] }) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (!images || images.length === 0) return null

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
        }}
      >
        {images.map((img, i) => (
          <div
            key={i}
            onClick={() => setLightboxIndex(i)}
            style={{
              position: 'relative',
              cursor: 'pointer',
              aspectRatio: '4/3',
              overflow: 'hidden',
              borderRadius: '0.5rem',
              background: '#232326',
            }}
          >
            <MediaImage
              src={img.url}
              alt={img.alt || `Gallery image ${i + 1}`}
              fill
              sizes="(max-width: 700px) 50vw, 200px"
            />
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => setLightboxIndex(null)}
        >
          <img
            src={images[lightboxIndex].url}
            alt={images[lightboxIndex].alt || `Lightbox image`}
            style={{ maxHeight: '90vh', maxWidth: '90vw', objectFit: 'contain' }}
          />
          <div style={{ position: 'absolute', bottom: '2rem', display: 'flex', gap: '1rem' }}>
            <button
              className="btn btn--gold"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : images.length - 1)
              }}
            >
              Prev
            </button>
            <button
              className="btn btn--gold"
              onClick={(e) => {
                e.stopPropagation()
                setLightboxIndex(lightboxIndex < images.length - 1 ? lightboxIndex + 1 : 0)
              }}
            >
              Next
            </button>
          </div>
          <button
            style={{
              position: 'absolute',
              top: '2rem',
              right: '2rem',
              background: 'none',
              border: 'none',
              color: '#fff',
              fontSize: '2rem',
              cursor: 'pointer',
            }}
            onClick={() => setLightboxIndex(null)}
          >
            &times;
          </button>
        </div>
      )}
    </>
  )
}
