import type { CollectionConfig, Config, Plugin } from 'payload'
import type { PermissionGroup, RBACUIPluginOptions } from './types'
import { flattenPermissionGroups, validatePermissionArray } from './lib/permissions'

const DEFAULT_ROLES_COLLECTION = 'roles'
const DEFAULT_PERMISSIONS_FIELD = 'permissions'
const DEFAULT_COMPONENT_PATH = '@salemaljebaly/payload-plugin-rbac-ui/client#PermissionsMatrixField'

const resolveDescription = (
  description: RBACUIPluginOptions['rolesFieldDescription'],
): string | Record<string, string> => {
  if (!description) return 'Select permissions for this role'
  return description
}

const configureRolesCollection = ({
  collection,
  options,
  allowedPermissions,
}: {
  collection: CollectionConfig
  options: RBACUIPluginOptions
  allowedPermissions: string[]
}): CollectionConfig => {
  const permissionsFieldName = options.permissionsFieldName ?? DEFAULT_PERMISSIONS_FIELD
  const componentPath = options.customFieldPath ?? DEFAULT_COMPONENT_PATH
  const permissionGroups = options.permissionGroups
  const fieldDescription = resolveDescription(options.rolesFieldDescription)

  const fields = [...(collection.fields ?? [])]
  const permissionsFieldIndex = fields.findIndex(
    (field) => 'name' in field && field.name === permissionsFieldName,
  )

  const fieldPatch = {
    type: 'json' as const,
    name: permissionsFieldName,
    admin: {
      description: fieldDescription,
      custom: {
        rbac: {
          permissionGroups,
        },
      },
      components: {
        Field: componentPath,
      },
    },
    validate: (value: unknown) => validatePermissionArray(value, allowedPermissions),
  }

  if (permissionsFieldIndex === -1) {
    if (options.ensurePermissionsField === false) return collection
    fields.push(fieldPatch)
  } else {
    const existingField = fields[permissionsFieldIndex]
    fields[permissionsFieldIndex] = {
      ...(existingField as object),
      ...fieldPatch,
      admin: {
        ...((existingField as { admin?: object }).admin ?? {}),
        ...fieldPatch.admin,
      },
    }
  }

  const updated = {
    ...collection,
    fields,
  }

  return options.onConfigureRolesCollection ? options.onConfigureRolesCollection(updated) : updated
}

export const rbacUIPlugin = (options: RBACUIPluginOptions): Plugin => {
  if (!options.permissionGroups || options.permissionGroups.length === 0) {
    throw new Error('rbacUIPlugin requires at least one permission group.')
  }

  const rolesCollectionSlug = options.rolesCollectionSlug ?? DEFAULT_ROLES_COLLECTION
  const allowedPermissions = flattenPermissionGroups(options.permissionGroups)

  return (incomingConfig: Config): Config => {
    const collections = incomingConfig.collections ?? []

    const hasRolesCollection = collections.some((collection) => collection.slug === rolesCollectionSlug)
    if (!hasRolesCollection) {
      throw new Error(`rbacUIPlugin could not find roles collection: "${rolesCollectionSlug}"`)
    }

    return {
      ...incomingConfig,
      collections: collections.map((collection) => {
        if (collection.slug !== rolesCollectionSlug) return collection

        return configureRolesCollection({
          collection,
          options,
          allowedPermissions,
        })
      }),
    }
  }
}

export type { PermissionGroup, PermissionItem, RBACUIPluginOptions } from './types'
export { flattenPermissionGroups, validatePermissionArray } from './lib/permissions'
