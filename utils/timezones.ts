/**
 * Time zone helpers built on `Intl` only (no Temporal / Luxon).
 * Offsets are derived by formatting an instant in the zone, so DST rules come
 * from the browser's tz database.
 */

const DAY_MS = 24 * 60 * 60 * 1000

const FALLBACK_ZONES: readonly string[] = [
  'UTC',
  'Pacific/Honolulu',
  'America/Anchorage',
  'America/Los_Angeles',
  'America/Denver',
  'America/Chicago',
  'America/New_York',
  'America/Toronto',
  'America/Sao_Paulo',
  'Atlantic/Reykjavik',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Prague',
  'Europe/Athens',
  'Europe/Moscow',
  'Africa/Cairo',
  'Africa/Johannesburg',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Dhaka',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Pacific/Auckland'
]

let cachedZones: string[] | null = null

export function listTimeZones(): string[] {
  if (cachedZones) return cachedZones
  let zones: string[] = []
  try {
    if (typeof Intl.supportedValuesOf === 'function') {
      zones = Intl.supportedValuesOf('timeZone')
    }
  } catch {
    zones = []
  }
  if (zones.length === 0) zones = [...FALLBACK_ZONES]
  if (!zones.includes('UTC')) zones = ['UTC', ...zones]
  cachedZones = zones
  return zones
}

export function isValidTimeZone(zone: string): boolean {
  if (!zone) return false
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: zone })
    return true
  } catch {
    return false
  }
}

export function localTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
  } catch {
    return 'UTC'
  }
}

/** Empty string means "browser local". */
export function resolveZone(zone: string): string {
  if (zone && isValidTimeZone(zone)) return zone
  return localTimeZone()
}

const partsFormatters = new Map<string, Intl.DateTimeFormat>()

function partsFormatter(zone: string): Intl.DateTimeFormat {
  let formatter = partsFormatters.get(zone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    partsFormatters.set(zone, formatter)
  }
  return formatter
}

export type WallTime = {
  year: number
  month: number
  day: number
  hour: number
  minute: number
  second: number
}

/** Interpret wall-clock fields as UTC and return epoch ms. */
export function wallToUtcMs(wall: WallTime): number {
  const d = new Date(0)
  d.setUTCFullYear(wall.year, wall.month - 1, wall.day)
  d.setUTCHours(wall.hour, wall.minute, wall.second, 0)
  return d.getTime()
}

export function instantToWall(ms: number, zone: string): WallTime {
  const parts = partsFormatter(zone).formatToParts(new Date(ms))
  const get = (type: Intl.DateTimeFormatPartTypes): number => {
    const part = parts.find((p) => p.type === type)
    return part ? Number(part.value) : 0
  }
  return {
    year: get('year'),
    month: get('month'),
    day: get('day'),
    hour: get('hour') % 24,
    minute: get('minute'),
    second: get('second')
  }
}

/** Zone offset from UTC in ms at the given instant (east = positive). */
export function zoneOffsetMs(ms: number, zone: string): number {
  const wall = instantToWall(ms, zone)
  return wallToUtcMs(wall) - Math.floor(ms / 1000) * 1000
}

export function formatOffset(offsetMs: number): string {
  const sign = offsetMs < 0 ? '-' : '+'
  const totalMinutes = Math.round(Math.abs(offsetMs) / 60000)
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0')
  const mm = String(totalMinutes % 60).padStart(2, '0')
  return `UTC${sign}${hh}:${mm}`
}

export type WallResolution = 'ok' | 'gap' | 'ambiguous'

/**
 * Convert a wall-clock time in `zone` to an instant.
 * - gap (spring forward, time does not exist): moves forward by the gap
 * - ambiguous (fall back, time occurs twice): picks the earlier instant
 */
export function wallToInstant(
  wall: WallTime,
  zone: string
): { ms: number; resolution: WallResolution } {
  const guess = wallToUtcMs(wall)
  const offsets = new Set<number>([
    zoneOffsetMs(guess - DAY_MS, zone),
    zoneOffsetMs(guess, zone),
    zoneOffsetMs(guess + DAY_MS, zone)
  ])
  const valid = new Set<number>()
  for (const offset of offsets) {
    const candidate = guess - offset
    if (zoneOffsetMs(candidate, zone) === offset) valid.add(candidate)
  }
  if (valid.size === 0) {
    const before = zoneOffsetMs(guess - DAY_MS, zone)
    return { ms: guess - before, resolution: 'gap' }
  }
  const sorted = [...valid].sort((a, b) => a - b)
  return {
    ms: sorted[0],
    resolution: sorted.length > 1 ? 'ambiguous' : 'ok'
  }
}

export type ZonedDisplay = {
  /** `YYYY-MM-DD HH:mm:ss` in the zone. */
  wall: string
  /** Locale-formatted weekday, date, time, and zone abbreviation. */
  long: string
  offset: string
  abbreviation: string
  wallDate: WallTime
}

function pad(value: number, width = 2): string {
  return String(value).padStart(width, '0')
}

export function formatWall(wall: WallTime): string {
  return `${pad(wall.year, 4)}-${pad(wall.month)}-${pad(wall.day)} ${pad(wall.hour)}:${pad(wall.minute)}:${pad(wall.second)}`
}

export function describeInstant(ms: number, zone: string): ZonedDisplay {
  const wallDate = instantToWall(ms, zone)
  const date = new Date(ms)
  const long = new Intl.DateTimeFormat(undefined, {
    timeZone: zone,
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  }).format(date)
  const abbreviation =
    new Intl.DateTimeFormat('en-US', { timeZone: zone, timeZoneName: 'short' })
      .formatToParts(date)
      .find((p) => p.type === 'timeZoneName')?.value ?? ''
  return {
    wall: formatWall(wallDate),
    long,
    offset: formatOffset(zoneOffsetMs(ms, zone)),
    abbreviation,
    wallDate
  }
}

/** Whole calendar days from `from`'s date to `to`'s date. */
export function calendarDayDiff(from: WallTime, to: WallTime): number {
  const a = Date.UTC(from.year, from.month - 1, from.day)
  const b = Date.UTC(to.year, to.month - 1, to.day)
  return Math.round((b - a) / DAY_MS)
}

/** `YYYY-MM-DDTHH:mm:ss` for `<input type="datetime-local" step="1">`. */
export function toDateTimeLocalValue(wall: WallTime): string {
  return `${pad(wall.year, 4)}-${pad(wall.month)}-${pad(wall.day)}T${pad(wall.hour)}:${pad(wall.minute)}:${pad(wall.second)}`
}

export function parseDateTimeLocal(value: string): WallTime | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(
    value.trim()
  )
  if (!match) return null
  const wall: WallTime = {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: match[6] ? Number(match[6]) : 0
  }
  if (
    wall.month < 1 ||
    wall.month > 12 ||
    wall.hour > 23 ||
    wall.minute > 59 ||
    wall.second > 59
  ) {
    return null
  }
  // Reject day overflow such as 2023-02-31.
  const check = new Date(wallToUtcMs(wall))
  if (
    check.getUTCMonth() + 1 !== wall.month ||
    check.getUTCDate() !== wall.day
  ) {
    return null
  }
  return wall
}
