import type { OxfmtConfig } from 'oxfmt'

export default {
  ignorePatterns: ['**/payload-types.ts', 'src/app/(payload)/admin/importMap.js', 'tsconfig.json'],
  printWidth: 100,
  semi: false,
  singleQuote: true,
  sortPackageJson: false,
  trailingComma: 'all',
} satisfies OxfmtConfig
