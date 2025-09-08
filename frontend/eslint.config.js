import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import importPlugin from 'eslint-plugin-import'

export default [
  {
    files: [
      '.stylelintrc.*',
      '**/*.config.js',
      '**/*.config.*js',
      'eslint.config.js',
    ],
    languageOptions: {
      sourceType: 'commonjs',
      globals: {
        module: true,
        process: true,
        require: true,
        __dirname: true,
      },
    },
    rules: {
      'no-console': 'off',
      'no-undef': 'off', // Desactiva verificación de variables no definidas
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['.stylelintrc.*', '**/*.config.js', '!**/eslint.config.js'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        project: './tsconfig.eslint.json',
        tsconfigRootDir: process.cwd(),
        sourceType: 'module',
      },
      globals: {
        process: true,
        module: true,
        require: true,
        __dirname: true,
      },
    },
    plugins: {
      react,
      'react-hooks': reactHooks,
      import: importPlugin,
    },
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
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
    settings: {
      react: {
        version: 'detect',
      },
    },
  },
]
