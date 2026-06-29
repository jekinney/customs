'use client'

import React, { useEffect, useState } from 'react'
import { useDocumentInfo, useFormFields } from '@payloadcms/ui'
import { computeBudget, type BudgetPart, type BudgetSummary } from '@/lib/budget'

const money = (n: number) => `$${Math.round(n).toLocaleString()}`

const GOLD = '#eab308'
const card: React.CSSProperties = {
  background: 'var(--theme-elevation-50)',
  border: '1px solid var(--theme-elevation-150)',
  borderRadius: 6,
  padding: '1rem 1.25rem',
  marginBottom: '1.5rem',
}
const label: React.CSSProperties = {
  fontSize: 11,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--theme-elevation-400)',
}

function Stat({ k, v, color }: { k: string; v: string; color?: string }) {
  return (
    <div>
      <div style={label}>{k}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: color || 'inherit' }}>{v}</div>
    </div>
  )
}

function Breakdown({ title, data }: { title: string; data: Record<string, number> }) {
  const rows = Object.entries(data)
  if (!rows.length) return null
  return (
    <div style={{ flex: 1, minWidth: 200 }}>
      <div style={{ ...label, marginBottom: 6 }}>{title}</div>
      {rows.map(([name, amt]) => (
        <div key={name} style={{ display: 'flex', justifyContent: 'space-between', padding: '3px 0', fontSize: 13, borderBottom: '1px dashed var(--theme-elevation-150)' }}>
          <span style={{ color: 'var(--theme-elevation-650)' }}>{name}</span>
          <span style={{ fontWeight: 600 }}>{money(amt)}</span>
        </div>
      ))}
    </div>
  )
}

export default function VehicleBudget() {
  const { id } = useDocumentInfo()
  const budgetTarget = useFormFields(([fields]) => Number(fields?.budgetTarget?.value) || 0)
  const [parts, setParts] = useState<BudgetPart[] | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    fetch(`/api/parts?where[vehicle][equals]=${id}&limit=1000&depth=1`, { credentials: 'include' })
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setParts(d?.docs || [])
      })
      .catch(() => !cancelled && setParts([]))
    return () => {
      cancelled = true
    }
  }, [id])

  if (!id) {
    return (
      <div style={card}>
        <div style={label}>Build Budget</div>
        <p style={{ color: 'var(--theme-elevation-400)', margin: '0.5rem 0 0' }}>
          Save the vehicle, then add parts under Garage Ledger to track its budget.
        </p>
      </div>
    )
  }

  if (parts === null) {
    return (
      <div style={card}>
        <div style={label}>Build Budget</div>
        <p style={{ color: 'var(--theme-elevation-400)', margin: '0.5rem 0 0' }}>Loading…</p>
      </div>
    )
  }

  const b: BudgetSummary = computeBudget(parts, budgetTarget)
  const pct = b.target > 0 ? Math.min(100, Math.round((b.spent / b.target) * 100)) : 0

  return (
    <div style={card}>
      <div style={{ ...label, marginBottom: 12 }}>Build Budget · {parts.length} part{parts.length === 1 ? '' : 's'}</div>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', marginBottom: 14 }}>
        <Stat k="Spent (actual)" v={money(b.spent)} color={GOLD} />
        <Stat k="Planned" v={money(b.planned)} />
        <Stat k="Projected total" v={money(b.projectedTotal)} />
        {b.target > 0 && <Stat k="Target" v={money(b.target)} />}
        {b.remaining !== null && (
          <Stat k={b.overBudget ? 'Over budget' : 'Remaining'} v={money(Math.abs(b.remaining))} color={b.overBudget ? 'var(--theme-error-500)' : undefined} />
        )}
      </div>

      {b.target > 0 && (
        <div style={{ height: 8, background: 'var(--theme-elevation-150)', borderRadius: 99, overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ width: `${pct}%`, height: '100%', background: b.overBudget ? 'var(--theme-error-500)' : GOLD }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <Breakdown title="By category" data={b.byCategory} />
        <Breakdown title="By store" data={b.byStore} />
      </div>
    </div>
  )
}
