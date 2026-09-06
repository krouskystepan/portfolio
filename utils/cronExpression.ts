import { Cron } from 'croner'
import cronstrue from 'cronstrue'

export type CronFields = {
  minute: string
  hour: string
  dayOfMonth: string
  month: string
  dayOfWeek: string
}

export type CronFieldKey = keyof CronFields

export type CronTimezone = 'local' | 'UTC'

export type ParseExpressionResult =
  | { ok: true; fields: CronFields }
  | { ok: false; error: string }

export type FieldMode = 'every' | 'step' | 'specific' | 'range' | 'raw'

export const FIELD_KEYS: CronFieldKey[] = [
  'minute',
  'hour',
  'dayOfMonth',
  'month',
  'dayOfWeek'
]

export const FIELD_LABELS: Record<CronFieldKey, string> = {
  minute: 'Minute',
  hour: 'Hour',
  dayOfMonth: 'Day of month',
  month: 'Month',
  dayOfWeek: 'Day of week'
}

/** Weekdays at 09:00 — a common default schedule. */
export const DEFAULT_FIELDS: CronFields = {
  minute: '0',
  hour: '9',
  dayOfMonth: '*',
  month: '*',
  dayOfWeek: '1-5'
}

export const CRON_PRESETS: { label: string; expression: string }[] = [
  { label: 'Every minute', expression: '* * * * *' },
  { label: 'Hourly', expression: '0 * * * *' },
  { label: 'Daily 00:00', expression: '0 0 * * *' },
  { label: 'Weekdays 09:00', expression: '0 9 * * 1-5' },
  { label: 'Monthly 1st', expression: '0 0 1 * *' },
  { label: 'Every Monday 09:00', expression: '0 9 * * 1' },
  { label: 'Every 15 min', expression: '*/15 * * * *' },
  { label: 'Twice daily', expression: '0 9,17 * * *' }
]

export const MONTH_NAMES = [
  'JAN',
  'FEB',
  'MAR',
  'APR',
  'MAY',
  'JUN',
  'JUL',
  'AUG',
  'SEP',
  'OCT',
  'NOV',
  'DEC'
] as const

export const DOW_NAMES = [
  'SUN',
  'MON',
  'TUE',
  'WED',
  'THU',
  'FRI',
  'SAT'
] as const

export const MINUTE_QUICK_VALUES = [0, 15, 30, 45] as const

export function cloneFields(fields: CronFields): CronFields {
  return { ...fields }
}

export function fieldsToExpression(fields: CronFields): string {
  return FIELD_KEYS.map((key) => fields[key].trim() || '*').join(' ')
}

export function parseExpression(input: string): ParseExpressionResult {
  const trimmed = input.trim().replace(/\s+/g, ' ')
  if (!trimmed) {
    return { ok: false, error: 'Enter a 5-field cron expression.' }
  }

  const parts = trimmed.split(' ')
  if (parts.length !== 5) {
    return {
      ok: false,
      error: `Expected 5 fields (minute hour day month weekday), got ${parts.length}.`
    }
  }

  const fields: CronFields = {
    minute: parts[0],
    hour: parts[1],
    dayOfMonth: parts[2],
    month: parts[3],
    dayOfWeek: parts[4]
  }

  try {
    // Validate field values via croner (throws on invalid patterns).
    new Cron(fieldsToExpression(fields))
  } catch (err) {
    return { ok: false, error: shortError(err, 'Invalid cron expression.') }
  }

  return { ok: true, fields }
}

export function describeCron(expression: string): string {
  try {
    return cronstrue.toString(expression, {
      throwExceptionOnParseError: true,
      verbose: false,
      use24HourTimeFormat: false
    })
  } catch (err) {
    throw new Error(shortError(err, 'Could not describe this expression.'))
  }
}

export function nextRuns(
  expression: string,
  count: number,
  timezone: CronTimezone
): Date[] {
  try {
    const options =
      timezone === 'UTC' ? { timezone: 'UTC' as const } : undefined
    const job = new Cron(expression, options)
    const runs = job.nextRuns(count)
    return runs.filter((d): d is Date => d instanceof Date)
  } catch (err) {
    throw new Error(shortError(err, 'Could not compute next runs.'))
  }
}

export function detectFieldMode(value: string): FieldMode {
  const v = value.trim()
  if (v === '*') return 'every'
  if (/^\*\/\d+$/.test(v)) return 'step'
  if (/^\d+-\d+$/.test(v) || /^[A-Za-z]{3}-[A-Za-z]{3}$/i.test(v)) return 'range'
  if (
    /^(\d+)(,\d+)*$/.test(v) ||
    /^([A-Za-z]{3})(,[A-Za-z]{3})*$/i.test(v)
  ) {
    return 'specific'
  }
  return 'raw'
}

export function parseStep(value: string): number | null {
  const m = value.trim().match(/^\*\/(\d+)$/)
  if (!m) return null
  const n = Number(m[1])
  return Number.isFinite(n) && n > 0 ? n : null
}

export function parseRange(
  value: string
): { from: string; to: string } | null {
  const m = value.trim().match(/^([A-Za-z0-9]+)-([A-Za-z0-9]+)$/)
  if (!m) return null
  return { from: m[1], to: m[2] }
}

export function parseSpecificList(value: string): string[] {
  const trimmed = value.trim()
  if (!trimmed || trimmed === '*') return []
  return trimmed.split(',').map((p) => p.trim()).filter(Boolean)
}

export function buildStep(n: number): string {
  return `*/${Math.max(1, Math.trunc(n))}`
}

export function buildSpecific(values: Array<string | number>): string {
  const unique = [
    ...new Set(values.map((v) => String(v).trim()).filter(Boolean))
  ]
  return unique.length === 0 ? '*' : unique.join(',')
}

export function buildRange(from: string | number, to: string | number): string {
  return `${from}-${to}`
}

/** Fixed locale + parts assembly so Node SSR and browsers don't disagree on "at" vs ",". */
export function formatRunTime(date: Date, timezone: CronTimezone): string {
  const opts: Intl.DateTimeFormatOptions = {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: timezone === 'UTC' ? 'UTC' : undefined,
    timeZoneName: 'short'
  }

  const parts = new Intl.DateTimeFormat('en-US', opts).formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''

  const weekday = get('weekday')
  const month = get('month')
  const day = get('day')
  const year = get('year')
  const hour = get('hour')
  const minute = get('minute')
  const second = get('second')
  const tz = get('timeZoneName')

  return `${weekday}, ${month} ${day}, ${year} ${hour}:${minute}:${second}${tz ? ` ${tz}` : ''}`
}

/** Short relative label, e.g. "in 2h" / "in 3d". Call on the client only. */
export function formatRelativeRun(date: Date, now = new Date()): string {
  const ms = date.getTime() - now.getTime()
  if (ms < 0) return 'past'
  const mins = Math.round(ms / 60_000)
  if (mins < 1) return 'now'
  if (mins < 60) return `in ${mins}m`
  const hours = Math.round(mins / 60)
  if (hours < 48) return `in ${hours}h`
  const days = Math.round(hours / 24)
  return `in ${days}d`
}

function shortError(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'string' && err) return err
  const asString = String(err)
  if (asString && asString !== '[object Object]' && asString !== 'Error') {
    return asString.replace(/^Error:\s*/i, '')
  }
  return fallback
}
