import type { CollectionConfig } from 'payload'
import { checkPermission } from '../access'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: { useAsTitle: 'title' },
  access: {
    create: checkPermission('Create:Post'),
    read:   checkPermission('Read:Post'),
    update: checkPermission('Update:Post'),
    delete: checkPermission('Delete:Post'),
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'content', type: 'textarea' },
  ],
}
