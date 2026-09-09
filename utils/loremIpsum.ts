export type LoremUnit = 'words' | 'sentences' | 'paragraphs'
export type LoremStyle = 'classic' | 'realistic'
export type LoremLength = 'short' | 'medium' | 'long'
export type LoremCase = 'sentence' | 'lower' | 'upper' | 'title'
export type LoremExportFormat =
  | 'plain'
  | 'lines'
  | 'html'
  | 'list'
  | 'markdown'
  | 'json'
  | 'jsx'

export type GenerateLoremOptions = {
  unit: LoremUnit
  count: number
  style: LoremStyle
  startWithLorem?: boolean
  length?: LoremLength
  textCase?: LoremCase
}

export const MIN_COUNT = 1
export const MAX_COUNT = 50
export const MAX_WORD_COUNT = 200
export const DEFAULT_COUNT = 3
export const DEFAULT_UNIT: LoremUnit = 'paragraphs'
export const DEFAULT_STYLE: LoremStyle = 'classic'
export const DEFAULT_LENGTH: LoremLength = 'medium'
export const DEFAULT_CASE: LoremCase = 'sentence'
export const DEFAULT_EXPORT: LoremExportFormat = 'plain'

export const LOREM_UNITS: readonly LoremUnit[] = [
  'words',
  'sentences',
  'paragraphs'
]
export const LOREM_STYLES: readonly LoremStyle[] = ['classic', 'realistic']
export const LOREM_LENGTHS: readonly LoremLength[] = ['short', 'medium', 'long']
export const LOREM_CASES: readonly LoremCase[] = [
  'sentence',
  'lower',
  'upper',
  'title'
]
export const LOREM_EXPORT_FORMATS: {
  id: LoremExportFormat
  label: string
  title: string
}[] = [
  { id: 'plain', label: 'Plain', title: 'Joined text' },
  { id: 'lines', label: 'Lines', title: 'One item per line' },
  { id: 'html', label: 'HTML', title: 'Paragraph tags' },
  { id: 'list', label: 'List', title: 'HTML unordered list' },
  {
    id: 'markdown',
    label: 'Markdown',
    title: 'Markdown paragraphs or bullets'
  },
  { id: 'json', label: 'JSON', title: 'JSON string array' },
  { id: 'jsx', label: 'JSX', title: 'React fragment' }
]

type LengthConfig = {
  sentenceMin: number
  sentenceMax: number
  paraMin: number
  paraMax: number
}

const LENGTH_CONFIG: Record<LoremLength, LengthConfig> = {
  short: { sentenceMin: 5, sentenceMax: 9, paraMin: 2, paraMax: 3 },
  medium: { sentenceMin: 8, sentenceMax: 16, paraMin: 3, paraMax: 6 },
  long: { sentenceMin: 16, sentenceMax: 24, paraMin: 5, paraMax: 8 }
}

/** Traditional lipsum opener, stored as words so units can share it. */
export const CLASSIC_OPENER_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit'
] as const

const CLASSIC_WORDS = [
  'lorem',
  'ipsum',
  'dolor',
  'sit',
  'amet',
  'consectetur',
  'adipiscing',
  'elit',
  'sed',
  'do',
  'eiusmod',
  'tempor',
  'incididunt',
  'ut',
  'labore',
  'et',
  'dolore',
  'magna',
  'aliqua',
  'enim',
  'ad',
  'minim',
  'veniam',
  'quis',
  'nostrud',
  'exercitation',
  'ullamco',
  'laboris',
  'nisi',
  'aliquip',
  'ex',
  'ea',
  'commodo',
  'consequat',
  'duis',
  'aute',
  'irure',
  'in',
  'reprehenderit',
  'voluptate',
  'velit',
  'esse',
  'cillum',
  'eu',
  'fugiat',
  'nulla',
  'pariatur',
  'excepteur',
  'sint',
  'occaecat',
  'cupidatat',
  'non',
  'proident',
  'sunt',
  'culpa',
  'qui',
  'officia',
  'deserunt',
  'mollit',
  'anim',
  'id',
  'est',
  'laborum',
  'at',
  'vero',
  'eos',
  'accusamus',
  'iusto',
  'odio',
  'dignissimos',
  'ducimus',
  'blanditiis',
  'praesentium',
  'voluptatum',
  'deleniti',
  'atque',
  'corrupti',
  'quos',
  'dolores',
  'quas',
  'molestias',
  'excepturi',
  'occaecati',
  'cupiditate',
  'provident',
  'similique',
  'mollitia',
  'animi',
  'dolorum',
  'fuga',
  'harum',
  'quidem',
  'rerum',
  'facilis',
  'expedita',
  'distinctio',
  'nam',
  'libero',
  'tempore',
  'cum',
  'soluta',
  'nobis',
  'eligendi',
  'optio',
  'cumque',
  'nihil',
  'impedit',
  'quo',
  'minus',
  'maxime',
  'placeat',
  'facere',
  'possimus',
  'omnis',
  'voluptas',
  'assumenda',
  'repellendus',
  'temporibus',
  'autem',
  'quibusdam',
  'officiis',
  'debitis',
  'necessitatibus',
  'saepe',
  'eveniet',
  'voluptates',
  'repudiandae',
  'recusandae',
  'itaque',
  'earum',
  'hic',
  'tenetur',
  'sapiente',
  'delectus',
  'reiciendis',
  'voluptatibus',
  'maiores',
  'alias',
  'consequatur',
  'perferendis',
  'doloribus',
  'asperiores',
  'repellat'
] as const

const REALISTIC_WORDS = [
  'product',
  'dashboard',
  'weekly',
  'trends',
  'teams',
  'design',
  'layout',
  'spacing',
  'type',
  'heading',
  'control',
  'placeholder',
  'copy',
  'honest',
  'contrast',
  'rhythm',
  'action',
  'label',
  'scannable',
  'reader',
  'outcome',
  'detail',
  'draft',
  'mock',
  'screen',
  'viewport',
  'wrapping',
  'names',
  'dates',
  'numbers',
  'generic',
  'scenario',
  'secondary',
  'note',
  'quieter',
  'color',
  'primary',
  'message',
  'form',
  'helper',
  'field',
  'empty',
  'state',
  'appear',
  'error',
  'step',
  'navigation',
  'shrink',
  'card',
  'title',
  'meta',
  'summary',
  'table',
  'row',
  'alignment',
  'density',
  'hero',
  'headline',
  'documentation',
  'sample',
  'filler',
  'compete',
  'caption',
  'image',
  'search',
  'result',
  'snippet',
  'metadata',
  'confirmation',
  'section',
  'content',
  'button',
  'panel',
  'sidebar',
  'toolbar',
  'preview',
  'workspace',
  'project',
  'update',
  'change'
] as const

const REALISTIC_SENTENCES = [
  'The dashboard highlights weekly trends so teams can act on what changed.',
  'Use this block to check how body copy sits next to headings and controls.',
  'Placeholder text keeps the layout honest without distracting from spacing.',
  'A short paragraph is often enough to judge line length and contrast.',
  'Call-to-action labels should stay scannable even when surrounding text grows.',
  'Readers skim first, so lead with the outcome and keep supporting detail tight.',
  'This sentence exists only to fill space while the real content is still in draft.',
  'Mock copy should feel plausible so stakeholders can picture the finished screen.',
  'Longer passages help stress-test wrapping on narrow viewports and large type.',
  'Keep names, dates, and numbers generic unless the scenario needs them.',
  'Secondary notes can sit in a quieter color once the primary message is clear.',
  'Forms work best when helper text is short, specific, and next to the field.',
  'Empty states should explain what will appear here after the first action.',
  'Error messages need a next step, not only a description of what went wrong.',
  'Navigation labels stay short so they still fit when the viewport shrinks.',
  'Cards look more finished when titles, meta, and a two-line summary are present.',
  'Tables need a few realistic rows to reveal alignment, wrapping, and density.',
  'Hero sections usually want one headline, one supporting line, and one action.',
  'Documentation samples should read like the product, not like lorem ipsum.',
  'This filler is intentionally plain so it does not compete with the design.',
  'Spacing between sections is easier to judge when each block has a similar weight.',
  'Captions under images should stay brief and describe the purpose, not the pixels.',
  'Search results benefit from a title, a snippet, and a quiet metadata line.',
  'Confirmations work better when they restate what happened and what to do next.'
] as const

export function maxCountForUnit(unit: LoremUnit): number {
  return unit === 'words' ? MAX_WORD_COUNT : MAX_COUNT
}

export function isCountInRange(count: number, unit: LoremUnit): boolean {
  const max = maxCountForUnit(unit)
  return Number.isInteger(count) && count >= MIN_COUNT && count <= max
}

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1))
}

function pickFrom<T>(bank: readonly T[], last?: T): T {
  if (bank.length === 1) return bank[0]
  let next = bank[Math.floor(Math.random() * bank.length)]
  while (next === last) {
    next = bank[Math.floor(Math.random() * bank.length)]
  }
  return next
}

function takeWords(
  count: number,
  bank: readonly string[],
  prefix: readonly string[] = []
): string[] {
  const out = prefix.slice(0, count)
  while (out.length < count) {
    out.push(pickFrom(bank, out[out.length - 1]))
  }
  return out
}

function capitalizeFirst(text: string): string {
  if (!text) return text
  return text.charAt(0).toUpperCase() + text.slice(1)
}

function formatWordList(words: string[], useClassicOpener: boolean): string {
  const formatted = [...words]
  if (
    useClassicOpener &&
    formatted.length > 5 &&
    formatted[4] === 'amet' &&
    formatted[5] === 'consectetur'
  ) {
    formatted[4] = 'amet,'
  }
  return capitalizeFirst(formatted.join(' '))
}

function wordsToSentence(words: string[]): string {
  return `${capitalizeFirst(words.join(' '))}.`
}

function classicOpenerSentence(extraWords: string[] = []): string {
  const head = formatWordList([...CLASSIC_OPENER_WORDS], true)
  if (extraWords.length === 0) return `${head}.`
  return `${head} ${extraWords.join(' ')}.`
}

function generateWordList(
  count: number,
  style: LoremStyle,
  useOpener: boolean
): string[] {
  if (style === 'realistic') {
    return takeWords(count, REALISTIC_WORDS)
  }
  const prefix = useOpener ? CLASSIC_OPENER_WORDS : []
  return takeWords(count, CLASSIC_WORDS, prefix)
}

function generateClassicSentence(
  useOpener: boolean,
  cfg: LengthConfig
): string {
  const length = randInt(cfg.sentenceMin, cfg.sentenceMax)
  if (useOpener) {
    if (length <= CLASSIC_OPENER_WORDS.length) {
      return classicOpenerSentence()
    }
    const extra = takeWords(
      length - CLASSIC_OPENER_WORDS.length,
      CLASSIC_WORDS,
      []
    )
    return classicOpenerSentence(extra)
  }
  return wordsToSentence(takeWords(length, CLASSIC_WORDS))
}

function generateSentenceList(
  count: number,
  style: LoremStyle,
  useOpener: boolean,
  cfg: LengthConfig
): string[] {
  if (style === 'realistic') {
    const out: string[] = []
    let last: string | undefined
    for (let i = 0; i < count; i++) {
      const next = pickFrom(REALISTIC_SENTENCES, last)
      out.push(next)
      last = next
    }
    return out
  }

  const out: string[] = []
  for (let i = 0; i < count; i++) {
    out.push(generateClassicSentence(useOpener && i === 0, cfg))
  }
  return out
}

function generateParagraphList(
  count: number,
  style: LoremStyle,
  useOpener: boolean,
  cfg: LengthConfig
): string[] {
  const out: string[] = []
  for (let i = 0; i < count; i++) {
    const sentenceCount = randInt(cfg.paraMin, cfg.paraMax)
    out.push(
      generateSentenceList(
        sentenceCount,
        style,
        useOpener && i === 0,
        cfg
      ).join(' ')
    )
  }
  return out
}

function applyCase(text: string, textCase: LoremCase): string {
  switch (textCase) {
    case 'lower':
      return text.toLowerCase()
    case 'upper':
      return text.toUpperCase()
    case 'title':
      return text.replace(
        /[A-Za-z][A-Za-z']*/g,
        (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
    default:
      return capitalizeFirst(text)
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function joinWordParts(parts: string[]): string {
  const formatted = [...parts]
  if (
    formatted.length > 5 &&
    formatted[4].replace(/,$/, '').toLowerCase() === 'amet' &&
    formatted[5].toLowerCase() === 'consectetur'
  ) {
    if (!formatted[4].endsWith(',')) formatted[4] = `${formatted[4]},`
  }
  return formatted.join(' ')
}

function wordProse(parts: string[], textCase: LoremCase): string {
  const joined = joinWordParts(parts)
  return textCase === 'lower' ? joined : capitalizeFirst(joined)
}

function asPlain(
  parts: string[],
  unit: LoremUnit,
  textCase: LoremCase
): string {
  if (unit === 'words') return wordProse(parts, textCase)
  if (unit === 'paragraphs') return parts.join('\n\n')
  return parts.join(' ')
}

export function exportLorem(
  parts: string[],
  format: LoremExportFormat,
  unit: LoremUnit,
  textCase: LoremCase = DEFAULT_CASE
): string {
  if (parts.length === 0) return ''

  switch (format) {
    case 'plain':
      return asPlain(parts, unit, textCase)
    case 'lines':
      return parts.join('\n')
    case 'html':
      if (unit === 'words') {
        return `<p>${escapeHtml(wordProse(parts, textCase))}</p>`
      }
      return parts.map((part) => `<p>${escapeHtml(part)}</p>`).join('\n')
    case 'list':
      return `<ul>\n${parts
        .map((part) => `  <li>${escapeHtml(part)}</li>`)
        .join('\n')}\n</ul>`
    case 'markdown':
      if (unit === 'paragraphs') return parts.join('\n\n')
      return parts.map((part) => `- ${part}`).join('\n')
    case 'json':
      return JSON.stringify(parts, null, 2)
    case 'jsx': {
      if (unit === 'words') {
        return `<p>{${JSON.stringify(wordProse(parts, textCase))}}</p>`
      }
      return `<>\n${parts
        .map((part) => `  <p>{${JSON.stringify(part)}}</p>`)
        .join('\n')}\n</>`
    }
  }
}

export function generateLorem({
  unit,
  count,
  style,
  startWithLorem = false,
  length = DEFAULT_LENGTH,
  textCase = DEFAULT_CASE
}: GenerateLoremOptions): string[] {
  if (!isCountInRange(count, unit)) {
    throw new Error(
      `Count must be an integer between ${MIN_COUNT} and ${maxCountForUnit(unit)}`
    )
  }

  const useOpener = style === 'classic' && startWithLorem
  const cfg = LENGTH_CONFIG[length]

  let parts: string[]
  if (unit === 'words') {
    parts = generateWordList(count, style, useOpener)
  } else if (unit === 'sentences') {
    parts = generateSentenceList(count, style, useOpener, cfg)
  } else {
    parts = generateParagraphList(count, style, useOpener, cfg)
  }

  return parts.map((part) =>
    unit === 'words' && textCase === 'sentence'
      ? part
      : applyCase(part, textCase)
  )
}
