import type { CollectionConfig, Config, Plugin } from 'payload'
import type { PermissionGroup, RBACUIPluginOptions } from './types'
import {
  createAutoPermissionGroups,
  flattenPermissionGroups,
  mergePermissionGroups,
  validatePermissionArray,
} from './lib/permissions'

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
  resolvedPermissionGroups,
}: {
  collection: CollectionConfig
  options: RBACUIPluginOptions
  allowedPermissions: string[]
  resolvedPermissionGroups: PermissionGroup[]
}): CollectionConfig => {
  const permissionsFieldName = options.permissionsFieldName ?? DEFAULT_PERMISSIONS_FIELD
  const componentPath = options.customFieldPath ?? DEFAULT_COMPONENT_PATH
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
          permissionGroups: resolvedPermissionGroups,
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
  const rolesCollectionSlug = options.rolesCollectionSlug ?? DEFAULT_ROLES_COLLECTION

  return (incomingConfig: Config): Config => {
    const collections = incomingConfig.collections ?? []

    const hasRolesCollection = collections.some((collection) => collection.slug === rolesCollectionSlug)
    if (!hasRolesCollection) {
      throw new Error(`rbacUIPlugin could not find roles collection: "${rolesCollectionSlug}"`)
    }

    const manualPermissionGroups = options.permissionGroups ?? []
    const autoPermissionGroups = createAutoPermissionGroups({
      config: incomingConfig,
      rolesCollectionSlug,
      autoDiscover: options.autoDiscover,
    })
    const resolvedPermissionGroups = mergePermissionGroups(autoPermissionGroups, manualPermissionGroups)

    if (resolvedPermissionGroups.length === 0) {
      throw new Error(
        'rbacUIPlugin resolved zero permission groups. Provide permissionGroups or enable autoDiscover.',
      )
    }

    const allowedPermissions = flattenPermissionGroups(resolvedPermissionGroups)

    return {
      ...incomingConfig,
      collections: collections.map((collection) => {
        if (collection.slug !== rolesCollectionSlug) return collection

        return configureRolesCollection({
          collection,
          options,
          allowedPermissions,
          resolvedPermissionGroups,
        })
      }),
    }
  }
}

export type {
  AutoDiscoverContext,
  AutoDiscoverOptions,
  AutoDiscoverSource,
  PermissionGroup,
  PermissionItem,
  RBACUIPluginOptions,
} from './types'
export {
  createAutoPermissionGroups,
  defaultGroupLabelFormatter,
  defaultPermissionFormatter,
  flattenPermissionGroups,
  mergePermissionGroups,
  validatePermissionArray,
} from './lib/permissions'
