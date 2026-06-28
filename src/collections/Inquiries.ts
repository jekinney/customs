import type { CollectionConfig } from 'payload'
import { isAuthenticated } from '@/access/roles'

// Contact-form submissions. Anyone may CREATE (public form); only signed-in
// staff (admin/owner) may read/triage. The site never exposes these publicly.
export const Inquiries: CollectionConfig = {
  slug: 'inquiries',
  labels: { singular: 'Inquiry', plural: 'Inquiries' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'email', 'vehicle', 'status', 'createdAt'],
    group: 'Leads',
  },
  access: {
    create: () => true, // public contact form
    read: isAuthenticated,
    update: isAuthenticated,
    delete: isAuthenticated,
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'email', type: 'email', required: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'phone', type: 'text', admin: { width: '50%' } },
        {
          name: 'status',
          type: 'select',
          defaultValue: 'new',
          admin: { width: '50%' },
          options: [
            { label: 'New', value: 'new' },
            { label: 'Read', value: 'read' },
            { label: 'Replied', value: 'replied' },
            { label: 'Archived', value: 'archived' },
          ],
        },
      ],
    },
    {
      name: 'vehicle',
      type: 'relationship',
      relationTo: 'vehicles',
      admin: { description: 'The build this inquiry is about, if any.' },
    },
    { name: 'message', type: 'textarea', required: true },
    {
      name: 'source',
      type: 'text',
      admin: { readOnly: true, description: 'Which page/form the inquiry came from.' },
    },
  ],
}
