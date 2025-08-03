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
  test: {
    include: ['**/*.test.{ts,tsx,js,jsx}'],
    environment: 'jsdom',
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
  },
})
