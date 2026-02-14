# @salemaljebaly/payload-plugin-rbac-ui

Reusable RBAC permissions matrix UI for Payload CMS.

## Features

- Adds a grouped checkbox matrix UI for role permissions in Admin.
- Validates role permissions against a strict allowed list.
- Keeps role permission UI and server-side validation in sync.
- Works by enhancing an existing roles collection.
- Supports auto-discovery from Payload collections and globals.

## Install

```bash
pnpm add @salemaljebaly/payload-plugin-rbac-ui
```

## Usage

```ts
import { buildConfig } from 'payload'
import { rbacUIPlugin, type PermissionGroup } from '@salemaljebaly/payload-plugin-rbac-ui'

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

## Auto-Discovery (Filament-like)

```ts
import { buildConfig } from 'payload'
import { rbacUIPlugin } from '@salemaljebaly/payload-plugin-rbac-ui'

export default buildConfig({
  collections: [/* users, roles, posts, etc */],
  globals: [/* settings, etc */],
  plugins: [
    rbacUIPlugin({
      rolesCollectionSlug: 'roles',
      autoDiscover: true, // Generates CRUD for collections + Read/Update for globals
    }),
  ],
})
```

You can also mix auto-discovery with custom manual permissions:

```ts
rbacUIPlugin({
  autoDiscover: true,
  permissionGroups: [
    {
      label: 'Posts',
      permissions: [{ action: 'Publish', description: 'Publish posts', permission: 'Publish:Post' }],
    },
  ],
})
```

## Options

- `rolesCollectionSlug`: roles collection slug. Default: `roles`
- `permissionsFieldName`: permissions field name. Default: `permissions`
- `permissionGroups`: optional manual permission groups (can be combined with auto-discovery).
- `autoDiscover`: `true` or object config for discovering permissions from collections/globals.
- `rolesFieldDescription`: custom field description text.
- `ensurePermissionsField`: if `true`, inserts field when missing. Default: `true`
- `customFieldPath`: override the client component path.
- `onConfigureRolesCollection`: final roles collection mutator.

### `autoDiscover` options

- `collections`: include collections. Default: `true`
- `globals`: include globals. Default: `true`
- `collectionActions`: default `['Create', 'Read', 'Update', 'Delete']`
- `globalActions`: default `['Read', 'Update']`
- `includeRolesCollection`: include roles resource. Default: `true`
- `formatPermission(context)`: customize generated permission string.
- `formatGroupLabel(context)`: customize group labels.

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
pnpm test
```
