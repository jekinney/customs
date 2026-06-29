// Pure helper: total cost of a maintenance record (consumables + labor).
export type MaintItem = { quantity?: number | null; unitCost?: number | null }

export function computeMaintenanceTotal(items: MaintItem[] | null | undefined, laborCost?: number | null): number {
  const consumables = (items || []).reduce((sum, i) => {
    const qty = i.quantity != null ? Number(i.quantity) : 1
    return sum + (Number.isFinite(qty) ? qty : 1) * (Number(i.unitCost) || 0)
  }, 0)
  return consumables + (Number(laborCost) || 0)
}
