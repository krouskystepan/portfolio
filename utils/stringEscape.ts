export type EscapeLanguage = 'c' | 'python' | 'shell'
export type QuoteStyle = 'double' | 'single' | 'ansi-c'

export type EscapeResult =
  | { ok: true; value: string; warning?: string }
  | { ok: false; error: string }

const CONTROL_ESCAPES: Record<number, string> = {
  0x07: '\\a',
  0x08: '\\b',
  0x09: '\\t',
  0x0a: '\\n',
  0x0b: '\\v',
  0x0c: '\\f',
  0x0d: '\\r'
}

function isPrintableAscii(cp: number): boolean {
  return cp >= 0x20 && cp <= 0x7e
}

function hexPad(n: number, width: number): string {
  return n.toString(16).padStart(width, '0')
}

function validateQuote(
  language: EscapeLanguage,
  quoteStyle: QuoteStyle
): string | null {
  if (quoteStyle === 'ansi-c' && language !== 'shell') {
    return "ANSI-C quoting ($'…') is only available for Shell."
  }
  return null
}

function escapeCodeLike(input: string, quoteChar: '"' | "'"): string {
  const chars = [...input]
  let out = ''
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    const cp = ch.codePointAt(0)!
    if (ch === '\\') {
      out += '\\\\'
      continue
    }
    if (ch === quoteChar) {
      out += `\\${quoteChar}`
      continue
    }
    if (cp === 0) {
      // Prefer \x00 when a following octal digit would glue onto \0.
      const next = chars[i + 1]
      if (next && next >= '0' && next <= '7') {
        out += '\\x00'
      } else {
        out += '\\0'
      }
      continue
    }
    const named = CONTROL_ESCAPES[cp]
    if (named) {
      out += named
      continue
    }
    if (isPrintableAscii(cp)) {
      out += ch
      continue
    }
    if (cp <= 0xff) {
      out += `\\x${hexPad(cp, 2)}`
      continue
    }
    if (cp <= 0xffff) {
      out += `\\u${hexPad(cp, 4)}`
      continue
    }
    out += `\\U${hexPad(cp, 8)}`
  }
  return out
}

function escapeShellDouble(input: string): string {
  let out = ''
  for (const ch of input) {
    if (ch === '\\' || ch === '"' || ch === '$' || ch === '`' || ch === '!') {
      out += `\\${ch}`
    } else {
      out += ch
    }
  }
  return out
}

/** POSIX-safe single-quoted argv token (includes outer quotes). */
function escapeShellSingle(input: string): string {
  return `'${input.replace(/'/g, `'\\''`)}'`
}

function escapeShellAnsiC(input: string): string {
  const chars = [...input]
  let inner = ''
  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]
    const cp = ch.codePointAt(0)!
    if (ch === '\\') {
      inner += '\\\\'
      continue
    }
    if (ch === "'") {
      inner += "\\'"
      continue
    }
    if (cp === 0) {
      const next = chars[i + 1]
      if (next && next >= '0' && next <= '7') {
        inner += '\\x00'
      } else {
        inner += '\\0'
      }
      continue
    }
    const named = CONTROL_ESCAPES[cp]
    if (named) {
      inner += named
      continue
    }
    if (isPrintableAscii(cp)) {
      inner += ch
      continue
    }
    if (cp <= 0xff) {
      inner += `\\x${hexPad(cp, 2)}`
      continue
    }
    if (cp <= 0xffff) {
      inner += `\\u${hexPad(cp, 4)}`
      continue
    }
    inner += `\\U${hexPad(cp, 8)}`
  }
  return `$'${inner}'`
}

export function escapeText(
  input: string,
  language: EscapeLanguage,
  quoteStyle: QuoteStyle
): EscapeResult {
  if (!input) return { ok: true, value: '' }

  const invalid = validateQuote(language, quoteStyle)
  if (invalid) return { ok: false, error: invalid }

  if (language === 'shell') {
    if (quoteStyle === 'double') {
      return { ok: true, value: escapeShellDouble(input) }
    }
    if (quoteStyle === 'single') {
      return { ok: true, value: escapeShellSingle(input) }
    }
    return { ok: true, value: escapeShellAnsiC(input) }
  }

  const quoteChar = quoteStyle === 'single' ? "'" : '"'
  return { ok: true, value: escapeCodeLike(input, quoteChar) }
}

type UnescapeParse = { value: string; warning?: string }

function stripOuterQuotes(
  input: string,
  quote: '"' | "'"
): { body: string; stripped: boolean } {
  if (
    input.length >= 2 &&
    input[0] === quote &&
    input[input.length - 1] === quote
  ) {
    return { body: input.slice(1, -1), stripped: true }
  }
  return { body: input, stripped: false }
}

function stripAnsiCWrapper(input: string): { body: string; stripped: boolean } {
  const trimmed = input.trim()
  if (
    trimmed.length >= 3 &&
    trimmed.startsWith("$'") &&
    trimmed.endsWith("'")
  ) {
    return { body: trimmed.slice(2, -1), stripped: true }
  }
  return { body: input, stripped: false }
}

function parseHexDigits(
  s: string,
  start: number,
  max: number
): { value: number; len: number } | null {
  let hex = ''
  for (let i = 0; i < max && start + i < s.length; i++) {
    const c = s[start + i]
    if (!/[0-9a-fA-F]/.test(c)) break
    hex += c
  }
  if (hex.length === 0) return null
  return { value: parseInt(hex, 16), len: hex.length }
}

function parseOctalDigits(
  s: string,
  start: number,
  max: number
): { value: number; len: number } | null {
  let oct = ''
  for (let i = 0; i < max && start + i < s.length; i++) {
    const c = s[start + i]
    if (c < '0' || c > '7') break
    oct += c
  }
  if (oct.length === 0) return null
  return { value: parseInt(oct, 8), len: oct.length }
}

function codePointToString(cp: number): string {
  try {
    return String.fromCodePoint(cp)
  } catch {
    return ''
  }
}

/**
 * Unescape C / Python / ANSI-C style backslash sequences.
 * Lenient: truncated or unknown sequences are left as written and flagged.
 */
function unescapeCodeLike(body: string): UnescapeParse {
  let out = ''
  let warning: string | undefined
  const note = (msg: string) => {
    if (!warning) warning = msg
  }

  for (let i = 0; i < body.length; i++) {
    if (body[i] !== '\\') {
      out += body[i]
      continue
    }

    if (i + 1 >= body.length) {
      out += '\\'
      note('Trailing backslash left unchanged.')
      break
    }

    const next = body[i + 1]
    switch (next) {
      case 'n':
        out += '\n'
        i++
        continue
      case 't':
        out += '\t'
        i++
        continue
      case 'r':
        out += '\r'
        i++
        continue
      case 'a':
        out += '\x07'
        i++
        continue
      case 'b':
        out += '\b'
        i++
        continue
      case 'f':
        out += '\f'
        i++
        continue
      case 'v':
        out += '\v'
        i++
        continue
      case '0': {
        const oct = parseOctalDigits(body, i + 1, 3)
        if (oct) {
          out += codePointToString(oct.value)
          i += oct.len
          continue
        }
        out += '\\0'
        note('Incomplete escape sequence left unchanged.')
        i++
        continue
      }
      case '\\':
      case "'":
      case '"':
        out += next
        i++
        continue
      case 'x': {
        const hex = parseHexDigits(body, i + 2, 2)
        if (!hex || hex.len < 1) {
          out += '\\x'
          note('Incomplete \\x escape left unchanged.')
          i++
          continue
        }
        out += codePointToString(hex.value)
        i += 1 + hex.len
        continue
      }
      case 'u': {
        const hex = parseHexDigits(body, i + 2, 4)
        if (!hex || hex.len < 4) {
          out += '\\u'
          note('Incomplete \\u escape left unchanged.')
          i++
          continue
        }
        out += codePointToString(hex.value)
        i += 1 + hex.len
        continue
      }
      case 'U': {
        const hex = parseHexDigits(body, i + 2, 8)
        if (!hex || hex.len < 8) {
          out += '\\U'
          note('Incomplete \\U escape left unchanged.')
          i++
          continue
        }
        out += codePointToString(hex.value)
        i += 1 + hex.len
        continue
      }
      default: {
        // Octal \1–\377 (leading digit already not 0 handled above for \0…)
        if (next >= '1' && next <= '7') {
          const oct = parseOctalDigits(body, i + 1, 3)
          if (oct) {
            out += codePointToString(oct.value)
            i += oct.len
            continue
          }
        }
        out += `\\${next}`
        note('Unknown escape sequence left unchanged.')
        i++
        continue
      }
    }
  }

  return warning ? { value: out, warning } : { value: out }
}

function unescapeShellDouble(body: string): UnescapeParse {
  let out = ''
  let warning: string | undefined

  for (let i = 0; i < body.length; i++) {
    if (body[i] !== '\\') {
      out += body[i]
      continue
    }
    if (i + 1 >= body.length) {
      out += '\\'
      warning = 'Trailing backslash left unchanged.'
      break
    }
    const next = body[i + 1]
    if (
      next === '\\' ||
      next === '"' ||
      next === '$' ||
      next === '`' ||
      next === '!' ||
      next === '\n'
    ) {
      out += next
      i++
      continue
    }
    // Outside the special set, backslash is kept (POSIX double-quote rules).
    out += '\\'
    out += next
    i++
  }

  return warning ? { value: out, warning } : { value: out }
}

/** Unwrap POSIX `'…'` / `'\''` concatenation back to raw text. */
function unescapeShellSingle(input: string): UnescapeParse {
  const trimmed = input.trim()
  if (!trimmed.includes("'")) {
    return { value: input }
  }

  let i = 0
  let out = ''
  let sawQuote = false

  while (i < trimmed.length) {
    if (trimmed[i] !== "'") {
      // Unquoted remnant - keep literally (lenient).
      out += trimmed[i]
      i++
      continue
    }
    sawQuote = true
    i++ // opening '
    while (i < trimmed.length) {
      // Embedded apostrophe join: '\''
      if (trimmed.startsWith("'\\''", i)) {
        out += "'"
        i += 4
        continue
      }
      if (trimmed[i] === "'") {
        i++ // closing '
        break
      }
      out += trimmed[i]
      i++
    }
  }

  if (!sawQuote) return { value: input }

  return { value: out }
}

export function unescapeText(
  input: string,
  language: EscapeLanguage,
  quoteStyle: QuoteStyle
): EscapeResult {
  if (!input) return { ok: true, value: '' }

  const invalid = validateQuote(language, quoteStyle)
  if (invalid) return { ok: false, error: invalid }

  if (language === 'shell' && quoteStyle === 'single') {
    const parsed = unescapeShellSingle(input)
    return parsed.warning
      ? { ok: true, value: parsed.value, warning: parsed.warning }
      : { ok: true, value: parsed.value }
  }

  if (language === 'shell' && quoteStyle === 'double') {
    const { body } = stripOuterQuotes(input, '"')
    const parsed = unescapeShellDouble(body)
    return parsed.warning
      ? { ok: true, value: parsed.value, warning: parsed.warning }
      : { ok: true, value: parsed.value }
  }

  if (language === 'shell' && quoteStyle === 'ansi-c') {
    const { body } = stripAnsiCWrapper(input)
    const parsed = unescapeCodeLike(body)
    return parsed.warning
      ? { ok: true, value: parsed.value, warning: parsed.warning }
      : { ok: true, value: parsed.value }
  }

  const quoteChar = quoteStyle === 'single' ? "'" : '"'
  const { body } = stripOuterQuotes(input, quoteChar)
  const parsed = unescapeCodeLike(body)
  return parsed.warning
    ? { ok: true, value: parsed.value, warning: parsed.warning }
    : { ok: true, value: parsed.value }
}
