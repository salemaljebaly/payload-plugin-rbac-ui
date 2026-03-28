import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: true,
  fields: [
    {
      name: 'superAdmin',
      type: 'checkbox',
      defaultValue: false,
      access: {
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
      admin: {
        description: 'Grants full access, bypasses all permission checks.',
      },
    },
    {
      name: 'roles',
      type: 'relationship',
      relationTo: 'roles',
      hasMany: true,
      saveToJWT: true,
      access: {
        update: ({ req: { user } }) => isSuperAdmin(user),
      },
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
