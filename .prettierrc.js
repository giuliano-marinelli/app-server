module.exports = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'none',
  overrides: [
    // configuration for ts files with: sorting of imports and arrays wrapping
    {
      files: '*.ts',
      options: {
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
        importOrderParserPlugins: ['typescript', 'decorators-legacy'],
        multilineArraysWrapThreshold: 1
      }
    },
    // configuration for hbs files for scaffolding templates
    {
      files: '*.hbs',
      options: {
        parser: 'glimmer'
      }
    }
  ]
};
