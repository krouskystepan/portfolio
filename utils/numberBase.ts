export const MIN_BASE = 2
export const MAX_BASE = 36

export type ParseIntegerResult =
  | { ok: true; value: bigint }
  | { ok: false; error: string }

export function isValidBase(base: number): boolean {
  return Number.isInteger(base) && base >= MIN_BASE && base <= MAX_BASE
}

export function baseLabel(base: number): string | null {
  switch (base) {
    case 2:
      return 'Binary'
    case 8:
      return 'Octal'
    case 10:
      return 'Decimal'
    case 16:
      return 'Hex'
    default:
      return null
  }
}

/** Strip whitespace; accept optional 0b / 0o / 0x / # prefixes when they match the radix. */
export function parseInteger(input: string, radix: number): ParseIntegerResult {
  if (!isValidBase(radix)) {
    return { ok: false, error: `Base must be ${MIN_BASE}-${MAX_BASE}.` }
  }

  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter a number.' }
  }

  if (trimmed.startsWith('-')) {
    return { ok: false, error: 'Negative numbers are not supported.' }
  }

  if (trimmed.includes('.') || trimmed.includes(',')) {
    return { ok: false, error: 'Integers only - no fractional part.' }
  }

  const digits = stripPrefixAndSpaces(trimmed, radix)
  if (digits === null) {
    return { ok: false, error: `Unexpected prefix for base ${radix}.` }
  }

  if (!digits) {
    return { ok: false, error: 'Enter a number.' }
  }

  let value = 0n
  const bigRadix = BigInt(radix)

  for (let i = 0; i < digits.length; i++) {
    const d = digitValue(digits[i])
    if (d < 0 || d >= radix) {
      return {
        ok: false,
        error: `Invalid digit '${digits[i]}' for base ${radix}.`
      }
    }
    value = value * bigRadix + BigInt(d)
  }

  return { ok: true, value }
}

/**
 * Format without a radix prefix. Binary groups by 4, hex by 2 when `group` is true.
 */
export function formatInteger(
  value: bigint,
  radix: number,
  options?: { group?: boolean }
): string {
  if (!isValidBase(radix)) {
    throw new RangeError(`Base must be ${MIN_BASE}-${MAX_BASE}.`)
  }
  if (value < 0n) {
    throw new RangeError('Negative numbers are not supported.')
  }

  const text = value.toString(radix)
  if (!options?.group) return text
  if (radix === 2) return groupDigits(text, 4)
  if (radix === 16) return groupDigits(text, 2)
  return text
}

function digitValue(ch: string): number {
  if (ch >= '0' && ch <= '9') return ch.charCodeAt(0) - 48
  const code = ch.toLowerCase().charCodeAt(0)
  if (code >= 97 && code <= 122) return code - 87 // a → 10
  return -1
}

function stripPrefixAndSpaces(input: string, radix: number): string | null {
  let rest = input

  if (radix === 2 && /^0b/i.test(rest)) {
    rest = rest.slice(2)
  } else if (radix === 8 && /^0o/i.test(rest)) {
    rest = rest.slice(2)
  } else if (radix === 16) {
    if (/^0x/i.test(rest)) rest = rest.slice(2)
    else if (rest.startsWith('#')) rest = rest.slice(1)
  } else if (/^0[box]/i.test(rest) || rest.startsWith('#')) {
    return null
  }

  if (radix !== 16 && rest.startsWith('#')) return null
  if (radix !== 2 && /^0b/i.test(rest)) return null
  if (radix !== 8 && /^0o/i.test(rest)) return null
  if (radix !== 16 && /^0x/i.test(rest)) return null

  return rest.replace(/\s+/g, '')
}

function groupDigits(digits: string, size: number): string {
  if (digits.length <= size) return digits
  const parts: string[] = []
  for (let i = digits.length; i > 0; i -= size) {
    parts.unshift(digits.slice(Math.max(0, i - size), i))
  }
  return parts.join(' ')
}
