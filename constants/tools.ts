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
    name: 'cURL → fetch / axios / Python',
    path: 'curl-to-http',
    description:
      'Convert pasted curl into ready-to-run fetch, axios, or Python requests.',
    section: 'web',
    keywords: [
      'curl',
      'fetch',
      'axios',
      'python',
      'requests',
      'http',
      'devtools',
      'request',
      'headers',
      'debug'
    ]
  },
  {
    name: 'Image to Base64 / data URI',
    path: '', // 'image-base64'
    description:
      'Encode an image to raw Base64 or a data URI for CSS and HTML embeds.',
    section: 'web',
    keywords: [
      'image',
      'base64',
      'data uri',
      'data url',
      'embed',
      'png',
      'jpg',
      'svg',
      'webp'
    ]
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
      'Generate strong passwords and secrets with length, charset, and entropy - all in the browser.',
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
    name: 'Color palette generator',
    path: 'color-palette',
    description:
      'Generate and lock color palettes with harmonies, contrast checks, color-blindness preview, and CSS/Tailwind export.',
    section: 'generators',
    keywords: [
      'palette',
      'harmony',
      'complementary',
      'analogous',
      'triadic',
      'shades',
      'contrast',
      'wcag',
      'tailwind',
      'css variables'
    ]
  },
  {
    name: 'Gradient generator',
    path: 'gradient-generator',
    description:
      'Build linear, radial, and conic CSS gradients with repeating variants, position and size controls, editable stops, and CSS/Tailwind export.',
    section: 'generators',
    keywords: [
      'gradient',
      'linear',
      'radial',
      'conic',
      'repeating',
      'css',
      'tailwind',
      'stops',
      'background',
      'angle',
      'color'
    ]
  },
  {
    name: 'SVG blob / wave generator',
    path: 'blob-wave',
    description:
      'Build organic blob and wave SVG shapes with brand presets, transparent export, and copy or download.',
    section: 'generators',
    keywords: [
      'svg',
      'blob',
      'wave',
      'shape',
      'path',
      'overlay',
      'obs',
      'background',
      'clip-path',
      'hero'
    ]
  },
  {
    name: 'CSS shadow generator',
    path: '', // 'shadow-generator'
    description:
      'Build box-shadow and text-shadow with layers, inset, and alpha - preview live, export CSS or Tailwind.',
    section: 'generators',
    keywords: [
      'box-shadow',
      'text-shadow',
      'inset',
      'blur',
      'spread',
      'css',
      'tailwind',
      'glow',
      'elevation'
    ]
  },
  {
    name: 'Hash generator',
    path: 'hash-generator',
    description:
      'Generate MD5 and SHA checksums for text or files - cache keys, integrity checks, pipeline digests.',
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
    name: 'Lorem / placeholder text',
    path: 'lorem-generator',
    description:
      'Generate placeholder paragraphs, sentences, or words - classic ipsum or realistic English.',
    section: 'generators',
    keywords: ['lorem', 'ipsum', 'placeholder', 'dummy text', 'filler', 'mock']
  },
  {
    name: 'Mock / fake data generator',
    path: 'mock-data',
    description:
      'Generate fake names, emails, bank details, and custom regex patterns as a JSON array for fixtures and QA.',
    section: 'generators',
    keywords: [
      'fake',
      'faker',
      'fixture',
      'seed',
      'qa',
      'email',
      'phone',
      'address',
      'iban',
      'bank',
      'account',
      'card',
      'uuid',
      'regex',
      'pattern'
    ]
  },
  {
    name: 'Color picker & converter',
    path: 'color-converter',
    description:
      'Pick a color visually or convert between HEX, RGB, HSL, LAB, LCH, and more.',
    section: 'converters',
    keywords: ['hex', 'rgb', 'hsl', 'picker', 'opacity', 'lab', 'lch']
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
    path: 'cron-builder',
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
      'Escape or unescape strings for C, Python, and shell - turn log escapes into text and text into pasteable literals.',
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
