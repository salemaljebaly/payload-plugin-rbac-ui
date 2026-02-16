import { defineConfig } from 'tsup'

export default defineConfig([
  // Server code
  {
    entry: {
      index: 'src/index.ts',
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ['react', 'react-dom', 'payload', '@payloadcms/ui'],
    treeshake: true,
    splitting: false,
  },
  // Client component (needs "use client" directive)
  {
    entry: {
      client: 'src/components/PermissionsMatrixField.tsx',
    },
    format: ['esm'],
    dts: true,
    sourcemap: true,
    external: ['react', 'react-dom', 'payload', '@payloadcms/ui'],
    banner: {
      js: '"use client";',
    },
  },
])
