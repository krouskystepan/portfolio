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
    name: 'Unicode / ASCII converter',
    path: 'unicode-ascii',
    description:
      'Turn text into ASCII/decimal/hex codes and back, or fold accents to plain letters.',
    section: 'text',
    keywords: [
      'unicode',
      'ascii',
      'escape',
      'codepoint',
      'utf-8',
      'entities',
      'transliterate'
    ]
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
    name: 'HTML / CSS / JS / Python Minifier',
    path: 'html-css-js-minifier',
    description: 'Minify or beautify HTML, CSS, JavaScript, or Python.',
    section: 'web',
    keywords: ['minify', 'beautify', 'prettier', 'bundle', 'python']
  },
  {
    name: 'URL encoder / decoder',
    path: 'url-encoder-decoder',
    description:
      'Live percent-encode and decode for query values or full URLs (UTF-8).',
    section: 'web',
    keywords: ['encodeURIComponent', 'decodeURIComponent', 'percent', 'url']
  },
  {
    name: 'URL inspector',
    path: 'url-inspector',
    description:
      'Split an href into origin, path, query, and hash. Edit the query table to rebuild the URL.',
    section: 'web',
    keywords: [
      'href',
      'origin',
      'pathname',
      'query',
      'searchparams',
      'hash',
      'parse'
    ]
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
    name: 'Base64 / Hex codec',
    path: '', // 'base64-hex'
    description:
      'Live convert between UTF-8 text, Base64, Base64URL, and hex (spaces, 0x, \\x dumps).',
    section: 'web',
    keywords: [
      'base64',
      'base64url',
      'hex',
      'encode',
      'decode',
      'blob',
      'token',
      'payload',
      'dump'
    ]
  },
  {
    name: 'UUID Generator',
    path: 'uuid-generator',
    description: 'Generate random UUIDs (v4) for identifiers or testing.',
    section: 'generators',
    keywords: ['guid', 'v4', 'random id']
  },
  {
    name: 'Password / secret generator',
    path: 'password-generator',
    description:
      'Generate strong passwords and secrets with length, charset, and entropy — all in the browser.',
    section: 'generators',
    keywords: [
      'password',
      'secret',
      'token',
      'api key',
      'random',
      'entropy',
      'charset',
      'generator',
      'csprng'
    ]
  },
  {
    name: 'QR code generator',
    path: 'qr-code',
    description:
      'Encode text or a URL as a QR code in the browser. Download PNG or SVG.',
    section: 'generators',
    keywords: ['qr', 'barcode', 'url', 'png', 'svg']
  },
  {
    name: 'Hash generator',
    path: '', // 'hash-generator'
    description:
      'Generate MD5 and SHA checksums for text or files — cache keys, integrity checks, pipeline digests.',
    section: 'generators',
    keywords: [
      'md5',
      'sha1',
      'sha256',
      'sha512',
      'checksum',
      'hash',
      'digest',
      'integrity',
      'hashlib',
      'md5sum'
    ]
  },
  {
    name: 'Color Converter',
    path: 'color-converter',
    description:
      'Convert colors between HEX, RGB, HSL and more. Live color preview.',
    section: 'converters',
    keywords: ['hex', 'rgb', 'hsl', 'picker']
  },
  {
    name: 'Timestamp Converter',
    path: 'timestamp-converter',
    description: 'Convert Unix timestamps to readable dates and vice versa.',
    section: 'converters',
    keywords: ['unix', 'epoch', 'timezone', 'date']
  },
  {
    name: 'Number base converter',
    path: 'number-base-converter',
    description:
      'Convert between binary, octal, decimal, hex, and any base 2-36.',
    section: 'converters',
    keywords: ['binary', 'octal', 'decimal', 'hex', 'radix', 'base', 'base36']
  },
  {
    name: 'Unix permission calculator',
    path: 'chmod-calculator',
    description:
      'Toggle rwx for owner, group, and others, or type an octal mode like 755.',
    section: 'network',
    keywords: ['chmod', 'unix', 'permissions', 'octal', 'rwx', '755', '644']
  },
  {
    name: 'CIDR / subnet calculator',
    path: 'cidr-calculator',
    description:
      'Enter an IPv4 address and mask (CIDR or dotted) to get network, broadcast, and host range.',
    section: 'network',
    keywords: [
      'cidr',
      'subnet',
      'ip',
      'ipv4',
      'mask',
      'network',
      'broadcast',
      'hosts',
      'prefix',
      'netmask'
    ]
  },
  {
    name: 'Cron expression builder',
    path: '', // 'cron-builder'
    description:
      'Build a 5-field cron schedule visually, read a plain-English explanation, and preview the next runs.',
    section: 'network',
    keywords: [
      'cron',
      'crontab',
      'schedule',
      'celery',
      'github actions',
      'quartz',
      'timer',
      'interval',
      'croner'
    ]
  },
  {
    name: 'Escape / unescape toolbox',
    path: '', // 'escape-unescape'
    description:
      'Escape or unescape strings for C, Python, and shell — turn log escapes into text and text into pasteable literals.',
    section: 'network',
    keywords: [
      'escape',
      'unescape',
      'backslash',
      'string literal',
      'c',
      'python',
      'shell',
      'bash',
      'quoting',
      'ansi-c'
    ]
  }
] as const satisfies readonly TTools[]

export type ToolPath = Exclude<(typeof tools)[number]['path'], ''>
