import {
  DEFAULT_CUSTOM_PATTERN,
  generateFromPattern,
  patternError
} from './mockPattern'
import {
  buildInsertStatements,
  objectsToParsedRows,
  tableNameIssue,
  type SqlDialect
} from './sqlInsert'

export { DEFAULT_CUSTOM_PATTERN, PATTERN_EXAMPLES } from './mockPattern'

export type MockFieldType =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'address'
  | 'date'
  | 'datetime'
  | 'uuid'
  | 'number'
  | 'boolean'
  | 'enum'
  | 'custom'

/**
 * One schema row. `key` may be a path: `customer.name` nests objects and
 * `items[].sku` builds an array of objects (see `parseKeyPath`).
 */
export type MockField = {
  key: string
  type: MockFieldType
  /** `custom` only. */
  pattern?: string
  /** `number` only. */
  min?: number
  max?: number
  /** `number` only: digits after the decimal point (0 = integer). */
  decimals?: number
  /** `enum` only. */
  values?: string[]
}

export type MockValue =
  | string
  | number
  | boolean
  | null
  | MockValue[]
  | { [key: string]: MockValue }
export type MockRecord = { [key: string]: MockValue }

export type MockExportFormat = 'json' | 'csv' | 'lines' | 'sql'
export type MockPresetId =
  | 'person'
  | 'signup'
  | 'contact'
  | 'bank'
  | 'user'
  | 'order'

export const MIN_COUNT = 1
export const MAX_COUNT = 1000
/** Above this the preview is heavy; the UI shows a warning. */
export const LARGE_COUNT_WARNING = 250
export const DEFAULT_COUNT = 10
export const MAX_FIELDS = 20
export const MAX_PATH_DEPTH = 4
export const DEFAULT_EXPORT: MockExportFormat = 'json'

export const MIN_ARRAY_LENGTH = 0
export const MAX_ARRAY_LENGTH = 20
export const DEFAULT_ARRAY_MIN = 1
export const DEFAULT_ARRAY_MAX = 3

export const DEFAULT_NUMBER_MIN = 0
export const DEFAULT_NUMBER_MAX = 100
export const DEFAULT_NUMBER_DECIMALS = 0
export const MAX_NUMBER_DECIMALS = 6
export const DEFAULT_ENUM_VALUES: readonly string[] = [
  'active',
  'inactive',
  'pending'
]
export const MAX_ENUM_VALUES = 50

export const DEFAULT_SQL_TABLE = 'mock_data'
export const DEFAULT_SQL_DIALECT: SqlDialect = 'postgres'
const SQL_EXPORT_BATCH = 50

export const FIELD_TYPES: readonly MockFieldType[] = [
  'fullName',
  'email',
  'phone',
  'address',
  'date',
  'datetime',
  'uuid',
  'number',
  'boolean',
  'enum',
  'custom'
]

export const FIELD_TYPE_LABELS: Record<MockFieldType, string> = {
  fullName: 'Name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  date: 'Date',
  datetime: 'DateTime',
  uuid: 'UUID',
  number: 'Number',
  boolean: 'Boolean',
  enum: 'Enum',
  custom: 'Custom'
}

export const DEFAULT_KEY_FOR_TYPE: Record<MockFieldType, string> = {
  fullName: 'name',
  email: 'email',
  phone: 'phone',
  address: 'address',
  date: 'date',
  datetime: 'createdAt',
  uuid: 'id',
  number: 'amount',
  boolean: 'active',
  enum: 'status',
  custom: 'code'
}

export const MOCK_EXPORT_FORMATS: {
  id: MockExportFormat
  label: string
  title: string
}[] = [
  { id: 'json', label: 'JSON', title: 'Pretty-printed array (nested kept)' },
  { id: 'csv', label: 'CSV', title: 'Header plus rows (nested flattened)' },
  { id: 'lines', label: 'Lines', title: 'One value per line, or NDJSON' },
  { id: 'sql', label: 'SQL INSERT', title: 'INSERT statements for a table' }
]

const PERSON_FIELDS: readonly MockField[] = [
  { key: 'name', type: 'fullName' },
  { key: 'email', type: 'email' },
  { key: 'phone', type: 'phone' },
  { key: 'address', type: 'address' },
  { key: 'createdAt', type: 'datetime' }
]

const SIGNUP_FIELDS: readonly MockField[] = [
  { key: 'name', type: 'fullName' },
  { key: 'email', type: 'email' },
  { key: 'createdAt', type: 'datetime' }
]

const CONTACT_FIELDS: readonly MockField[] = [
  { key: 'name', type: 'fullName' },
  { key: 'email', type: 'email' },
  { key: 'phone', type: 'phone' }
]

const BANK_FIELDS: readonly MockField[] = [
  { key: 'name', type: 'fullName' },
  {
    key: 'iban',
    type: 'custom',
    pattern: '[A-Z]{2}\\d{2}[A-Z]{4}\\d{12}'
  },
  { key: 'account', type: 'custom', pattern: '\\d{10}' },
  { key: 'card', type: 'custom', pattern: '\\d{4} \\d{4} \\d{4} \\d{4}' }
]

const USER_FIELDS: readonly MockField[] = [
  { key: 'id', type: 'uuid' },
  { key: 'name', type: 'fullName' },
  { key: 'active', type: 'boolean' },
  { key: 'age', type: 'number', min: 18, max: 80, decimals: 0 },
  { key: 'role', type: 'enum', values: ['admin', 'editor', 'viewer'] },
  { key: 'contact.email', type: 'email' },
  { key: 'contact.phone', type: 'phone' },
  { key: 'address.home', type: 'address' }
]

const ORDER_FIELDS: readonly MockField[] = [
  { key: 'id', type: 'uuid' },
  { key: 'customer.name', type: 'fullName' },
  { key: 'customer.email', type: 'email' },
  {
    key: 'status',
    type: 'enum',
    values: ['pending', 'paid', 'shipped', 'cancelled']
  },
  { key: 'items[].sku', type: 'custom', pattern: '[A-Z]{3}-\\d{4}' },
  { key: 'items[].qty', type: 'number', min: 1, max: 5, decimals: 0 },
  { key: 'items[].price', type: 'number', min: 1, max: 500, decimals: 2 },
  { key: 'createdAt', type: 'datetime' }
]

export const MOCK_PRESETS: {
  id: MockPresetId
  label: string
  title: string
  fields: readonly MockField[]
}[] = [
  {
    id: 'person',
    label: 'Person',
    title: 'Name, email, phone, address, createdAt',
    fields: PERSON_FIELDS
  },
  {
    id: 'signup',
    label: 'Signup',
    title: 'Name, email, createdAt',
    fields: SIGNUP_FIELDS
  },
  {
    id: 'contact',
    label: 'Contact',
    title: 'Name, email, phone',
    fields: CONTACT_FIELDS
  },
  {
    id: 'bank',
    label: 'Bank',
    title: 'Name plus IBAN, account, and card via custom patterns',
    fields: BANK_FIELDS
  },
  {
    id: 'user',
    label: 'User (nested)',
    title: 'UUID, boolean, number range, enum, and nested contact / address',
    fields: USER_FIELDS
  },
  {
    id: 'order',
    label: 'Order (array)',
    title: 'Nested customer plus an items[] array of objects',
    fields: ORDER_FIELDS
  }
]

export const DEFAULT_SCHEMA: readonly MockField[] = PERSON_FIELDS

const FIRST_NAMES = [
  'Ada',
  'Grace',
  'Alan',
  'Linus',
  'Margaret',
  'Katherine',
  'Barbara',
  'Donald',
  'Edsger',
  'Ken',
  'Dennis',
  'Bjarne',
  'Guido',
  'Brendan',
  'Tim',
  'James',
  'Maria',
  'Sofia',
  'Liam',
  'Olivia',
  'Noah',
  'Emma',
  'Ethan',
  'Mia',
  'Luca',
  'Nora',
  'Owen',
  'Zoe',
  'Kai',
  'Ivy',
  'Leo',
  'Maya',
  'Nina',
  'Theo',
  'Ruby',
  'Clara',
  'Hugo',
  'Iris',
  'Miles',
  'Lena',
  'Felix',
  'Chloe',
  'Jonah',
  'Hazel',
  'Priya',
  'Diego',
  'Naomi',
  'Samir',
  'Elise',
  'Hiro'
] as const

const LAST_NAMES = [
  'Lovelace',
  'Hopper',
  'Turing',
  'Torvalds',
  'Hamilton',
  'Johnson',
  'Liskov',
  'Knuth',
  'Dijkstra',
  'Thompson',
  'Ritchie',
  'Stroustrup',
  'Rossum',
  'Eich',
  'Berners',
  'Gosling',
  'Garcia',
  'Chen',
  'Patel',
  'Kim',
  'Nguyen',
  'Williams',
  'Brown',
  'Lopez',
  'Martin',
  'Wright',
  'Cooper',
  'Reed',
  'Bailey',
  'Hayes',
  'Foster',
  'Price',
  'Bennett',
  'Cole',
  'Sato',
  'Andersson',
  'Silva',
  'Kowalski',
  'Nielsen',
  'Okafor'
] as const

const STREET_NAMES = [
  'Oak',
  'Maple',
  'Pine',
  'Cedar',
  'Elm',
  'Willow',
  'Birch',
  'Cherry',
  'Lake',
  'Hill',
  'Park',
  'Main',
  'Sunset',
  'River',
  'Spring',
  'Valley',
  'Forest',
  'Meadow',
  'Ridge',
  'Harbor',
  'Walnut',
  'Ash',
  'Brook',
  'Canyon'
] as const

const STREET_SUFFIXES = [
  'St',
  'Ave',
  'Blvd',
  'Rd',
  'Ln',
  'Dr',
  'Way',
  'Ct'
] as const

const CITIES = [
  { city: 'Austin', state: 'TX', zip: '78701' },
  { city: 'Seattle', state: 'WA', zip: '98101' },
  { city: 'Portland', state: 'OR', zip: '97201' },
  { city: 'Denver', state: 'CO', zip: '80202' },
  { city: 'Boston', state: 'MA', zip: '02108' },
  { city: 'Chicago', state: 'IL', zip: '60601' },
  { city: 'Miami', state: 'FL', zip: '33101' },
  { city: 'Phoenix', state: 'AZ', zip: '85003' },
  { city: 'Nashville', state: 'TN', zip: '37201' },
  { city: 'Atlanta', state: 'GA', zip: '30303' },
  { city: 'Dallas', state: 'TX', zip: '75201' },
  { city: 'Minneapolis', state: 'MN', zip: '55401' },
  { city: 'Pittsburgh', state: 'PA', zip: '15222' },
  { city: 'Raleigh', state: 'NC', zip: '27601' },
  { city: 'Madison', state: 'WI', zip: '53703' },
  { city: 'Boulder', state: 'CO', zip: '80302' },
  { city: 'Boise', state: 'ID', zip: '83702' },
  { city: 'Tucson', state: 'AZ', zip: '85701' },
  { city: 'Richmond', state: 'VA', zip: '23219' },
  { city: 'Sacramento', state: 'CA', zip: '95814' }
] as const

const EMAIL_DOMAINS = [
  'example.com',
  'example.net',
  'example.org',
  'mail.example.com',
  'example.edu'
] as const

const DAY_MS = 24 * 60 * 60 * 1000
const DATE_SPAN_DAYS = 730

type City = (typeof CITIES)[number]

type RecordSeed = {
  firstName: string
  lastName: string
  userSlug: string
  city: City
  streetNumber: number
  streetName: string
  streetSuffix: string
  timestamp: number
}

/**
 * Uniform index in [0, n) via rejection sampling (no modulo bias).
 */
function randomInt(maxExclusive: number): number {
  if (maxExclusive <= 0 || !Number.isFinite(maxExclusive)) {
    throw new Error('maxExclusive must be positive')
  }
  if (maxExclusive === 1) return 0
  if (maxExclusive > 0x100000000) {
    throw new Error('maxExclusive is too large')
  }

  const buf = new Uint32Array(1)
  const limit = Math.floor(0x100000000 / maxExclusive) * maxExclusive
  for (;;) {
    crypto.getRandomValues(buf)
    if (buf[0] < limit) return buf[0] % maxExclusive
  }
}

function pickFrom<T>(bank: readonly T[]): T {
  return bank[randomInt(bank.length)]
}

function slugPart(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function randomTimestamp(): number {
  const daysAgo = randomInt(DATE_SPAN_DAYS + 1)
  const msIntoDay = randomInt(DAY_MS)
  return Date.now() - daysAgo * DAY_MS - msIntoDay
}

function formatDate(timestamp: number): string {
  return new Date(timestamp).toISOString().slice(0, 10)
}

function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toISOString()
}

function formatPhone(): string {
  const exchange = randomInt(10)
  const line = String(randomInt(10000)).padStart(4, '0')
  return `+1 555-01${exchange}-${line}`
}

function formatAddress(seed: RecordSeed): string {
  return `${seed.streetNumber} ${seed.streetName} ${seed.streetSuffix}, ${seed.city.city}, ${seed.city.state} ${seed.city.zip}`
}

function nextEmail(seed: RecordSeed, used: Set<string>): string {
  const local = seed.userSlug || 'user'
  const domain = pickFrom(EMAIL_DOMAINS)
  let n = randomInt(90) + 10
  let email = `${local}.${n}@${domain}`
  while (used.has(email.toLowerCase())) {
    n += 1
    email = `${local}.${n}@${domain}`
  }
  used.add(email.toLowerCase())
  return email
}

function makeSeed(): RecordSeed {
  const firstName = pickFrom(FIRST_NAMES)
  const lastName = pickFrom(LAST_NAMES)
  return {
    firstName,
    lastName,
    userSlug:
      `${slugPart(firstName)}.${slugPart(lastName)}`.replace(
        /^\.+|\.+$/g,
        ''
      ) || 'user',
    city: pickFrom(CITIES),
    streetNumber: randomInt(9999) + 1,
    streetName: pickFrom(STREET_NAMES),
    streetSuffix: pickFrom(STREET_SUFFIXES),
    timestamp: randomTimestamp()
  }
}

/** RFC 4122 version 4 UUID from crypto.getRandomValues. */
function randomUuid(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'))
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex
    .slice(6, 8)
    .join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10, 16).join('')}`
}

function numberBounds(field: MockField): {
  min: number
  max: number
  decimals: number
} {
  return {
    min: field.min ?? DEFAULT_NUMBER_MIN,
    max: field.max ?? DEFAULT_NUMBER_MAX,
    decimals: field.decimals ?? DEFAULT_NUMBER_DECIMALS
  }
}

function randomNumber(field: MockField): number {
  const { min, max, decimals } = numberBounds(field)
  const scale = 10 ** decimals
  const lo = Math.ceil(min * scale)
  const hi = Math.floor(max * scale)
  const n = lo + randomInt(hi - lo + 1)
  return n / scale
}

function valueForField(
  field: MockField,
  seed: RecordSeed,
  used: Set<string>
): MockValue {
  switch (field.type) {
    case 'fullName':
      return `${seed.firstName} ${seed.lastName}`
    case 'email':
      return nextEmail(seed, used)
    case 'phone':
      return formatPhone()
    case 'address':
      return formatAddress(seed)
    case 'date':
      return formatDate(seed.timestamp)
    case 'datetime':
      return formatDateTime(seed.timestamp)
    case 'uuid':
      return randomUuid()
    case 'number':
      return randomNumber(field)
    case 'boolean':
      return randomInt(2) === 1
    case 'enum':
      return pickFrom(
        field.values && field.values.length > 0
          ? field.values
          : DEFAULT_ENUM_VALUES
      )
    case 'custom':
      return generateFromPattern(field.pattern ?? DEFAULT_CUSTOM_PATTERN)
  }
}

// --- Key paths --------------------------------------------------------------

export type KeySegment = { name: string; array: boolean }

/**
 * `a.b` -> two object levels. A trailing `[]` marks an array segment:
 * `tags[]` is an array of values, `items[].sku` an array of objects.
 * Returns null when the key is not a valid path.
 */
export function parseKeyPath(key: string): KeySegment[] | null {
  const trimmed = key.trim()
  if (!trimmed) return null
  const segments: KeySegment[] = []
  for (const raw of trimmed.split('.')) {
    const part = raw.trim()
    const array = part.endsWith('[]')
    const name = (array ? part.slice(0, -2) : part).trim()
    if (!name || /[[\]]/.test(name)) return null
    segments.push({ name, array })
  }
  return segments
}

const FORBIDDEN_KEY_NAMES = new Set(['__proto__', 'constructor', 'prototype'])

export function keyPathIssue(key: string): string | null {
  const segments = parseKeyPath(key)
  if (!segments) {
    return `Invalid key "${key.trim() || '(empty)'}" - use a.b or items[].sku.`
  }
  if (segments.length > MAX_PATH_DEPTH) {
    return `Key "${key.trim()}" is deeper than ${MAX_PATH_DEPTH} levels.`
  }
  if (segments.some((s) => FORBIDDEN_KEY_NAMES.has(s.name))) {
    return `Key "${key.trim()}" uses a reserved name.`
  }
  return null
}

type NodeKind = 'leaf' | 'object' | 'array-leaf' | 'array-object'

function pathConflict(keys: readonly string[]): string | null {
  const nodes = new Map<string, NodeKind>()
  for (const key of keys) {
    const segments = parseKeyPath(key)
    if (!segments) continue
    const names: string[] = []
    for (let depth = 0; depth < segments.length; depth++) {
      const seg = segments[depth]
      names.push(seg.name)
      const last = depth === segments.length - 1
      const kind: NodeKind = last
        ? seg.array
          ? 'array-leaf'
          : 'leaf'
        : seg.array
          ? 'array-object'
          : 'object'
      const nodeKey = names.join('.')
      const existing = nodes.get(nodeKey)
      if (existing && existing !== kind) {
        return `"${key.trim()}" conflicts with another field at "${nodeKey}".`
      }
      nodes.set(nodeKey, kind)
    }
  }
  return null
}

// --- Generation -------------------------------------------------------------

type ParsedField = { field: MockField; segments: KeySegment[] }

type GenContext = {
  used: Set<string>
  arrayMin: number
  arrayMax: number
  lengths: Map<string, number>
  seeds: Map<string, RecordSeed>
}

function isMockObject(value: MockValue | undefined): value is MockRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function seedFor(ctx: GenContext, id: string): RecordSeed {
  const existing = ctx.seeds.get(id)
  if (existing) return existing
  const created = makeSeed()
  ctx.seeds.set(id, created)
  return created
}

function arrayLengthFor(ctx: GenContext, id: string): number {
  const existing = ctx.lengths.get(id)
  if (existing !== undefined) return existing
  const length = ctx.arrayMin + randomInt(ctx.arrayMax - ctx.arrayMin + 1)
  ctx.lengths.set(id, length)
  return length
}

function place(
  target: MockRecord,
  parsed: ParsedField,
  depth: number,
  pathId: string,
  seed: RecordSeed,
  ctx: GenContext
): void {
  const seg = parsed.segments[depth]
  const last = depth === parsed.segments.length - 1
  const nodeId = pathId ? `${pathId}.${seg.name}` : seg.name

  if (!seg.array) {
    if (last) {
      target[seg.name] = valueForField(parsed.field, seed, ctx.used)
      return
    }
    const existing = target[seg.name]
    const child: MockRecord = isMockObject(existing) ? existing : {}
    target[seg.name] = child
    place(child, parsed, depth + 1, nodeId, seed, ctx)
    return
  }

  const arrayId = `${nodeId}[]`
  const length = arrayLengthFor(ctx, arrayId)
  const current = target[seg.name]
  const list: MockValue[] = Array.isArray(current) ? current : []
  target[seg.name] = list

  for (let i = 0; i < length; i++) {
    const elementId = `${arrayId}#${i}`
    const elementSeed = seedFor(ctx, elementId)
    if (last) {
      list[i] = valueForField(parsed.field, elementSeed, ctx.used)
      continue
    }
    const existing = list[i]
    const child: MockRecord = isMockObject(existing) ? existing : {}
    list[i] = child
    place(child, parsed, depth + 1, elementId, elementSeed, ctx)
  }
}

export function cloneFields(fields: readonly MockField[]): MockField[] {
  return fields.map((field) => ({
    key: field.key,
    type: field.type,
    ...(field.pattern != null ? { pattern: field.pattern } : {}),
    ...(field.min != null ? { min: field.min } : {}),
    ...(field.max != null ? { max: field.max } : {}),
    ...(field.decimals != null ? { decimals: field.decimals } : {}),
    ...(field.values != null ? { values: [...field.values] } : {})
  }))
}

export function uniqueKey(base: string, existing: readonly string[]): string {
  const trimmed = base.trim() || 'field'
  if (!existing.includes(trimmed)) return trimmed
  let i = 2
  while (existing.includes(`${trimmed}${i}`)) i += 1
  return `${trimmed}${i}`
}

/** A field of `type` with that type's default parameters and the given key. */
export function fieldForType(type: MockFieldType, key: string): MockField {
  const field: MockField = { key, type }
  switch (type) {
    case 'custom':
      field.pattern = DEFAULT_CUSTOM_PATTERN
      break
    case 'number':
      field.min = DEFAULT_NUMBER_MIN
      field.max = DEFAULT_NUMBER_MAX
      field.decimals = DEFAULT_NUMBER_DECIMALS
      break
    case 'enum':
      field.values = [...DEFAULT_ENUM_VALUES]
      break
    default:
      break
  }
  return field
}

export function suggestedField(existing: readonly MockField[]): MockField {
  const keys = existing.map((field) => field.key)
  const unusedType = FIELD_TYPES.find(
    (type) => !existing.some((field) => field.type === type)
  )
  const type = unusedType ?? 'custom'
  return fieldForType(type, uniqueKey(DEFAULT_KEY_FOR_TYPE[type], keys))
}

function valuesEqual(
  a: readonly string[] | undefined,
  b: readonly string[] | undefined
): boolean {
  const x = a ?? []
  const y = b ?? []
  return x.length === y.length && x.every((v, i) => v === y[i])
}

export function fieldsEqual(
  a: readonly MockField[],
  b: readonly MockField[]
): boolean {
  return (
    a.length === b.length &&
    a.every((field, index) => {
      const other = b[index]
      if (field.key !== other.key || field.type !== other.type) return false
      switch (field.type) {
        case 'custom':
          return (field.pattern ?? '') === (other.pattern ?? '')
        case 'number': {
          const x = numberBounds(field)
          const y = numberBounds(other)
          return x.min === y.min && x.max === y.max && x.decimals === y.decimals
        }
        case 'enum':
          return valuesEqual(field.values, other.values)
        default:
          return true
      }
    })
  )
}

export function activePresetId(
  schema: readonly MockField[]
): MockPresetId | null {
  const match = MOCK_PRESETS.find((preset) =>
    fieldsEqual(schema, preset.fields)
  )
  return match?.id ?? null
}

export function isCountInRange(count: number): boolean {
  return Number.isInteger(count) && count >= MIN_COUNT && count <= MAX_COUNT
}

export function isArrayRangeValid(min: number, max: number): boolean {
  return (
    Number.isInteger(min) &&
    Number.isInteger(max) &&
    min >= MIN_ARRAY_LENGTH &&
    max <= MAX_ARRAY_LENGTH &&
    min <= max
  )
}

export function isFieldType(value: string): value is MockFieldType {
  return (FIELD_TYPES as readonly string[]).includes(value)
}

/** Comma-separated enum text -> trimmed, non-empty unique values. */
export function parseEnumValues(text: string): string[] {
  const out: string[] = []
  for (const part of text.split(',')) {
    const value = part.trim()
    if (value && !out.includes(value)) out.push(value)
  }
  return out
}

function numberIssue(field: MockField): string | null {
  const { min, max, decimals } = numberBounds(field)
  const label = field.key.trim() || 'number'
  if (!Number.isFinite(min) || !Number.isFinite(max)) {
    return `"${label}": min and max must be numbers.`
  }
  if (
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > MAX_NUMBER_DECIMALS
  ) {
    return `"${label}": decimals must be 0-${MAX_NUMBER_DECIMALS}.`
  }
  if (min > max) return `"${label}": min is greater than max.`
  if (Math.abs(min) > 1e9 || Math.abs(max) > 1e9) {
    return `"${label}": use values between -1e9 and 1e9.`
  }
  const scale = 10 ** decimals
  const lo = Math.ceil(min * scale)
  const hi = Math.floor(max * scale)
  if (hi < lo) return `"${label}": no value fits that range and precision.`
  if (hi - lo + 1 > 0x100000000) return `"${label}": range is too large.`
  return null
}

export function schemaIssue(schema: readonly MockField[]): string | null {
  if (schema.length < 1) return 'Add at least one field.'
  if (schema.length > MAX_FIELDS) return `At most ${MAX_FIELDS} fields.`
  const keys = schema.map((field) => field.key.trim())
  if (keys.some((key) => key === '')) return 'Every field needs a key.'
  if (new Set(keys).size !== keys.length) return 'Field keys must be unique.'
  for (const key of keys) {
    const issue = keyPathIssue(key)
    if (issue) return issue
  }
  const conflict = pathConflict(keys)
  if (conflict) return conflict
  for (const field of schema) {
    if (!isFieldType(field.type)) return 'Unknown field type.'
    if (field.type === 'custom') {
      const error = patternError(field.pattern)
      if (error) return `Custom pattern: ${error}`
    }
    if (field.type === 'number') {
      const error = numberIssue(field)
      if (error) return error
    }
    if (field.type === 'enum') {
      if (!field.values || field.values.length < 1) {
        return `"${field.key.trim()}": add at least one enum value.`
      }
      if (field.values.length > MAX_ENUM_VALUES) {
        return `"${field.key.trim()}": at most ${MAX_ENUM_VALUES} enum values.`
      }
    }
  }
  return null
}

export function isSchemaValid(schema: readonly MockField[]): boolean {
  return schemaIssue(schema) == null
}

// --- URL serialization (flat schemas stay byte-identical to the old format) -

type SerializedField = {
  k: string
  t: MockFieldType
  p?: string
  a?: number
  b?: number
  d?: number
  v?: string[]
}

export function serializeMockSchema(fields: readonly MockField[]): string {
  return JSON.stringify(
    fields.map((field) => {
      const row: SerializedField = { k: field.key, t: field.type }
      if (field.type === 'custom' && field.pattern) row.p = field.pattern
      if (field.type === 'number') {
        const { min, max, decimals } = numberBounds(field)
        if (Number.isFinite(min)) row.a = min
        if (Number.isFinite(max)) row.b = max
        if (Number.isFinite(decimals)) row.d = decimals
      }
      if (field.type === 'enum' && field.values) row.v = field.values
      return row
    })
  )
}

function finiteOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

export function parseMockSchema(raw: string | null): MockField[] {
  if (raw == null || raw.trim() === '') return cloneFields(DEFAULT_SCHEMA)
  try {
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed) || parsed.length < 1) {
      return cloneFields(DEFAULT_SCHEMA)
    }
    const fields: MockField[] = []
    for (const item of parsed.slice(0, MAX_FIELDS)) {
      if (!item || typeof item !== 'object') continue
      const rec = item as {
        k?: unknown
        t?: unknown
        p?: unknown
        a?: unknown
        b?: unknown
        d?: unknown
        v?: unknown
      }
      if (typeof rec.k !== 'string' || typeof rec.t !== 'string') continue
      if (!isFieldType(rec.t)) continue
      const field: MockField = { key: rec.k, type: rec.t }
      if (field.type === 'custom') {
        field.pattern =
          typeof rec.p === 'string' ? rec.p : DEFAULT_CUSTOM_PATTERN
      }
      if (field.type === 'number') {
        field.min = finiteOr(rec.a, DEFAULT_NUMBER_MIN)
        field.max = finiteOr(rec.b, DEFAULT_NUMBER_MAX)
        field.decimals = finiteOr(rec.d, DEFAULT_NUMBER_DECIMALS)
      }
      if (field.type === 'enum') {
        const values = Array.isArray(rec.v)
          ? rec.v.filter((v): v is string => typeof v === 'string')
          : []
        field.values =
          values.length > 0
            ? values.slice(0, MAX_ENUM_VALUES)
            : [...DEFAULT_ENUM_VALUES]
      }
      fields.push(field)
    }
    return fields.length > 0 ? fields : cloneFields(DEFAULT_SCHEMA)
  } catch {
    return cloneFields(DEFAULT_SCHEMA)
  }
}

export const DEFAULT_SCHEMA_SERIALIZED = serializeMockSchema(DEFAULT_SCHEMA)

export type GenerateOptions = {
  /** Length range for `[]` path segments (inclusive). */
  arrayMin?: number
  arrayMax?: number
}

function prepareGeneration(
  schema: readonly MockField[],
  count: number,
  options?: GenerateOptions
): {
  fields: ParsedField[]
  arrayMin: number
  arrayMax: number
} {
  if (!isCountInRange(count)) {
    throw new Error(
      `Count must be an integer between ${MIN_COUNT} and ${MAX_COUNT}`
    )
  }
  const issue = schemaIssue(schema)
  if (issue) throw new Error(issue)

  const arrayMin = options?.arrayMin ?? DEFAULT_ARRAY_MIN
  const arrayMax = options?.arrayMax ?? DEFAULT_ARRAY_MAX
  if (!isArrayRangeValid(arrayMin, arrayMax)) {
    throw new Error(
      `Array length must be ${MIN_ARRAY_LENGTH}-${MAX_ARRAY_LENGTH} with min <= max`
    )
  }

  const fields: ParsedField[] = schema.map((field) => {
    const segments = parseKeyPath(field.key)
    if (!segments) throw new Error(`Invalid key "${field.key}"`)
    return {
      field: { ...cloneFields([field])[0], key: field.key.trim() },
      segments
    }
  })

  return { fields, arrayMin, arrayMax }
}

export function generateRecords(
  schema: readonly MockField[],
  count: number,
  options?: GenerateOptions
): MockRecord[] {
  const { fields, arrayMin, arrayMax } = prepareGeneration(
    schema,
    count,
    options
  )
  const used = new Set<string>()
  const records: MockRecord[] = []

  for (let i = 0; i < count; i++) {
    const ctx: GenContext = {
      used,
      arrayMin,
      arrayMax,
      lengths: new Map(),
      seeds: new Map()
    }
    const seed = makeSeed()
    const record: MockRecord = {}
    for (const parsed of fields) {
      place(record, parsed, 0, '', seed, ctx)
    }
    records.push(record)
  }

  return records
}

const PROGRESSIVE_CHUNK = 50

function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve())
    } else {
      setTimeout(resolve, 0)
    }
  })
}

/**
 * Same as `generateRecords`, but yields to the UI every chunk when count is
 * large so the page stays responsive. Always client-side / non-deterministic
 * (CSPRNG); no seed parameter.
 */
export async function generateRecordsProgressive(
  schema: readonly MockField[],
  count: number,
  options?: GenerateOptions
): Promise<MockRecord[]> {
  const { fields, arrayMin, arrayMax } = prepareGeneration(
    schema,
    count,
    options
  )
  const used = new Set<string>()
  const records: MockRecord[] = []
  const progressive = count > LARGE_COUNT_WARNING

  for (let i = 0; i < count; i++) {
    const ctx: GenContext = {
      used,
      arrayMin,
      arrayMax,
      lengths: new Map(),
      seeds: new Map()
    }
    const seed = makeSeed()
    const record: MockRecord = {}
    for (const parsed of fields) {
      place(record, parsed, 0, '', seed, ctx)
    }
    records.push(record)
    if (progressive && (i + 1) % PROGRESSIVE_CHUNK === 0) {
      await yieldToUi()
    }
  }

  return records
}

// --- Export -----------------------------------------------------------------

function scalarToString(value: MockValue): string {
  if (value === null) return ''
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/** Nested objects become `a.b` columns; arrays stay as a JSON string cell. */
function flattenRecord(
  record: MockRecord,
  prefix: string,
  out: Map<string, string>
): void {
  for (const [key, value] of Object.entries(record)) {
    const path = prefix ? `${prefix}.${key}` : key
    if (isMockObject(value)) flattenRecord(value, path, out)
    else out.set(path, scalarToString(value))
  }
}

export type MockSqlExportOptions = {
  table: string
  dialect: SqlDialect
}

export function exportMock(
  records: MockRecord[],
  format: MockExportFormat,
  sql?: MockSqlExportOptions
): string {
  if (records.length === 0) return ''

  switch (format) {
    case 'json':
      return JSON.stringify(records, null, 2)
    case 'csv': {
      const flat = records.map((record) => {
        const out = new Map<string, string>()
        flattenRecord(record, '', out)
        return out
      })
      const keys: string[] = []
      const seen = new Set<string>()
      for (const row of flat) {
        for (const key of row.keys()) {
          if (!seen.has(key)) {
            seen.add(key)
            keys.push(key)
          }
        }
      }
      const header = keys.map(csvEscape).join(',')
      const rows = flat.map((row) =>
        keys.map((key) => csvEscape(row.get(key) ?? '')).join(',')
      )
      return [header, ...rows].join('\n')
    }
    case 'lines': {
      const first = Object.keys(records[0])
      if (
        first.length === 1 &&
        records.every(
          (r) => !isMockObject(r[first[0]]) && !Array.isArray(r[first[0]])
        )
      ) {
        return records
          .map((record) => scalarToString(record[first[0]]))
          .join('\n')
      }
      return records.map((record) => JSON.stringify(record)).join('\n')
    }
    case 'sql': {
      const options = sql ?? {
        table: DEFAULT_SQL_TABLE,
        dialect: DEFAULT_SQL_DIALECT
      }
      const issue = tableNameIssue(options.table)
      if (issue) return `-- ${issue}`
      try {
        return buildInsertStatements(objectsToParsedRows(records), {
          table: options.table,
          dialect: options.dialect,
          batchSize: SQL_EXPORT_BATCH,
          quoteIdentifiers: true,
          ignoreConflicts: false,
          wrapInTransaction: false,
          jsonbCast: false
        }).sql
      } catch (err) {
        return `-- ${err instanceof Error ? err.message : 'SQL export failed'}`
      }
    }
  }
}
