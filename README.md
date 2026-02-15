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

## Quick Start (Auto-Discover)

```ts
import { buildConfig } from 'payload'
import { rbacUIPlugin } from '@salemaljebaly/payload-plugin-rbac-ui'

export default buildConfig({
  collections: [/* users, roles, posts, etc */],
  globals: [/* settings, etc */],
  plugins: [
    rbacUIPlugin({
      rolesCollectionSlug: 'roles',
      autoDiscover: true,
    }),
  ],
})
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
pnpm typecheck
pnpm test
```

## Contributing

Contributions are welcome.

1. Fork the repository and create a branch from `main`.
2. Make focused changes with tests.
3. Run:

```bash
pnpm install
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
