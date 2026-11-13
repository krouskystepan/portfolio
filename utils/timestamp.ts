/**
 * Unix epoch parsing with unit detection (seconds / ms / µs / ns).
 * Integer math uses BigInt nanoseconds so 16- and 19-digit inputs stay exact.
 */

export type TimestampUnit = 'auto' | 's' | 'ms' | 'us' | 'ns'
export type ResolvedUnit = Exclude<TimestampUnit, 'auto'>

export const TIMESTAMP_UNITS: readonly TimestampUnit[] = [
  'auto',
  's',
  'ms',
  'us',
  'ns'
]

export const TIMESTAMP_UNIT_LABELS: Record<TimestampUnit, string> = {
  auto: 'Auto',
  s: 'Seconds',
  ms: 'Milliseconds',
  us: 'Microseconds',
  ns: 'Nanoseconds'
}

const UNIT_NAMES: Record<ResolvedUnit, string> = {
  s: 'seconds',
  ms: 'milliseconds',
  us: 'microseconds',
  ns: 'nanoseconds'
}

const NS_PER_UNIT: Record<ResolvedUnit, bigint> = {
  s: BigInt(1000000000),
  ms: BigInt(1000000),
  us: BigInt(1000),
  ns: BigInt(1)
}

/** Decimal places a fractional input may carry before it is sub-nanosecond. */
const FRACTION_DIGITS: Record<ResolvedUnit, number> = {
  s: 9,
  ms: 6,
  us: 3,
  ns: 0
}

const ZERO = BigInt(0)
const ONE = BigInt(1)
const TEN = BigInt(10)

/** Magnitudes at which `auto` switches to the next unit (see detectUnit). */
const AUTO_THRESHOLDS: readonly [bigint, ResolvedUnit][] = [
  [BigInt('100000000000'), 's'], // < 1e11  (year 5138 in seconds)
  [BigInt('100000000000000'), 'ms'], // < 1e14
  [BigInt('100000000000000000'), 'us'] // < 1e17
]

export const MAX_DATE_MS = 8.64e15

export function detectUnit(absInteger: bigint): ResolvedUnit {
  for (const [limit, unit] of AUTO_THRESHOLDS) {
    if (absInteger < limit) return unit
  }
  return 'ns'
}

type NumericParts = { negative: boolean; integer: string; fraction: string }

function parseNumericParts(raw: string): NumericParts | null {
  const match = /^([+-]?)(\d+)(?:\.(\d+))?$/.exec(raw.trim())
  if (!match) return null
  return {
    negative: match[1] === '-',
    integer: match[2],
    fraction: match[3] ?? ''
  }
}

export function isNumericInput(raw: string): boolean {
  return parseNumericParts(raw) !== null
}

function floorDiv(a: bigint, b: bigint): bigint {
  const q = a / b
  return a % b !== ZERO && a < ZERO !== b < ZERO ? q - ONE : q
}

export type EpochConversion = {
  kind: 'epoch' | 'date'
  /** Unit applied to numeric input; null for date strings. */
  unit: ResolvedUnit | null
  unitDetected: boolean
  digits: number
  nanos: bigint
  date: Date
}

export type ConversionResult =
  | { ok: true; value: EpochConversion }
  | { ok: false; error: string }

export function nanosToDate(nanos: bigint): Date | null {
  const ms = floorDiv(nanos, NS_PER_UNIT.ms)
  const asNumber = Number(ms)
  if (!Number.isFinite(asNumber) || Math.abs(asNumber) > MAX_DATE_MS) {
    return null
  }
  const date = new Date(asNumber)
  return Number.isNaN(date.getTime()) ? null : date
}

export function convertTimestampInput(
  raw: string,
  unit: TimestampUnit
): ConversionResult {
  const value = raw.trim()
  if (!value) return { ok: false, error: 'Input cannot be empty.' }

  const numeric = parseNumericParts(value)
  if (numeric) {
    const integer = BigInt(numeric.integer)
    const resolved = unit === 'auto' ? detectUnit(integer) : unit
    const scale = NS_PER_UNIT[resolved]
    const maxFraction = FRACTION_DIGITS[resolved]
    const fractionText = numeric.fraction.slice(0, maxFraction)
    let nanos = integer * scale
    if (fractionText) {
      nanos +=
        (BigInt(fractionText) * scale) / TEN ** BigInt(fractionText.length)
    }
    if (numeric.negative) nanos = -nanos

    const date = nanosToDate(nanos)
    if (!date) {
      return {
        ok: false,
        error: `Out of range for ${UNIT_NAMES[resolved]} - try another unit.`
      }
    }
    return {
      ok: true,
      value: {
        kind: 'epoch',
        unit: resolved,
        unitDetected: unit === 'auto',
        digits: numeric.integer.length,
        nanos,
        date
      }
    }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return { ok: false, error: 'Invalid date format.' }
  }
  return {
    ok: true,
    value: {
      kind: 'date',
      unit: null,
      unitDetected: false,
      digits: 0,
      nanos: BigInt(date.getTime()) * NS_PER_UNIT.ms,
      date
    }
  }
}

export type EpochValues = { s: string; ms: string; us: string; ns: string }

export function epochValues(nanos: bigint): EpochValues {
  return {
    s: floorDiv(nanos, NS_PER_UNIT.s).toString(),
    ms: floorDiv(nanos, NS_PER_UNIT.ms).toString(),
    us: floorDiv(nanos, NS_PER_UNIT.us).toString(),
    ns: nanos.toString()
  }
}

export function describeUnit(value: EpochConversion): string | null {
  if (!value.unit) return null
  const name = UNIT_NAMES[value.unit]
  return value.unitDetected
    ? `Detected ${name} (${value.digits} digit${value.digits === 1 ? '' : 's'}). Pick a unit to override.`
    : `Treated as ${name}.`
}

/** Epoch "now" in `unit` (auto = seconds, the classic Unix timestamp). */
export function nowEpoch(unit: TimestampUnit, nowMs = Date.now()): string {
  const nanos = BigInt(nowMs) * NS_PER_UNIT.ms
  const values = epochValues(nanos)
  return unit === 'auto' ? values.s : values[unit]
}

/**
 * Shift the user's input by `deltaSeconds`. Numeric input stays in its
 * (detected or chosen) unit; date strings return an ISO string.
 */
export function shiftTimestampInput(
  raw: string,
  unit: TimestampUnit,
  deltaSeconds: number
): string | null {
  const result = convertTimestampInput(raw, unit)
  if (!result.ok) return null
  const { value } = result
  const delta = BigInt(Math.round(deltaSeconds)) * NS_PER_UNIT.s
  const shifted = value.nanos + delta
  if (value.kind === 'date') {
    const date = nanosToDate(shifted)
    return date ? date.toISOString() : null
  }
  if (!value.unit) return null
  if (!nanosToDate(shifted)) return null
  return floorDiv(shifted, NS_PER_UNIT[value.unit]).toString()
}

const RELATIVE_STEPS: readonly [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 3600],
  ['month', 30 * 24 * 3600],
  ['week', 7 * 24 * 3600],
  ['day', 24 * 3600],
  ['hour', 3600],
  ['minute', 60],
  ['second', 1]
]

export function relativeTime(target: Date, now: number = Date.now()): string {
  const diffSeconds = Math.round((target.getTime() - now) / 1000)
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })
  const abs = Math.abs(diffSeconds)
  for (const [unit, seconds] of RELATIVE_STEPS) {
    if (abs >= seconds || unit === 'second') {
      return formatter.format(Math.trunc(diffSeconds / seconds), unit)
    }
  }
  return formatter.format(0, 'second')
}
