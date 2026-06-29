import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const run = `${Date.now()}`
const ids: { users: (string | number)[]; vehicles: (string | number)[]; parts: (string | number)[] } = {
  users: [],
  vehicles: [],
  parts: [],
}
let ownerA: any
let ownerB: any
let admin: any
let partA: any

describe('Parts owner-scoped access', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    const mkUser = async (role: 'admin' | 'owner', tag: string) => {
      const u = await payload.create({
        collection: 'users',
        overrideAccess: true,
        data: { email: `${tag}+${run}@test.local`, password: 'test12345', role, name: tag },
      })
      ids.users.push(u.id)
      return u
    }
    ownerA = await mkUser('owner', 'partsA')
    ownerB = await mkUser('owner', 'partsB')
    admin = await mkUser('admin', 'partsAdmin')

    const vehicleA = await payload.create({
      collection: 'vehicles',
      overrideAccess: true,
      data: { title: `PartsVehicle ${run}`, status: 'draft', owner: ownerA.id },
    })
    ids.vehicles.push(vehicleA.id)

    partA = await payload.create({
      collection: 'parts',
      overrideAccess: true,
      data: { name: `Currie 9in ${run}`, vehicle: vehicleA.id, quantity: 2, unitPrice: 50 },
    })
    ids.parts.push(partA.id)
  })

  afterAll(async () => {
    for (const id of ids.parts) await payload.delete({ collection: 'parts', id, overrideAccess: true }).catch(() => {})
    for (const id of ids.vehicles) await payload.delete({ collection: 'vehicles', id, overrideAccess: true }).catch(() => {})
    for (const id of ids.users) await payload.delete({ collection: 'users', id, overrideAccess: true }).catch(() => {})
  })

  it('inherits owner from the vehicle and computes lineTotal', () => {
    const ownerId = typeof partA.owner === 'object' ? partA.owner.id : partA.owner
    expect(ownerId).toBe(ownerA.id)
    expect(partA.lineTotal).toBe(100)
  })

  const find = (user: any) =>
    payload.find({ collection: 'parts', overrideAccess: false, user, where: { id: { in: ids.parts } } })

  it("the owner can read their vehicle's part", async () => {
    const res = await find(ownerA)
    expect(res.docs.map((d: any) => d.id)).toContain(partA.id)
  })

  it("another owner cannot read someone else's part", async () => {
    const res = await find(ownerB)
    expect(res.docs.map((d: any) => d.id)).not.toContain(partA.id)
  })

  it('admin can read all parts', async () => {
    const res = await find(admin)
    expect(res.docs.map((d: any) => d.id)).toContain(partA.id)
  })

  it('anonymous cannot read parts at all', async () => {
    await expect(payload.find({ collection: 'parts', overrideAccess: false, user: undefined })).rejects.toThrow()
  })

  it("another owner cannot update someone else's part", async () => {
    await expect(
      payload.update({ collection: 'parts', id: partA.id, overrideAccess: false, user: ownerB, data: { notes: 'hacked' } }),
    ).rejects.toThrow()
  })
})
