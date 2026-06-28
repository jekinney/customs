import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect } from 'vitest'

let payload: Payload
const run = `${Date.now()}`
let admin: any
const created: (string | number)[] = []
let adminId: string | number

describe('Inquiries access control', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
    admin = await payload.create({
      collection: 'users',
      overrideAccess: true,
      data: { email: `inqadmin+${run}@test.local`, password: 'test12345', role: 'admin', name: 'inqadmin' },
    })
    adminId = admin.id
  })

  afterAll(async () => {
    for (const id of created) await payload.delete({ collection: 'inquiries', id, overrideAccess: true }).catch(() => {})
    await payload.delete({ collection: 'users', id: adminId, overrideAccess: true }).catch(() => {})
  })

  it('lets the public submit an inquiry (no auth)', async () => {
    const doc = await payload.create({
      collection: 'inquiries',
      overrideAccess: false,
      data: { name: `Visitor ${run}`, email: 'visitor@example.com', message: 'Interested in a build' },
    })
    created.push(doc.id)
    expect(doc.id).toBeTruthy()
    expect(doc.status).toBe('new')
  })

  it('hides inquiries from anonymous readers', async () => {
    await expect(
      payload.find({ collection: 'inquiries', overrideAccess: false, user: undefined }),
    ).rejects.toThrow()
  })

  it('lets staff read submitted inquiries', async () => {
    const res = await payload.find({ collection: 'inquiries', overrideAccess: false, user: admin, where: { id: { in: created } } })
    expect(res.docs.length).toBeGreaterThan(0)
  })
})
