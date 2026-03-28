# @salemaljebaly/payload-plugin-rbac-ui

[![npm version](https://img.shields.io/npm/v/@salemaljebaly/payload-plugin-rbac-ui)](https://www.npmjs.com/package/@salemaljebaly/payload-plugin-rbac-ui)
[![npm downloads](https://img.shields.io/npm/dm/@salemaljebaly/payload-plugin-rbac-ui)](https://www.npmjs.com/package/@salemaljebaly/payload-plugin-rbac-ui)
[![license](https://img.shields.io/npm/l/@salemaljebaly/payload-plugin-rbac-ui)](./LICENSE)

RBAC permissions matrix UI for Payload CMS. Injects a grouped checkbox UI into your Roles collection and validates saved permissions against an auto-discovered allow-list.

![Permissions Matrix UI](https://raw.githubusercontent.com/salemaljebaly/payload-plugin-rbac-ui/main/docs/images/permissions-matrix.png)

## Install

```bash
pnpm add @salemaljebaly/payload-plugin-rbac-ui
```

## Setup

### 1. Roles collection

```ts
// src/collections/Roles.ts
import type { CollectionConfig } from 'payload'

export const Roles: CollectionConfig = {
  slug: 'roles',
  admin: { useAsTitle: 'name' },
  access: {
    read: ({ req: { user } }) => !!user, // logged-in users can read (needed for relationship selectors)
    create: isAdmin,
    update: isAdmin,
    delete: isAdmin,
  },
  fields: [
    { name: 'name', type: 'text', required: true, unique: true },
    { name: 'description', type: 'textarea' },
    // 'permissions' field is injected automatically by the plugin
  ],
}
```

### 2. Add the plugin

```ts
// src/payload.config.ts
import { rbacUIPlugin } from '@salemaljebaly/payload-plugin-rbac-ui'

export default buildConfig({
  collections: [Users, Roles, Posts /* ... */],
  plugins: [
    rbacUIPlugin({
      rolesCollectionSlug: 'roles',
      autoDiscover: true,
    }),
  ],
})
```

### 3. Link users to roles

```ts
// src/collections/Users.ts
{
  name: 'roles',
  type: 'relationship',
  relationTo: 'roles',
  hasMany: true,
  saveToJWT: true, // populates role objects (with permissions) onto req.user — no DB query needed
}
```

### 4. Enforce permissions

The plugin handles UI and validation only. Add access control to your collections:

```ts
// src/access/index.ts
import type { Access } from 'payload'

export function hasPermission(user: any, permission: string): boolean {
  if (!user?.roles) return false
  const roles = Array.isArray(user.roles) ? user.roles : [user.roles]
  return roles.some((role: any) => {
    const permissions = typeof role === 'object' ? role?.permissions : null
    return Array.isArray(permissions) && permissions.includes(permission)
  })
}

export const checkPermission =
  (permission: string): Access =>
  ({ req: { user } }) =>
    isAdmin(user) || hasPermission(user, permission)

// Name-based admin check with first-setup fallback (see warning below)
export function isAdmin(user: any): boolean {
  if (!user) return false
  const roles = user.roles
  if (!roles || (Array.isArray(roles) && roles.length === 0)) return true // first-setup fallback
  const roleList = Array.isArray(roles) ? roles : [roles]
  return roleList.some((role: any) => {
    const name = typeof role === 'object' ? role?.name : role
    return typeof name === 'string' && name.toLowerCase() === 'administrator'
  })
}
```

```ts
// src/collections/Posts.ts
access: {
  create: checkPermission('Create:Post'),
  read:   checkPermission('Read:Post'),
  update: checkPermission('Update:Post'),
  delete: checkPermission('Delete:Post'),
}
```

### Permission string format

The default formatter produces:

| Type       | Slug            | Permission strings                                        |
|------------|-----------------|-----------------------------------------------------------|
| Collection | `posts`         | `Create:Post`, `Read:Post`, `Update:Post`, `Delete:Post`  |
| Collection | `categories`    | `Create:Category`, `Read:Category`, …                     |
| Global     | `settings`      | `Read:Global:Setting`, `Update:Global:Setting`            |

Rule: `slug → singularize → PascalCase`. Open the Roles admin UI to see the exact strings for your app.

## ⚠️ First-Setup Warning

**Problem:** If you protect your Roles collection with `checkPermission()`, your first admin user has no roles yet — so they can't open the Roles page to create any roles. Circular dependency.

**Solution:** Use `isAdmin()` with a first-setup fallback (shown above). When a logged-in user has zero roles, `isAdmin()` returns `true`. Once they create and assign a role named `Administrator` to themselves, the fallback no longer applies.

Alternatively, seed your roles and assign one to the first user on startup.

## Hybrid mode (auto + custom)

```ts
rbacUIPlugin({
  autoDiscover: true,
  permissionGroups: [
    {
      label: 'Post',
      permissions: [
        { action: 'Publish', description: 'Publish posts', permission: 'Publish:Post' },
      ],
    },
  ],
})
```

Auto-discovered and manual groups with the same label are merged.

## Options

| Option | Default | Description |
|--------|---------|-------------|
| `rolesCollectionSlug` | `'roles'` | Slug of your roles collection |
| `permissionsFieldName` | `'permissions'` | Field name to inject/patch |
| `permissionGroups` | `[]` | Manual permission groups |
| `autoDiscover` | `false` | `true` or config object (see below) |
| `rolesFieldDescription` | — | Description shown under the field |
| `ensurePermissionsField` | `true` | Auto-add field if missing. Set `false` to skip |
| `customFieldPath` | — | Override the React component path |
| `onConfigureRolesCollection` | — | Callback to modify the final collection config |

### `autoDiscover` options

| Option | Default | Description |
|--------|---------|-------------|
| `collections` | `true` | Discover from collections |
| `globals` | `true` | Discover from globals |
| `collectionActions` | `['Create','Read','Update','Delete']` | Actions per collection |
| `globalActions` | `['Read','Update']` | Actions per global |
| `includeRolesCollection` | `true` | Include the roles collection itself. Set `false` to exclude — permissions like `Create:Role` won't be in the allow-list, so don't use them in seed data |
| `formatPermission(ctx)` | — | `ctx: { action: string, slug: string, source: 'collection' \| 'global' }` → `string` |
| `formatGroupLabel(ctx)` | — | `ctx: { slug: string, source: 'collection' \| 'global' }` → `string` |

## Compatibility

- Payload: `^3.76.1`
- React: `^19`
- Next.js: `>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.0-canary.10 <17.0.0`

## Development

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

## Contributing

1. Fork and branch from `main`.
2. Make focused changes with tests.
3. Run `pnpm build && pnpm typecheck && pnpm test`.
4. Open a PR with clear before/after context.

See [`CONTRIBUTING.md`](./CONTRIBUTING.md) for details.

## Releasing

```bash
pnpm version patch   # or minor / major
pnpm publish --access public
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```
