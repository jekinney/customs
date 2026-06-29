import type { Payload } from 'payload'

// Turn a reviewed invoice's line items into Parts on its vehicle, then mark the
// invoice confirmed. Returns the number of parts created. Used by the confirm
// endpoint and covered by integration tests.
export async function confirmInvoice(payload: Payload, invoiceId: string | number): Promise<number> {
  const invoice = (await payload.findByID({ collection: 'invoices', id: invoiceId, depth: 0, overrideAccess: true })) as any
  const items = (invoice?.lineItems || []) as any[]
  let created = 0
  for (const li of items) {
    await payload.create({
      collection: 'parts',
      overrideAccess: true,
      data: {
        name: li.description || 'Part',
        vehicle: invoice.vehicle,
        category: li.category || undefined,
        store: invoice.store || undefined,
        partNumber: li.partNumber || undefined,
        quantity: li.quantity || 1,
        unitPrice: li.unitPrice || 0,
        status: 'received',
        purchaseDate: invoice.invoiceDate || undefined,
        sourceInvoice: invoiceId,
      },
    })
    created++
  }
  await payload.update({ collection: 'invoices', id: invoiceId, overrideAccess: true, data: { reviewStatus: 'confirmed' } })
  return created
}
