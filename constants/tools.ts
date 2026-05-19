import type { TTools } from './types'

export const tools = [
  {
    name: 'JSON & data workbench',
    path: 'data-workbench',
    description:
      'Format and validate JSON, convert CSV and YAML, and generate TypeScript types in one place.',
    section: 'data',
    keywords: [
      'json',
      'yaml',
      'csv',
      'typescript',
      'format',
      'validate',
      'converter',
      'ts types'
    ]
  },
  {
    name: 'Text Compare / Diff Tool',
    path: 'text-diff',
    description:
      'Compare two blocks of text and see the differences highlighted.',
    section: 'text',
    keywords: ['diff', 'compare', 'merge', 'changes']
  },
  {
    name: 'Text Case Converter',
    path: 'case-converter',
    description:
      'Convert text into camelCase, PascalCase, snake_case, uppercase, and more.',
    section: 'text',
    keywords: ['case', 'camelcase', 'pascal', 'snake']
  },
  {
    name: 'Alphabet Sorter',
    path: 'alphabet-sorter',
    description:
      'Sort text alphabetically, with an option to automatically group related items together.',
    section: 'text',
    keywords: ['sort', 'list', 'alphabetical']
  },
  {
    name: 'Regex tester',
    path: 'regex-tester',
    description:
      'Try JavaScript regular expressions with flags and see each match in your sample text.',
    section: 'text',
    keywords: ['regexp', 'pattern', 'match']
  },
  {
    name: 'Slug generator',
    path: 'slug-generator',
    description:
      'Turn titles into URL-friendly slugs with accent stripping and hyphen rules.',
    section: 'text',
    keywords: ['url', 'permalink', 'seo']
  },
  {
    name: 'HTML / CSS / JS Minifier',
    path: 'html-css-js-minifier',
    description:
      'Minify or beautify HTML, CSS, or JavaScript code to optimize performance.',
    section: 'web',
    keywords: ['minify', 'beautify', 'prettier', 'bundle']
  },
  {
    name: 'URL encoder / decoder',
    path: 'url-encoder-decoder',
    description:
      'Encode and decode text with URI component rules (UTF-8 safe) for query strings.',
    section: 'web',
    keywords: ['encodeURIComponent', 'decodeURIComponent', 'percent']
  },
  {
    name: 'JWT decode (no verification)',
    path: 'jwt-decoder',
    description:
      'Inspect JWT header and payload JSON. Signature is not verified.',
    section: 'web',
    keywords: ['jwt', 'bearer', 'token', 'base64']
  },
  {
    name: 'UUID Generator',
    path: 'uuid-generator',
    description: 'Generate random UUIDs (v4) for identifiers or testing.',
    section: 'utilities',
    keywords: ['guid', 'v4', 'random id']
  },
  {
    name: 'Color Converter',
    path: 'color-converter',
    description:
      'Convert colors between HEX, RGB, HSL and more. Live color preview.',
    section: 'utilities',
    keywords: ['hex', 'rgb', 'hsl', 'picker']
  },
  {
    name: 'Timestamp Converter',
    path: 'timestamp-converter',
    description: 'Convert Unix timestamps to readable dates and vice versa.',
    section: 'utilities',
    keywords: ['unix', 'epoch', 'timezone', 'date']
  }
] as const satisfies readonly TTools[]

export type ToolPath = (typeof tools)[number]['path']
