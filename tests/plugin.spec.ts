import { describe, expect, it } from 'vitest'
import type { Config } from 'payload'
import { rbacUIPlugin } from '../src/index'

const permissionGroups = [
  {
    label: 'Users',
    permissions: [
      { action: 'Create', description: 'Create users', permission: 'Create:User' },
      { action: 'Read', description: 'Read users', permission: 'Read:User' },
    ],
  },
]

describe('rbacUIPlugin', () => {
  it('injects RBAC field config into the roles collection', async () => {
    const plugin = rbacUIPlugin({ permissionGroups })

    const config = (await plugin({
      collections: [
        {
          slug: 'roles',
          fields: [
            {
              name: 'permissions',
              type: 'json',
            },
          ],
        },
      ],
    } as Config)) as Config

    const rolesCollection = config.collections?.find((collection) => collection.slug === 'roles')
    const permissionsField = rolesCollection?.fields?.find(
      (field) => 'name' in field && field.name === 'permissions',
    )

    expect(permissionsField).toBeDefined()
    expect(permissionsField?.type).toBe('json')
    expect((permissionsField as { admin?: { components?: { Field?: string } } }).admin?.components?.Field).toBe(
      '@salemaljebaly/payload-plugin-rbac-ui/client#PermissionsMatrixField',
    )

    const validate = (permissionsField as { validate?: (value: unknown) => true | string }).validate
    expect(validate?.(['Read:User'])).toBe(true)
    expect(validate?.(['Delete:User'])).toContain('Invalid permissions found')
  })

  it('throws when roles collection is missing', () => {
    const plugin = rbacUIPlugin({ permissionGroups })

    expect(() =>
      plugin({
        collections: [{ slug: 'users', fields: [] }] as Config['collections'],
      } as Config),
    ).toThrow(
      'rbacUIPlugin could not find roles collection: "roles"',
    )
  })
})
