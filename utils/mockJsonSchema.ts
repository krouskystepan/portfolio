/**
 * Subset of JSON Schema (draft-07-ish) → MockField paths for the mock data tool.
 * Unsupported constructs produce warnings or errors rather than silent wrong data.
 */

import type { JSONSchema7, JSONSchema7Definition } from 'json-schema'
import {
  DEFAULT_ARRAY_MAX,
  DEFAULT_ARRAY_MIN,
  DEFAULT_CUSTOM_PATTERN,
  DEFAULT_NUMBER_DECIMALS,
  DEFAULT_NUMBER_MAX,
  DEFAULT_NUMBER_MIN,
  MAX_ARRAY_LENGTH,
  MAX_ENUM_VALUES,
  MAX_FIELDS,
  MAX_NUMBER_DECIMALS,
  MAX_PATH_DEPTH,
  MIN_ARRAY_LENGTH,
  type MockField
} from './mockData'
import { patternError as patternHasError } from './mockPattern'

export type JsonSchemaConvertResult = {
  fields: MockField[]
  arrayMin: number
  arrayMax: number
  warnings: string[]
}

export const SAMPLE_MOCK_JSON_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "id": { "type": "string", "format": "uuid" },
    "customer": {
      "type": "object",
      "properties": {
        "name": { "type": "string" },
        "email": { "type": "string", "format": "email" },
        "phone": { "type": "string", "format": "phone" }
      }
    },
    "status": {
      "type": "string",
      "enum": ["pending", "paid", "shipped", "cancelled"]
    },
    "active": { "type": "boolean" },
    "total": { "type": "number", "minimum": 1, "maximum": 500 },
    "items": {
      "type": "array",
      "minItems": 1,
      "maxItems": 3,
      "items": {
        "type": "object",
        "properties": {
          "sku": { "type": "string", "pattern": "[A-Z]{3}-\\\\d{4}" },
          "qty": { "type": "integer", "minimum": 1, "maximum": 5 }
        }
      }
    },
    "createdAt": { "type": "string", "format": "date-time" }
  },
  "required": ["id", "customer", "status"]
}`

function isSchemaObject(
  def: JSONSchema7Definition | undefined
): def is JSONSchema7 {
  return typeof def === 'object' && def !== null
}

function primaryType(schema: JSONSchema7): string | null {
  const t = schema.type
  if (Array.isArray(t)) {
    const nonNull = t.filter((x) => x !== 'null')
    if (nonNull.length === 0) return 'null'
    return String(nonNull[0])
  }
  if (typeof t === 'string') return t
  if (schema.properties) return 'object'
  if (schema.items) return 'array'
  if (schema.enum) return null
  if (schema.const !== undefined) return null
  return null
}

function pathDepth(path: string): number {
  if (!path) return 0
  return path.split('.').length
}

function clampInt(value: number, lo: number, hi: number): number {
  if (!Number.isFinite(value)) return lo
  return Math.min(hi, Math.max(lo, Math.trunc(value)))
}

function heuristicStringType(
  key: string,
  format: string | undefined
): MockField['type'] | 'custom' {
  const fmt = (format ?? '').toLowerCase()
  if (fmt === 'email') return 'email'
  if (fmt === 'uuid' || fmt === 'guid') return 'uuid'
  if (fmt === 'date') return 'date'
  if (fmt === 'date-time' || fmt === 'datetime') return 'datetime'
  if (fmt === 'phone' || fmt === 'tel') return 'phone'

  const leaf = key.replace(/\[\]$/, '').split('.').pop()?.toLowerCase() ?? ''
  if (leaf === 'email' || leaf.endsWith('email')) return 'email'
  if (leaf === 'phone' || leaf === 'tel' || leaf === 'mobile') return 'phone'
  if (leaf === 'address' || leaf.endsWith('address')) return 'address'
  if (
    leaf === 'name' ||
    leaf === 'fullname' ||
    leaf === 'full_name' ||
    leaf === 'displayname'
  ) {
    return 'fullName'
  }
  if (leaf === 'id' || leaf.endsWith('uuid') || leaf.endsWith('guid')) {
    return 'uuid'
  }
  if (leaf === 'createdat' || leaf === 'updatedat' || leaf.endsWith('at')) {
    return 'datetime'
  }
  if (leaf === 'date' || leaf.endsWith('date')) return 'date'
  return 'custom'
}

function numberField(
  key: string,
  schema: JSONSchema7,
  integer: boolean
): MockField {
  let min =
    typeof schema.minimum === 'number'
      ? schema.minimum
      : typeof schema.exclusiveMinimum === 'number'
        ? schema.exclusiveMinimum
        : DEFAULT_NUMBER_MIN
  let max =
    typeof schema.maximum === 'number'
      ? schema.maximum
      : typeof schema.exclusiveMaximum === 'number'
        ? schema.exclusiveMaximum
        : DEFAULT_NUMBER_MAX
  if (min > max) {
    const swap = min
    min = max
    max = swap
  }
  const decimals = integer
    ? 0
    : typeof schema.multipleOf === 'number' && schema.multipleOf > 0
      ? Math.min(
          MAX_NUMBER_DECIMALS,
          Math.max(
            0,
            Math.ceil(-Math.log10(schema.multipleOf))
          )
        )
      : Math.max(DEFAULT_NUMBER_DECIMALS, 2)
  return { key, type: 'number', min, max, decimals }
}

function enumField(key: string, values: unknown[]): MockField | null {
  const strings = values
    .filter((v): v is string | number | boolean =>
      ['string', 'number', 'boolean'].includes(typeof v)
    )
    .map((v) => String(v))
  const unique = [...new Set(strings)].slice(0, MAX_ENUM_VALUES)
  if (unique.length === 0) return null
  return { key, type: 'enum', values: unique }
}

type WalkCtx = {
  fields: MockField[]
  warnings: string[]
  arrayMin: number
  arrayMax: number
  sawArray: boolean
}

function noteUnsupported(ctx: WalkCtx, feature: string, path: string) {
  const where = path || '(root)'
  ctx.warnings.push(`Ignored ${feature} at ${where}.`)
}

function resolveComposed(schema: JSONSchema7, path: string, ctx: WalkCtx): JSONSchema7 {
  if (schema.oneOf && schema.oneOf.length > 0) {
    noteUnsupported(ctx, 'oneOf (using first branch)', path)
    const first = schema.oneOf[0]
    return isSchemaObject(first) ? first : schema
  }
  if (schema.anyOf && schema.anyOf.length > 0) {
    noteUnsupported(ctx, 'anyOf (using first branch)', path)
    const first = schema.anyOf[0]
    return isSchemaObject(first) ? first : schema
  }
  if (schema.allOf && schema.allOf.length > 0) {
    noteUnsupported(ctx, 'allOf (using first branch)', path)
    const first = schema.allOf[0]
    return isSchemaObject(first) ? first : schema
  }
  return schema
}

function addLeaf(key: string, schema: JSONSchema7, ctx: WalkCtx): void {
  if (ctx.fields.length >= MAX_FIELDS) {
    ctx.warnings.push(`Stopped at ${MAX_FIELDS} fields (limit).`)
    return
  }
  if (pathDepth(key) > MAX_PATH_DEPTH) {
    ctx.warnings.push(`Skipped "${key}" (deeper than ${MAX_PATH_DEPTH} levels).`)
    return
  }

  if (schema.const !== undefined) {
    const field = enumField(key, [schema.const])
    if (field) ctx.fields.push(field)
    else ctx.warnings.push(`Skipped const at "${key}" (unsupported value).`)
    return
  }

  if (Array.isArray(schema.enum)) {
    const field = enumField(key, schema.enum)
    if (field) ctx.fields.push(field)
    else ctx.warnings.push(`Skipped enum at "${key}" (no usable values).`)
    return
  }

  const type = primaryType(schema)

  if (type === 'boolean') {
    ctx.fields.push({ key, type: 'boolean' })
    return
  }

  if (type === 'integer') {
    ctx.fields.push(numberField(key, schema, true))
    return
  }

  if (type === 'number') {
    ctx.fields.push(numberField(key, schema, false))
    return
  }

  if (type === 'null') {
    ctx.warnings.push(`Skipped null-only field "${key}".`)
    return
  }

  // string or untyped leaf
  const format =
    typeof schema.format === 'string' ? schema.format : undefined
  const mapped = heuristicStringType(key, format)

  if (mapped === 'custom') {
    const pattern =
      typeof schema.pattern === 'string' && schema.pattern.trim()
        ? schema.pattern
        : DEFAULT_CUSTOM_PATTERN
    const err = patternHasError(pattern)
    if (err) {
      ctx.warnings.push(
        `"${key}": pattern not supported (${err}); using ${DEFAULT_CUSTOM_PATTERN}.`
      )
      ctx.fields.push({
        key,
        type: 'custom',
        pattern: DEFAULT_CUSTOM_PATTERN
      })
      return
    }
    ctx.fields.push({ key, type: 'custom', pattern })
    return
  }

  ctx.fields.push({ key, type: mapped })
}

function walk(
  schemaIn: JSONSchema7,
  path: string,
  ctx: WalkCtx
): void {
  if (schemaIn.$ref) {
    noteUnsupported(ctx, '$ref', path)
    return
  }
  if (schemaIn.not) noteUnsupported(ctx, 'not', path)
  if (schemaIn.if || schemaIn.then || schemaIn.else) {
    noteUnsupported(ctx, 'if/then/else', path)
  }

  const schema = resolveComposed(schemaIn, path, ctx)

  if (schema.const !== undefined || Array.isArray(schema.enum)) {
    if (!path) {
      ctx.warnings.push('Root enum/const schemas are not supported.')
      return
    }
    addLeaf(path, schema, ctx)
    return
  }

  const type = primaryType(schema)

  if (type === 'object' || (!type && schema.properties)) {
    const props = schema.properties ?? {}
    const keys = Object.keys(props)
    if (keys.length === 0) {
      ctx.warnings.push(
        path
          ? `Object "${path}" has no properties.`
          : 'Root object has no properties.'
      )
      return
    }
    for (const key of keys) {
      const def = props[key]
      if (!isSchemaObject(def)) {
        if (def === true) {
          addLeaf(path ? `${path}.${key}` : key, { type: 'string' }, ctx)
        } else {
          ctx.warnings.push(`Skipped "${path ? `${path}.` : ''}${key}" (not a schema object).`)
        }
        continue
      }
      const next = path ? `${path}.${key}` : key
      walk(def, next, ctx)
    }
    return
  }

  if (type === 'array' || (!type && schema.items)) {
    if (!path) {
      throw new Error(
        'Root type "array" is not supported — use an object schema; record count controls how many objects are generated.'
      )
    }
    ctx.sawArray = true
    if (typeof schema.minItems === 'number') {
      ctx.arrayMin = clampInt(schema.minItems, MIN_ARRAY_LENGTH, MAX_ARRAY_LENGTH)
    }
    if (typeof schema.maxItems === 'number') {
      ctx.arrayMax = clampInt(schema.maxItems, MIN_ARRAY_LENGTH, MAX_ARRAY_LENGTH)
    }
    if (ctx.arrayMin > ctx.arrayMax) {
      const t = ctx.arrayMin
      ctx.arrayMin = ctx.arrayMax
      ctx.arrayMax = t
    }

    const items = schema.items
    if (Array.isArray(items)) {
      throw new Error(
        `Tuple "items" arrays are not supported at "${path}" — use a single items schema.`
      )
    }
    if (!isSchemaObject(items)) {
      // boolean true / missing → array of strings
      addLeaf(`${path}[]`, { type: 'string' }, ctx)
      return
    }
    const itemSchema = resolveComposed(items, `${path}[]`, ctx)
    const itemType = primaryType(itemSchema)
    if (
      itemType === 'object' ||
      (!itemType && itemSchema.properties) ||
      itemSchema.properties
    ) {
      const props = itemSchema.properties ?? {}
      if (Object.keys(props).length === 0) {
        ctx.warnings.push(`Array "${path}" item object has no properties.`)
        return
      }
      for (const key of Object.keys(props)) {
        const def = props[key]
        if (!isSchemaObject(def)) {
          if (def === true) {
            addLeaf(`${path}[].${key}`, { type: 'string' }, ctx)
          }
          continue
        }
        walk(def, `${path}[].${key}`, ctx)
      }
      return
    }
    addLeaf(`${path}[]`, itemSchema, ctx)
    return
  }

  if (!path) {
    throw new Error(
      'Root schema must be type "object" with properties (subset of draft-07).'
    )
  }
  addLeaf(path, schema, ctx)
}

/** Convert a JSON Schema object into mock field paths. */
export function jsonSchemaToMockFields(
  schema: unknown
): JsonSchemaConvertResult {
  if (!isSchemaObject(schema as JSONSchema7Definition)) {
    throw new Error('Schema must be a JSON object.')
  }
  const root = schema as JSONSchema7
  const ctx: WalkCtx = {
    fields: [],
    warnings: [],
    arrayMin: DEFAULT_ARRAY_MIN,
    arrayMax: DEFAULT_ARRAY_MAX,
    sawArray: false
  }
  walk(root, '', ctx)
  if (ctx.fields.length === 0) {
    throw new Error('No generatable fields found in the schema.')
  }
  // Deduplicate keys (later wins) while preserving order of first occurrence.
  const seen = new Set<string>()
  const fields: MockField[] = []
  for (const field of ctx.fields) {
    if (seen.has(field.key)) {
      ctx.warnings.push(`Duplicate key "${field.key}" — keeping the first.`)
      continue
    }
    seen.add(field.key)
    fields.push(field)
  }
  return {
    fields,
    arrayMin: ctx.sawArray ? ctx.arrayMin : DEFAULT_ARRAY_MIN,
    arrayMax: ctx.sawArray ? ctx.arrayMax : DEFAULT_ARRAY_MAX,
    warnings: ctx.warnings
  }
}

/** Parse JSON text and convert. */
export function parseJsonSchemaToMockFields(
  text: string
): JsonSchemaConvertResult {
  if (!text.trim()) throw new Error('Paste a JSON Schema first.')
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Invalid JSON'
    throw new Error(`Invalid JSON Schema: ${message}`)
  }
  return jsonSchemaToMockFields(parsed)
}

/** Soft validation message for the UI (null = ok enough to try convert). */
export function jsonSchemaTextIssue(text: string): string | null {
  if (!text.trim()) return 'Paste a JSON Schema (draft-07 subset).'
  try {
    JSON.parse(text)
    return null
  } catch (err) {
    return err instanceof Error ? err.message : 'Invalid JSON'
  }
}

/** Defaults used when the schema textarea is empty. */
export function emptySchemaConvertHint(): string {
  return `Supports object, array, string (format/pattern), number/integer (min/max), boolean, enum, and const. Root must be an object. $ref / full composition are not supported.`
}
