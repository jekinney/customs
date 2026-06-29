import { getPayload, Payload } from 'payload'
import path from 'node:path'
import config from '@/payload.config'
import { confirmInvoice } from '@/lib/invoiceConfirm'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const run = `${Date.now()}`
let owner: any
let vehicle: any
let invoice: any

// Upload collections need a file; the local API takes a filePath. Reuse a real repo image.
const FILE_PATH = path.resolve('migration/images/shop-truck-imageBefore.jpg')

describe('confirmInvoice', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    owner = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email: `inv+${run}@test.local`, password: 'test12345', role: 'owner', name: 'inv' },
    })
    vehicle = await payload.create({
      collection: 'vehicles',
      overrideAccess: true,
      data: { title: `InvVehicle ${run}`, status: 'draft', owner: owner.id },
    })
    invoice = await payload.create({
      collection: 'invoices',
      overrideAccess: true,
      filePath: FILE_PATH,
      data: {
        vehicle: vehicle.id,
        invoiceDate: '2026-06-01',
        lineItems: [
          { description: 'Brake pads', quantity: 2, unitPrice: 40, lineTotal: 80 },
          { description: 'Rotors', quantity: 2, unitPrice: 90, lineTotal: 180 },
        ],
      },
    })
  })

  afterAll(async () => {
    const parts = await payload.find({ collection: 'parts', where: { sourceInvoice: { equals: invoice.id } }, limit: 100, overrideAccess: true })
    for (const p of parts.docs) await payload.delete({ collection: 'parts', id: p.id, overrideAccess: true }).catch(() => {})
    await payload.delete({ collection: 'invoices', id: invoice.id, overrideAccess: true }).catch(() => {})
    await payload.delete({ collection: 'vehicles', id: vehicle.id, overrideAccess: true }).catch(() => {})
    await payload.delete({ collection: 'users', id: owner.id, overrideAccess: true }).catch(() => {})
  })

  it('creates a part per line item (owner inherited, lineTotal computed) and confirms', async () => {
    const created = await confirmInvoice(payload, invoice.id)
    expect(created).toBe(2)

    const parts = await payload.find({ collection: 'parts', where: { sourceInvoice: { equals: invoice.id } }, limit: 100, overrideAccess: true })
    expect(parts.totalDocs).toBe(2)

    const pads = parts.docs.find((p: any) => p.name === 'Brake pads') as any
    expect(pads).toBeTruthy()
    expect(pads.lineTotal).toBe(80)
    expect(pads.status).toBe('received')
    expect(typeof pads.owner === 'object' ? pads.owner.id : pads.owner).toBe(owner.id)

    const inv = (await payload.findByID({ collection: 'invoices', id: invoice.id, overrideAccess: true })) as any
    expect(inv.reviewStatus).toBe('confirmed')
  })
})
