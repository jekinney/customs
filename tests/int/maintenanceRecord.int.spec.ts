import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const run = `${Date.now()}`
let ownerA: any
let ownerB: any
let vehicle: any
let record: any

describe('MaintenanceRecords (owner-scoped + totalCost hook)', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const mk = async (tag: string) =>
      payload.create({ collection: 'users', overrideAccess: true, data: { email: `${tag}+${run}@test.local`, password: 'test12345', role: 'owner', name: tag } })
    ownerA = await mk('maintA')
    ownerB = await mk('maintB')
    vehicle = await payload.create({ collection: 'vehicles', overrideAccess: true, data: { title: `MaintVeh ${run}`, status: 'draft', owner: ownerA.id } })
    record = await payload.create({
      collection: 'maintenance-records',
      overrideAccess: true,
      data: {
        vehicle: vehicle.id,
        type: 'oil-change',
        mileage: 84000,
        laborCost: 50,
        items: [
          { name: 'Oil', quantity: 6, unitCost: 8 },
          { name: 'Filter', quantity: 1, unitCost: 14 },
        ],
      },
    })
  })

  afterAll(async () => {
    await payload.delete({ collection: 'maintenance-records', id: record.id, overrideAccess: true }).catch(() => {})
    await payload.delete({ collection: 'vehicles', id: vehicle.id, overrideAccess: true }).catch(() => {})
    await payload.delete({ collection: 'users', id: ownerA.id, overrideAccess: true }).catch(() => {})
    await payload.delete({ collection: 'users', id: ownerB.id, overrideAccess: true }).catch(() => {})
  })

  it('computes totalCost and inherits owner from the vehicle', () => {
    expect(record.totalCost).toBe(112) // 48 + 14 + 50
    expect(typeof record.owner === 'object' ? record.owner.id : record.owner).toBe(ownerA.id)
  })

  it('is readable by its owner but not another owner; denied to anonymous', async () => {
    const seenByA = await payload.find({ collection: 'maintenance-records', overrideAccess: false, user: ownerA, where: { id: { equals: record.id } } })
    expect(seenByA.docs.map((d: any) => d.id)).toContain(record.id)
    const seenByB = await payload.find({ collection: 'maintenance-records', overrideAccess: false, user: ownerB, where: { id: { equals: record.id } } })
    expect(seenByB.docs.map((d: any) => d.id)).not.toContain(record.id)
    await expect(payload.find({ collection: 'maintenance-records', overrideAccess: false, user: undefined })).rejects.toThrow()
  })
})
