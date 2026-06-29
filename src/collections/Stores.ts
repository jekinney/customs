import type { CollectionConfig } from 'payload'
import { isAuthenticated, adminOnly } from '@/access/roles'

// Vendors/stores (Rock Auto, Summit, Jegs, …). Internal reference data — never
// public. `aliases` help AI invoice ingestion match a vendor name on a receipt.
export const Stores: CollectionConfig = {
  slug: 'stores',
  labels: { singular: 'Store', plural: 'Stores' },
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'website', 'phone'], group: 'Garage Ledger' },
  access: {
    read: isAuthenticated,
    create: isAuthenticated,
    update: isAuthenticated,
    delete: adminOnly,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'website', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', admin: { width: '50%' } },
        { name: 'accountNumber', type: 'text', admin: { width: '50%', description: 'Your account # (private).' } },
      ],
    },
    {
      name: 'aliases',
      type: 'array',
      admin: { description: 'Alternate names this vendor appears as on invoices (helps AI matching).' },
      fields: [{ name: 'value', type: 'text', required: true }],
    },
    { name: 'notes', type: 'textarea' },
  ],
}
