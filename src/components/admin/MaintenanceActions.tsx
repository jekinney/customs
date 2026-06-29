'use client'

import React, { useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'

const card: React.CSSProperties = {
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 6,
  padding: '1rem 1.25rem',
  marginBottom: '1.5rem',
}

type Rec = { service?: string; dueAtMileage?: number; dueByDate?: string; reason?: string }

export default function MaintenanceActions() {
  const { id } = useDocumentInfo()
  const recs = useFormFields(([fields]) => (fields?.aiRecommendations?.value as Rec[]) || [])
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState('')

  if (!id) {
    return (
      <div style={card}>
        <strong>Next-Service Recommendations</strong>
        <p style={{ color: 'var(--theme-elevation-400)', margin: '0.5rem 0 0' }}>
          Save this record, then get AI suggestions for upcoming maintenance.
        </p>
      </div>
    )
  }

  const recommend = async () => {
    setBusy(true)
    setMsg('')
    try {
      const r = await fetch(`/api/maintenance-records/${id}/recommend`, { method: 'POST', credentials: 'include' })
      const d = await r.json()
      if (!r.ok) setMsg(d?.error || 'Request failed.')
      else {
        setMsg(`Got ${d.count} recommendation(s). Reloading…`)
        setTimeout(() => window.location.reload(), 1200)
      }
    } catch {
      setMsg('Network error.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div style={card}>
      <strong>Next-Service Recommendations</strong>
      <div style={{ margin: '0.6rem 0' }}>
        <button
          type="button"
          style={{ border: 'none', borderRadius: 4, padding: '0.55rem 1.1rem', fontWeight: 600, cursor: 'pointer', background: '#eab308', color: '#000' }}
          disabled={busy}
          onClick={recommend}
        >
          {busy ? 'Thinking…' : 'Get AI recommendations'}
        </button>
        {msg && <span style={{ marginLeft: '0.75rem', fontSize: 13, color: 'var(--theme-elevation-650)' }}>{msg}</span>}
      </div>
      {Array.isArray(recs) && recs.length > 0 && (
        <ul style={{ listStyle: 'none', margin: '0.5rem 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recs.map((r, i) => (
            <li key={i} style={{ borderTop: '1px solid var(--theme-elevation-150)', paddingTop: 8, fontSize: 13 }}>
              <strong>{r.service}</strong>
              <span style={{ color: 'var(--theme-elevation-500)' }}>
                {r.dueAtMileage ? ` · ~${Number(r.dueAtMileage).toLocaleString()} mi` : ''}
                {r.dueByDate ? ` · by ${r.dueByDate}` : ''}
              </span>
              {r.reason && <div style={{ color: 'var(--theme-elevation-650)' }}>{r.reason}</div>}
            </li>
          ))}
        </ul>
      )}
      <p style={{ color: 'var(--theme-elevation-400)', fontSize: 11, marginTop: 10 }}>AI-generated guidance — advisory only.</p>
    </div>
  )
}
