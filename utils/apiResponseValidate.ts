import {
  validateAgainstSchema,
  type SchemaValidationError
} from '@/utils/jsonSchema'

export type IssueKind =
  | 'missing'
  | 'unexpected'
  | 'type-mismatch'
  | 'value-mismatch'
  | 'array-length'

export const ISSUE_KIND_LABELS: Record<IssueKind, string> = {
  missing: 'Missing',
  unexpected: 'Unexpected',
  'type-mismatch': 'Type mismatch',
  'value-mismatch': 'Value mismatch',
  'array-length': 'Array length'
}

export type StructureIssue = {
  /** JSONPath-like location, e.g. `$.data.items[2].id`. */
  path: string
  kind: IssueKind
  message: string
  expected?: string
  actual?: string
}

export type ArrayCompareMode =
  /** First element of the expected array is a template for every actual item. */
  | 'template'
  /** Compare element-by-element by index and report length differences. */
  | 'index'

export type StructureCompareOptions = {
  /** Report properties present in actual but absent in expected. */
  reportUnexpected: boolean
  /** Also report differing primitive values (not just types). */
  compareValues: boolean
  /** Accept `null` in the actual response where the sample has a non-null value. */
  allowNull: boolean
  arrayMode: ArrayCompareMode
}

export const DEFAULT_COMPARE_OPTIONS: StructureCompareOptions = {
  reportUnexpected: true,
  compareValues: false,
  allowNull: false,
  arrayMode: 'template'
}

type JsonKind = 'string' | 'number' | 'boolean' | 'null' | 'array' | 'object'

function kindOf(value: unknown): JsonKind {
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

const IDENTIFIER_RE = /^[A-Za-z_$][\w$]*$/

function childPath(base: string, key: string): string {
  return IDENTIFIER_RE.test(key) ? `${base}.${key}` : `${base}[${JSON.stringify(key)}]`
}

function indexPath(base: string, index: number): string {
  return `${base}[${index}]`
}

function preview(value: unknown, max = 40): string {
  let text: string
  try {
    text = JSON.stringify(value) ?? String(value)
  } catch {
    text = String(value)
  }
  return text.length > max ? `${text.slice(0, max)}…` : text
}

function compareNode(
  expected: unknown,
  actual: unknown,
  path: string,
  options: StructureCompareOptions,
  issues: StructureIssue[]
): void {
  const expectedKind = kindOf(expected)
  const actualKind = kindOf(actual)

  if (expectedKind !== actualKind) {
    // `null` in the sample is treated as "unknown / nullable" when allowNull is on.
    if (options.allowNull && (actualKind === 'null' || expectedKind === 'null')) {
      return
    }
    issues.push({
      path,
      kind: 'type-mismatch',
      message: `Expected ${expectedKind}, got ${actualKind}`,
      expected: expectedKind,
      actual: actualKind
    })
    return
  }

  if (expectedKind === 'object') {
    const exp = expected as Record<string, unknown>
    const act = actual as Record<string, unknown>
    for (const key of Object.keys(exp)) {
      const nested = childPath(path, key)
      if (!Object.prototype.hasOwnProperty.call(act, key)) {
        issues.push({
          path: nested,
          kind: 'missing',
          message: `Missing property "${key}"`,
          expected: kindOf(exp[key])
        })
        continue
      }
      compareNode(exp[key], act[key], nested, options, issues)
    }
    if (options.reportUnexpected) {
      for (const key of Object.keys(act)) {
        if (!Object.prototype.hasOwnProperty.call(exp, key)) {
          issues.push({
            path: childPath(path, key),
            kind: 'unexpected',
            message: `Unexpected property "${key}"`,
            actual: kindOf(act[key])
          })
        }
      }
    }
    return
  }

  if (expectedKind === 'array') {
    const exp = expected as unknown[]
    const act = actual as unknown[]
    if (options.arrayMode === 'template') {
      if (exp.length === 0) return
      act.forEach((item, i) => {
        compareNode(exp[0], item, indexPath(path, i), options, issues)
      })
      return
    }
    const shared = Math.min(exp.length, act.length)
    for (let i = 0; i < shared; i++) {
      compareNode(exp[i], act[i], indexPath(path, i), options, issues)
    }
    if (exp.length !== act.length) {
      issues.push({
        path,
        kind: 'array-length',
        message: `Expected ${exp.length} item(s), got ${act.length}`,
        expected: String(exp.length),
        actual: String(act.length)
      })
    }
    return
  }

  if (options.compareValues && expected !== actual) {
    issues.push({
      path,
      kind: 'value-mismatch',
      message: `Expected ${preview(expected)}, got ${preview(actual)}`,
      expected: preview(expected),
      actual: preview(actual)
    })
  }
}

/** Structural diff of `actual` against an `expected` sample. */
export function compareStructure(
  expected: unknown,
  actual: unknown,
  options: StructureCompareOptions = DEFAULT_COMPARE_OPTIONS
): StructureIssue[] {
  const issues: StructureIssue[] = []
  compareNode(expected, actual, '$', options, issues)
  return issues
}

export type ParseIssue = {
  field: 'actual' | 'expected' | 'schema'
  message: string
}

export type ValidationInput = {
  actualText: string
  expectedText: string
  schemaText: string
  options: StructureCompareOptions
}

export type ValidationReport = {
  parseIssues: ParseIssue[]
  /** null when no expected sample was provided. */
  structureIssues: StructureIssue[] | null
  /** null when no schema was provided (or it failed to parse). */
  schemaIssues: SchemaValidationError[] | null
  /** True only when something was validated and nothing failed. */
  ok: boolean
}

function tryParse(
  text: string,
  field: ParseIssue['field'],
  parseIssues: ParseIssue[]
): { ok: true; value: unknown } | { ok: false } {
  try {
    return { ok: true, value: JSON.parse(text) as unknown }
  } catch (err) {
    parseIssues.push({
      field,
      message: err instanceof Error ? err.message : 'Invalid JSON'
    })
    return { ok: false }
  }
}

/** Run structural comparison and/or schema validation. */
export async function validateApiResponse(
  input: ValidationInput
): Promise<ValidationReport> {
  const parseIssues: ParseIssue[] = []
  const hasExpected = input.expectedText.trim().length > 0
  const hasSchema = input.schemaText.trim().length > 0

  const actual = input.actualText.trim()
    ? tryParse(input.actualText, 'actual', parseIssues)
    : null
  const expected = hasExpected
    ? tryParse(input.expectedText, 'expected', parseIssues)
    : null
  const schema = hasSchema
    ? tryParse(input.schemaText, 'schema', parseIssues)
    : null

  let structureIssues: StructureIssue[] | null = null
  let schemaIssues: SchemaValidationError[] | null = null

  if (actual?.ok && expected?.ok) {
    structureIssues = compareStructure(expected.value, actual.value, input.options)
  }

  if (actual?.ok && schema?.ok) {
    if (schema.value === null || typeof schema.value !== 'object') {
      parseIssues.push({ field: 'schema', message: 'Schema must be a JSON object' })
    } else {
      try {
        const result = await validateAgainstSchema(schema.value, actual.value)
        schemaIssues = result.errors
      } catch (err) {
        parseIssues.push({
          field: 'schema',
          message: err instanceof Error ? err.message : 'Schema compilation failed'
        })
      }
    }
  }

  const validated = structureIssues !== null || schemaIssues !== null
  const ok =
    validated &&
    parseIssues.length === 0 &&
    (structureIssues?.length ?? 0) === 0 &&
    (schemaIssues?.length ?? 0) === 0

  return { parseIssues, structureIssues, schemaIssues, ok }
}

export function countIssuesByKind(
  issues: readonly StructureIssue[]
): Record<IssueKind, number> {
  const counts: Record<IssueKind, number> = {
    missing: 0,
    unexpected: 0,
    'type-mismatch': 0,
    'value-mismatch': 0,
    'array-length': 0
  }
  for (const issue of issues) counts[issue.kind]++
  return counts
}

/** Plain-text report for copy / download. */
export function formatReport(report: ValidationReport): string {
  const lines: string[] = []
  for (const p of report.parseIssues) {
    lines.push(`[PARSE:${p.field}] ${p.message}`)
  }
  if (report.structureIssues) {
    lines.push(
      report.structureIssues.length === 0
        ? '[STRUCTURE] OK - matches expected sample'
        : `[STRUCTURE] ${report.structureIssues.length} issue(s)`
    )
    for (const issue of report.structureIssues) {
      lines.push(`  ${ISSUE_KIND_LABELS[issue.kind]}  ${issue.path} - ${issue.message}`)
    }
  }
  if (report.schemaIssues) {
    lines.push(
      report.schemaIssues.length === 0
        ? '[SCHEMA] OK - valid against schema'
        : `[SCHEMA] ${report.schemaIssues.length} issue(s)`
    )
    for (const issue of report.schemaIssues) {
      lines.push(`  ${issue.path} - ${issue.message}`)
    }
  }
  return lines.join('\n')
}

export const SAMPLE_EXPECTED = JSON.stringify(
  {
    id: 1,
    name: 'Ada',
    email: 'ada@example.com',
    roles: ['admin'],
    profile: { age: 36, active: true }
  },
  null,
  2
)

export const SAMPLE_ACTUAL = JSON.stringify(
  {
    id: '1',
    name: 'Ada',
    roles: ['admin', 'dev'],
    profile: { age: '36', active: true, locale: 'en' },
    createdAt: '2026-01-01'
  },
  null,
  2
)
