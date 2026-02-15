# Contributing

Thanks for contributing to `@salemaljebaly/payload-plugin-rbac-ui`.

## Workflow

1. Fork and branch from `main`.
2. Keep PRs focused and small.
3. Add/update tests for behavior changes.
4. Run checks before opening PR:

```bash
pnpm install
pnpm typecheck
pnpm test
```

## Pull Request Checklist

- [ ] Clear summary of the problem and change
- [ ] Backward compatibility considered
- [ ] Tests added/updated when needed
- [ ] README updated for user-facing behavior changes

## Commit Messages

Use conventional style where possible:

- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`

## Releases

Maintainers handle versioning and publish:

```bash
pnpm version patch|minor|major
git tag -a vX.Y.Z -m "Release vX.Y.Z"
git push origin vX.Y.Z
```

Publishing is automated via GitHub Actions Trusted Publisher (OIDC) on tag push (`v*`) using `.github/workflows/release.yml`.

## Questions / Discussion

Use GitHub Issues for bugs and feature requests.
Use GitHub Discussions for open-ended ideas (if Discussions are enabled in the repo).
