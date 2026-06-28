import React from 'react'
import { Logo } from '../brand/Logo'

export function Footer() {
  const year = 2026 // build-stamped; updated at each release
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="brand">
          <Logo variant="white" size={36} />
          <span className="brand__name">
            120 <span className="accent">Customs</span>
          </span>
        </div>
        <p>Precision resto-mods, suspension drops &amp; frame-off builds — since 2012.</p>
        <p>&copy; {year} 120 Customs. All builds hand-fabricated.</p>
      </div>
    </footer>
  )
}

export default Footer
