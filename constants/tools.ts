import type { TTools } from './types'

export const tools = [
  // ── Data & Serialization ──────────────────────────────────────────
  {
    name: 'JSON & data workbench',
    path: 'data-workbench',
    description:
      'Format and validate JSON, convert CSV and YAML, generate TypeScript types, and work with JSON Schema.',
    section: 'data',
    keywords: [
      'json',
      'yaml',
      'csv',
      'typescript',
      'format',
      'validate',
      'converter',
      'ts types',
      'schema',
      'json schema',
      'ajv',
      'sort keys',
      'escape',
      'delimiter',
      'nullable'
    ]
  },
  {
    name: 'JSON Query & Transform',
    path: 'json-query',
    description:
      'Query JSON with JSONPath or reshape it with JSONata — examples, timing, and downloadable results.',
    section: 'data',
    keywords: [
      'jsonpath',
      'jsonata',
      'query',
      'transform',
      'filter',
      'map',
      'expression'
    ]
  },
  {
    name: 'XML workbench',
    path: 'xml-workbench',
    description:
      'Format, minify, and validate XML, and convert between XML and JSON in the browser.',
    section: 'data',
    keywords: ['xml', 'format', 'minify', 'validate', 'json', 'soap', 'parser']
  },

  // ── Text & Code ───────────────────────────────────────────────────
  {
    name: 'Text Compare / Diff Tool',
    path: 'text-diff',
    description:
      'Compare two blocks of text or normalized JSON and see the differences highlighted.',
    section: 'text',
    keywords: ['diff', 'compare', 'merge', 'changes', 'json']
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
    name: 'Markdown editor & preview',
    path: 'markdown-editor',
    description:
      'Write Markdown with a live GFM preview, then copy or download — no raw HTML rendering.',
    section: 'text',
    keywords: ['markdown', 'md', 'gfm', 'preview', 'readme']
  },
  {
    name: 'SQL formatter',
    path: 'sql-formatter',
    description:
      'Pretty-print SQL with dialect options for Postgres, MySQL, SQLite, and more.',
    section: 'text',
    keywords: ['sql', 'format', 'pretty', 'postgres', 'mysql', 'query']
  },
  {
    name: 'HTML entity encoder / decoder',
    path: 'html-entities',
    description:
      'Encode or decode HTML entities (named, decimal, or hex) for safe markup paste.',
    section: 'text',
    keywords: ['html', 'entities', 'amp', 'lt', 'gt', 'encode', 'decode']
  },

  // ── Web & API ─────────────────────────────────────────────────────
  {
    name: 'HTML / CSS / JS / Python Minifier',
    path: 'html-css-js-minifier',
    description: 'Minify or beautify HTML, CSS, JavaScript, or Python.',
    section: 'web',
    keywords: ['minify', 'beautify', 'prettier', 'bundle', 'python']
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
    keywords: ['jwt', 'bearer', 'token', 'base64', 'auth', 'encoding']
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
    name: 'HTTP Request Builder',
    path: 'http-request-builder',
    description:
      'Compose and send HTTP requests from the browser — methods, headers, body, and CORS-aware errors.',
    section: 'web',
    keywords: [
      'http',
      'fetch',
      'api',
      'rest',
      'headers',
      'cors',
      'request',
      'postman',
      'bearer',
      'basic auth',
      'playground'
    ]
  },
  {
    name: 'OpenAPI viewer',
    path: 'openapi-viewer',
    description:
      'Paste or upload an OpenAPI 3 spec to browse endpoints, parameters, and schemas client-side.',
    section: 'web',
    keywords: [
      'openapi',
      'swagger',
      'api',
      'spec',
      'yaml',
      'endpoints',
      'parameters',
      'schemas',
      'oas'
    ]
  },

  // ── Encoding & Cryptography ───────────────────────────────────────
  {
    name: 'URL encoder / decoder',
    path: 'url-encoder-decoder',
    description:
      'Live percent-encode and decode for query values or full URLs (UTF-8).',
    section: 'encoding',
    keywords: [
      'encodeURIComponent',
      'decodeURIComponent',
      'percent',
      'url',
      'web'
    ]
  },
  {
    name: 'Image to Base64 / data URI',
    path: 'image-base64',
    description:
      'Encode an image to raw Base64 or a data URI for CSS and HTML embeds.',
    section: 'encoding',
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
    path: 'base64-hex',
    description:
      'Live convert between UTF-8 text, Base64, Base64URL, and hex (spaces, 0x, \\x dumps).',
    section: 'encoding',
    keywords: [
      'base64',
      'base64url',
      'hex',
      'encode',
      'decode',
      'blob',
      'token',
      'payload',
      'dump',
      'utf-8'
    ]
  },
  {
    name: 'Hash generator',
    path: 'hash-generator',
    description:
      'Generate MD5 and SHA checksums for text or files - cache keys, integrity checks, pipeline digests.',
    section: 'encoding',
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
      'md5sum',
      'cryptography'
    ]
  },

  // ── Generators & Mock Data ────────────────────────────────────────
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
      'Generate nested fake fixtures from fields or JSON Schema, with uuid, enums, and SQL INSERT export.',
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
      'pattern',
      'sql',
      'nested',
      'json schema',
      'enum',
      'boolean',
      'array'
    ]
  },
  {
    name: 'SQL INSERT generator',
    path: 'sql-insert-generator',
    description:
      'Turn JSON, NDJSON, or CSV into INSERT statements with Postgres, MySQL, or SQLite escaping.',
    section: 'generators',
    keywords: ['sql', 'insert', 'fixture', 'postgres', 'mysql', 'sqlite', 'csv']
  },

  // ── Design & CSS ──────────────────────────────────────────────────
  {
    name: 'Color palette generator',
    path: 'color-palette',
    description:
      'Generate and lock color palettes with harmonies, contrast checks, color-blindness preview, and CSS/Tailwind export.',
    section: 'design',
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
    section: 'design',
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
    section: 'design',
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
    path: 'shadow-generator',
    description:
      'Build box-shadow and text-shadow with layers, inset, and alpha - preview live, export CSS or Tailwind.',
    section: 'design',
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
    name: 'Color picker & converter',
    path: 'color-converter',
    description:
      'Pick a color visually or convert between HEX, RGB, HSL, LAB, LCH, and more.',
    section: 'design',
    keywords: ['hex', 'rgb', 'hsl', 'picker', 'opacity', 'lab', 'lch']
  },

  // ── Date, Time & Numbers ──────────────────────────────────────────
  {
    name: 'Timestamp Converter',
    path: 'timestamp-converter',
    description:
      'Convert Unix timestamps (seconds, ms, µs, ns) to readable dates with timezone and relative time.',
    section: 'datetime',
    keywords: ['unix', 'epoch', 'timezone', 'date', 'milliseconds', 'relative']
  },
  {
    name: 'Timezone converter',
    path: 'timezone-converter',
    description:
      'Convert a wall-clock time across time zones with DST gap and fold warnings.',
    section: 'datetime',
    keywords: ['timezone', 'dst', 'utc', 'local', 'convert', 'zone']
  },
  {
    name: 'Number base converter',
    path: 'number-base-converter',
    description:
      'Convert between binary, octal, decimal, hex, and any base 2-36.',
    section: 'datetime',
    keywords: ['binary', 'octal', 'decimal', 'hex', 'radix', 'base', 'base36']
  },
  {
    name: 'Cron expression builder',
    path: 'cron-builder',
    description:
      'Build a 5-field cron schedule visually, read a plain-English explanation, and preview the next runs.',
    section: 'datetime',
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

  // ── Network & System ──────────────────────────────────────────────
  {
    name: 'Unix permission calculator',
    path: 'chmod-calculator',
    description:
      'Toggle rwx for owner, group, and others, or type an octal mode like 755.',
    section: 'network',
    keywords: ['chmod', 'unix', 'permissions', 'octal', 'rwx', '755', '644']
  },
  {
    name: 'Escape / unescape toolbox',
    path: 'escape-unescape',
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
    name: 'IP address inspector',
    path: 'ip-inspector',
    description:
      'Classify IPv4/IPv6 addresses (private, loopback, link-local, and more) and show alternate forms.',
    section: 'network',
    keywords: [
      'ip',
      'ipv4',
      'ipv6',
      'private',
      'loopback',
      'cidr',
      'address'
    ]
  },
  {
    name: 'DNS lookup',
    path: 'dns-lookup',
    description:
      'Look up DNS records via DNS-over-HTTPS (Cloudflare or Google) with explicit provider disclosure.',
    section: 'network',
    keywords: [
      'dns',
      'doh',
      'a',
      'aaaa',
      'mx',
      'txt',
      'cname',
      'cloudflare',
      'resolver'
    ]
  },

  // ── QA & Testing ──────────────────────────────────────────────────
  {
    name: 'Log analyzer',
    path: 'log-analyzer',
    description:
      'Paste or upload logs, filter by level and keyword, group repeats, and export — plain text or JSON lines.',
    section: 'qa',
    keywords: [
      'log',
      'analyzer',
      'error',
      'warn',
      'jsonl',
      'traceback',
      'filter',
      'qa'
    ]
  },
  {
    name: 'JSON assertion builder',
    path: 'json-assertion-builder',
    description:
      'Build path-based assertions against sample JSON and copy Jest-style or generic snippets.',
    section: 'qa',
    keywords: [
      'assert',
      'expect',
      'jsonpath',
      'test',
      'jest',
      'vitest',
      'qa'
    ]
  },
  {
    name: 'API response validator',
    path: 'api-response-validator',
    description:
      'Diff actual vs expected JSON structure or validate against JSON Schema with path-accurate errors.',
    section: 'qa',
    keywords: [
      'api',
      'response',
      'validate',
      'schema',
      'diff',
      'contract',
      'qa'
    ]
  },
  {
    name: 'HTTP status code reference',
    path: 'http-status-codes',
    description:
      'Searchable offline reference for HTTP status codes, names, and when to use them.',
    section: 'qa',
    keywords: ['http', 'status', '404', '500', 'codes', 'reference', 'rest']
  }
] as const satisfies readonly TTools[]

export type ToolPath = Exclude<(typeof tools)[number]['path'], ''>
