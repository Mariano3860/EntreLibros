import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'
import globals from 'globals'

export default [
  {
    // Ignore all build artifacts everywhere
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/coverage/**',
      '**/.next/**',
      '**/out/**',
      '**/*.min.js',
      '**/*.bundle.js',
    ],
  },
  // 1) Node-only config and scripts/config files
  {
    files: [
      '.stylelintrc.*',
      '**/*.config.*',
      '**/*.config.*js',
      'scripts/**/*.{js,cjs,mjs}',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      'no-console': 'off',
    },
  },
  // 2) Base JS rules
  js.configs.recommended,
  // 3) TypeScript + React for app source ONLY (avoid dist/)
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: process.cwd(),
      },
      // Browser + Node globals available in app code (e.g., SSR tooling, Vite)
      globals: {
        ...globals.browser,
        ...globals.node,
        // Extra globals sometimes used by tooling
        __REACT_DEVTOOLS_GLOBAL_HOOK__: 'readonly',
        IntersectionObserver: 'readonly',
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    settings: {
      react: { version: 'detect' },
    },
    rules: {
      'no-console': 'warn',
      // TS already checks undefined symbols; keep no-undef off in TS
      'no-undef': 'off',
      // Tame unused variables but allow intentional "_" discards
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      // Allow common expression patterns used in modern TS/React code
      '@typescript-eslint/no-unused-expressions': [
        'warn',
        {
          allowShortCircuit: true,
          allowTernary: true,
          allowTaggedTemplates: true,
        },
      ],

      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'import/order': [
        'warn',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          pathGroups: [
            { pattern: '@src/**', group: 'internal' },
            { pattern: '@mocks/**', group: 'internal' },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
          alphabetize: { order: 'asc', caseInsensitive: true },
          'newlines-between': 'always',
        },
      ],
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx,js}'],
    languageOptions: {
      globals: { ...globals.vitest },
    },
  },
]
