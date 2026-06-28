import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config: configPromise })
  const { docs } = await payload.find({
    collection: 'vehicles',
    where: { status: { not_equals: 'draft' } },
    limit: 1000,
    depth: 0,
  })

  const vehicleRoutes: MetadataRoute.Sitemap = docs.map((v) => ({
    url: `${SITE_URL}/vehicles/${v.slug}`,
    lastModified: v.updatedAt ? new Date(v.updatedAt) : undefined,
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  return [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.5 },
    ...vehicleRoutes,
  ]
}
