module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none',
  plugins: [
    require.resolve('prettier-plugin-organize-imports'),
    require.resolve('prettier-plugin-multiline-arrays')
  ],
  multilineArraysWrapThreshold: 1
};
