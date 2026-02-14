import type { PermissionGroup } from '../types'

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
