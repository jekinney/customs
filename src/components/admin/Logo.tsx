import React from 'react'
import { Logo } from '@/components/brand/Logo'

// Larger brand lockup shown on the Payload admin login screen.
export default function AdminLogo() {
  return (
    <div style={{ color: '#eab308', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
      <Logo variant="gold" size={96} />
      <div
        style={{
          fontFamily: "'Roboto Mono', monospace",
          fontWeight: 700,
          fontStyle: 'italic',
          textTransform: 'uppercase',
          letterSpacing: '0.15em',
          color: '#fff',
          fontSize: 18,
        }}
      >
        120 <span style={{ color: '#eab308' }}>Customs</span>
      </div>
    </div>
  )
}
