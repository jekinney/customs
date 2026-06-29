import { describe, it, expect } from 'vitest'
import { matchStore, mapCategory } from '@/lib/invoice'

const stores = [
  { id: 1, name: 'Summit Racing', aliases: [{ value: 'SUMMIT RACING EQUIP' }, { value: 'SUMMIT' }] },
  { id: 2, name: 'RockAuto', aliases: [{ value: 'ROCKAUTO' }] },
  { id: 3, name: 'JEGS', aliases: null },
]
const categories = [
  { id: 10, name: 'Engine' },
  { id: 11, name: 'Wheels & Tires' },
  { id: 12, name: 'Exhaust' },
]

describe('matchStore', () => {
  it('matches by alias (case-insensitive, contains)', () => {
    expect(matchStore('SUMMIT RACING EQUIP CO', stores)).toBe(1)
    expect(matchStore('rockauto.com', stores)).toBe(2)
    expect(matchStore('JEGS High Performance', stores)).toBe(3)
  })
  it('returns null for unknown / empty vendor', () => {
    expect(matchStore('Napa Auto Parts', stores)).toBeNull()
    expect(matchStore('', stores)).toBeNull()
    expect(matchStore(null, stores)).toBeNull()
  })
})

describe('mapCategory', () => {
  it('maps exact and partial names', () => {
    expect(mapCategory('Engine', categories)).toBe(10)
    expect(mapCategory('engine', categories)).toBe(10)
    expect(mapCategory('wheels', categories)).toBe(11) // partial
  })
  it('returns null for unknown / empty', () => {
    expect(mapCategory('Upholstery', categories)).toBeNull()
    expect(mapCategory(undefined, categories)).toBeNull()
  })
})
