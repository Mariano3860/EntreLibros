import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default [
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'coverage/**',
      'scripts/migrate.js',
      'scripts/generate-openapi.ts',
      '**/*.config.js',
      '!**/eslint.config.js',
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.es2024,
        URL: 'readonly',
      },
    },
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { project: './tsconfig.json' },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
