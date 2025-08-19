import { fileURLToPath, URL } from 'node:url'

import svgr from 'vite-plugin-svgr'
import tsconfigPaths from 'vite-tsconfig-paths'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    svgr({
      svgrOptions: {
        exportType: 'named',
        ref: true,
        svgo: false,
        titleProp: true,
      },
      include: '**/*.svg',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      mocks: fileURLToPath(new URL('./mocks', import.meta.url)),
    },
  },
  test: {
    include: ['**/*.test.{ts,tsx,js,jsx}'],
    environment: 'jsdom',
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**'],
      exclude: [
        '**/*.stories.{ts,tsx}',
        'tests/**',
        'node_modules/**',
        'mocks/**',
        'src/api/**',
        'src/hooks/api/**',
        'src/components/**',
        '**/*.d.ts',
        '**/*.types.ts',
      ],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
      },
    },
    setupFiles: './tests/setup.ts',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
})
