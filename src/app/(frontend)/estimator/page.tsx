import React from 'react'
import type { Metadata } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { EstimatorForm } from '@/components/site/EstimatorForm'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Build Estimator',
  description: 'Ballpark the cost of your custom truck build with the 120 Customs estimator.',
  alternates: { canonical: '/estimator' },
}

export default async function EstimatorPage() {
  const payload = await getPayload({ config: configPromise })
  const cfg = await payload.findGlobal({ slug: 'estimator-config' })

  const platforms = (cfg.platforms || []).map((p) => ({
    name: p.name,
    basePrice: p.basePrice || 0,
    minYear: p.minYear ?? null,
    maxYear: p.maxYear ?? null,
  }))
  const features = (cfg.features || []).map((f) => ({
    name: f.name,
    price: f.price || 0,
    group: f.group,
    description: f.description ?? null,
  }))

  return (
    <section className="hero" style={{ padding: '4.5rem 0 4rem' }}>
      <div className="container" style={{ maxWidth: '56rem' }}>
        <span className="badge">Build Estimator</span>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            textTransform: 'uppercase',
            fontSize: 'clamp(2.5rem, 6vw, 4rem)',
            lineHeight: 0.9,
            margin: '1rem 0 1rem',
          }}
        >
          Ballpark Your <span className="accent">Build</span>
        </h1>
        {cfg.intro && (
          <p style={{ color: '#cbd0d6', maxWidth: '42rem', margin: '0 auto 2.5rem' }}>{cfg.intro}</p>
        )}

        <EstimatorForm
          platforms={platforms}
          features={features}
          contingencyPct={cfg.contingencyPct ?? 15}
          disclaimer={cfg.disclaimer ?? null}
        />
      </div>
    </section>
  )
}
