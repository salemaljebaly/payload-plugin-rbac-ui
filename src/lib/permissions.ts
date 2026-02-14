import type { Config } from 'payload'
import type { AutoDiscoverContext, AutoDiscoverOptions, PermissionGroup } from '../types'

export const flattenPermissionGroups = (groups: PermissionGroup[]): string[] => {
  const unique = new Set<string>()

  for (const group of groups) {
    for (const item of group.permissions) {
      unique.add(item.permission)
    }
  }

  return [...unique]
}

export const validatePermissionArray = (
  value: unknown,
  allowedPermissions: readonly string[],
): true | string => {
  if (value === null || value === undefined) return true
  if (!Array.isArray(value)) return 'Permissions must be an array of strings.'

  const invalid = value.filter(
    (item) => typeof item !== 'string' || !allowedPermissions.includes(item),
  )

  if (invalid.length > 0) {
    return `Invalid permissions found: ${invalid.join(', ')}`
  }

  return true
}

export const coerceStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((v): v is string => typeof v === 'string')
}

const toPascalCase = (value: string): string =>
  value
    .split(/[-_\s/]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

const singularize = (value: string): string => {
  if (value.endsWith('ies')) return `${value.slice(0, -3)}y`
  if (value.endsWith('ses')) return value.slice(0, -2)
  if (value.endsWith('s') && !value.endsWith('ss')) return value.slice(0, -1)
  return value
}

export const defaultPermissionFormatter = ({ action, slug, source }: AutoDiscoverContext): string => {
  const entity = toPascalCase(singularize(slug))
  if (source === 'collection') return `${action}:${entity}`
  return `${action}:Global:${entity}`
}

export const defaultGroupLabelFormatter = ({
  slug,
  source,
}: {
  slug: string
  source: 'collection' | 'global'
}): string => {
  const label = toPascalCase(singularize(slug))
  return source === 'collection' ? label : `Global ${label}`
}

const normalizeAutoDiscoverOptions = (
  autoDiscover: boolean | AutoDiscoverOptions | undefined,
): Required<AutoDiscoverOptions> => {
  const fromOptions = typeof autoDiscover === 'object' && autoDiscover ? autoDiscover : {}

  return {
    collections: fromOptions.collections ?? true,
    globals: fromOptions.globals ?? true,
    collectionActions: fromOptions.collectionActions ?? ['Create', 'Read', 'Update', 'Delete'],
    globalActions: fromOptions.globalActions ?? ['Read', 'Update'],
    includeRolesCollection: fromOptions.includeRolesCollection ?? true,
    formatPermission: fromOptions.formatPermission ?? defaultPermissionFormatter,
    formatGroupLabel: fromOptions.formatGroupLabel ?? defaultGroupLabelFormatter,
  }
}

export const createAutoPermissionGroups = ({
  config,
  rolesCollectionSlug,
  autoDiscover,
}: {
  config: Config
  rolesCollectionSlug: string
  autoDiscover: boolean | AutoDiscoverOptions | undefined
}): PermissionGroup[] => {
  if (!autoDiscover) return []

  const options = normalizeAutoDiscoverOptions(autoDiscover)
  const groups: PermissionGroup[] = []

  if (options.collections) {
    for (const collection of config.collections ?? []) {
      if (!collection.slug) continue
      if (!options.includeRolesCollection && collection.slug === rolesCollectionSlug) continue

      const label = options.formatGroupLabel({ slug: collection.slug, source: 'collection' })
      groups.push({
        label,
        permissions: options.collectionActions.map((action) => ({
          action,
          description: `${action} ${label}`,
          permission: options.formatPermission({ action, slug: collection.slug, source: 'collection' }),
        })),
      })
    }
  }

  if (options.globals) {
    for (const globalConfig of config.globals ?? []) {
      if (!globalConfig.slug) continue

      const label = options.formatGroupLabel({ slug: globalConfig.slug, source: 'global' })
      groups.push({
        label,
        permissions: options.globalActions.map((action) => ({
          action,
          description: `${action} ${label}`,
          permission: options.formatPermission({ action, slug: globalConfig.slug, source: 'global' }),
        })),
      })
    }
  }

  return groups
}

export const mergePermissionGroups = (...groups: PermissionGroup[][]): PermissionGroup[] => {
  const mergedByLabel = new Map<string, Map<string, PermissionGroup['permissions'][number]>>()

  for (const groupSet of groups) {
    for (const group of groupSet) {
      const existing = mergedByLabel.get(group.label) ?? new Map<string, PermissionGroup['permissions'][number]>()
      for (const item of group.permissions) {
        existing.set(item.permission, item)
      }
      mergedByLabel.set(group.label, existing)
    }
  }

  return [...mergedByLabel.entries()].map(([label, items]) => ({
    label,
    permissions: [...items.values()],
  }))
}
