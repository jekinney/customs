import type { CollectionConfig } from 'payload'
import { isAdmin } from '@/access/roles'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['name', 'email', 'role'],
  },
  auth: true,
  access: {
    // Only admins manage the user list; owners can still read/update themselves.
    create: ({ req: { user } }) => isAdmin(user),
    delete: ({ req: { user } }) => isAdmin(user),
    read: ({ req: { user } }) => {
      if (isAdmin(user)) return true
      if (user) return { id: { equals: user.id } }
      return false
    },
    update: ({ req: { user } }) => {
      if (isAdmin(user)) return true
      if (user) return { id: { equals: user.id } }
      return false
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      // First user (you) is the admin; additional vehicle owners get 'owner'.
      defaultValue: 'admin',
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Owner', value: 'owner' },
      ],
      access: {
        // Only admins may change roles (an owner can't promote themselves).
        update: ({ req: { user } }) => isAdmin(user),
      },
    },
  ],
  versions: false,
}
