export type AssertionKind =
  | 'exists'
  | 'type'
  | 'equals'
  | 'contains'
  | 'arrayLength'

export type JsonValueType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'null'
  | 'array'
  | 'object'

export type LengthOperator = 'eq' | 'gte' | 'lte'

export type SnippetFormat = 'expect' | 'generic'

export const ASSERTION_KINDS: readonly AssertionKind[] = [
  'exists',
  'type',
  'equals',
  'contains',
  'arrayLength'
]

export const ASSERTION_KIND_LABELS: Record<AssertionKind, string> = {
  exists: 'Exists',
  type: 'Type',
  equals: 'Equals',
  contains: 'Contains',
  arrayLength: 'Array length'
}

export const JSON_VALUE_TYPES: readonly JsonValueType[] = [
  'string',
  'number',
  'boolean',
  'null',
  'array',
  'object'
]

export const LENGTH_OPERATOR_LABELS: Record<LengthOperator, string> = {
  eq: '=',
  gte: '≥',
  lte: '≤'
}

export type AssertionCheck = {
  id: string
  kind: AssertionKind
  /** Dot path (`user.items[0].id`) or JSONPath (starts with `$`). */
  path: string
  /**
   * Raw user input.
   * - type: a JsonValueType
   * - equals: JSON literal (falls back to a plain string)
   * - contains: JSON literal / substring / key
   * - arrayLength: integer
   */
  expected: string
  lengthOp: LengthOperator
}

export type AssertionResult = {
  check: AssertionCheck
  passed: boolean
  /** Human description, e.g. `user.id equals 42`. */
  description: string
  /** Short explanation of what was found. */
  detail: string
  /** Type of the resolved value (null when path not found). */
  actualType: JsonValueType | null
  /** Config / path errors (invalid expected value, bad JSONPath, ...). */
  error: string | null
}

export type PathSyntax = 'dot' | 'jsonpath'

export type PathSegment = string | number

export type Resolved =
  | { ok: true; found: boolean; value: unknown; matchCount: number }
  | { ok: false; error: string }

let checkCounter = 0

export function makeCheckId(): string {
  checkCounter += 1
  return `check-${checkCounter}`
}

export function createCheck(
  kind: AssertionKind = 'exists',
  path = ''
): AssertionCheck {
  return {
    id: makeCheckId(),
    kind,
    path,
    expected: kind === 'type' ? 'string' : kind === 'arrayLength' ? '1' : '',
    lengthOp: 'eq'
  }
}

export function detectPathSyntax(path: string): PathSyntax {
  return path.trim().startsWith('$') ? 'jsonpath' : 'dot'
}

export function getJsonType(value: unknown): JsonValueType {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return 'number'
    case 'boolean':
      return 'boolean'
    default:
      return 'object'
  }
}

export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (typeof a !== typeof b) return false
  if (a === null || b === null) return false
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) {
      return false
    }
    return a.every((item, i) => deepEqual(item, b[i]))
  }
  if (typeof a === 'object' && typeof b === 'object') {
    const ao = a as Record<string, unknown>
    const bo = b as Record<string, unknown>
    const aKeys = Object.keys(ao)
    const bKeys = Object.keys(bo)
    if (aKeys.length !== bKeys.length) return false
    return aKeys.every(
      (key) => Object.prototype.hasOwnProperty.call(bo, key) && deepEqual(ao[key], bo[key])
    )
  }
  return false
}

// --- Dot paths ---------------------------------------------------------------------

const IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/

/** Parse `a.b[0]["x y"].c` into segments. Throws on invalid syntax. */
export function parseDotPath(path: string): PathSegment[] {
  const s = path.trim()
  if (s === '' || s === '.') return []
  const segments: PathSegment[] = []
  let i = 0
  while (i < s.length) {
    const ch = s[i]
    if (ch === '.') {
      i++
      continue
    }
    if (ch === '[') {
      const end = s.indexOf(']', i)
      if (end === -1) throw new Error(`Unclosed "[" in path "${path}"`)
      const inner = s.slice(i + 1, end).trim()
      if (/^\d+$/.test(inner)) {
        segments.push(Number(inner))
      } else if (/^(["']).*\1$/.test(inner)) {
        segments.push(inner.slice(1, -1))
      } else {
        throw new Error(`Invalid bracket segment "[${inner}]" in path "${path}"`)
      }
      i = end + 1
      continue
    }
    let j = i
    while (j < s.length && s[j] !== '.' && s[j] !== '[') j++
    segments.push(s.slice(i, j))
    i = j
  }
  return segments
}

/** Format segments as a dot path (brackets for indexes / unusual keys). */
export function formatDotPath(segments: readonly PathSegment[]): string {
  let out = ''
  for (const seg of segments) {
    if (typeof seg === 'number') out += `[${seg}]`
    else if (IDENTIFIER_RE.test(seg)) out += out ? `.${seg}` : seg
    else out += `[${JSON.stringify(seg)}]`
  }
  return out
}

function resolveDotPath(data: unknown, path: string): Resolved {
  let segments: PathSegment[]
  try {
    segments = parseDotPath(path)
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Invalid path' }
  }
  let current: unknown = data
  for (const seg of segments) {
    if (typeof seg === 'number') {
      if (!Array.isArray(current) || seg >= current.length) {
        return { ok: true, found: false, value: undefined, matchCount: 0 }
      }
      current = current[seg]
    } else {
      if (
        current === null ||
        typeof current !== 'object' ||
        Array.isArray(current) ||
        !Object.prototype.hasOwnProperty.call(current, seg)
      ) {
        return { ok: true, found: false, value: undefined, matchCount: 0 }
      }
      current = (current as Record<string, unknown>)[seg]
    }
  }
  return { ok: true, found: true, value: current, matchCount: 1 }
}

async function resolveJsonPath(data: unknown, path: string): Promise<Resolved> {
  try {
    const { JSONPath } = await import('jsonpath-plus')
    if (data === null || typeof data !== 'object') {
      const isRoot = path.trim() === '$'
      return isRoot
        ? { ok: true, found: true, value: data, matchCount: 1 }
        : { ok: true, found: false, value: undefined, matchCount: 0 }
    }
    const out: unknown = JSONPath({
      path: path.trim(),
      json: data,
      wrap: true
    })
    const matches = Array.isArray(out) ? (out as unknown[]) : []
    return {
      ok: true,
      found: matches.length > 0,
      value: matches[0],
      matchCount: matches.length
    }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'JSONPath evaluation failed'
    }
  }
}

export async function resolvePath(data: unknown, path: string): Promise<Resolved> {
  return detectPathSyntax(path) === 'jsonpath'
    ? resolveJsonPath(data, path)
    : resolveDotPath(data, path)
}

// --- Expected value parsing ---------------------------------------------------------

/** Parse user input as JSON; fall back to the raw string. */
export function parseExpectedLiteral(input: string): unknown {
  const trimmed = input.trim()
  if (trimmed === '') return ''
  try {
    return JSON.parse(trimmed) as unknown
  } catch {
    return input
  }
}

function parseLength(input: string): number | null {
  const n = Number(input.trim())
  return Number.isInteger(n) && n >= 0 ? n : null
}

function preview(value: unknown, max = 60): string {
  let text: string
  try {
    text = JSON.stringify(value) ?? String(value)
  } catch {
    text = String(value)
  }
  return text.length > max ? `${text.slice(0, max)}…` : text
}

export function describeCheck(check: AssertionCheck): string {
  const path = check.path.trim() || '(root)'
  switch (check.kind) {
    case 'exists':
      return `${path} exists`
    case 'type':
      return `${path} is of type ${check.expected || '?'}`
    case 'equals':
      return `${path} equals ${preview(parseExpectedLiteral(check.expected))}`
    case 'contains':
      return `${path} contains ${preview(parseExpectedLiteral(check.expected))}`
    case 'arrayLength':
      return `${path} has length ${LENGTH_OPERATOR_LABELS[check.lengthOp]} ${check.expected || '?'}`
  }
}

// --- Evaluation ------------------------------------------------------------------------

function evaluateResolved(
  check: AssertionCheck,
  resolved: Extract<Resolved, { ok: true }>
): Omit<AssertionResult, 'check' | 'description'> {
  const { found, value } = resolved
  const actualType = found ? getJsonType(value) : null
  const base = { actualType, error: null as string | null }

  if (check.kind === 'exists') {
    return {
      ...base,
      passed: found,
      detail: found
        ? `Found ${actualType} ${preview(value)}`
        : 'Path not found'
    }
  }

  if (!found) {
    return { ...base, passed: false, detail: 'Path not found' }
  }

  switch (check.kind) {
    case 'type': {
      const passed = actualType === check.expected
      return {
        ...base,
        passed,
        detail: passed
          ? `Value is ${actualType}`
          : `Expected ${check.expected || '?'}, got ${actualType}`
      }
    }
    case 'equals': {
      const expected = parseExpectedLiteral(check.expected)
      const passed = deepEqual(value, expected)
      return {
        ...base,
        passed,
        detail: passed
          ? `Matches ${preview(value)}`
          : `Expected ${preview(expected)}, got ${preview(value)}`
      }
    }
    case 'contains': {
      const expected = parseExpectedLiteral(check.expected)
      if (typeof value === 'string') {
        const needle = typeof expected === 'string' ? expected : check.expected.trim()
        const passed = value.includes(needle)
        return {
          ...base,
          passed,
          detail: passed
            ? `String contains ${preview(needle)}`
            : `String ${preview(value)} does not contain ${preview(needle)}`
        }
      }
      if (Array.isArray(value)) {
        const passed = value.some((item) => deepEqual(item, expected))
        return {
          ...base,
          passed,
          detail: passed
            ? `Array contains ${preview(expected)}`
            : `Array ${preview(value)} does not contain ${preview(expected)}`
        }
      }
      if (value !== null && typeof value === 'object') {
        const key = typeof expected === 'string' ? expected : check.expected.trim()
        const passed = Object.prototype.hasOwnProperty.call(value, key)
        return {
          ...base,
          passed,
          detail: passed
            ? `Object has key ${preview(key)}`
            : `Object has no key ${preview(key)}`
        }
      }
      return {
        ...base,
        passed: false,
        detail: `"contains" needs a string, array, or object (got ${actualType})`
      }
    }
    case 'arrayLength': {
      const expectedLen = parseLength(check.expected)
      if (expectedLen === null) {
        return {
          ...base,
          passed: false,
          error: 'Expected length must be a non-negative integer',
          detail: 'Invalid expected length'
        }
      }
      if (!Array.isArray(value)) {
        return {
          ...base,
          passed: false,
          detail: `Value is ${actualType}, not an array`
        }
      }
      const len = value.length
      const passed =
        check.lengthOp === 'eq'
          ? len === expectedLen
          : check.lengthOp === 'gte'
            ? len >= expectedLen
            : len <= expectedLen
      return {
        ...base,
        passed,
        detail: `Length is ${len} (expected ${LENGTH_OPERATOR_LABELS[check.lengthOp]} ${expectedLen})`
      }
    }
  }
}

export async function evaluateCheck(
  data: unknown,
  check: AssertionCheck
): Promise<AssertionResult> {
  const description = describeCheck(check)
  const resolved = await resolvePath(data, check.path)
  if (!resolved.ok) {
    return {
      check,
      passed: false,
      description,
      detail: resolved.error,
      actualType: null,
      error: resolved.error
    }
  }
  return { check, description, ...evaluateResolved(check, resolved) }
}

export async function evaluateChecks(
  data: unknown,
  checks: readonly AssertionCheck[]
): Promise<AssertionResult[]> {
  return Promise.all(checks.map((check) => evaluateCheck(data, check)))
}

// --- Suggest checks from a sample ----------------------------------------------------------

const MAX_SUGGESTED_CHECKS = 60
const MAX_SUGGEST_DEPTH = 6
const MAX_ARRAY_ITEMS_SAMPLED = 1

/** Generate `type` / `equals` / `arrayLength` checks for each leaf in the sample. */
export function suggestChecks(data: unknown): AssertionCheck[] {
  const checks: AssertionCheck[] = []

  const push = (
    kind: AssertionKind,
    segments: readonly PathSegment[],
    expected: string,
    lengthOp: LengthOperator = 'eq'
  ) => {
    if (checks.length >= MAX_SUGGESTED_CHECKS) return
    checks.push({
      id: makeCheckId(),
      kind,
      path: formatDotPath(segments),
      expected,
      lengthOp
    })
  }

  const walk = (value: unknown, segments: PathSegment[], depth: number) => {
    if (checks.length >= MAX_SUGGESTED_CHECKS) return
    const type = getJsonType(value)
    if (segments.length > 0) push('type', segments, type)

    if (type === 'object') {
      if (depth >= MAX_SUGGEST_DEPTH) return
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        walk(nested, [...segments, key], depth + 1)
      }
      return
    }
    if (type === 'array') {
      const arr = value as unknown[]
      if (segments.length > 0) push('arrayLength', segments, String(arr.length))
      if (depth >= MAX_SUGGEST_DEPTH) return
      arr.slice(0, MAX_ARRAY_ITEMS_SAMPLED).forEach((item, i) => {
        walk(item, [...segments, i], depth + 1)
      })
      return
    }
    if (segments.length > 0) {
      push('equals', segments, JSON.stringify(value))
    }
  }

  walk(data, [], 0)
  return checks
}

/** List dot paths found in a sample (for path autocomplete). */
export function collectPaths(data: unknown, max = 200): string[] {
  const out: string[] = []
  const walk = (value: unknown, segments: PathSegment[], depth: number) => {
    if (out.length >= max || depth > MAX_SUGGEST_DEPTH) return
    if (segments.length > 0) out.push(formatDotPath(segments))
    if (Array.isArray(value)) {
      value.slice(0, 3).forEach((item, i) => walk(item, [...segments, i], depth + 1))
    } else if (value !== null && typeof value === 'object') {
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        walk(nested, [...segments, key], depth + 1)
      }
    }
  }
  walk(data, [], 0)
  return out
}

// --- Snippets ---------------------------------------------------------------------------------

function toJsAccessor(path: string, root: string): string | null {
  if (detectPathSyntax(path) === 'jsonpath') return null
  try {
    const segments = parseDotPath(path)
    let out = root
    for (const seg of segments) {
      if (typeof seg === 'number') out += `[${seg}]`
      else if (IDENTIFIER_RE.test(seg)) out += `.${seg}`
      else out += `[${JSON.stringify(seg)}]`
    }
    return out
  } catch {
    return null
  }
}

function expectLines(result: AssertionResult): string[] {
  const { check } = result
  const isJsonPath = detectPathSyntax(check.path) === 'jsonpath'
  const pathLiteral = JSON.stringify(check.path.trim())
  const matches = `JSONPath({ path: ${pathLiteral}, json: body, wrap: true })`
  const accessor = isJsonPath
    ? `${matches}[0]`
    : toJsAccessor(check.path, 'body') ?? `body /* invalid path: ${check.path} */`

  switch (check.kind) {
    case 'exists':
      return isJsonPath
        ? [`expect(${matches}.length).toBeGreaterThan(0)`]
        : [`expect(${accessor}).toBeDefined()`]
    case 'type':
      switch (check.expected) {
        case 'null':
          return [`expect(${accessor}).toBeNull()`]
        case 'array':
          return [`expect(Array.isArray(${accessor})).toBe(true)`]
        case 'object':
          return [
            `expect(typeof ${accessor}).toBe('object')`,
            `expect(${accessor}).not.toBeNull()`,
            `expect(Array.isArray(${accessor})).toBe(false)`
          ]
        default:
          return [`expect(typeof ${accessor}).toBe(${JSON.stringify(check.expected)})`]
      }
    case 'equals': {
      const expected = parseExpectedLiteral(check.expected)
      const literal = JSON.stringify(expected)
      const matcher =
        expected !== null && typeof expected === 'object' ? 'toEqual' : 'toBe'
      return [`expect(${accessor}).${matcher}(${literal})`]
    }
    case 'contains': {
      const expected = parseExpectedLiteral(check.expected)
      const literal = JSON.stringify(expected)
      switch (result.actualType) {
        case 'array':
          return [`expect(${accessor}).toContainEqual(${literal})`]
        case 'object':
          return [
            `expect(${accessor}).toHaveProperty(${JSON.stringify(typeof expected === 'string' ? expected : check.expected.trim())})`
          ]
        default:
          return [
            `expect(${accessor}).toContain(${JSON.stringify(typeof expected === 'string' ? expected : check.expected.trim())})`
          ]
      }
    }
    case 'arrayLength': {
      const n = parseLength(check.expected) ?? 0
      if (check.lengthOp === 'eq') return [`expect(${accessor}).toHaveLength(${n})`]
      if (check.lengthOp === 'gte') {
        return [`expect(${accessor}.length).toBeGreaterThanOrEqual(${n})`]
      }
      return [`expect(${accessor}.length).toBeLessThanOrEqual(${n})`]
    }
  }
}

function genericLine(check: AssertionCheck): string {
  const path = check.path.trim() || '$'
  switch (check.kind) {
    case 'exists':
      return `ASSERT EXISTS   ${path}`
    case 'type':
      return `ASSERT TYPE     ${path} == ${JSON.stringify(check.expected)}`
    case 'equals':
      return `ASSERT EQUALS   ${path} == ${JSON.stringify(parseExpectedLiteral(check.expected))}`
    case 'contains':
      return `ASSERT CONTAINS ${path} ∋ ${JSON.stringify(parseExpectedLiteral(check.expected))}`
    case 'arrayLength': {
      const op = check.lengthOp === 'eq' ? '==' : check.lengthOp === 'gte' ? '>=' : '<='
      return `ASSERT LENGTH   ${path} ${op} ${parseLength(check.expected) ?? '?'}`
    }
  }
}

/** Build a copyable snippet for all checks. Uses evaluated results to refine output. */
export function buildSnippet(
  results: readonly AssertionResult[],
  format: SnippetFormat
): string {
  if (results.length === 0) return ''

  if (format === 'generic') {
    return [
      '# Generic assertions (dot path or JSONPath)',
      ...results.map((r) => genericLine(r.check))
    ].join('\n')
  }

  const usesJsonPath = results.some(
    (r) => detectPathSyntax(r.check.path) === 'jsonpath'
  )
  const header = [
    ...(usesJsonPath ? ["import { JSONPath } from 'jsonpath-plus'", ''] : []),
    '// Jest / Vitest style - `body` is the parsed JSON response',
    '// const body = await response.json()',
    ''
  ]

  const body = results.flatMap((r) => [`// ${r.description}`, ...expectLines(r)])
  return [...header, ...body].join('\n')
}

/** Human-readable list for copy / plain output. */
export function buildHumanList(results: readonly AssertionResult[]): string {
  return results
    .map((r, i) => `${i + 1}. [${r.passed ? 'PASS' : 'FAIL'}] ${r.description} - ${r.detail}`)
    .join('\n')
}
