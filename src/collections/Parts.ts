import type { CollectionConfig } from 'payload'
import { isAuthenticated, privateOwnerAccess, adminOnlyField } from '@/access/roles'

// Per-vehicle parts list (private Garage Ledger). Each part inherits its `owner`
// from the vehicle, so access is owner-scoped; never public.
export const Parts: CollectionConfig = {
  slug: 'parts',
  labels: { singular: 'Part', plural: 'Parts' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'vehicle', 'category', 'status', 'lineTotal'],
    group: 'Garage Ledger',
  },
  access: {
    read: privateOwnerAccess,
    create: isAuthenticated,
    update: privateOwnerAccess,
    delete: privateOwnerAccess,
  },
  hooks: {
    beforeChange: [
      async ({ data, req }) => {
        if (!data) return data
        // Inherit owner from the vehicle (so access stays owner-scoped).
        if (data.vehicle && !data.owner) {
          const vehicle = await req.payload.findByID({
            collection: 'vehicles',
            id: data.vehicle,
            depth: 0,
            overrideAccess: true,
          })
          const owner = (vehicle as { owner?: unknown })?.owner
          if (owner) data.owner = typeof owner === 'object' ? (owner as { id: unknown }).id : owner
        }
        // Computed line total.
        data.lineTotal = (Number(data.quantity) || 0) * (Number(data.unitPrice) || 0)
        return data
      },
    ],
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      type: 'row',
      fields: [
        { name: 'vehicle', type: 'relationship', relationTo: 'vehicles', required: true, admin: { width: '50%' } },
        { name: 'category', type: 'relationship', relationTo: 'part-categories', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'store', type: 'relationship', relationTo: 'stores', admin: { width: '50%' } },
        { name: 'partNumber', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'quantity', type: 'number', defaultValue: 1, admin: { width: '33%' } },
        { name: 'unitPrice', type: 'number', admin: { width: '33%', description: 'Price each ($).' } },
        {
          name: 'lineTotal',
          type: 'number',
          admin: { width: '34%', readOnly: true, description: 'qty × unit (auto).' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          defaultValue: 'wishlist',
          admin: { width: '50%' },
          options: [
            { label: 'Wishlist', value: 'wishlist' },
            { label: 'Ordered', value: 'ordered' },
            { label: 'Received', value: 'received' },
            { label: 'Installed', value: 'installed' },
            { label: 'Returned', value: 'returned' },
          ],
        },
        { name: 'purchaseDate', type: 'date', admin: { width: '50%' } },
      ],
    },
    { name: 'notes', type: 'textarea' },
    {
      name: 'sourceInvoice',
      type: 'relationship',
      relationTo: 'invoices',
      admin: { position: 'sidebar', readOnly: true, description: 'Set when created from an uploaded invoice.' },
    },
    {
      name: 'owner',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Inherited from the vehicle. Only admins can change it.',
      },
      access: { update: adminOnlyField },
    },
  ],
}
