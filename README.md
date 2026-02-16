# @salemaljebaly/payload-plugin-rbac-ui

[![npm version](https://img.shields.io/npm/v/@salemaljebaly/payload-plugin-rbac-ui)](https://www.npmjs.com/package/@salemaljebaly/payload-plugin-rbac-ui)
[![npm downloads](https://img.shields.io/npm/dm/@salemaljebaly/payload-plugin-rbac-ui)](https://www.npmjs.com/package/@salemaljebaly/payload-plugin-rbac-ui)
[![license](https://img.shields.io/npm/l/@salemaljebaly/payload-plugin-rbac-ui)](./LICENSE)

RBAC permissions matrix UI for Payload CMS.

## Features

- Role permissions UI with grouped checkboxes.
- Strict permission value validation.
- Auto-discovery from Payload collections and globals.
- Supports hybrid mode (auto-discovery + custom permissions).

## Screenshot

![Permissions Matrix UI](https://raw.githubusercontent.com/salemaljebaly/payload-plugin-rbac-ui/main/docs/images/permissions-matrix.png)

## Install

```bash
pnpm add @salemaljebaly/payload-plugin-rbac-ui
```

## Setup Guide

### 1. Create a Roles Collection

First, create a Roles collection in your Payload config:

```ts
// src/collections/Roles.ts
import { CollectionConfig } from 'payload'

export const Roles: CollectionConfig = {
  slug: 'roles',
  admin: {
    useAsTitle: 'name',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
    },
    {
      name: 'description',
      type: 'textarea',
    },
    // The 'permissions' field will be added automatically by the plugin
  ],
}
```

### 2. Add the Plugin

Add the plugin to your Payload config with auto-discovery enabled:

```ts
// src/payload.config.ts
import { buildConfig } from 'payload'
import { rbacUIPlugin } from '@salemaljebaly/payload-plugin-rbac-ui'
import { Roles } from './collections/Roles'
import { Users } from './collections/Users'

export default buildConfig({
  collections: [Users, Roles, /* other collections */],
  globals: [/* settings, etc */],
  plugins: [
    rbacUIPlugin({
      rolesCollectionSlug: 'roles',
      autoDiscover: true, // Automatically discover permissions from collections & globals
    }),
  ],
})
```

### 3. Implement Authorization

**Important:** This plugin only provides the UI and validation for permissions. You must implement authorization logic in your collections and globals:

```ts
// src/collections/Posts.ts
import { CollectionConfig } from 'payload'

export const Posts: CollectionConfig = {
  slug: 'posts',
  access: {
    create: ({ req }) => {
      // Check if user's role has the 'Create:Post' permission
      const permissions = req.user?.role?.permissions || []
      return permissions.includes('Create:Post')
    },
    read: ({ req }) => {
      const permissions = req.user?.role?.permissions || []
      return permissions.includes('Read:Post')
    },
    update: ({ req }) => {
      const permissions = req.user?.role?.permissions || []
      return permissions.includes('Update:Post')
    },
    delete: ({ req }) => {
      const permissions = req.user?.role?.permissions || []
      return permissions.includes('Delete:Post')
    },
  },
  fields: [/* your fields */],
}
```

**Helper function** (optional):

```ts
// src/lib/hasPermission.ts
export const hasPermission = (req: PayloadRequest, permission: string): boolean => {
  const permissions = req.user?.role?.permissions || []
  return permissions.includes(permission)
}

// Usage in collection:
import { hasPermission } from '@/lib/hasPermission'

access: {
  create: ({ req }) => hasPermission(req, 'Create:Post'),
  read: ({ req }) => hasPermission(req, 'Read:Post'),
}
```

## Hybrid Example (Auto + Custom)

```ts
import { rbacUIPlugin } from '@salemaljebaly/payload-plugin-rbac-ui'

rbacUIPlugin({
  autoDiscover: true,
  permissionGroups: [
    {
      label: 'Post',
      permissions: [
        {
          action: 'Publish',
          description: 'Publish posts',
          permission: 'Publish:Post',
        },
      ],
    },
  ],
})
```

## Access Enforcement Note

This plugin handles **UI + validation** for role permissions.

Your app still handles **authorization checks** (for example with `hasPermission('Read:Post')` in collection/global access).

## Options

- `rolesCollectionSlug` (default: `roles`)
- `permissionsFieldName` (default: `permissions`)
- `permissionGroups` (optional manual groups)
- `autoDiscover` (`true` or config object)
- `rolesFieldDescription`
- `ensurePermissionsField` (default: `true`)
- `customFieldPath`
- `onConfigureRolesCollection`

`autoDiscover` supports:

- `collections` (default: `true`)
- `globals` (default: `true`)
- `collectionActions` (default: `['Create', 'Read', 'Update', 'Delete']`)
- `globalActions` (default: `['Read', 'Update']`)
- `includeRolesCollection` (default: `true`)
- `formatPermission(context)`
- `formatGroupLabel(context)`

## Compatibility

- Payload: `^3.76.1`
- React: `^19`
- Next.js (via `@payloadcms/next` peer range):
  `>=15.2.9 <15.3.0 || >=15.3.9 <15.4.0 || >=15.4.11 <15.5.0 || >=16.2.0-canary.10 <17.0.0`

## Development

```bash
# Install dependencies
pnpm install

# Build the plugin
pnpm build

# Watch mode for development
pnpm dev

# Type checking
pnpm typecheck

# Run tests
pnpm test
```

## Contributing

Contributions are welcome.

1. Fork the repository and create a branch from `main`.
2. Make focused changes with tests.
3. Run:

```bash
pnpm install
pnpm build
pnpm typecheck
pnpm test
```

4. Open a PR with clear context and before/after behavior.

For full contribution details, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Releases, Tags, and npm Publish

This project uses git tags and npm versions together.

1. Merge PRs to `main`.
2. Bump version:

```bash
pnpm version patch
# or: pnpm version minor
# or: pnpm version major
```

3. Publish package:

```bash
pnpm publish --access public
```

4. Create and push git tag:

```bash
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

## Community Discovery

- Add GitHub topic: `payload-plugin`
- Keep npm package up to date
- Add release notes for each version
