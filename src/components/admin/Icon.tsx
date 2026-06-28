import React from 'react'
import { Logo } from '@/components/brand/Logo'

// Small gear mark shown in the Payload admin nav. Gold colour set inline so it
// does not depend on the public-site stylesheet.
export default function AdminIcon() {
  return (
    <span style={{ color: '#eab308', display: 'inline-flex' }}>
      <Logo variant="gold" size={28} />
    </span>
  )
}
