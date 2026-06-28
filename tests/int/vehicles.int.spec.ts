import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const run = `${Date.now()}`
const ids: { users: (string | number)[]; vehicles: (string | number)[] } = { users: [], vehicles: [] }

let ownerA: any
let ownerB: any
let admin: any
let publishedVehicle: any
let draftVehicle: any

describe('Vehicles access control', () => {
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
    ownerA = await mkUser('owner', 'ownerA')
    ownerB = await mkUser('owner', 'ownerB')
    admin = await mkUser('admin', 'admin')

    const mkVehicle = async (title: string, status: string, owner: any) => {
      const v = await payload.create({
        collection: 'vehicles',
        overrideAccess: true,
        data: { title: `${title} ${run}`, status, owner: owner.id },
      })
      ids.vehicles.push(v.id)
      return v
    }
    publishedVehicle = await mkVehicle('Published Build', 'published', ownerA)
    draftVehicle = await mkVehicle('Draft Build', 'draft', ownerA)
  })

  afterAll(async () => {
    for (const id of ids.vehicles) await payload.delete({ collection: 'vehicles', id, overrideAccess: true }).catch(() => {})
    for (const id of ids.users) await payload.delete({ collection: 'users', id, overrideAccess: true }).catch(() => {})
  })

  const findTitles = async (user: any) => {
    const res = await payload.find({ collection: 'vehicles', overrideAccess: false, user, where: { id: { in: ids.vehicles } }, limit: 100 })
    return res.docs.map((d: any) => d.title)
  }

  it('anonymous sees published but NOT draft vehicles', async () => {
    const titles = await findTitles(undefined)
    expect(titles).toContain(publishedVehicle.title)
    expect(titles).not.toContain(draftVehicle.title)
  })

  it('owner sees their own draft + published', async () => {
    const titles = await findTitles(ownerA)
    expect(titles).toContain(publishedVehicle.title)
    expect(titles).toContain(draftVehicle.title)
  })

  it("another owner cannot see someone else's draft", async () => {
    const titles = await findTitles(ownerB)
    expect(titles).toContain(publishedVehicle.title)
    expect(titles).not.toContain(draftVehicle.title)
  })

  it('admin sees everything', async () => {
    const titles = await findTitles(admin)
    expect(titles).toContain(publishedVehicle.title)
    expect(titles).toContain(draftVehicle.title)
  })

  it("a non-owner cannot update another owner's vehicle", async () => {
    await expect(
      payload.update({
        collection: 'vehicles',
        id: draftVehicle.id,
        overrideAccess: false,
        user: ownerB,
        data: { summary: 'hacked' },
      }),
    ).rejects.toThrow()
  })

  it('owner can update their own vehicle', async () => {
    const updated = await payload.update({
      collection: 'vehicles',
      id: draftVehicle.id,
      overrideAccess: false,
      user: ownerA,
      data: { summary: 'legit update' },
    })
    expect(updated.summary).toBe('legit update')
  })
})
