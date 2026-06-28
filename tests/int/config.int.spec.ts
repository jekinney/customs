import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Payload config', () => {
  beforeAll(async () => {
    payload = await getPayload({ config: await config })
  })

  it('registers the expected collections', () => {
    const slugs = payload.config.collections.map((c) => c.slug)
    expect(slugs).toContain('users')
    expect(slugs).toContain('media')
  })

  it('configures media as an upload collection', () => {
    const media = payload.config.collections.find((c) => c.slug === 'media')
    expect(media?.upload).toBeTruthy()
  })
})
