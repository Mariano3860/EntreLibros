import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      enabled: true,
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**', 'mocks/**'],
      exclude: ['**/*.stories.{ts,tsx}', 'tests/**', 'node_modules/**'],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
    workspace: [
      {
        test: {
          globals: true,
          include: ['**/*.node.test.{ts,tsx,js,jsx}'],
          exclude: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.{idea,git,cache,output,temp}/**',
          ],
          environment: 'node',
          pool: 'forks',
        },
      },
      {
        test: {
          globals: true,
          include: ['**/*.test.{ts,tsx,js,jsx}'],
          exclude: [
            '**/*.node.test.*',
            '**/node_modules/**',
            '**/dist/**',
            '**/.{idea,git,cache,output,temp}/**',
          ],
          environment: 'jsdom',
          setupFiles: './tests/setup.ts',
          pool: 'threads',
        },
      },
    ],
  },
})
