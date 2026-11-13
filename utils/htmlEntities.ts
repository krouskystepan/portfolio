export type HtmlEntityEncodeMode = 'basic' | 'named' | 'decimal' | 'hex'

/** Common named character references (HTML 4 core + frequent HTML5 additions). */
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: '\u00a0',
  iexcl: '¡',
  cent: '¢',
  pound: '£',
  curren: '¤',
  yen: '¥',
  brvbar: '¦',
  sect: '§',
  uml: '¨',
  copy: '©',
  ordf: 'ª',
  laquo: '«',
  not: '¬',
  shy: '\u00ad',
  reg: '®',
  macr: '¯',
  deg: '°',
  plusmn: '±',
  sup2: '²',
  sup3: '³',
  acute: '´',
  micro: 'µ',
  para: '¶',
  middot: '·',
  cedil: '¸',
  sup1: '¹',
  ordm: 'º',
  raquo: '»',
  frac14: '¼',
  frac12: '½',
  frac34: '¾',
  iquest: '¿',
  Agrave: 'À',
  Aacute: 'Á',
  Acirc: 'Â',
  Atilde: 'Ã',
  Auml: 'Ä',
  Aring: 'Å',
  AElig: 'Æ',
  Ccedil: 'Ç',
  Egrave: 'È',
  Eacute: 'É',
  Ecirc: 'Ê',
  Euml: 'Ë',
  Igrave: 'Ì',
  Iacute: 'Í',
  Icirc: 'Î',
  Iuml: 'Ï',
  ETH: 'Ð',
  Ntilde: 'Ñ',
  Ograve: 'Ò',
  Oacute: 'Ó',
  Ocirc: 'Ô',
  Otilde: 'Õ',
  Ouml: 'Ö',
  times: '×',
  Oslash: 'Ø',
  Ugrave: 'Ù',
  Uacute: 'Ú',
  Ucirc: 'Û',
  Uuml: 'Ü',
  Yacute: 'Ý',
  THORN: 'Þ',
  szlig: 'ß',
  agrave: 'à',
  aacute: 'á',
  acirc: 'â',
  atilde: 'ã',
  auml: 'ä',
  aring: 'å',
  aelig: 'æ',
  ccedil: 'ç',
  egrave: 'è',
  eacute: 'é',
  ecirc: 'ê',
  euml: 'ë',
  igrave: 'ì',
  iacute: 'í',
  icirc: 'î',
  iuml: 'ï',
  eth: 'ð',
  ntilde: 'ñ',
  ograve: 'ò',
  oacute: 'ó',
  ocirc: 'ô',
  otilde: 'õ',
  ouml: 'ö',
  divide: '÷',
  oslash: 'ø',
  ugrave: 'ù',
  uacute: 'ú',
  ucirc: 'û',
  uuml: 'ü',
  yacute: 'ý',
  thorn: 'þ',
  yuml: 'ÿ',
  OElig: 'Œ',
  oelig: 'œ',
  Scaron: 'Š',
  scaron: 'š',
  Yuml: 'Ÿ',
  fnof: 'ƒ',
  circ: 'ˆ',
  tilde: '˜',
  ensp: '\u2002',
  emsp: '\u2003',
  thinsp: '\u2009',
  zwnj: '\u200c',
  zwj: '\u200d',
  lrm: '\u200e',
  rlm: '\u200f',
  ndash: '–',
  mdash: '—',
  lsquo: '‘',
  rsquo: '’',
  sbquo: '‚',
  ldquo: '“',
  rdquo: '”',
  bdquo: '„',
  dagger: '†',
  Dagger: '‡',
  bull: '•',
  hellip: '…',
  permil: '‰',
  prime: '′',
  Prime: '″',
  lsaquo: '‹',
  rsaquo: '›',
  oline: '‾',
  euro: '€',
  trade: '™',
  larr: '←',
  uarr: '↑',
  rarr: '→',
  darr: '↓',
  harr: '↔',
  lArr: '⇐',
  uArr: '⇑',
  rArr: '⇒',
  dArr: '⇓',
  hArr: '⇔',
  forall: '∀',
  part: '∂',
  exist: '∃',
  empty: '∅',
  nabla: '∇',
  isin: '∈',
  notin: '∉',
  ni: '∋',
  prod: '∏',
  sum: '∑',
  minus: '−',
  lowast: '∗',
  radic: '√',
  prop: '∝',
  infin: '∞',
  ang: '∠',
  and: '∧',
  or: '∨',
  cap: '∩',
  cup: '∪',
  int: '∫',
  there4: '∴',
  sim: '∼',
  cong: '≅',
  asymp: '≈',
  ne: '≠',
  equiv: '≡',
  le: '≤',
  ge: '≥',
  sub: '⊂',
  sup: '⊃',
  nsub: '⊄',
  sube: '⊆',
  supe: '⊇',
  oplus: '⊕',
  otimes: '⊗',
  perp: '⊥',
  sdot: '⋅',
  loz: '◊',
  spades: '♠',
  clubs: '♣',
  hearts: '♥',
  diams: '♦',
  check: '✓',
  star: '☆',
  starf: '★',
  Alpha: 'Α',
  Beta: 'Β',
  Gamma: 'Γ',
  Delta: 'Δ',
  Epsilon: 'Ε',
  Zeta: 'Ζ',
  Eta: 'Η',
  Theta: 'Θ',
  Iota: 'Ι',
  Kappa: 'Κ',
  Lambda: 'Λ',
  Mu: 'Μ',
  Nu: 'Ν',
  Xi: 'Ξ',
  Omicron: 'Ο',
  Pi: 'Π',
  Rho: 'Ρ',
  Sigma: 'Σ',
  Tau: 'Τ',
  Upsilon: 'Υ',
  Phi: 'Φ',
  Chi: 'Χ',
  Psi: 'Ψ',
  Omega: 'Ω',
  alpha: 'α',
  beta: 'β',
  gamma: 'γ',
  delta: 'δ',
  epsilon: 'ε',
  zeta: 'ζ',
  eta: 'η',
  theta: 'θ',
  iota: 'ι',
  kappa: 'κ',
  lambda: 'λ',
  mu: 'μ',
  nu: 'ν',
  xi: 'ξ',
  omicron: 'ο',
  pi: 'π',
  rho: 'ρ',
  sigmaf: 'ς',
  sigma: 'σ',
  tau: 'τ',
  upsilon: 'υ',
  phi: 'φ',
  chi: 'χ',
  psi: 'ψ',
  omega: 'ω'
}

/** Character -> preferred entity name (first wins; `apos` skipped for HTML 4 safety). */
const CHAR_TO_NAME: ReadonlyMap<string, string> = (() => {
  const map = new Map<string, string>()
  for (const [name, char] of Object.entries(NAMED_ENTITIES)) {
    if (name === 'apos') continue
    if (!map.has(char)) map.set(char, name)
  }
  return map
})()

export const HTML_ENTITY_COUNT = Object.keys(NAMED_ENTITIES).length

const BASIC_ESCAPES: Readonly<Record<string, string>> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;'
}

function numericEntity(codePoint: number, hex: boolean): string {
  return hex
    ? `&#x${codePoint.toString(16).toUpperCase()};`
    : `&#${codePoint};`
}

/** Escape text for safe placement in HTML text or attribute values. */
export function encodeHtmlEntities(
  input: string,
  mode: HtmlEntityEncodeMode
): string {
  let out = ''
  for (const char of input) {
    const basic = BASIC_ESCAPES[char]
    if (basic) {
      out += basic
      continue
    }
    const codePoint = char.codePointAt(0) ?? 0
    const isPlainAscii =
      codePoint < 0x80 && (codePoint >= 0x20 || codePoint === 9 || codePoint === 10 || codePoint === 13)
    if (mode === 'basic' || isPlainAscii) {
      out += char
      continue
    }
    if (mode === 'named') {
      const name = CHAR_TO_NAME.get(char)
      out += name ? `&${name};` : numericEntity(codePoint, true)
      continue
    }
    out += numericEntity(codePoint, mode === 'hex')
  }
  return out
}

const ENTITY_RE = /&(?:#([xX][0-9a-fA-F]{1,6}|[0-9]{1,7})|([A-Za-z][A-Za-z0-9]{1,31}));/g

export type HtmlEntityDecodeResult = {
  value: string
  /** Number of references that were decoded. */
  decoded: number
  /** Distinct named references that were not recognised and left untouched. */
  unknown: string[]
}

/** Decode named, decimal and hex character references. Pure string logic: no DOM, no HTML parsing. */
export function decodeHtmlEntities(input: string): HtmlEntityDecodeResult {
  let decoded = 0
  const unknown = new Set<string>()
  const value = input.replace(
    ENTITY_RE,
    (match: string, numeric: string | undefined, named: string | undefined) => {
      if (numeric !== undefined) {
        const isHex = numeric[0] === 'x' || numeric[0] === 'X'
        const code = isHex
          ? Number.parseInt(numeric.slice(1), 16)
          : Number.parseInt(numeric, 10)
        if (!Number.isFinite(code) || code > 0x10ffff) return match
        decoded += 1
        if (code === 0 || (code >= 0xd800 && code <= 0xdfff)) return '\ufffd'
        return String.fromCodePoint(code)
      }
      if (named !== undefined) {
        const char = Object.prototype.hasOwnProperty.call(NAMED_ENTITIES, named)
          ? NAMED_ENTITIES[named]
          : undefined
        if (char === undefined) {
          unknown.add(match)
          return match
        }
        decoded += 1
        return char
      }
      return match
    }
  )
  return { value, decoded, unknown: [...unknown] }
}

/** Reference list for the UI cheat-sheet. */
export const COMMON_ENTITY_REFERENCE: { name: string; char: string; label: string }[] = [
  { name: '&amp;', char: '&', label: 'Ampersand' },
  { name: '&lt;', char: '<', label: 'Less than' },
  { name: '&gt;', char: '>', label: 'Greater than' },
  { name: '&quot;', char: '"', label: 'Double quote' },
  { name: '&#39;', char: "'", label: 'Apostrophe' },
  { name: '&nbsp;', char: '\u00a0', label: 'Non-breaking space' },
  { name: '&copy;', char: '©', label: 'Copyright' },
  { name: '&reg;', char: '®', label: 'Registered' },
  { name: '&trade;', char: '™', label: 'Trademark' },
  { name: '&euro;', char: '€', label: 'Euro' },
  { name: '&mdash;', char: '—', label: 'Em dash' },
  { name: '&hellip;', char: '…', label: 'Ellipsis' }
]
