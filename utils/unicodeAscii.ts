const COMBINING_MARKS = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]/g
const PRINTABLE_ASCII = /[\x20-\x7E]/

const MAX_INSPECT_CHARS = 256

/** Punctuation and letters NFKD does not turn into ASCII on its own. */
const ASCII_REPLACEMENTS: Record<string, string> = {
  '\u00A0': ' ',
  '\u202F': ' ',
  '\u2007': ' ',
  '\u2008': ' ',
  '\u2009': ' ',
  '\u200A': ' ',
  '\u200B': '',
  '\uFEFF': '',
  '\u2010': '-',
  '\u2011': '-',
  '\u2012': '-',
  '\u2013': '-',
  '\u2014': '-',
  '\u2015': '-',
  '\u2212': '-',
  '\u00AD': '-',
  '\u2018': "'",
  '\u2019': "'",
  '\u201A': "'",
  '\u201B': "'",
  '\u2032': "'",
  '\u201C': '"',
  '\u201D': '"',
  '\u201E': '"',
  '\u201F': '"',
  '\u2033': '"',
  '\u00AB': '"',
  '\u00BB': '"',
  '\u2039': "'",
  '\u203A': "'",
  '\u2026': '...',
  '\u00B7': '*',
  '\u2022': '*',
  '\u00D7': 'x',
  '\u00F7': '/',
  '\u00A9': '(c)',
  '\u00AE': '(r)',
  '\u2122': '(tm)',
  '\u00B0': ' deg',
  '\u20AC': 'EUR',
  '\u00A3': 'GBP',
  '\u00A5': 'JPY',
  '\u00DF': 'ss',
  '\u00E6': 'ae',
  '\u00C6': 'AE',
  '\u0153': 'oe',
  '\u0152': 'OE',
  '\u00F8': 'o',
  '\u00D8': 'O',
  '\u0142': 'l',
  '\u0141': 'L',
  '\u0111': 'd',
  '\u0110': 'D',
  '\u00F0': 'd',
  '\u00D0': 'D',
  '\u00FE': 'th',
  '\u00DE': 'Th',
  '\u0131': 'i'
}

export type UnicodeVariant = {
  label: string
  value: string
}

export type UnicodeCharInfo = {
  char: string
  codePoint: string
  decimal: number
  utf8: string
  ascii: string
  isAscii: boolean
}

function fromCodePoint(n: number): string {
  if (!Number.isFinite(n) || n < 0 || n > 0x10ffff) return ''
  return String.fromCodePoint(n)
}

export function toAscii(input: string): string {
  const decoded = decodeUnicodeEscapes(input)
  const decomposed = decoded.normalize('NFKD').replace(COMBINING_MARKS, '')
  let out = ''

  for (const ch of decomposed) {
    const code = ch.codePointAt(0) ?? 0
    if (code <= 0x7f) {
      out += ch
      continue
    }
    if (Object.prototype.hasOwnProperty.call(ASCII_REPLACEMENTS, ch)) {
      out += ASCII_REPLACEMENTS[ch]
    }
  }

  return out
}

export function toJsEscapes(input: string): string {
  return Array.from(input)
    .map((ch) => {
      const cp = ch.codePointAt(0) ?? 0
      if (cp <= 0x7e && PRINTABLE_ASCII.test(ch) && ch !== '\\') return ch
      if (cp <= 0xffff) return `\\u${cp.toString(16).padStart(4, '0')}`
      return `\\u{${cp.toString(16)}}`
    })
    .join('')
}

export function toHtmlEntities(input: string): string {
  return Array.from(input)
    .map((ch) => {
      const cp = ch.codePointAt(0) ?? 0
      if (cp <= 0x7e && PRINTABLE_ASCII.test(ch) && ch !== '&' && ch !== '<') {
        return ch
      }
      return `&#x${cp.toString(16)};`
    })
    .join('')
}

export function toCodePoints(input: string): string {
  return Array.from(input)
    .map((ch) => {
      const cp = ch.codePointAt(0) ?? 0
      return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`
    })
    .join(' ')
}

export function toUtf8Hex(input: string): string {
  return [...new TextEncoder().encode(input)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ')
}

export function looksEncoded(input: string): boolean {
  return /\\u\{?[0-9a-fA-F]{2,6}\}?|\\x[0-9a-fA-F]{2}|&#x?[0-9a-fA-F]+;/i.test(
    input
  )
}

export function decodeUnicodeEscapes(input: string): string {
  return input
    .replace(/\\u\{([0-9a-fA-F]{1,6})\}/g, (_, hex: string) =>
      fromCodePoint(parseInt(hex, 16))
    )
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex: string) =>
      fromCodePoint(parseInt(hex, 16))
    )
    .replace(/\\x([0-9a-fA-F]{2})/g, (_, hex: string) =>
      fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#x([0-9a-fA-F]{1,6});/gi, (_, hex: string) =>
      fromCodePoint(parseInt(hex, 16))
    )
    .replace(/&#(\d{1,7});/g, (_, dec: string) => fromCodePoint(Number(dec)))
}

export function buildUnicodeVariants(input: string): UnicodeVariant[] {
  if (!input) {
    return [
      { label: 'ASCII', value: '' },
      { label: 'Decoded characters', value: '' },
      { label: 'JS / JSON escapes', value: '' },
      { label: 'HTML entities', value: '' },
      { label: 'Code points', value: '' }
    ]
  }

  return [
    { label: 'ASCII', value: toAscii(input) },
    { label: 'Decoded characters', value: decodeUnicodeEscapes(input) },
    { label: 'JS / JSON escapes', value: toJsEscapes(input) },
    { label: 'HTML entities', value: toHtmlEntities(input) },
    { label: 'Code points', value: toCodePoints(input) }
  ]
}

export function inspectUnicodeChars(input: string): {
  chars: UnicodeCharInfo[]
  truncated: boolean
  total: number
} {
  const all = Array.from(input)
  const total = all.length
  const slice = all.slice(0, MAX_INSPECT_CHARS)
  const encoder = new TextEncoder()

  const chars = slice.map((ch) => {
    const cp = ch.codePointAt(0) ?? 0
    const folded = toAscii(ch)
    return {
      char: ch === ' ' ? '␠' : ch === '\n' ? '⏎' : ch === '\t' ? '⇥' : ch,
      codePoint: `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`,
      decimal: cp,
      utf8: [...encoder.encode(ch)]
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' '),
      ascii: folded || '-',
      isAscii: cp <= 0x7f
    }
  })

  return { chars, truncated: total > MAX_INSPECT_CHARS, total }
}
