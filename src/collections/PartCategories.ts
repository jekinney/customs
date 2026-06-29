import type { CollectionConfig } from 'payload'
import { isAuthenticated, adminOnly } from '@/access/roles'

const slugify = (s: string): string =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')

// Shared part categories (driveline, engine, body, …). Internal reference data —
// never public; staff (admin/owner) read/edit, admins delete.
export const PartCategories: CollectionConfig = {
  slug: 'part-categories',
  labels: { singular: 'Part Category', plural: 'Part Categories' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'sortOrder'], group: 'Garage Ledger' },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: adminOnly,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.name) data.slug = slugify(String(data.name))
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', unique: true, index: true, admin: { position: 'sidebar' } },
    { name: 'description', type: 'text' },
    { name: 'sortOrder', type: 'number', admin: { position: 'sidebar' } },
  ],
}
