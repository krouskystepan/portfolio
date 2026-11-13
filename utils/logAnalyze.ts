export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL' | 'UNKNOWN'

export type LogMode = 'plain' | 'jsonl'

export const LOG_LEVELS: readonly LogLevel[] = [
  'DEBUG',
  'INFO',
  'WARN',
  'ERROR',
  'FATAL',
  'UNKNOWN'
]

/** Numeric severity for sorting / "highest level in group". */
export const LOG_LEVEL_SEVERITY: Record<LogLevel, number> = {
  UNKNOWN: 0,
  DEBUG: 1,
  INFO: 2,
  WARN: 3,
  ERROR: 4,
  FATAL: 5
}

/** Soft limit: above this the UI shows a warning and renders a capped list. */
export const LOG_SOFT_LIMIT_BYTES = 5 * 1024 * 1024

export type LogEntry = {
  /** 0-based index in the parsed entry list. */
  id: number
  /** 1-based first line in the source. */
  lineStart: number
  /** 1-based last line in the source (multi-line entries span several). */
  lineEnd: number
  level: LogLevel
  /** Message without timestamp / level prefix (best effort). */
  message: string
  /** Original text of the entry (all lines), used for export. */
  raw: string
  timestampText: string | null
  /** Epoch ms when parseable. */
  timestamp: number | null
  /** Parsed JSON object (jsonl mode only, when the line was valid JSON). */
  json: Record<string, unknown> | null
}

export type ParseResult = {
  entries: LogEntry[]
  totalLines: number
  /** jsonl mode: lines that were not valid JSON objects (kept as plain entries). */
  invalidJsonLines: number
}

export type LogFilter = {
  levels: ReadonlySet<LogLevel>
  keyword: string
  caseSensitive: boolean
  useRegex: boolean
  /** Inclusive epoch ms bounds; entries without a timestamp are excluded when set. */
  fromMs: number | null
  toMs: number | null
}

export type FilterResult = {
  entries: LogEntry[]
  /** Set when `useRegex` is on and the pattern is invalid. */
  regexError: string | null
}

export type LevelStats = {
  total: number
  counts: Record<LogLevel, number>
}

export type MessageGroup = {
  key: string
  /** First message seen for this group. */
  message: string
  count: number
  level: LogLevel
  firstLine: number
  lastLine: number
}

export type SizeWarning = {
  bytes: number
  overLimit: boolean
}

// --- Level / timestamp detection ---------------------------------------------

const LEVEL_ALIASES: Record<string, LogLevel> = {
  TRACE: 'DEBUG',
  DEBUG: 'DEBUG',
  VERBOSE: 'DEBUG',
  INFO: 'INFO',
  INFORMATION: 'INFO',
  LOG: 'INFO',
  NOTICE: 'INFO',
  WARN: 'WARN',
  WARNING: 'WARN',
  ERROR: 'ERROR',
  ERR: 'ERROR',
  SEVERE: 'ERROR',
  FATAL: 'FATAL',
  CRITICAL: 'FATAL',
  CRIT: 'FATAL',
  PANIC: 'FATAL'
}

const KEYED_LEVEL_RE =
  /\b(?:level|lvl|severity|levelname|loglevel)\s*[=:]\s*["']?([A-Za-z]+)/i
const BRACKET_LEVEL_RE =
  /[[(]\s*(trace|debug|verbose|info|notice|warn|warning|error|err|fatal|critical|crit)\s*[\])]/i
const BARE_LEVEL_RE =
  /\b(TRACE|DEBUG|VERBOSE|INFO|NOTICE|WARN|WARNING|ERROR|FATAL|CRITICAL|SEVERE|PANIC)\b/
const LEVEL_SCAN_CHARS = 200

const ISO_TIMESTAMP_RE =
  /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}(?:[.,]\d{1,9})?(?:\s?(?:Z|[+-]\d{2}:?\d{2}))?/

export function normalizeLevel(raw: string): LogLevel {
  return LEVEL_ALIASES[raw.trim().toUpperCase()] ?? 'UNKNOWN'
}

/** Detect the level in one plain-text log line. */
export function detectLevel(line: string): LogLevel {
  const head = line.length > LEVEL_SCAN_CHARS ? line.slice(0, LEVEL_SCAN_CHARS) : line
  const keyed = KEYED_LEVEL_RE.exec(head)
  if (keyed) {
    const level = normalizeLevel(keyed[1])
    if (level !== 'UNKNOWN') return level
  }
  const bracket = BRACKET_LEVEL_RE.exec(head)
  if (bracket) return normalizeLevel(bracket[1])
  const bare = BARE_LEVEL_RE.exec(head)
  if (bare) return normalizeLevel(bare[1])
  return 'UNKNOWN'
}

function parseTimestamp(text: string): number | null {
  const iso = text
    .replace(',', '.')
    .replace(/^(\d{4}-\d{2}-\d{2}) /, '$1T')
    .replace(/\s+(Z|[+-]\d{2}:?\d{2})$/, '$1')
    .replace(/([+-]\d{2})(\d{2})$/, '$1:$2')
  const ms = Date.parse(iso)
  return Number.isFinite(ms) ? ms : null
}

function detectTimestamp(line: string): {
  text: string | null
  ms: number | null
} {
  const m = ISO_TIMESTAMP_RE.exec(line.length > 120 ? line.slice(0, 120) : line)
  if (!m) return { text: null, ms: null }
  return { text: m[0], ms: parseTimestamp(m[0]) }
}

/** Strip leading timestamp / level tokens so grouping focuses on the message. */
function stripPrefix(line: string): string {
  let out = line.trim()
  out = out.replace(ISO_TIMESTAMP_RE, '')
  out = out.replace(/^[\s\-–|:[\]()]+/, '')
  out = out.replace(
    /^(?:TRACE|DEBUG|VERBOSE|INFO|NOTICE|WARN|WARNING|ERROR|FATAL|CRITICAL|SEVERE|PANIC)\b[\s:\-–|\]]*/i,
    ''
  )
  return out.trim()
}

// --- Plain parsing -------------------------------------------------------------

const CONTINUATION_RE =
  /^(?:\s+\S|\s*Traceback \(most recent call last\)|\s*Caused by:|\s*\.\.\. \d+ (?:more|common frames omitted)|\s*at\s+\S|\s*File ")/
const EXCEPTION_LINE_RE = /^[A-Za-z_][\w.]*(?:Error|Exception|Warning)(?::|$)/

function isContinuation(line: string, previous: LogEntry | undefined): boolean {
  if (!previous || line.length === 0) return false
  if (CONTINUATION_RE.test(line)) return true
  // Python-style final exception line after a traceback.
  if (EXCEPTION_LINE_RE.test(line) && /Traceback|File "/.test(previous.raw)) {
    return true
  }
  return false
}

function splitLines(text: string): string[] {
  return text.split(/\r?\n/)
}

function parsePlain(text: string): ParseResult {
  const lines = splitLines(text)
  const entries: LogEntry[] = []
  let current: LogEntry | undefined

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().length === 0) continue

    if (current && isContinuation(line, current)) {
      current.raw += `\n${line}`
      current.lineEnd = i + 1
      if (current.level === 'UNKNOWN') {
        const lvl = detectLevel(line)
        if (lvl !== 'UNKNOWN') current.level = lvl
      }
      continue
    }

    const ts = detectTimestamp(line)
    current = {
      id: entries.length,
      lineStart: i + 1,
      lineEnd: i + 1,
      level: detectLevel(line),
      message: stripPrefix(line),
      raw: line,
      timestampText: ts.text,
      timestamp: ts.ms,
      json: null
    }
    entries.push(current)
  }

  return { entries, totalLines: lines.length, invalidJsonLines: 0 }
}

// --- JSON-lines parsing --------------------------------------------------------

const JSON_LEVEL_KEYS = ['level', 'severity', 'levelname', 'lvl', 'log.level']
const JSON_MESSAGE_KEYS = ['message', 'msg', 'log', 'text', 'event']
const JSON_TIME_KEYS = ['timestamp', 'time', 'ts', '@timestamp', 'date', 'datetime']

/** pino / bunyan numeric levels. */
function numericLevel(n: number): LogLevel {
  if (n >= 60) return 'FATAL'
  if (n >= 50) return 'ERROR'
  if (n >= 40) return 'WARN'
  if (n >= 30) return 'INFO'
  if (n >= 10) return 'DEBUG'
  return 'UNKNOWN'
}

function pickKey(
  obj: Record<string, unknown>,
  keys: readonly string[]
): unknown {
  for (const key of keys) {
    if (key in obj && obj[key] !== undefined && obj[key] !== null) return obj[key]
  }
  return undefined
}

function jsonLevel(obj: Record<string, unknown>): LogLevel {
  const raw = pickKey(obj, JSON_LEVEL_KEYS)
  if (typeof raw === 'number') return numericLevel(raw)
  if (typeof raw === 'string') return normalizeLevel(raw)
  return 'UNKNOWN'
}

function jsonMessage(obj: Record<string, unknown>): string {
  const raw = pickKey(obj, JSON_MESSAGE_KEYS)
  if (typeof raw === 'string') return raw
  if (raw !== undefined) return JSON.stringify(raw)
  return ''
}

function jsonTimestamp(obj: Record<string, unknown>): {
  text: string | null
  ms: number | null
} {
  const raw = pickKey(obj, JSON_TIME_KEYS)
  if (typeof raw === 'number') {
    // seconds vs milliseconds heuristic
    const ms = raw < 1e11 ? raw * 1000 : raw
    return { text: String(raw), ms: Number.isFinite(ms) ? ms : null }
  }
  if (typeof raw === 'string') {
    const parsed = Date.parse(raw)
    return { text: raw, ms: Number.isFinite(parsed) ? parsed : null }
  }
  return { text: null, ms: null }
}

function tryParseJsonObject(line: string): Record<string, unknown> | null {
  const trimmed = line.trim()
  if (!trimmed.startsWith('{')) return null
  try {
    const value = JSON.parse(trimmed) as unknown
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      return value as Record<string, unknown>
    }
    return null
  } catch {
    return null
  }
}

function parseJsonLines(text: string): ParseResult {
  const lines = splitLines(text)
  const entries: LogEntry[] = []
  let invalid = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().length === 0) continue

    const obj = tryParseJsonObject(line)
    if (obj) {
      const ts = jsonTimestamp(obj)
      entries.push({
        id: entries.length,
        lineStart: i + 1,
        lineEnd: i + 1,
        level: jsonLevel(obj),
        message: jsonMessage(obj),
        raw: line,
        timestampText: ts.text,
        timestamp: ts.ms,
        json: obj
      })
      continue
    }

    invalid++
    const ts = detectTimestamp(line)
    entries.push({
      id: entries.length,
      lineStart: i + 1,
      lineEnd: i + 1,
      level: detectLevel(line),
      message: stripPrefix(line),
      raw: line,
      timestampText: ts.text,
      timestamp: ts.ms,
      json: null
    })
  }

  return { entries, totalLines: lines.length, invalidJsonLines: invalid }
}

export function parseLog(text: string, mode: LogMode): ParseResult {
  if (!text.trim()) return { entries: [], totalLines: 0, invalidJsonLines: 0 }
  return mode === 'jsonl' ? parseJsonLines(text) : parsePlain(text)
}

/** Heuristic: if most non-empty lines parse as JSON objects, suggest jsonl mode. */
export function detectLogMode(text: string): LogMode {
  const sample = splitLines(text.slice(0, 20000))
    .filter((l) => l.trim())
    .slice(0, 20)
  if (sample.length === 0) return 'plain'
  const jsonCount = sample.filter((l) => tryParseJsonObject(l) !== null).length
  return jsonCount / sample.length >= 0.6 ? 'jsonl' : 'plain'
}

// --- Filtering -----------------------------------------------------------------

export function createDefaultFilter(): LogFilter {
  return {
    levels: new Set<LogLevel>(LOG_LEVELS),
    keyword: '',
    caseSensitive: false,
    useRegex: false,
    fromMs: null,
    toMs: null
  }
}

export function filterEntries(
  entries: readonly LogEntry[],
  filter: LogFilter
): FilterResult {
  const keyword = filter.keyword.trim()
  let matcher: ((text: string) => boolean) | null = null
  let regexError: string | null = null

  if (keyword) {
    if (filter.useRegex) {
      try {
        const re = new RegExp(keyword, filter.caseSensitive ? '' : 'i')
        matcher = (text) => re.test(text)
      } catch (err) {
        regexError = err instanceof Error ? err.message : 'Invalid regular expression'
      }
    } else if (filter.caseSensitive) {
      matcher = (text) => text.includes(keyword)
    } else {
      const needle = keyword.toLowerCase()
      matcher = (text) => text.toLowerCase().includes(needle)
    }
  }

  const hasTimeFilter = filter.fromMs !== null || filter.toMs !== null

  const result = entries.filter((entry) => {
    if (!filter.levels.has(entry.level)) return false
    if (hasTimeFilter) {
      if (entry.timestamp === null) return false
      if (filter.fromMs !== null && entry.timestamp < filter.fromMs) return false
      if (filter.toMs !== null && entry.timestamp > filter.toMs) return false
    }
    if (matcher && !matcher(entry.raw)) return false
    return true
  })

  return { entries: regexError ? [] : result, regexError }
}

// --- Stats / grouping -----------------------------------------------------------

export function computeLevelStats(entries: readonly LogEntry[]): LevelStats {
  const counts: Record<LogLevel, number> = {
    DEBUG: 0,
    INFO: 0,
    WARN: 0,
    ERROR: 0,
    FATAL: 0,
    UNKNOWN: 0
  }
  for (const entry of entries) counts[entry.level]++
  return { total: entries.length, counts }
}

/** Collapse volatile tokens (ids, numbers, hex) so similar messages group together. */
export function normalizeMessageForGrouping(message: string): string {
  return message
    .replace(
      /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi,
      '<uuid>'
    )
    .replace(/\b0x[0-9a-f]+\b/gi, '<hex>')
    .replace(/\b[0-9a-f]{16,}\b/gi, '<hex>')
    .replace(/\d+(?:\.\d+)?/g, '<n>')
    .replace(/\s+/g, ' ')
    .trim()
}

function firstLineOf(text: string): string {
  const idx = text.indexOf('\n')
  return idx === -1 ? text : text.slice(0, idx)
}

/** Group repeated messages; returns groups with `count >= minCount`, most frequent first. */
export function groupRepeatedMessages(
  entries: readonly LogEntry[],
  minCount = 2
): MessageGroup[] {
  const map = new Map<string, MessageGroup>()

  for (const entry of entries) {
    const base = firstLineOf(entry.message) || firstLineOf(entry.raw)
    const key = normalizeMessageForGrouping(base)
    if (!key) continue
    const existing = map.get(key)
    if (existing) {
      existing.count++
      existing.lastLine = entry.lineEnd
      if (LOG_LEVEL_SEVERITY[entry.level] > LOG_LEVEL_SEVERITY[existing.level]) {
        existing.level = entry.level
      }
    } else {
      map.set(key, {
        key,
        message: base,
        count: 1,
        level: entry.level,
        firstLine: entry.lineStart,
        lastLine: entry.lineEnd
      })
    }
  }

  return [...map.values()]
    .filter((g) => g.count >= minCount)
    .sort((a, b) => b.count - a.count || a.firstLine - b.firstLine)
}

// --- Export / size ----------------------------------------------------------------

export function entriesToText(entries: readonly LogEntry[]): string {
  return entries.map((e) => e.raw).join('\n')
}

export function getSizeWarning(text: string): SizeWarning {
  // Cheap pre-check: UTF-8 is at least 1 byte per UTF-16 unit.
  const bytes =
    text.length > LOG_SOFT_LIMIT_BYTES
      ? text.length
      : new TextEncoder().encode(text).length
  return { bytes, overLimit: bytes > LOG_SOFT_LIMIT_BYTES }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
