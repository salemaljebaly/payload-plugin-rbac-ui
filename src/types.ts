import type { CollectionConfig } from 'payload'

export type PermissionItem = {
  action: string
  description: string
  permission: string
}

export type PermissionGroup = {
  label: string
  permissions: PermissionItem[]
}

export type RBACUIPluginOptions = {
  rolesCollectionSlug?: string
  permissionsFieldName?: string
  permissionGroups: PermissionGroup[]
  rolesFieldDescription?: string | Record<string, string>
  ensurePermissionsField?: boolean
  customFieldPath?: string
  onConfigureRolesCollection?: (collection: CollectionConfig) => CollectionConfig
}
