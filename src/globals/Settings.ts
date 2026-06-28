import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/access/roles'

// Site-wide content + contact + SEO defaults. Public read; admin-only write.
export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: { group: 'Site' },
  access: {
    read: () => true,
    update: adminOnly,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          fields: [
            { name: 'tagline', type: 'text' },
            { name: 'heroHeadline', type: 'text' },
            { name: 'heroImage', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'The Shop story',
          fields: [
            { name: 'storyTitle', type: 'text' },
            { name: 'storyContent', type: 'richText' },
            { name: 'storyImage', type: 'upload', relationTo: 'media' },
          ],
        },
        {
          label: 'Contact',
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'contactEmail', type: 'email', admin: { width: '50%' } },
                { name: 'phone', type: 'text', admin: { width: '50%' } },
              ],
            },
            { name: 'location', type: 'text' },
            {
              name: 'socialLinks',
              type: 'array',
              fields: [
                { name: 'label', type: 'text', required: true },
                { name: 'url', type: 'text', required: true },
              ],
            },
          ],
        },
        {
          label: 'SEO defaults',
          fields: [
            { name: 'metaTitle', type: 'text' },
            { name: 'metaDescription', type: 'textarea' },
            { name: 'shareImage', type: 'upload', relationTo: 'media' },
          ],
        },
      ],
    },
  ],
}
