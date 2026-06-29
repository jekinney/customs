import { describe, it, expect } from 'vitest'
import { computeBudget } from '@/lib/budget'

describe('computeBudget', () => {
  const parts = [
    { lineTotal: 100, status: 'installed', category: { name: 'Engine' }, store: { name: 'Summit' } },
    { lineTotal: 50, status: 'received', category: { name: 'Engine' }, store: { name: 'RockAuto' } },
    { lineTotal: 200, status: 'ordered', category: { name: 'Body' }, store: { name: 'Summit' } },
    { lineTotal: 30, status: 'wishlist', category: { name: 'Body' }, store: null },
    { lineTotal: 999, status: 'returned', category: { name: 'Engine' }, store: { name: 'Summit' } },
  ]

  it('separates actual spend from planned', () => {
    const b = computeBudget(parts, 500)
    expect(b.spent).toBe(150) // installed + received
    expect(b.planned).toBe(230) // ordered + wishlist
    expect(b.projectedTotal).toBe(380)
  })

  it('computes remaining/over against the target (excludes returned)', () => {
    expect(computeBudget(parts, 500).remaining).toBe(350)
    expect(computeBudget(parts, 100).overBudget).toBe(true)
    expect(computeBudget(parts, 0).remaining).toBeNull()
  })

  it('rolls up by category and store, ignoring returned items', () => {
    const b = computeBudget(parts, 0)
    expect(b.byCategory.Engine).toBe(150) // 100 + 50 (returned 999 excluded)
    expect(b.byCategory.Body).toBe(230)
    expect(b.byStore.Summit).toBe(300) // 100 installed + 200 ordered (returned 999 excluded)
    expect(b.byStore.Unspecified).toBe(30)
  })

  it('handles an empty list', () => {
    const b = computeBudget([], 1000)
    expect(b.spent).toBe(0)
    expect(b.remaining).toBe(1000)
  })
})
