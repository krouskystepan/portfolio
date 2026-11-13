/**
 * JSON / CSV rows -> SQL INSERT statements (client-side, no database needed).
 * Escaping is intentionally small and per-dialect; it targets fixture / seed
 * data, not hostile input piped into a live database.
 */

export type SqlDialect = 'postgres' | 'mysql' | 'sqlite'
export type SqlInputFormat = 'auto' | 'json' | 'csv'
export type CsvDelimiter = 'auto' | 'comma' | 'semicolon' | 'tab' | 'pipe'

export type SqlValue = string | number | boolean | null

export const SQL_DIALECTS: readonly SqlDialect[] = [
  'postgres',
  'mysql',
  'sqlite'
]

export const SQL_DIALECT_LABELS: Record<SqlDialect, string> = {
  postgres: 'PostgreSQL',
  mysql: 'MySQL',
  sqlite: 'SQLite'
}

export const SQL_INPUT_FORMATS: readonly SqlInputFormat[] = [
  'auto',
  'json',
  'csv'
]

export const CSV_DELIMITERS: readonly CsvDelimiter[] = [
  'auto',
  'comma',
  'semicolon',
  'tab',
  'pipe'
]

export const DEFAULT_TABLE_NAME = 'my_table'
export const MAX_BATCH_SIZE = 5000

export type ParsedRows = {
  columns: string[]
  rows: SqlValue[][]
  /** Format actually used (resolved from `auto`). */
  format: 'json' | 'csv'
}

export type SqlInsertOptions = {
  table: string
  dialect: SqlDialect
  /** Rows per INSERT statement; 1 = one statement per row. */
  batchSize: number
  quoteIdentifiers: boolean
  /** Postgres/SQLite: ON CONFLICT DO NOTHING. MySQL: INSERT IGNORE. */
  ignoreConflicts: boolean
  wrapInTransaction: boolean
  /** Postgres only: append ::jsonb to object / array cells. */
  jsonbCast: boolean
}

export type SqlInsertResult = {
  sql: string
  statementCount: number
  rowCount: number
  warnings: string[]
}

export const DEFAULT_SQL_OPTIONS: SqlInsertOptions = {
  table: DEFAULT_TABLE_NAME,
  dialect: 'postgres',
  batchSize: 1,
  quoteIdentifiers: true,
  ignoreConflicts: false,
  wrapInTransaction: false,
  jsonbCast: false
}

// --- Escaping ---------------------------------------------------------------

/** Quote one identifier part (no dots). */
export function quoteIdentPart(name: string, dialect: SqlDialect): string {
  if (dialect === 'mysql') return `\`${name.replace(/`/g, '``')}\``
  return `"${name.replace(/"/g, '""')}"`
}

const SIMPLE_IDENT = /^[A-Za-z_][A-Za-z0-9_]*$/

function identPart(
  name: string,
  dialect: SqlDialect,
  quoteAlways: boolean
): string {
  if (!quoteAlways && SIMPLE_IDENT.test(name)) return name
  return quoteIdentPart(name, dialect)
}

/** `schema.table` -> one quoted part per dot-separated segment. */
export function formatTableName(
  table: string,
  dialect: SqlDialect,
  quoteAlways: boolean
): string {
  const parts = table
    .trim()
    .split('.')
    .map((part) => part.trim())
  return parts.map((part) => identPart(part, dialect, quoteAlways)).join('.')
}

export function tableNameIssue(table: string): string | null {
  const trimmed = table.trim()
  if (!trimmed) return 'Table name is required.'
  const parts = trimmed.split('.')
  if (parts.length > 3) return 'Use at most database.schema.table.'
  if (parts.some((part) => part.trim() === '')) {
    return 'Table name has an empty segment.'
  }
  if (/[\u0000]/.test(trimmed)) return 'Table name contains a NUL character.'
  return null
}

/** Escape a string body (without surrounding quotes). */
export function escapeSqlString(value: string, dialect: SqlDialect): string {
  if (dialect === 'mysql') {
    let out = ''
    for (const ch of value) {
      switch (ch) {
        case '\\':
          out += '\\\\'
          break
        case "'":
          out += "''"
          break
        case '\0':
          out += '\\0'
          break
        case '\n':
          out += '\\n'
          break
        case '\r':
          out += '\\r'
          break
        case '\x1a':
          out += '\\Z'
          break
        default:
          out += ch
      }
    }
    return out
  }
  // Postgres (standard_conforming_strings = on) and SQLite: only ' is special.
  return value.replace(/'/g, "''")
}

export function formatSqlValue(
  value: SqlValue,
  dialect: SqlDialect,
  options?: { jsonbCast?: boolean; asJson?: boolean }
): string {
  if (value === null) return 'NULL'
  if (typeof value === 'boolean') {
    if (dialect === 'sqlite') return value ? '1' : '0'
    return value ? 'TRUE' : 'FALSE'
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'NULL'
  }
  let text = value
  if (dialect === 'postgres' && text.includes('\0')) {
    text = text.replace(/\0/g, '')
  }
  const literal = `'${escapeSqlString(text, dialect)}'`
  if (options?.asJson && options.jsonbCast && dialect === 'postgres') {
    return `${literal}::jsonb`
  }
  return literal
}

// --- Parsing: JSON ----------------------------------------------------------

type JsonRecord = Record<string, unknown>

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Nested objects / arrays are stored as JSON text (marked via prefix map). */
function jsonCell(value: unknown): { cell: SqlValue; json: boolean } {
  if (value === null || value === undefined) return { cell: null, json: false }
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean'
  ) {
    return { cell: value, json: false }
  }
  return { cell: JSON.stringify(value), json: true }
}

function parseJsonDocument(text: string): unknown {
  try {
    return JSON.parse(text)
  } catch (firstError) {
    // NDJSON fallback: one JSON value per non-empty line.
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
    if (lines.length > 1) {
      try {
        return lines.map((line) => JSON.parse(line) as unknown)
      } catch {
        // fall through to the original error
      }
    }
    throw firstError
  }
}

export type ParsedJsonRows = ParsedRows & { jsonColumns: ReadonlySet<string> }

export function parseJsonRows(text: string): ParsedJsonRows {
  if (!text.trim()) throw new Error('Input is empty.')
  let doc: unknown
  try {
    doc = parseJsonDocument(text)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON'
    throw new Error(`Invalid JSON: ${message}`)
  }

  const list: unknown[] = Array.isArray(doc) ? doc : [doc]
  if (list.length === 0) throw new Error('JSON array is empty.')
  const records: JsonRecord[] = []
  for (let i = 0; i < list.length; i++) {
    const item = list[i]
    if (!isRecord(item)) {
      throw new Error(`Row ${i + 1} is not a JSON object.`)
    }
    records.push(item)
  }

  const columns: string[] = []
  const seen = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    }
  }
  if (columns.length === 0) throw new Error('Objects have no keys.')

  const jsonColumns = new Set<string>()
  const rows = records.map((record) =>
    columns.map((column) => {
      const { cell, json } = jsonCell(record[column])
      if (json) jsonColumns.add(column)
      return cell
    })
  )

  return { columns, rows, format: 'json', jsonColumns }
}

// --- Parsing: CSV -----------------------------------------------------------

const DELIMITER_CHAR: Record<Exclude<CsvDelimiter, 'auto'>, string> = {
  comma: ',',
  semicolon: ';',
  tab: '\t',
  pipe: '|'
}

export function detectCsvDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ''
  let best = ','
  let bestCount = 0
  for (const ch of Object.values(DELIMITER_CHAR)) {
    const count = firstLine.split(ch).length - 1
    if (count > bestCount) {
      best = ch
      bestCount = count
    }
  }
  return best
}

/** RFC 4180-style parser (quoted fields, "" escapes, embedded newlines). */
export function parseCsvText(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  const src = text.charCodeAt(0) === 0xfeff ? text.slice(1) : text

  while (i < src.length) {
    const ch = src[i]
    if (inQuotes) {
      if (ch === '"') {
        if (src[i + 1] === '"') {
          field += '"'
          i += 2
          continue
        }
        inQuotes = false
        i += 1
        continue
      }
      field += ch
      i += 1
      continue
    }
    if (ch === '"' && field === '') {
      inQuotes = true
      i += 1
      continue
    }
    if (ch === delimiter) {
      row.push(field)
      field = ''
      i += 1
      continue
    }
    if (ch === '\r' || ch === '\n') {
      row.push(field)
      field = ''
      rows.push(row)
      row = []
      if (ch === '\r' && src[i + 1] === '\n') i += 1
      i += 1
      continue
    }
    field += ch
    i += 1
  }
  if (inQuotes) throw new Error('CSV has an unterminated quoted field.')
  if (field !== '' || row.length > 0) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((r) => !(r.length === 1 && r[0] === ''))
}

const SAFE_NUMBER = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/

/** Leading zeros (zip codes, ids) and >15 digit ints stay strings. */
export function inferCsvCell(raw: string): SqlValue {
  const trimmed = raw.trim()
  if (/^null$/i.test(trimmed)) return null
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true'
  if (SAFE_NUMBER.test(trimmed)) {
    const digits = trimmed.replace(/[^0-9]/g, '')
    if (digits.length <= 15) {
      const n = Number(trimmed)
      if (Number.isFinite(n)) return n
    }
  }
  return raw
}

export type CsvParseOptions = {
  delimiter: CsvDelimiter
  inferTypes: boolean
  emptyAsNull: boolean
}

export const DEFAULT_CSV_OPTIONS: CsvParseOptions = {
  delimiter: 'auto',
  inferTypes: true,
  emptyAsNull: true
}

export function parseCsvRows(
  text: string,
  options: CsvParseOptions
): ParsedRows {
  if (!text.trim()) throw new Error('Input is empty.')
  const delimiter =
    options.delimiter === 'auto'
      ? detectCsvDelimiter(text)
      : DELIMITER_CHAR[options.delimiter]
  const table = parseCsvText(text, delimiter)
  if (table.length < 2) {
    throw new Error('CSV needs a header row and at least one data row.')
  }

  const header = table[0].map((name) => name.trim())
  if (header.some((name) => name === '')) {
    throw new Error('CSV header has an empty column name.')
  }
  if (new Set(header).size !== header.length) {
    throw new Error('CSV header has duplicate column names.')
  }

  const rows: SqlValue[][] = table.slice(1).map((cells) =>
    header.map((_, index): SqlValue => {
      const raw = cells[index] ?? ''
      if (raw === '' && options.emptyAsNull) return null
      return options.inferTypes ? inferCsvCell(raw) : raw
    })
  )

  return { columns: header, rows, format: 'csv' }
}

// --- Format detection -------------------------------------------------------

export function detectInputFormat(text: string): 'json' | 'csv' {
  const first = text.trimStart()[0]
  return first === '{' || first === '[' ? 'json' : 'csv'
}

export type ParseInput = {
  text: string
  format: SqlInputFormat
  csv: CsvParseOptions
}

export function parseSqlInput(input: ParseInput): ParsedJsonRows {
  const format =
    input.format === 'auto' ? detectInputFormat(input.text) : input.format
  if (format === 'json') return parseJsonRows(input.text)
  const csv = parseCsvRows(input.text, input.csv)
  return { ...csv, jsonColumns: new Set<string>() }
}

// --- Build INSERT -----------------------------------------------------------

export function columnListIssue(columns: readonly string[]): string | null {
  if (columns.length === 0) return 'No columns found.'
  if (columns.some((c) => c === '')) return 'Column names cannot be empty.'
  return null
}

export function buildInsertStatements(
  parsed: ParsedJsonRows,
  options: SqlInsertOptions
): SqlInsertResult {
  const tableIssue = tableNameIssue(options.table)
  if (tableIssue) throw new Error(tableIssue)
  const colIssue = columnListIssue(parsed.columns)
  if (colIssue) throw new Error(colIssue)

  const { dialect } = options
  const warnings: string[] = []
  const table = formatTableName(
    options.table,
    dialect,
    options.quoteIdentifiers
  )
  const columns = parsed.columns
    .map((name) => identPart(name, dialect, options.quoteIdentifiers))
    .join(', ')
  const batch = Math.min(
    Math.max(1, Math.floor(options.batchSize)),
    MAX_BATCH_SIZE
  )

  if (
    dialect === 'postgres' &&
    !options.quoteIdentifiers &&
    parsed.columns.some((c) => /[A-Z]/.test(c))
  ) {
    warnings.push(
      'Unquoted PostgreSQL identifiers fold to lowercase; mixed-case columns may not match.'
    )
  }
  if (dialect === 'postgres') {
    const hasNul = parsed.rows.some((row) =>
      row.some((cell) => typeof cell === 'string' && cell.includes('\0'))
    )
    if (hasNul) {
      warnings.push(
        'NUL characters were removed (PostgreSQL cannot store them).'
      )
    }
  }

  const insertKeyword =
    dialect === 'mysql' && options.ignoreConflicts
      ? 'INSERT IGNORE INTO'
      : 'INSERT INTO'
  const conflictClause =
    dialect !== 'mysql' && options.ignoreConflicts
      ? ' ON CONFLICT DO NOTHING'
      : ''

  const jsonColumnIndexes = new Set<number>()
  parsed.columns.forEach((name, index) => {
    if (parsed.jsonColumns.has(name)) jsonColumnIndexes.add(index)
  })

  const statements: string[] = []
  for (let start = 0; start < parsed.rows.length; start += batch) {
    const chunk = parsed.rows.slice(start, start + batch)
    const tuples = chunk.map((row) => {
      const cells = row.map((cell, index) =>
        formatSqlValue(cell, dialect, {
          jsonbCast: options.jsonbCast,
          asJson: jsonColumnIndexes.has(index) && typeof cell === 'string'
        })
      )
      return `(${cells.join(', ')})`
    })
    const values =
      tuples.length === 1 ? ` ${tuples[0]}` : `\n  ${tuples.join(',\n  ')}`
    statements.push(
      `${insertKeyword} ${table} (${columns}) VALUES${values}${conflictClause};`
    )
  }

  let sql = statements.join('\n')
  if (options.wrapInTransaction) {
    const begin = dialect === 'mysql' ? 'START TRANSACTION;' : 'BEGIN;'
    sql = `${begin}\n${sql}\nCOMMIT;`
  }

  return {
    sql,
    statementCount: statements.length,
    rowCount: parsed.rows.length,
    warnings
  }
}

/** Convenience: rows given as plain objects (used by the Mock Data exporter). */
export function objectsToParsedRows(
  records: readonly Record<string, unknown>[]
): ParsedJsonRows {
  const columns: string[] = []
  const seen = new Set<string>()
  for (const record of records) {
    for (const key of Object.keys(record)) {
      if (!seen.has(key)) {
        seen.add(key)
        columns.push(key)
      }
    }
  }
  const jsonColumns = new Set<string>()
  const rows = records.map((record) =>
    columns.map((column) => {
      const { cell, json } = jsonCell(record[column])
      if (json) jsonColumns.add(column)
      return cell
    })
  )
  return { columns, rows, format: 'json', jsonColumns }
}
