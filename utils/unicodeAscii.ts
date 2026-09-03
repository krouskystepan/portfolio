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

function splitCodeTokens(input: string): string[] {
  return input
    .trim()
    .split(/[\s,;]+/)
    .filter(Boolean)
}

export function looksLikeNumericCodes(input: string): boolean {
  const tokens = splitCodeTokens(input)
  if (tokens.length === 0) return false

  if (tokens.every((t) => /^U\+[0-9a-fA-F]{4,6}$/i.test(t))) return true
  if (tokens.every((t) => /^[01]{8}$/.test(t))) return true

  const allDecimal = tokens.every((t) => /^\d+$/.test(t))
  if (allDecimal) return true

  const allHexish = tokens.every((t) =>
    /^(?:0x|\\x)?[0-9a-fA-F]{1,6}$/i.test(t)
  )
  if (!allHexish) return false

  const hasHexMarker = tokens.some(
    (t) => /[a-f]/i.test(t) || /^(?:0x|\\x)/i.test(t)
  )
  if (!hasHexMarker) return false

  if (
    tokens.length === 1 &&
    !/^(?:0x|\\x)/i.test(tokens[0]) &&
    /[a-z]/i.test(tokens[0])
  ) {
    return false
  }

  return true
}

export function fromNumericCodes(input: string): string {
  const tokens = splitCodeTokens(input)
  if (tokens.length === 0) return ''

  if (tokens.every((t) => /^U\+[0-9a-fA-F]{4,6}$/i.test(t))) {
    return tokens
      .map((t) => fromCodePoint(parseInt(t.slice(2), 16)))
      .join('')
  }

  if (tokens.every((t) => /^[01]{8}$/.test(t))) {
    return tokens
      .map((t) => fromCodePoint(parseInt(t, 2)))
      .join('')
  }

  const allDecimal = tokens.every((t) => /^\d+$/.test(t))
  if (allDecimal) {
    return tokens.map((t) => fromCodePoint(Number(t))).join('')
  }

  return tokens
    .map((t) => t.replace(/^(?:0x|\\x)/i, ''))
    .map((t) => fromCodePoint(parseInt(t, 16)))
    .join('')
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

export function toPlainText(input: string): string {
  if (looksLikeNumericCodes(input)) return fromNumericCodes(input)
  return decodeUnicodeEscapes(input)
}

function foldToAscii(text: string): string {
  const decomposed = text.normalize('NFKD').replace(COMBINING_MARKS, '')
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

export function toAscii(input: string): string {
  return foldToAscii(toPlainText(input))
}

export function toDecimalCodes(input: string): string {
  return Array.from(toPlainText(input))
    .map((ch) => String(ch.codePointAt(0) ?? 0))
    .join(' ')
}

export function toHexCodes(input: string): string {
  return Array.from(toPlainText(input))
    .map((ch) => (ch.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(2, '0'))
    .join(' ')
}

export function toJsEscapes(input: string): string {
  return Array.from(toPlainText(input))
    .map((ch) => {
      const cp = ch.codePointAt(0) ?? 0
      if (cp <= 0x7e && PRINTABLE_ASCII.test(ch) && ch !== '\\') return ch
      if (cp <= 0xffff) return `\\u${cp.toString(16).padStart(4, '0')}`
      return `\\u{${cp.toString(16)}}`
    })
    .join('')
}

export function toHtmlEntities(input: string): string {
  return Array.from(toPlainText(input))
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
  return Array.from(toPlainText(input))
    .map((ch) => {
      const cp = ch.codePointAt(0) ?? 0
      return `U+${cp.toString(16).toUpperCase().padStart(4, '0')}`
    })
    .join(' ')
}

export function buildUnicodeVariants(input: string): UnicodeVariant[] {
  if (!input) {
    return [
      { label: 'Text', value: '' },
      { label: 'ASCII', value: '' },
      { label: 'Decimal codes', value: '' },
      { label: 'Hex codes', value: '' },
      { label: 'JS / JSON escapes', value: '' },
      { label: 'HTML entities', value: '' }
    ]
  }

  return [
    { label: 'Text', value: toPlainText(input) },
    { label: 'ASCII', value: toAscii(input) },
    { label: 'Decimal codes', value: toDecimalCodes(input) },
    { label: 'Hex codes', value: toHexCodes(input) },
    { label: 'JS / JSON escapes', value: toJsEscapes(input) },
    { label: 'HTML entities', value: toHtmlEntities(input) }
  ]
}

export function inspectUnicodeChars(input: string): {
  chars: UnicodeCharInfo[]
  truncated: boolean
  total: number
} {
  const source = toPlainText(input)
  const all = Array.from(source)
  const total = all.length
  const slice = all.slice(0, MAX_INSPECT_CHARS)
  const encoder = new TextEncoder()

  const chars = slice.map((ch) => {
    const cp = ch.codePointAt(0) ?? 0
    const folded = foldToAscii(ch)
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
