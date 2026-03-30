import type { Access } from 'payload'

export function isSuperAdmin(user: any): boolean {
  return user?.superAdmin === true
}

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
    isSuperAdmin(user) || hasPermission(user, permission)
