import React from 'react'
import Link from 'next/link'
import { ShopTruck } from '@/components/brand/ShopTruck'

// Phase 1 homepage shell — design system + layout for review.
// The Showroom grid and the editable story are wired to the CMS in later phases.
export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container">
          <span className="badge">★ Precision Resto-Mods &amp; Heavy-Duty Off-Road Builds</span>
          <h2>
            Trucks Built
            <br />
            <span className="accent">For The Show</span>
          </h2>
          <p>
            A personal collection of elite suspension drops, custom resto-mods and frame-off builds —
            crafted for regional car shows, the drive, and the love of classic oil-and-steel culture.
          </p>
          <Link href="/#showroom" className="btn btn--gold">
            Examine The Showroom
          </Link>
          <div className="hero__truck">
            <ShopTruck />
          </div>
        </div>
      </section>

      {/* Showroom (CMS-driven in Phase 3) */}
      <section id="showroom" className="section section--center">
        <div className="container">
          <span className="section__eyebrow">Craftsmanship Showroom</span>
          <h3 className="section__title">Personal Build Archives</h3>
          <p style={{ color: 'var(--muted)', maxWidth: '40rem', margin: '0 auto 2rem' }}>
            Each build will show before/after, a full photo gallery and a complete spec sheet.
          </p>
          <div className="placeholder">
            Showroom grid loads from the CMS in Phase 3. Add vehicles in the{' '}
            <Link href="/admin" style={{ color: 'var(--gold)' }}>
              admin
            </Link>
            .
          </div>
        </div>
      </section>

      {/* The Shop / story */}
      <section id="shop" className="section">
        <div className="container">
          <div className="shop-grid">
            <div className="card shop-truck-frame">
              <span className="shop-truck-frame__tag">Archive Spec // No. 01 OBS</span>
              <ShopTruck />
            </div>
            <div>
              <span className="section__eyebrow">— Cores &amp; Craftsmanship</span>
              <h3 className="section__title">The Shop</h3>
              <p style={{ color: '#cbd0d6' }}>
                I build and customize trucks as a personal passion project — from classic frame-off
                teardowns to lowering setups and vintage body fittings. The objective is absolute
                mechanical integrity and high-impact aesthetics.
              </p>
              <div className="code-list">
                <div className="code-list__head">⛉ My Build Code</div>
                <ul>
                  <li>
                    <span>01.</span> Perfect structural frame welds only — no half-measures.
                  </li>
                  <li>
                    <span>02.</span> Match axle ratios precisely for vibration-free highway cruising.
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
