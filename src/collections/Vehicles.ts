import type { CollectionConfig } from 'payload'
import { readPublishedOrOwn, adminOrOwnerWrite, isAuthenticated, adminOnlyField } from '@/access/roles'

const slugify = (s: string): string =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

export const Vehicles: CollectionConfig = {
  slug: 'vehicles',
  labels: { singular: 'Vehicle', plural: 'Vehicles' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'category', 'status', 'featured'],
    group: 'Showroom',
  },
  access: {
    read: readPublishedOrOwn,
    create: isAuthenticated,
    update: adminOrOwnerWrite,
    delete: adminOrOwnerWrite,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && !data.slug && data.title) {
          data.slug = slugify(String(data.title))
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'budgetPanel',
      type: 'ui',
      admin: { components: { Field: '@/components/admin/VehicleBudget#default' } },
    },
    {
      type: 'row',
      fields: [
        { name: 'title', type: 'text', required: true, admin: { width: '60%' } },
        { name: 'year', type: 'number', admin: { width: '40%' } },
      ],
    },
    {
      name: 'slug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        description: 'URL path: /vehicles/<slug>. Auto-generated from the title if left blank.',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      admin: { position: 'sidebar' },
      options: [
        { label: 'Draft (hidden)', value: 'draft' },
        { label: 'Published', value: 'published' },
        { label: 'For sale', value: 'for-sale' },
        { label: 'Sold', value: 'sold' },
      ],
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        description: 'Who owns this build + its private ledger. Only admins can reassign.',
      },
      // Default to the creating user; only admins may change it afterwards.
      defaultValue: ({ req }) => req?.user?.id,
      access: { update: adminOnlyField },
    },
    { name: 'featured', type: 'checkbox', admin: { position: 'sidebar' } },
    { name: 'order', type: 'number', admin: { position: 'sidebar', description: 'Manual sort (lower = first).' } },

    {
      type: 'row',
      fields: [
        {
          name: 'category',
          type: 'select',
          admin: { width: '50%' },
          options: [
            { label: 'Lifts', value: 'lifts' },
            { label: 'Street', value: 'street' },
            { label: 'Overland', value: 'overland' },
            { label: 'Performance', value: 'performance' },
          ],
        },
        { name: 'clientTruck', type: 'text', label: 'Client / Truck', admin: { width: '50%' } },
      ],
    },
    { name: 'summary', type: 'text', admin: { description: 'Short blurb for the showroom card.' } },

    // ---- Media ----
    { name: 'coverImage', type: 'upload', relationTo: 'media', admin: { description: 'Card + hero image.' } },
    {
      name: 'gallery',
      type: 'array',
      label: 'Photo gallery',
      admin: { description: 'Shown on the vehicle spec-sheet page. Drag to reorder.' },
      fields: [
        { name: 'image', type: 'upload', relationTo: 'media', required: true },
        { name: 'caption', type: 'text' },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'beforeImage', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
        { name: 'afterImage', type: 'upload', relationTo: 'media', admin: { width: '50%' } },
      ],
    },

    // ---- Story ----
    { name: 'description', type: 'richText' },
    { name: 'challenge', type: 'richText', label: 'The challenge' },
    { name: 'solution', type: 'richText', label: 'The solution' },

    // ---- Specs ----
    {
      name: 'specs',
      type: 'group',
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'stance', type: 'text', admin: { width: '50%' }, label: 'Stance (lifted/lowered/stock)' },
            { name: 'wheels', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'engine', type: 'text', admin: { width: '50%' } },
            { name: 'transmission', type: 'text', admin: { width: '50%' } },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'drivetrain', type: 'text', admin: { width: '50%' } },
            { name: 'gearRatio', type: 'text', admin: { width: '50%' }, label: 'Gear ratio' },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'differential', type: 'text', admin: { width: '50%' } },
            { name: 'performance', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },

    // ---- Commercial / meta ----
    {
      type: 'row',
      fields: [
        { name: 'completionTime', type: 'text', admin: { width: '33%' } },
        { name: 'estimatedCost', type: 'number', admin: { width: '33%' } },
        {
          name: 'salePrice',
          type: 'number',
          admin: { width: '33%', description: 'Shown when status is For sale.' },
        },
      ],
    },
    {
      name: 'budgetTarget',
      type: 'number',
      admin: { description: 'Optional build budget target (private — drives the Garage Ledger later).' },
    },
    { name: 'publishedAt', type: 'date', admin: { position: 'sidebar' } },
  ],
}
