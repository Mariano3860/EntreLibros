module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-recommended-scss'],
  plugins: [],
  rules: {
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'function-url-no-scheme-relative': null,
    'import-notation': null,
    'property-no-vendor-prefix': null,
  },
  ignoreFiles: ['**/node_modules/**', '**/dist/**'],
}
