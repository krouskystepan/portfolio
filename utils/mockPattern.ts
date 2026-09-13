const REPEAT_CAP = 32
const STAR_PLUS_CAP = 8

const DIGITS = '0123456789'
const UPPER = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const LOWER = 'abcdefghijklmnopqrstuvwxyz'
const WORD = `${UPPER}${LOWER}${DIGITS}_`
const SPACE = ' \t'
const PRINTABLE = Array.from({ length: 95 }, (_, i) =>
  String.fromCharCode(32 + i)
).join('')

export const DEFAULT_CUSTOM_PATTERN = '[A-Z]{3}-\\d{4}'

export const PATTERN_EXAMPLES: { label: string; pattern: string }[] = [
  { label: '8 digits', pattern: '\\d{8}' },
  { label: 'SKU', pattern: '[A-Z]{3}-\\d{4}' },
  {
    label: 'UUID',
    pattern:
      '[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}'
  },
  { label: 'IBAN', pattern: '[A-Z]{2}\\d{2}[A-Z]{4}\\d{12}' },
  { label: 'Card', pattern: '\\d{4} \\d{4} \\d{4} \\d{4}' }
]

type GenNode =
  | { t: 'lit'; s: string }
  | { t: 'set'; chars: string }
  | { t: 'seq'; xs: GenNode[] }
  | { t: 'alt'; xs: GenNode[] }
  | { t: 'rep'; x: GenNode; min: number; max: number }

class PatternError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PatternError'
  }
}

function unwrapPattern(raw: string): string {
  const trimmed = raw.trim()
  if (trimmed.length >= 2 && trimmed.startsWith('/')) {
    const last = trimmed.lastIndexOf('/')
    if (last > 0) return trimmed.slice(1, last)
  }
  return trimmed
}

function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 0) throw new PatternError('Empty character set')
  if (maxExclusive === 1) return 0
  const buf = new Uint32Array(1)
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive
  for (;;) {
    crypto.getRandomValues(buf)
    if (buf[0] < limit) return buf[0] % maxExclusive
  }
}

function pickChar(chars: string): string {
  if (!chars) throw new PatternError('Empty character set')
  return chars[randomInt(chars.length)]
}

function minus(universe: string, drop: string): string {
  const skip = new Set(drop)
  return [...universe].filter((ch) => !skip.has(ch)).join('')
}

function rangeChars(from: string, to: string): string {
  const a = from.charCodeAt(0)
  const b = to.charCodeAt(0)
  if (b < a) throw new PatternError(`Bad range ${from}-${to}`)
  let out = ''
  for (let c = a; c <= b; c++) out += String.fromCharCode(c)
  return out
}

function uniqueChars(chars: string): string {
  return [...new Set(chars)].join('')
}

type Cursor = { src: string; i: number }

function peek(c: Cursor): string {
  return c.src[c.i] ?? ''
}

function eof(c: Cursor): boolean {
  return c.i >= c.src.length
}

function eat(c: Cursor, ch?: string): string {
  if (eof(c)) throw new PatternError('Unexpected end of pattern')
  const got = c.src[c.i]
  if (ch != null && got !== ch) {
    throw new PatternError(`Expected ${ch}`)
  }
  c.i += 1
  return got
}

function escapeToChars(code: string): string {
  switch (code) {
    case 'd':
      return DIGITS
    case 'D':
      return minus(PRINTABLE, DIGITS)
    case 'w':
      return WORD
    case 'W':
      return minus(PRINTABLE, WORD)
    case 's':
      return SPACE
    case 'S':
      return minus(PRINTABLE, SPACE)
    case 'n':
      return '\n'
    case 't':
      return '\t'
    case 'r':
      return '\r'
    default:
      return code
  }
}

function readEscape(c: Cursor): string {
  eat(c, '\\')
  if (eof(c)) throw new PatternError('Dangling backslash')
  const code = eat(c)
  if (code === 'p' || code === 'P' || code === 'k' || code === '1') {
    throw new PatternError(`\\${code} is not supported`)
  }
  if (DIGITS.includes(code) && code !== '0') {
    throw new PatternError('Backreferences are not supported')
  }
  return escapeToChars(code)
}

function readClass(c: Cursor): GenNode {
  eat(c, '[')
  let negate = false
  if (peek(c) === '^') {
    eat(c)
    negate = true
  }
  let chars = ''
  if (peek(c) === ']' ) {
    chars += eat(c)
  }
  while (!eof(c) && peek(c) !== ']') {
    let next: string
    if (peek(c) === '\\') {
      next = readEscape(c)
    } else {
      next = eat(c)
    }
    if (peek(c) === '-' && c.src[c.i + 1] && c.src[c.i + 1] !== ']') {
      eat(c, '-')
      const end = peek(c) === '\\' ? readEscape(c) : eat(c)
      if (next.length !== 1 || end.length !== 1) {
        throw new PatternError('Range bounds must be single characters')
      }
      chars += rangeChars(next, end)
    } else {
      chars += next
    }
  }
  eat(c, ']')
  chars = uniqueChars(chars)
  if (negate) chars = minus(PRINTABLE, chars)
  if (!chars) throw new PatternError('Character class is empty')
  return { t: 'set', chars }
}

function readQuantifier(
  c: Cursor,
  node: GenNode
): GenNode {
  const ch = peek(c)
  let min = 1
  let max = 1
  if (ch === '*') {
    eat(c)
    min = 0
    max = STAR_PLUS_CAP
  } else if (ch === '+') {
    eat(c)
    min = 1
    max = STAR_PLUS_CAP
  } else if (ch === '?') {
    eat(c)
    min = 0
    max = 1
  } else if (ch === '{') {
    eat(c)
    let n = ''
    while (DIGITS.includes(peek(c))) n += eat(c)
    if (!n) throw new PatternError('Empty quantifier')
    min = Number(n)
    max = min
    if (peek(c) === ',') {
      eat(c)
      let m = ''
      while (DIGITS.includes(peek(c))) m += eat(c)
      max = m ? Number(m) : min + STAR_PLUS_CAP
    }
    eat(c, '}')
    if (max < min) throw new PatternError('Quantifier max is less than min')
    if (min > REPEAT_CAP || max > REPEAT_CAP) {
      throw new PatternError(`Quantifier is capped at ${REPEAT_CAP}`)
    }
  } else {
    return node
  }
  if (peek(c) === '?') eat(c)
  return { t: 'rep', x: node, min, max }
}

function readAtom(c: Cursor): GenNode | null {
  if (eof(c)) return null
  const ch = peek(c)
  if (ch === '|' || ch === ')') return null
  if (ch === '^' || ch === '$') {
    eat(c)
    return { t: 'lit', s: '' }
  }
  if (ch === '.') {
    eat(c)
    return { t: 'set', chars: PRINTABLE }
  }
  if (ch === '[') return readClass(c)
  if (ch === '(') {
    eat(c)
    if (peek(c) === '?') {
      eat(c)
      const next = peek(c)
      if (next === ':') {
        eat(c)
      } else {
        throw new PatternError('Lookahead / lookbehind / flags are not supported')
      }
    }
    const inner = readAlt(c)
    eat(c, ')')
    return inner
  }
  if (ch === '\\') {
    const chars = readEscape(c)
    return chars.length === 1 ? { t: 'lit', s: chars } : { t: 'set', chars }
  }
  if (ch === '*' || ch === '+' || ch === '?' || ch === '{' || ch === '}') {
    throw new PatternError(`Unexpected ${ch}`)
  }
  return { t: 'lit', s: eat(c) }
}

function readSeq(c: Cursor): GenNode {
  const xs: GenNode[] = []
  for (;;) {
    const atom = readAtom(c)
    if (!atom) break
    xs.push(readQuantifier(c, atom))
  }
  if (xs.length === 0) return { t: 'lit', s: '' }
  if (xs.length === 1) return xs[0]
  return { t: 'seq', xs }
}

function readAlt(c: Cursor): GenNode {
  const xs = [readSeq(c)]
  while (peek(c) === '|') {
    eat(c)
    xs.push(readSeq(c))
  }
  if (xs.length === 1) return xs[0]
  return { t: 'alt', xs }
}

function parsePattern(raw: string): GenNode {
  const src = unwrapPattern(raw)
  if (!src) throw new PatternError('Pattern is empty')
  const c: Cursor = { src, i: 0 }
  const node = readAlt(c)
  if (!eof(c)) throw new PatternError(`Unexpected ${peek(c)}`)
  return node
}

function emit(node: GenNode): string {
  switch (node.t) {
    case 'lit':
      return node.s
    case 'set':
      return pickChar(node.chars)
    case 'seq':
      return node.xs.map(emit).join('')
    case 'alt':
      return emit(node.xs[randomInt(node.xs.length)])
    case 'rep': {
      const n = node.min + randomInt(node.max - node.min + 1)
      let out = ''
      for (let i = 0; i < n; i++) out += emit(node.x)
      return out
    }
  }
}

export function patternError(pattern: string | undefined): string | null {
  try {
    parsePattern(pattern ?? '')
    return null
  } catch (err) {
    return err instanceof Error ? err.message : 'Invalid pattern'
  }
}

export function generateFromPattern(pattern: string): string {
  return emit(parsePattern(pattern))
}
