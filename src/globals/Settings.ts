import type { GlobalConfig } from 'payload'
import { adminOnly } from '@/access/roles'

import { revalidatePath } from 'next/cache'

// Site-wide content + contact + SEO defaults. Public read; admin-only write.
export const Settings: GlobalConfig = {
  slug: 'settings',
  admin: { group: 'Site' },
  access: {
    read: () => true,
    update: adminOnly,
  },
  hooks: {
    afterChange: [
      ({ doc }) => {
        // Clear Next.js cache for the home page so frontend updates immediately
        try {
          revalidatePath('/')
          revalidatePath('/(frontend)', 'layout')
          // Clear the admin cache to ensure the form re-populates with fresh data
          revalidatePath('/admin/globals/settings')
        } catch (e) {
          // Ignore invariant errors if running outside of an active Next.js request context
          console.warn('revalidatePath skipped (not running in Next.js context)')
        }
        return doc
      },
    ],
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
            { name: 'heroText', type: 'textarea' },
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
