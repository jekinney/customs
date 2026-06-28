import React from 'react'
import Link from 'next/link'

// Rendered at the TOP of the Payload admin nav (beforeNavLinks).
export default function DashboardLink() {
  return (
    <Link
      href="/admin"
      className="nav__link"
      style={{ display: 'flex', alignItems: 'center', padding: '0.5rem 0', fontWeight: 600 }}
    >
      Dashboard
    </Link>
  )
}
