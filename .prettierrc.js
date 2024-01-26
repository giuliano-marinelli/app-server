module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none',
  plugins: [require.resolve('@trivago/prettier-plugin-sort-imports')],
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
  importOrderParserPlugins: ['typescript', 'decorators-legacy']
};
