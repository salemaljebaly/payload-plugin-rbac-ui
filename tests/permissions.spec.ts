import { describe, expect, it } from 'vitest'
import { flattenPermissionGroups, validatePermissionArray } from '../src/lib/permissions'

describe('permissions utils', () => {
  it('flattens and de-duplicates permission groups', () => {
    const permissions = flattenPermissionGroups([
      {
        label: 'Users',
        permissions: [
          { action: 'Read', description: 'Read users', permission: 'Read:User' },
          { action: 'Create', description: 'Create users', permission: 'Create:User' },
        ],
      },
      {
        label: 'Users duplicate group',
        permissions: [{ action: 'Read', description: 'Read users', permission: 'Read:User' }],
      },
    ])

    expect(permissions).toEqual(['Read:User', 'Create:User'])
  })

  it('validates permission arrays against the allow-list', () => {
    const allowed = ['Read:User', 'Create:User']

    expect(validatePermissionArray(['Read:User'], allowed)).toBe(true)
    expect(validatePermissionArray(null, allowed)).toBe(true)
    expect(validatePermissionArray('Read:User', allowed)).toBe(
      'Permissions must be an array of strings.',
    )

    const invalidResult = validatePermissionArray(['Read:User', 'Delete:User'], allowed)
    expect(invalidResult).toContain('Invalid permissions found')
    expect(invalidResult).toContain('Delete:User')
  })
})
