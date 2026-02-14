# payload-plugin-rbac-ui

Reusable RBAC permissions matrix UI for Payload CMS.

## Features

- Adds a grouped checkbox matrix UI for role permissions in Admin.
- Validates role permissions against a strict allowed list.
- Keeps role permission UI and server-side validation in sync.
- Works by enhancing an existing roles collection.

## Install

```bash
pnpm add payload-plugin-rbac-ui
```

## Usage

```ts
import { buildConfig } from 'payload'
import { rbacUIPlugin, type PermissionGroup } from 'payload-plugin-rbac-ui'

const permissionGroups: PermissionGroup[] = [
  {
    label: 'Posts',
    permissions: [
      { action: 'Create', description: 'Create posts', permission: 'Create:Post' },
      { action: 'Read', description: 'Read posts', permission: 'Read:Post' },
      { action: 'Update', description: 'Update posts', permission: 'Update:Post' },
      { action: 'Delete', description: 'Delete posts', permission: 'Delete:Post' },
    ],
  },
]

export default buildConfig({
  collections: [/* users, roles, etc */],
  plugins: [
    rbacUIPlugin({
      rolesCollectionSlug: 'roles',
      permissionsFieldName: 'permissions',
      permissionGroups,
    }),
  ],
})
```

## Options

- `rolesCollectionSlug`: roles collection slug. Default: `roles`
- `permissionsFieldName`: permissions field name. Default: `permissions`
- `permissionGroups`: grouped permission model used by the UI and validator.
- `rolesFieldDescription`: custom field description text.
- `ensurePermissionsField`: if `true`, inserts field when missing. Default: `true`
- `customFieldPath`: override the client component path.
- `onConfigureRolesCollection`: final roles collection mutator.

## Best Practices

- Keep permission strings stable (`Action:Resource`).
- Use one shared permission registry for UI, role seeds, and access helpers.
- Use `overrideAccess: false` whenever you pass `user` in Local API calls.
- Keep access checks server-side; UI is only convenience.

## Publishing / Official Discovery

To make the plugin discoverable in the Payload ecosystem:

1. Publish to npm.
2. Add topic `payload-plugin` to the GitHub repository.

Payload docs reference the `payload-plugin` topic for plugin discovery.

## Development

```bash
pnpm --filter payload-plugin-rbac-ui test
```
