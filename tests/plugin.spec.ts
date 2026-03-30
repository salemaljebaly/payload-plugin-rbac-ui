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

  it('auto-discovers collection and global permissions', async () => {
    const plugin = rbacUIPlugin({ autoDiscover: true })

    const config = (await plugin({
      collections: [
        { slug: 'roles', fields: [{ name: 'permissions', type: 'json' }] },
        { slug: 'posts', fields: [] },
      ],
      globals: [{ slug: 'site-settings', fields: [] }],
    } as unknown as Config)) as Config

    const rolesCollection = config.collections?.find((collection) => collection.slug === 'roles')
    const permissionsField = rolesCollection?.fields?.find(
      (field) => 'name' in field && field.name === 'permissions',
    ) as { admin?: { custom?: { rbac?: { permissionGroups?: typeof permissionGroups } } } } | undefined

    const groups = permissionsField?.admin?.custom?.rbac?.permissionGroups ?? []
    const postGroup = groups.find((group) => group.label === 'Post')
    const globalGroup = groups.find((group) => group.label === 'Global SiteSetting')

    expect(postGroup).toBeDefined()
    expect(postGroup?.permissions.map((item) => item.permission)).toEqual([
      'Create:Post',
      'Read:Post',
      'Update:Post',
      'Delete:Post',
    ])

    expect(globalGroup).toBeDefined()
    expect(globalGroup?.permissions.map((item) => item.permission)).toEqual([
      'Read:Global:SiteSetting',
      'Update:Global:SiteSetting',
    ])
  })

  it('merges auto-discovered and manual permission groups', async () => {
    const plugin = rbacUIPlugin({
      autoDiscover: true,
      permissionGroups: [
        {
          label: 'Post',
          permissions: [
            { action: 'Publish', description: 'Publish post', permission: 'Publish:Post' },
          ],
        },
      ],
    })

    const config = (await plugin({
      collections: [
        { slug: 'roles', fields: [{ name: 'permissions', type: 'json' }] },
        { slug: 'posts', fields: [] },
      ],
    } as unknown as Config)) as Config

    const rolesCollection = config.collections?.find((collection) => collection.slug === 'roles')
    const permissionsField = rolesCollection?.fields?.find(
      (field) => 'name' in field && field.name === 'permissions',
    ) as { admin?: { custom?: { rbac?: { permissionGroups?: typeof permissionGroups } } } } | undefined

    const groups = permissionsField?.admin?.custom?.rbac?.permissionGroups ?? []
    const postGroup = groups.find((group) => group.label === 'Post')
    const permissions = postGroup?.permissions.map((item) => item.permission) ?? []

    expect(permissions).toContain('Create:Post')
    expect(permissions).toContain('Read:Post')
    expect(permissions).toContain('Update:Post')
    expect(permissions).toContain('Delete:Post')
    expect(permissions).toContain('Publish:Post')
  })

  it('uses a custom permissionsFieldName', async () => {
    const plugin = rbacUIPlugin({
      permissionGroups,
      permissionsFieldName: 'access',
    })

    const config = (await plugin({
      collections: [
        { slug: 'roles', fields: [{ name: 'access', type: 'json' }] },
      ],
    } as unknown as Config)) as Config

    const rolesCollection = config.collections?.find((c) => c.slug === 'roles')
    const accessField = rolesCollection?.fields?.find(
      (field) => 'name' in field && field.name === 'access',
    )

    expect(accessField).toBeDefined()
    expect((accessField as { admin?: { components?: { Field?: string } } }).admin?.components?.Field).toBe(
      '@salemaljebaly/payload-plugin-rbac-ui/client#PermissionsMatrixField',
    )
  })

  it('skips field injection when ensurePermissionsField is false and field is absent', async () => {
    const plugin = rbacUIPlugin({
      permissionGroups,
      ensurePermissionsField: false,
    })

    const config = (await plugin({
      collections: [
        { slug: 'roles', fields: [] }, // no permissions field
      ],
    } as unknown as Config)) as Config

    const rolesCollection = config.collections?.find((c) => c.slug === 'roles')
    const permissionsField = rolesCollection?.fields?.find(
      (field) => 'name' in field && field.name === 'permissions',
    )

    expect(permissionsField).toBeUndefined()
  })

  it('calls onConfigureRolesCollection with the configured collection', async () => {
    let received: unknown = null

    const plugin = rbacUIPlugin({
      permissionGroups,
      onConfigureRolesCollection: (collection) => {
        received = collection
        return collection
      },
    })

    await plugin({
      collections: [
        { slug: 'roles', fields: [{ name: 'permissions', type: 'json' }] },
      ],
    } as unknown as Config)

    expect(received).not.toBeNull()
    expect((received as { slug: string }).slug).toBe('roles')
  })
})
