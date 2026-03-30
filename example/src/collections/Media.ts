import type { CollectionConfig } from 'payload'
import { checkPermission } from '../access'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: checkPermission('Read:Media'),
    create: checkPermission('Create:Media'),
    update: checkPermission('Update:Media'),
    delete: checkPermission('Delete:Media'),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
}
