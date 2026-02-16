import React, { useCallback, useMemo } from 'react'
import type { JSONFieldClientComponent } from 'payload'
import { useField } from '@payloadcms/ui'
import type { PermissionGroup } from '../types'
import { coerceStringArray } from '../lib/permissions'

type FieldAdminConfig = {
  custom?: {
    rbac?: {
      permissionGroups?: PermissionGroup[]
    }
  }
}

const readPermissionGroups = (props: unknown): PermissionGroup[] => {
  const typedProps = props as { field?: { admin?: FieldAdminConfig } }
  const admin = typedProps.field?.admin
  return admin?.custom?.rbac?.permissionGroups ?? []
}

export const PermissionsMatrixField: JSONFieldClientComponent = (props) => {
  const { path } = props
  const groups = readPermissionGroups(props)
  const { value, setValue } = useField<unknown>({ path })

  const safeValue = useMemo(() => coerceStringArray(value), [value])
  const currentPermissions = useMemo(() => new Set(safeValue), [safeValue])

  const handleTogglePermission = useCallback(
    (permission: string) => {
      const nextValue = currentPermissions.has(permission)
        ? safeValue.filter((p) => p !== permission)
        : [...safeValue, permission]

      setValue(nextValue)
    },
    [currentPermissions, safeValue, setValue],
  )

  const handleToggleGroup = useCallback(
    (group: PermissionGroup) => {
      const groupPermissions = group.permissions.map((item) => item.permission)
      const allSelected = groupPermissions.every((permission) => currentPermissions.has(permission))

      const nextValue = allSelected
        ? safeValue.filter((p) => !groupPermissions.includes(p))
        : [...new Set([...safeValue, ...groupPermissions])]

      setValue(nextValue)
    },
    [currentPermissions, safeValue, setValue],
  )

  return (
    <div className="field-type permissions-field" style={{ marginTop: 'var(--base)' }}>
      <div
        style={{
          marginBottom: 'var(--base)',
          padding: 'var(--base)',
          backgroundColor: 'var(--theme-success-50)',
          border: '1px solid var(--theme-success-200)',
          borderRadius: 'var(--base-radius)',
        }}
      >
        <strong>Selected: {currentPermissions.size} permissions</strong>
      </div>

      {groups.map((group) => {
        const groupPermissions = group.permissions.map((item) => item.permission)
        const selectedCount = groupPermissions.filter((permission) => currentPermissions.has(permission)).length
        const allSelected = selectedCount === groupPermissions.length
        const someSelected = selectedCount > 0 && !allSelected

        return (
          <div
            key={group.label}
            style={{
              marginBottom: 'calc(var(--base) * 1.5)',
              border: '1px solid var(--theme-elevation-150)',
              borderRadius: 'var(--base-radius)',
              overflow: 'hidden',
              backgroundColor: 'var(--theme-bg)',
            }}
          >
            <div
              style={{
                padding: 'var(--base)',
                backgroundColor: allSelected
                  ? 'var(--theme-success-100)'
                  : someSelected
                    ? 'var(--theme-warning-100)'
                    : 'var(--theme-elevation-50)',
                borderBottom: '1px solid var(--theme-elevation-150)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'calc(var(--base) * 0.75)' }}>
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(input) => {
                    if (input) input.indeterminate = someSelected
                  }}
                  onChange={() => handleToggleGroup(group)}
                  style={{ cursor: 'pointer' }}
                />
                <strong style={{ fontSize: '1.125rem' }}>{group.label}</strong>
                {selectedCount > 0 && (
                  <span
                    style={{
                      fontSize: '0.875rem',
                      color: 'var(--theme-elevation-500)',
                      backgroundColor: 'var(--theme-elevation-100)',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '9999px',
                    }}
                  >
                    {selectedCount}/{groupPermissions.length}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleToggleGroup(group)}
                className="btn"
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  backgroundColor: allSelected ? 'var(--theme-error-500)' : 'var(--theme-success-500)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--base-radius)',
                  cursor: 'pointer',
                }}
              >
                {allSelected ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div
              style={{
                padding: 'var(--base)',
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: 'calc(var(--base) * 0.75)',
              }}
            >
              {group.permissions.map((item) => {
                const isSelected = currentPermissions.has(item.permission)

                return (
                  <label
                    key={item.permission}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '0.5rem',
                      padding: 'calc(var(--base) * 0.75)',
                      border: `2px solid ${isSelected ? 'var(--theme-success-500)' : 'var(--theme-elevation-150)'}`,
                      borderRadius: 'var(--base-radius)',
                      backgroundColor: isSelected ? 'var(--theme-success-50)' : 'var(--theme-bg)',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleTogglePermission(item.permission)}
                      style={{ marginTop: '0.125rem', cursor: 'pointer' }}
                    />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.125rem' }}>
                        {item.action}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--theme-elevation-600)' }}>
                        {item.description}
                      </div>
                    </div>
                  </label>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
