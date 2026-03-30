import type { CollectionConfig } from 'payload'
import { isSuperAdmin } from '../access'

export const Roles: CollectionConfig = {
  slug: 'roles',
  admin: { useAsTitle: 'name' },
  access: {
    read: ({ req: { user } }) => isSuperAdmin(user),
    create: ({ req: { user } }) => isSuperAdmin(user),
    update: ({ req: { user } }) => isSuperAdmin(user),
    delete: ({ req: { user } }) => isSuperAdmin(user),
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
  ],
}
