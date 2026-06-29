// Pure budget rollup for a vehicle's parts list (private Garage Ledger).
// Kept framework-free so it can be unit-tested and reused by the admin panel.

export type BudgetPart = {
  lineTotal?: number | null
  status?: string | null
  category?: { name?: string } | string | number | null
  store?: { name?: string } | string | number | null
}

export type BudgetSummary = {
  spent: number // actual: received + installed
  planned: number // projected: wishlist + ordered
  projectedTotal: number // spent + planned
  target: number
  remaining: number | null // target - spent (null when no target)
  overBudget: boolean
  byCategory: Record<string, number>
  byStore: Record<string, number>
}

const ACTUAL = ['received', 'installed']
const PLANNED = ['wishlist', 'ordered']

const nameOf = (rel: BudgetPart['category'], fallback: string): string => {
  if (rel && typeof rel === 'object' && 'name' in rel && rel.name) return String(rel.name)
  return fallback
}

const sortDesc = (rec: Record<string, number>): Record<string, number> =>
  Object.fromEntries(Object.entries(rec).sort((a, b) => b[1] - a[1]))

export function computeBudget(parts: BudgetPart[], budgetTarget?: number | null): BudgetSummary {
  let spent = 0
  let planned = 0
  const byCategory: Record<string, number> = {}
  const byStore: Record<string, number> = {}

  for (const p of parts || []) {
    const amount = Number(p.lineTotal) || 0
    const status = p.status || ''
    if (ACTUAL.includes(status)) spent += amount
    else if (PLANNED.includes(status)) planned += amount

    if (status !== 'returned') {
      const cat = nameOf(p.category, 'Uncategorized')
      const store = nameOf(p.store, 'Unspecified')
      byCategory[cat] = (byCategory[cat] || 0) + amount
      byStore[store] = (byStore[store] || 0) + amount
    }
  }

  const target = Number(budgetTarget) || 0
  const remaining = target > 0 ? target - spent : null

  return {
    spent,
    planned,
    projectedTotal: spent + planned,
    target,
    remaining,
    overBudget: target > 0 && spent > target,
    byCategory: sortDesc(byCategory),
    byStore: sortDesc(byStore),
  }
}
