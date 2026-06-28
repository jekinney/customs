import React from 'react'
import { Logo } from '@/components/brand/Logo'

// Small gear mark shown in the Payload admin nav (not a link — use the nav links instead).
export default function AdminIcon() {
  return (
    <span style={{ color: '#eab308', display: 'inline-flex' }}>
      <Logo variant="gold" size={28} markOnly />
    </span>
  )
}
