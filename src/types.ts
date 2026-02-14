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
  permissionGroups?: PermissionGroup[]
  autoDiscover?: boolean | AutoDiscoverOptions
  rolesFieldDescription?: string | Record<string, string>
  ensurePermissionsField?: boolean
  customFieldPath?: string
  onConfigureRolesCollection?: (collection: CollectionConfig) => CollectionConfig
}

export type AutoDiscoverSource = 'collection' | 'global'

export type AutoDiscoverContext = {
  action: string
  slug: string
  source: AutoDiscoverSource
}

export type AutoDiscoverOptions = {
  collections?: boolean
  globals?: boolean
  collectionActions?: string[]
  globalActions?: string[]
  includeRolesCollection?: boolean
  formatPermission?: (context: AutoDiscoverContext) => string
  formatGroupLabel?: (context: { slug: string; source: AutoDiscoverSource }) => string
}
