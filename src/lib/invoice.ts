// Pure helpers for AI invoice ingestion: match a parsed vendor name to a known
// store (by name or alias), and map a suggested category name to a category id.
// Framework-free so they can be unit-tested.

export type StoreLite = {
  id: string | number
  name: string
  aliases?: ({ value?: string | null } | string | null)[] | null
}
export type CategoryLite = { id: string | number; name: string }

const norm = (s: unknown): string => String(s ?? '').toLowerCase().trim()

/** Fuzzy-match a vendor name on an invoice to a known store (name or alias). */
export function matchStore(parsedName: string | null | undefined, stores: StoreLite[]): string | number | null {
  const p = norm(parsedName)
  if (!p) return null
  for (const store of stores) {
    const candidates = [store.name, ...(store.aliases || []).map((a) => (typeof a === 'string' ? a : a?.value))]
    for (const c of candidates) {
      const n = norm(c)
      if (n && (p.includes(n) || n.includes(p))) return store.id
    }
  }
  return null
}

/** Map a suggested category name to a category id (exact, then contains). */
export function mapCategory(name: string | null | undefined, categories: CategoryLite[]): string | number | null {
  const n = norm(name)
  if (!n) return null
  const exact = categories.find((c) => norm(c.name) === n)
  if (exact) return exact.id
  const partial = categories.find((c) => norm(c.name).includes(n) || n.includes(norm(c.name)))
  return partial?.id ?? null
}
