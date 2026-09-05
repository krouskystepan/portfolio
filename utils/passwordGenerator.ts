export type CharsetOptions = {
  lowercase: boolean
  uppercase: boolean
  digits: boolean
  symbols: boolean
  excludeAmbiguous: boolean
}

export type StrengthLabel =
  | 'weak'
  | 'fair'
  | 'strong'
  | 'very-strong'
  | 'overkill'

export const DEFAULT_CHARSET: CharsetOptions = {
  lowercase: true,
  uppercase: true,
  digits: true,
  symbols: true,
  excludeAmbiguous: false
}

export const MIN_LENGTH = 4
export const MAX_LENGTH = 128
export const MIN_COUNT = 1
export const MAX_COUNT = 50

const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz'
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const DIGITS = '0123456789'
const SYMBOLS = '!@#$%^&*()-_=+[]{};:,.?/'
/** Characters stripped when excludeAmbiguous is on (includes `|` if present in symbols). */
const AMBIGUOUS = '0OIl1|'

const VOWELS_LOWER = 'aeiou'
const CONSONANTS_LOWER = 'bcdfghjklmnpqrstvwxyz'

function stripAmbiguous(chars: string, exclude: boolean): string {
  if (!exclude) return chars
  const drop = new Set(AMBIGUOUS)
  return [...chars].filter((ch) => !drop.has(ch)).join('')
}

function casePool(lower: string, options: CharsetOptions): string {
  let pool = ''
  if (options.lowercase) pool += lower
  if (options.uppercase) pool += lower.toUpperCase()
  return stripAmbiguous(pool, options.excludeAmbiguous)
}

export function buildCharset(options: CharsetOptions): string {
  let charset = ''
  if (options.lowercase) charset += LOWERCASE
  if (options.uppercase) charset += UPPERCASE
  if (options.digits) charset += DIGITS
  if (options.symbols) charset += SYMBOLS
  return stripAmbiguous(charset, options.excludeAmbiguous)
}

export function hasLetterCharset(options: CharsetOptions): boolean {
  return options.lowercase || options.uppercase
}

export function buildReadablePools(options: CharsetOptions): {
  consonants: string
  vowels: string
  digits: string
  symbols: string
} {
  return {
    consonants: casePool(CONSONANTS_LOWER, options),
    vowels: casePool(VOWELS_LOWER, options),
    digits: options.digits
      ? stripAmbiguous(DIGITS, options.excludeAmbiguous)
      : '',
    symbols: options.symbols
      ? stripAmbiguous(SYMBOLS, options.excludeAmbiguous)
      : ''
  }
}

export function entropyBits(length: number, charsetSize: number): number {
  if (charsetSize <= 0 || length <= 0 || !Number.isFinite(length)) return 0
  return length * Math.log2(charsetSize)
}

/** Approximate entropy for CVCV readable generation (patterned, not full charset). */
export function readableEntropyBits(
  length: number,
  options: CharsetOptions
): number {
  if (length <= 0 || !Number.isFinite(length)) return 0
  const { consonants, vowels, digits, symbols } = buildReadablePools(options)
  if (!consonants || !vowels) return 0

  const letterBudget = letterSlotCount(length, options)
  const otherBudget = length - letterBudget
  const cBits = Math.log2(consonants.length)
  const vBits = Math.log2(vowels.length)
  // Half the letter slots are consonants, half vowels (approx), + 1 bit for start
  const letterBits = 1 + letterBudget * ((cBits + vBits) / 2)

  let otherBits = 0
  if (otherBudget > 0) {
    const otherPool = digits + symbols
    if (otherPool.length > 0) {
      otherBits = otherBudget * Math.log2(otherPool.length)
    }
  }

  return letterBits + otherBits
}

export function strengthFromEntropy(bits: number): StrengthLabel {
  if (bits < 28) return 'weak'
  if (bits < 36) return 'fair'
  if (bits < 60) return 'strong'
  if (bits < 128) return 'very-strong'
  return 'overkill'
}

export function formatStrengthLabel(label: StrengthLabel): string {
  switch (label) {
    case 'very-strong':
      return 'very strong'
    default:
      return label
  }
}

/**
 * Uniform index in [0, n) via rejection sampling (no modulo bias).
 */
function randomIndex(n: number): number {
  if (n <= 0) throw new Error('Charset is empty')
  if (n === 1) return 0

  const maxUnbiased = Math.floor(256 / n) * n
  const buf = new Uint8Array(1)
  for (;;) {
    crypto.getRandomValues(buf)
    const value = buf[0]
    if (value < maxUnbiased) return value % n
  }
}

function pick(pool: string): string {
  return pool[randomIndex(pool.length)]
}

function assertLength(length: number) {
  if (
    !Number.isFinite(length) ||
    length < MIN_LENGTH ||
    length > MAX_LENGTH ||
    !Number.isInteger(length)
  ) {
    throw new Error(
      `Length must be an integer between ${MIN_LENGTH} and ${MAX_LENGTH}`
    )
  }
}

function assertCount(count: number) {
  if (
    !Number.isFinite(count) ||
    count < MIN_COUNT ||
    count > MAX_COUNT ||
    !Number.isInteger(count)
  ) {
    throw new Error(
      `Count must be an integer between ${MIN_COUNT} and ${MAX_COUNT}`
    )
  }
}

/** How many slots stay letters when digits/symbols are enabled. */
function letterSlotCount(length: number, options: CharsetOptions): number {
  const wantsOther = options.digits || options.symbols
  if (!wantsOther) return length
  // Keep most of the password pronounceable; reserve ~20% (min 1, max 4) for extras
  const reserved = Math.min(4, Math.max(1, Math.round(length * 0.2)))
  return Math.max(2, length - reserved)
}

export function generatePassword(length: number, charset: string): string {
  if (!charset) throw new Error('Charset is empty')
  assertLength(length)

  let out = ''
  for (let i = 0; i < length; i++) {
    out += charset[randomIndex(charset.length)]
  }
  return out
}

/**
 * Pronounceable CVCV… body, with optional digits/symbols tacked on the end.
 * Example: `baKuRoXeTi42!`
 */
export function generateReadablePassword(
  length: number,
  options: CharsetOptions
): string {
  assertLength(length)
  const { consonants, vowels, digits, symbols } = buildReadablePools(options)
  if (!consonants || !vowels) {
    throw new Error('Readable mode needs lowercase and/or uppercase letters')
  }

  const letterLen = letterSlotCount(length, options)
  const otherLen = length - letterLen
  const startConsonant = randomIndex(2) === 0

  let letters = ''
  for (let i = 0; i < letterLen; i++) {
    const useConsonant = startConsonant ? i % 2 === 0 : i % 2 === 1
    letters += pick(useConsonant ? consonants : vowels)
  }

  let extras = ''
  const otherPool = digits + symbols
  if (otherLen > 0 && otherPool) {
    // Prefer at least one digit and one symbol when both are enabled and space allows
    if (otherLen >= 2 && digits && symbols) {
      extras += pick(digits) + pick(symbols)
      for (let i = 2; i < otherLen; i++) extras += pick(otherPool)
    } else {
      for (let i = 0; i < otherLen; i++) extras += pick(otherPool)
    }
  } else if (otherLen > 0) {
    // digits/symbols requested but pool empty after ambiguous filter — fill with letters
    for (let i = 0; i < otherLen; i++) {
      const useConsonant = startConsonant
        ? (letterLen + i) % 2 === 0
        : (letterLen + i) % 2 === 1
      extras += pick(useConsonant ? consonants : vowels)
    }
  }

  return letters + extras
}

export function generatePasswords(
  length: number,
  count: number,
  charset: string,
  options?: { readable?: boolean; charsetOptions?: CharsetOptions }
): string[] {
  assertCount(count)

  if (options?.readable) {
    if (!options.charsetOptions) {
      throw new Error('Readable generation requires charset options')
    }
    return Array.from({ length: count }, () =>
      generateReadablePassword(length, options.charsetOptions!)
    )
  }

  return Array.from({ length: count }, () => generatePassword(length, charset))
}
