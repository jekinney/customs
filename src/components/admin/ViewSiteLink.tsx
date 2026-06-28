import React from 'react'
import Link from 'next/link'

// Rendered at the BOTTOM of the Payload admin nav (afterNavLinks) — jump to the public site.
export default function ViewSiteLink() {
  return (
    <Link
      href="/"
      className="nav__link"
      style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0', opacity: 0.85 }}
    >
      ↗ View Site
    </Link>
  )
}
