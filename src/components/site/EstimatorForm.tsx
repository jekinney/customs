'use client'

import React, { useMemo, useState, useTransition } from 'react'
import { estimateBuild, type EstimateResult } from '@/app/(frontend)/actions/estimateBuild'

type Platform = { name: string; basePrice: number; minYear: number | null; maxYear: number | null }
type Feature = { name: string; price: number; group: string; description: string | null }

const SINGLE_GROUPS = ['lift', 'wheels', 'tires']
const GROUP_ORDER = ['lift', 'wheels', 'tires', 'performance', 'exterior', 'interior', 'other']
const GROUP_LABELS: Record<string, string> = {
  lift: 'Lift / Stance',
  wheels: 'Wheels',
  tires: 'Tires',
  performance: 'Performance',
  exterior: 'Exterior',
  interior: 'Interior',
  other: 'Other',
}

const money = (n: number) => `$${Math.round(n).toLocaleString()}`

const labelStyle: React.CSSProperties = {
  fontSize: '0.7rem',
  textTransform: 'uppercase',
  letterSpacing: '0.12em',
  color: 'var(--muted)',
  marginBottom: '0.5rem',
  display: 'block',
}
const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '0.7rem',
  background: 'var(--bg)',
  border: '1px solid var(--border)',
  color: 'var(--text)',
  borderRadius: '0.25rem',
  fontFamily: 'var(--font-mono)',
}

export function EstimatorForm({
  platforms,
  features,
  contingencyPct,
  disclaimer,
}: {
  platforms: Platform[]
  features: Feature[]
  contingencyPct: number
  disclaimer: string | null
}) {
  const [platform, setPlatform] = useState(platforms[0]?.name ?? '')
  const [year, setYear] = useState('')
  const [single, setSingle] = useState<Record<string, string>>({})
  const [multi, setMulti] = useState<Record<string, boolean>>({})
  const [result, setResult] = useState<EstimateResult | null>(null)
  const [pending, startTransition] = useTransition()

  const byGroup = useMemo(() => {
    const m: Record<string, Feature[]> = {}
    for (const f of features) (m[f.group] ||= []).push(f)
    return m
  }, [features])

  const selectedNames = useMemo(() => {
    const names = Object.values(single).filter(Boolean)
    for (const [name, on] of Object.entries(multi)) if (on) names.push(name)
    return names
  }, [single, multi])

  const liveTotal = useMemo(() => {
    const base = platforms.find((p) => p.name === platform)?.basePrice ?? 0
    const adds = features
      .filter((f) => selectedNames.includes(f.name))
      .reduce((s, f) => s + (f.price || 0), 0)
    return base + adds
  }, [platform, selectedNames, platforms, features])

  const pct = contingencyPct / 100
  const low = Math.round(liveTotal * (1 - pct))
  const high = Math.round(liveTotal * (1 + pct))

  const onEstimate = () => {
    startTransition(async () => {
      const r = await estimateBuild({
        platform,
        year: year ? Number(year) : undefined,
        features: selectedNames,
      })
      setResult(r)
    })
  }

  const card: React.CSSProperties = {
    background: 'var(--bg-elev)',
    border: '1px solid var(--border)',
    borderRadius: '0.75rem',
    padding: '1.5rem',
    textAlign: 'left',
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
      {/* Selections */}
      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label style={labelStyle}>Platform</label>
          <select value={platform} onChange={(e) => setPlatform(e.target.value)} style={fieldStyle}>
            {platforms.map((p) => (
              <option key={p.name} value={p.name}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label style={labelStyle}>Year (optional)</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="e.g. 1993"
            style={fieldStyle}
          />
        </div>

        {GROUP_ORDER.filter((g) => byGroup[g]?.length).map((g) => (
          <div key={g}>
            <label style={labelStyle}>{GROUP_LABELS[g] || g}</label>
            {SINGLE_GROUPS.includes(g) ? (
              <select
                value={single[g] ?? ''}
                onChange={(e) => setSingle((s) => ({ ...s, [g]: e.target.value }))}
                style={fieldStyle}
              >
                <option value="">— none —</option>
                {byGroup[g].map((f) => (
                  <option key={f.name} value={f.name}>
                    {f.name} ({money(f.price)})
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {byGroup[g].map((f) => (
                  <label key={f.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={!!multi[f.name]}
                      onChange={(e) => setMulti((m) => ({ ...m, [f.name]: e.target.checked }))}
                    />
                    <span>{f.name}</span>
                    <span style={{ color: 'var(--gold)', marginLeft: 'auto' }}>{money(f.price)}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <div style={labelStyle}>Estimated range</div>
          <div style={{ fontFamily: 'var(--font-display)', fontStyle: 'italic', fontSize: '2.25rem', color: 'var(--gold)', lineHeight: 1 }}>
            {money(low)} – {money(high)}
          </div>
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            Midpoint {money(liveTotal)} · ±{contingencyPct}%
          </div>
        </div>

        <button onClick={onEstimate} disabled={pending || liveTotal === 0} className="btn btn--gold" style={{ opacity: pending || liveTotal === 0 ? 0.6 : 1 }}>
          {pending ? 'Thinking…' : 'Get AI Breakdown'}
        </button>

        {result?.narrative && (
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem', fontSize: '0.9rem', color: '#cbd0d6' }}>
            {result.narrative}
          </div>
        )}
        {result?.error && (
          <div style={{ color: 'var(--muted)', fontSize: '0.8rem' }}>{result.error}</div>
        )}

        {result && result.lineItems.length > 0 && (
          <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.82rem' }}>
            {result.lineItems.map((li, i) => (
              <li key={i} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed var(--border)', paddingBottom: '0.3rem' }}>
                <span style={{ color: 'var(--muted)' }}>{li.label}</span>
                <span>{money(li.price)}</span>
              </li>
            ))}
          </ul>
        )}

        {disclaimer && (
          <p style={{ color: 'var(--muted)', fontSize: '0.72rem', marginTop: 'auto' }}>{disclaimer}</p>
        )}
      </div>
    </div>
  )
}
