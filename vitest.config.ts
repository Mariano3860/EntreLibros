import { defineConfig } from 'vitest/config'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**', 'mocks/**'],
      exclude: ['**/*.stories.{ts,tsx}', 'tests/**', 'node_modules/**'],
      thresholds: {
        lines: 85,
        functions: 85,
        branches: 85,
        statements: 85,
      },
    },
    setupFiles: './tests/setup.ts',
    globals: true,
    exclude: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.{idea,git,cache,output,temp}/**',
    ],
    workspace: [
      {
        extends: true,
        test: {
          include: ['**/*.node.test.{ts,tsx,js,jsx}'],
          environment: 'node',
          pool: 'forks',
        },
      },
      {
        extends: true,
        test: {
          include: ['**/*.test.{ts,tsx,js,jsx}'],
          exclude: ['**/*.node.test.*'],
          environment: 'jsdom',
          pool: 'threads',
        },
      },
    ],
  },
})
