'use client'

import React, { useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

const card: React.CSSProperties = {
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 6,
  padding: '1rem 1.25rem',
  marginBottom: '1.5rem',
}
const btn: React.CSSProperties = {
  border: 'none',
  borderRadius: 4,
  padding: '0.55rem 1.1rem',
  fontWeight: 600,
  cursor: 'pointer',
}

export default function InvoiceActions() {
  const { id } = useDocumentInfo()
  const [busy, setBusy] = useState<string>('')
  const [msg, setMsg] = useState<string>('')

  if (!id) {
    return (
      <div style={card}>
        <strong>AI Invoice Ingestion</strong>
        <p style={{ color: 'var(--theme-elevation-400)', margin: '0.5rem 0 0' }}>
          Pick a vehicle, upload the invoice file, and <em>Save</em>. Then return here to extract.
        </p>
      </div>
    )
  }

  const call = async (action: 'extract' | 'confirm') => {
    setBusy(action)
    setMsg('')
    try {
      const r = await fetch(`/api/invoices/${id}/${action}`, { method: 'POST', credentials: 'include' })
      const d = await r.json()
      if (!r.ok) {
        setMsg(d?.error || 'Request failed.')
      } else if (action === 'extract') {
        setMsg(`Extracted ${d.lineItems} line item(s). Reloading to review…`)
        setTimeout(() => window.location.reload(), 1300)
      } else {
        setMsg(`Created ${d.created} part(s) from this invoice. Reloading…`)
        setTimeout(() => window.location.reload(), 1300)
      }
    } catch {
      setMsg('Network error.')
    } finally {
      setBusy('')
    }
  }

  return (
    <div style={card}>
      <strong>AI Invoice Ingestion</strong>
      <p style={{ color: 'var(--theme-elevation-400)', margin: '0.4rem 0 0.8rem', fontSize: 13 }}>
        <em>Extract</em> reads the uploaded file with AI and fills the fields below for review.{' '}
        <em>Confirm</em> turns the reviewed line items into parts on the vehicle.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="button" style={{ ...btn, background: '#eab308', color: '#000' }} disabled={!!busy} onClick={() => call('extract')}>
          {busy === 'extract' ? 'Extracting…' : 'Extract with AI'}
        </button>
        <button type="button" style={{ ...btn, background: 'var(--theme-elevation-150)', color: 'var(--theme-text)' }} disabled={!!busy} onClick={() => call('confirm')}>
          {busy === 'confirm' ? 'Creating…' : 'Confirm → create parts'}
        </button>
        {msg && <span style={{ fontSize: 13, color: 'var(--theme-elevation-650)' }}>{msg}</span>}
      </div>
    </div>
  )
}
