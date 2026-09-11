import {
  DEFAULT_CUSTOM_PATTERN,
  generateFromPattern,
  patternError
} from './mockPattern'

export { DEFAULT_CUSTOM_PATTERN, PATTERN_EXAMPLES } from './mockPattern'

export type MockFieldType =
  | 'fullName'
  | 'email'
  | 'phone'
  | 'address'
  | 'date'
  | 'datetime'
  | 'custom'

export type MockField = {
  key: string
  type: MockFieldType
  pattern?: string
}

export type MockExportFormat = 'json' | 'csv' | 'lines'
export type MockPresetId = 'person' | 'signup' | 'contact' | 'bank'

export const MIN_COUNT = 1
export const MAX_COUNT = 100
export const DEFAULT_COUNT = 10
export const MAX_FIELDS = 12
export const DEFAULT_EXPORT: MockExportFormat = 'json'

export const FIELD_TYPES: readonly MockFieldType[] = [
  'fullName',
  'email',
  'phone',
  'address',
  'date',
  'datetime',
  'custom'
]

export const FIELD_TYPE_LABELS: Record<MockFieldType, string> = {
  fullName: 'Name',
  email: 'Email',
  phone: 'Phone',
  address: 'Address',
  date: 'Date',
  datetime: 'DateTime',
  custom: 'Custom'
}

export const DEFAULT_KEY_FOR_TYPE: Record<MockFieldType, string> = {
  fullName: 'name',
  email: 'email',
  phone: 'phone',
  address: 'address',
  date: 'date',
  datetime: 'createdAt',
  custom: 'code'
}

export const MOCK_EXPORT_FORMATS: {
  id: MockExportFormat
  label: string
  title: string
}[] = [
  { id: 'json', label: 'JSON', title: 'Pretty-printed array' },
  { id: 'csv', label: 'CSV', title: 'Header plus rows' },
  { id: 'lines', label: 'Lines', title: 'One value per line, or NDJSON' }
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
      `${slugPart(firstName)}.${slugPart(lastName)}`.replace(/^\.+|\.+$/g, '') ||
      'user',
    city: pickFrom(CITIES),
    streetNumber: randomInt(9999) + 1,
    streetName: pickFrom(STREET_NAMES),
    streetSuffix: pickFrom(STREET_SUFFIXES),
    timestamp: randomTimestamp()
  }
}

function valueForField(
  field: MockField,
  seed: RecordSeed,
  used: Set<string>
): string {
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
    case 'custom':
      return generateFromPattern(field.pattern ?? DEFAULT_CUSTOM_PATTERN)
  }
}

export function cloneFields(fields: readonly MockField[]): MockField[] {
  return fields.map((field) => ({
    key: field.key,
    type: field.type,
    ...(field.pattern != null ? { pattern: field.pattern } : {})
  }))
}

export function uniqueKey(base: string, existing: readonly string[]): string {
  const trimmed = base.trim() || 'field'
  if (!existing.includes(trimmed)) return trimmed
  let i = 2
  while (existing.includes(`${trimmed}${i}`)) i += 1
  return `${trimmed}${i}`
}

export function suggestedField(existing: readonly MockField[]): MockField {
  const keys = existing.map((field) => field.key)
  const unusedType = FIELD_TYPES.find(
    (type) => !existing.some((field) => field.type === type)
  )
  const type = unusedType ?? 'custom'
  const field: MockField = {
    key: uniqueKey(DEFAULT_KEY_FOR_TYPE[type], keys),
    type
  }
  if (type === 'custom') field.pattern = DEFAULT_CUSTOM_PATTERN
  return field
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
      if (field.type !== 'custom') return true
      return (field.pattern ?? '') === (other.pattern ?? '')
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

export function isFieldType(value: string): value is MockFieldType {
  return (FIELD_TYPES as readonly string[]).includes(value)
}

export function schemaIssue(schema: readonly MockField[]): string | null {
  if (schema.length < 1) return 'Add at least one field.'
  if (schema.length > MAX_FIELDS) return `At most ${MAX_FIELDS} fields.`
  const keys = schema.map((field) => field.key.trim())
  if (keys.some((key) => key === '')) return 'Every field needs a key.'
  if (new Set(keys).size !== keys.length) return 'Field keys must be unique.'
  for (const field of schema) {
    if (!isFieldType(field.type)) return 'Unknown field type.'
    if (field.type === 'custom') {
      const error = patternError(field.pattern)
      if (error) return `Custom pattern: ${error}`
    }
  }
  return null
}

export function isSchemaValid(schema: readonly MockField[]): boolean {
  return schemaIssue(schema) == null
}

export function serializeMockSchema(fields: readonly MockField[]): string {
  return JSON.stringify(
    fields.map((field) => {
      const row: { k: string; t: MockFieldType; p?: string } = {
        k: field.key,
        t: field.type
      }
      if (field.type === 'custom' && field.pattern) row.p = field.pattern
      return row
    })
  )
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
      const rec = item as { k?: unknown; t?: unknown; p?: unknown }
      if (typeof rec.k !== 'string' || typeof rec.t !== 'string') continue
      if (!isFieldType(rec.t)) continue
      const field: MockField = { key: rec.k, type: rec.t }
      if (field.type === 'custom') {
        field.pattern =
          typeof rec.p === 'string' ? rec.p : DEFAULT_CUSTOM_PATTERN
      }
      fields.push(field)
    }
    return fields.length > 0 ? fields : cloneFields(DEFAULT_SCHEMA)
  } catch {
    return cloneFields(DEFAULT_SCHEMA)
  }
}

export const DEFAULT_SCHEMA_SERIALIZED = serializeMockSchema(DEFAULT_SCHEMA)

export function generateRecords(
  schema: readonly MockField[],
  count: number
): Record<string, string>[] {
  if (!isCountInRange(count)) {
    throw new Error(
      `Count must be an integer between ${MIN_COUNT} and ${MAX_COUNT}`
    )
  }
  if (!isSchemaValid(schema)) {
    throw new Error(
      `Schema must have 1-${MAX_FIELDS} fields with unique, non-empty keys`
    )
  }

  const fields = schema.map((field) => ({
    key: field.key.trim(),
    type: field.type,
    ...(field.type === 'custom'
      ? { pattern: field.pattern ?? DEFAULT_CUSTOM_PATTERN }
      : {})
  }))
  const used = new Set<string>()
  const records: Record<string, string>[] = []

  for (let i = 0; i < count; i++) {
    const seed = makeSeed()
    const record: Record<string, string> = {}
    for (const field of fields) {
      record[field.key] = valueForField(field, seed, used)
    }
    records.push(record)
  }

  return records
}

export function exportMock(
  records: Record<string, string>[],
  format: MockExportFormat
): string {
  if (records.length === 0) return ''

  const keys = Object.keys(records[0])

  switch (format) {
    case 'json':
      return JSON.stringify(records, null, 2)
    case 'csv': {
      const header = keys.map(csvEscape).join(',')
      const rows = records.map((record) =>
        keys.map((key) => csvEscape(record[key] ?? '')).join(',')
      )
      return [header, ...rows].join('\n')
    }
    case 'lines':
      if (keys.length === 1) {
        return records.map((record) => record[keys[0]] ?? '').join('\n')
      }
      return records.map((record) => JSON.stringify(record)).join('\n')
  }
}
