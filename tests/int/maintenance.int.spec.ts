import { describe, it, expect } from 'vitest'
import { computeMaintenanceTotal } from '@/lib/maintenance'

describe('computeMaintenanceTotal', () => {
  it('sums consumables (qty × unitCost) + labor', () => {
    const items = [
      { quantity: 6, unitCost: 8 }, // oil
      { quantity: 1, unitCost: 14 }, // filter
    ]
    expect(computeMaintenanceTotal(items, 50)).toBe(112) // 48 + 14 + 50
  })

  it('defaults missing quantity to 1 and handles empty/labor-only', () => {
    expect(computeMaintenanceTotal([{ unitCost: 20 }], 0)).toBe(20)
    expect(computeMaintenanceTotal([], 75)).toBe(75)
    expect(computeMaintenanceTotal(null, null)).toBe(0)
  })
})
