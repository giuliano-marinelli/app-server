module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none',
  plugins: [
    require.resolve('@trivago/prettier-plugin-sort-imports'),
    require.resolve('prettier-plugin-multiline-arrays')
  ],
  importOrder: [
    '^@nestjs/(.*)$',
    '^@(.*)$',
    '<THIRD_PARTY_MODULES>',
    '^./(?!.*schema$)(?!.*entity$)(?!.*dto$)(?!.*input$)(?!.*controller$)(?!.*resolver$)(?!.*service$)(?!.*module$).*$',
    '.*.schema$',
    '.*.entity$',
    '.*.dto$',
    '.*.input$',
    '.*.controller$',
    '.*.resolver$',
    '.*.service$',
    '.*.module$'
  ],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
  importOrderParserPlugins: [
    'typescript',
    'decorators-legacy'
  ],
  multilineArraysWrapThreshold: 1
};
