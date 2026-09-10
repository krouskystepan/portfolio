import {
  hexToRgb,
  hslToHex,
  rgbToHex,
  rgbToHsl,
  type HSL
} from '@/utils/colorUtils'

export type GradientType = 'linear' | 'radial' | 'conic'
export type RadialShape = 'circle' | 'ellipse'
export type RadialSize =
  | 'closest-side'
  | 'closest-corner'
  | 'farthest-side'
  | 'farthest-corner'
export type GradientExportFormat = 'css' | 'tailwind' | 'json'

export type GradientStop = {
  id: string
  hex: string
  position: number
}

export type Gradient = {
  type: GradientType
  repeating: boolean
  angle: number
  shape: RadialShape
  size: RadialSize
  posX: number
  posY: number
  stops: GradientStop[]
}

export const MIN_STOPS = 2
export const MAX_STOPS = 8
export const DEFAULT_STOP_COUNT = 3
export const DEFAULT_ANGLE = 90
export const DEFAULT_SHAPE: RadialShape = 'circle'
export const DEFAULT_SIZE: RadialSize = 'farthest-corner'
export const DEFAULT_TYPE: GradientType = 'linear'
export const DEFAULT_POS = 50

export const GRADIENT_TYPES: { id: GradientType; label: string }[] = [
  { id: 'linear', label: 'Linear' },
  { id: 'radial', label: 'Radial' },
  { id: 'conic', label: 'Conic' }
]

export const RADIAL_SHAPES: { id: RadialShape; label: string }[] = [
  { id: 'circle', label: 'Circle' },
  { id: 'ellipse', label: 'Ellipse' }
]

export const RADIAL_SIZES: {
  id: RadialSize
  label: string
  hint: string
}[] = [
  {
    id: 'closest-side',
    label: 'Closest side',
    hint: 'The 100% stop meets the nearest edge. Keep the center inside the box - on an edge the radius is 0.'
  },
  {
    id: 'closest-corner',
    label: 'Closest corner',
    hint: 'The 100% stop meets the nearest corner.'
  },
  {
    id: 'farthest-side',
    label: 'Farthest side',
    hint: 'The 100% stop meets the farthest edge.'
  },
  {
    id: 'farthest-corner',
    label: 'Farthest corner',
    hint: 'The 100% stop meets the farthest corner (CSS default).'
  }
]

export const POSITION_CELLS: { x: number; y: number; label: string }[] = [
  { x: 0, y: 0, label: 'Top left' },
  { x: 50, y: 0, label: 'Top' },
  { x: 100, y: 0, label: 'Top right' },
  { x: 0, y: 50, label: 'Left' },
  { x: 50, y: 50, label: 'Center' },
  { x: 100, y: 50, label: 'Right' },
  { x: 0, y: 100, label: 'Bottom left' },
  { x: 50, y: 100, label: 'Bottom' },
  { x: 100, y: 100, label: 'Bottom right' }
]

/** Keep the center inside the box so `closest-side` has a non-zero radius. */
export const RADIAL_EDGE_INSET = 20

export function radialExtentCollapsed(
  size: RadialSize,
  posX: number,
  posY: number
): boolean {
  const onXEdge = posX === 0 || posX === 100
  const onYEdge = posY === 0 || posY === 100
  if (size === 'closest-side') return onXEdge || onYEdge
  if (size === 'closest-corner') return onXEdge && onYEdge
  return false
}

function insetAxis(n: number): number {
  if (n <= 0) return RADIAL_EDGE_INSET
  if (n >= 100) return 100 - RADIAL_EDGE_INSET
  return clampPosition(n)
}

export function nudgePositionForRadialSize(
  size: RadialSize,
  x: number,
  y: number
): { x: number; y: number } {
  if (size === 'closest-side') {
    return { x: insetAxis(x), y: insetAxis(y) }
  }
  if (
    size === 'closest-corner' &&
    (x === 0 || x === 100) &&
    (y === 0 || y === 100)
  ) {
    return { x: insetAxis(x), y: insetAxis(y) }
  }
  return { x: clampPosition(x), y: clampPosition(y) }
}

export const EXPORT_FORMATS: { id: GradientExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'json', label: 'JSON' }
]

export const ANGLE_PRESETS = [0, 45, 90, 135, 180, 225, 270, 315] as const

export type GradientPreset = {
  id: string
  label: string
  type: GradientType
  repeating?: boolean
  angle?: number
  shape?: RadialShape
  size?: RadialSize
  posX?: number
  posY?: number
  stops: readonly { hex: string; position: number }[]
}

export const GRADIENT_PRESETS: GradientPreset[] = [
  {
    id: 'sunset',
    label: 'Sunset',
    type: 'linear',
    angle: 90,
    stops: [
      { hex: '#FF6B6B', position: 0 },
      { hex: '#FFB347', position: 45 },
      { hex: '#6C5CE7', position: 100 }
    ]
  },
  {
    id: 'ocean',
    label: 'Ocean',
    type: 'linear',
    angle: 180,
    stops: [
      { hex: '#0F2027', position: 0 },
      { hex: '#203A43', position: 50 },
      { hex: '#2C5364', position: 100 }
    ]
  },
  {
    id: 'mint',
    label: 'Mint',
    type: 'linear',
    angle: 90,
    stops: [
      { hex: '#D4FC79', position: 0 },
      { hex: '#96E6A1', position: 100 }
    ]
  },
  {
    id: 'dusk',
    label: 'Dusk',
    type: 'linear',
    angle: 135,
    stops: [
      { hex: '#0F0C29', position: 0 },
      { hex: '#302B63', position: 50 },
      { hex: '#24243E', position: 100 }
    ]
  },
  {
    id: 'spotlight',
    label: 'Spotlight',
    type: 'radial',
    shape: 'circle',
    size: 'farthest-corner',
    posX: 50,
    posY: 50,
    stops: [
      { hex: '#FFFFFF', position: 0 },
      { hex: '#7C3AED', position: 50 },
      { hex: '#0F172A', position: 100 }
    ]
  },
  {
    id: 'wheel',
    label: 'Wheel',
    type: 'conic',
    angle: 0,
    posX: 50,
    posY: 50,
    stops: [
      { hex: '#FF6B6B', position: 0 },
      { hex: '#FFD93D', position: 25 },
      { hex: '#6BCB77', position: 50 },
      { hex: '#4D96FF', position: 75 },
      { hex: '#FF6B6B', position: 100 }
    ]
  }
]

export function gradientFromPreset(preset: GradientPreset): Gradient {
  return {
    type: preset.type,
    repeating: preset.repeating ?? false,
    angle: preset.angle ?? DEFAULT_ANGLE,
    shape: preset.shape ?? DEFAULT_SHAPE,
    size: preset.size ?? DEFAULT_SIZE,
    posX: preset.posX ?? DEFAULT_POS,
    posY: preset.posY ?? DEFAULT_POS,
    stops: preset.stops.map((s) => makeStop(s.hex, s.position))
  }
}

export function presetMatches(
  preset: GradientPreset,
  gradient: Gradient
): boolean {
  const next = gradientFromPreset(preset)
  if (
    next.type !== gradient.type ||
    next.repeating !== gradient.repeating ||
    next.angle !== gradient.angle
  ) {
    return false
  }
  if (gradient.type === 'radial') {
    if (next.shape !== gradient.shape || next.size !== gradient.size) {
      return false
    }
  }
  if (gradient.type === 'radial' || gradient.type === 'conic') {
    if (next.posX !== gradient.posX || next.posY !== gradient.posY) {
      return false
    }
  }
  if (next.stops.length !== gradient.stops.length) return false
  const a = sortStops(next.stops)
  const b = sortStops(gradient.stops)
  return a.every(
    (s, i) =>
      s.hex.toUpperCase() === b[i].hex.toUpperCase() &&
      s.position === b[i].position
  )
}

/** Deterministic SSR/hydration placeholder - never use Math.random() / UUID here. */
export const DEFAULT_STOP_DEFS = [
  { hex: '#FF6B6B', position: 0 },
  { hex: '#4ECDC4', position: 50 },
  { hex: '#556270', position: 100 }
] as const

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

const wrapHue = (h: number) => ((h % 360) + 360) % 360

const rand = (min: number, max: number) => min + Math.random() * (max - min)

const normalizeHex = (hex: string): string | null => {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

export function createStopId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `g-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function makeStop(
  hex: string,
  position: number,
  id = createStopId()
): GradientStop {
  return {
    id,
    hex,
    position: clampPosition(position)
  }
}

export function clampPosition(n: number): number {
  if (!Number.isFinite(n)) return 0
  return clamp(Math.round(n), 0, 100)
}

export function clampAngle(n: number): number {
  if (!Number.isFinite(n)) return DEFAULT_ANGLE
  return clamp(Math.round(n), 0, 360)
}

export function sortStops(stops: GradientStop[]): GradientStop[] {
  return [...stops].sort((a, b) => a.position - b.position)
}

export function createPlaceholderStops(
  count = DEFAULT_STOP_COUNT
): GradientStop[] {
  const n = clamp(count, MIN_STOPS, MAX_STOPS)
  return Array.from({ length: n }, (_, i) => {
    const def = DEFAULT_STOP_DEFS[i % DEFAULT_STOP_DEFS.length]
    const t = n === 1 ? 0 : i / (n - 1)
    return makeStop(
      def.hex,
      n <= DEFAULT_STOP_DEFS.length
        ? (DEFAULT_STOP_DEFS[i]?.position ?? Math.round(t * 100))
        : Math.round(t * 100),
      `gradient-ssr-${i}`
    )
  })
}

export function createDefaultStops(): GradientStop[] {
  return DEFAULT_STOP_DEFS.map((d) => makeStop(d.hex, d.position))
}

export type ParsedStop = { hex: string; position: number }

export function toShareParam(stops: ParsedStop[]): string {
  return stops
    .map(
      (s) =>
        `${s.hex.replace(/^#/, '').toLowerCase()}@${clampPosition(s.position)}`
    )
    .join('-')
}

export function parseShareParam(raw: string): ParsedStop[] | null {
  const parts = raw
    .trim()
    .split('-')
    .map((p) => p.trim())
    .filter(Boolean)
  if (parts.length < MIN_STOPS || parts.length > MAX_STOPS) return null
  const stops: ParsedStop[] = []
  for (const part of parts) {
    const at = part.lastIndexOf('@')
    if (at <= 0) return null
    const hexPart = part.slice(0, at)
    const posPart = part.slice(at + 1)
    const hex = normalizeHex(hexPart)
    const position = Number.parseInt(posPart, 10)
    if (!hex || !Number.isFinite(position)) return null
    stops.push({ hex, position: clampPosition(position) })
  }
  return stops
}

export const DEFAULT_SHARE_PARAM = toShareParam([...DEFAULT_STOP_DEFS])

export function stopsFromParsed(parsed: ParsedStop[]): GradientStop[] {
  return parsed.map((s) => makeStop(s.hex, s.position))
}

function randomHsl(): HSL {
  return {
    h: rand(0, 360),
    s: rand(45, 85),
    l: rand(35, 70)
  }
}

function hueOffsets(count: number): number[] {
  if (count === 2) return [0, 180]
  if (count === 3) return [-30, 0, 150]
  if (count === 4) return [0, 90, 180, 270]
  return Array.from({ length: count }, (_, i) => (360 / count) * i)
}

/** Complementary / analogous-ish stops from a random seed hue. */
export function randomizeStops(count = DEFAULT_STOP_COUNT): GradientStop[] {
  const n = clamp(count, MIN_STOPS, MAX_STOPS)
  const base = randomHsl()
  const offsets = hueOffsets(n)
  return offsets.map((offset, i) => {
    const t = n === 1 ? 0.5 : i / (n - 1)
    const hex = hslToHex(
      wrapHue(base.h + offset),
      clamp(base.s + (i % 2 === 0 ? 0 : -10), 30, 90),
      clamp(base.l + (t - 0.5) * 24, 22, 78)
    )
    return makeStop(hex, Math.round(t * 100))
  })
}

function midpointHex(aHex: string, bHex: string): string {
  const aRgb = hexToRgb(aHex)
  const bRgb = hexToRgb(bHex)
  if (!aRgb || !bRgb) return aHex
  const a = rgbToHsl(aRgb.r, aRgb.g, aRgb.b)
  const b = rgbToHsl(bRgb.r, bRgb.g, bRgb.b)
  let dh = b.h - a.h
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360
  return hslToHex(wrapHue(a.h + dh / 2), (a.s + b.s) / 2, (a.l + b.l) / 2)
}

export function addStop(stops: GradientStop[]): GradientStop[] | null {
  if (stops.length >= MAX_STOPS) return null
  const sorted = sortStops(stops)
  let gapStart = 0
  let maxGap = -1
  for (let i = 0; i < sorted.length - 1; i++) {
    const gap = sorted[i + 1].position - sorted[i].position
    if (gap > maxGap) {
      maxGap = gap
      gapStart = i
    }
  }
  const a = sorted[gapStart]
  const b = sorted[gapStart + 1] ?? a
  const position = clampPosition((a.position + b.position) / 2)
  return [...stops, makeStop(midpointHex(a.hex, b.hex), position)]
}

export function removeStop(
  stops: GradientStop[],
  id: string
): GradientStop[] | null {
  if (stops.length <= MIN_STOPS) return null
  const next = stops.filter((s) => s.id !== id)
  return next.length === stops.length ? null : next
}

export function updateStopHex(
  stops: GradientStop[],
  id: string,
  raw: string
): GradientStop[] {
  let value = raw.trim()
  if (!value.startsWith('#')) value = `#${value}`
  const hex = normalizeHex(value)
  if (!hex) return stops
  return stops.map((s) => (s.id === id ? { ...s, hex } : s))
}

export function updateStopPosition(
  stops: GradientStop[],
  id: string,
  position: number
): GradientStop[] {
  const next = clampPosition(position)
  return stops.map((s) => (s.id === id ? { ...s, position: next } : s))
}

function formatStopCss(stop: ParsedStop): string {
  return `${stop.hex.toUpperCase()} ${clampPosition(stop.position)}%`
}

/** Cardinal angles as `to top` etc. - `0deg` can paint a 1px seam at the end edge. */
function linearGradientAxis(angle: number): string {
  const a = clampAngle(angle)
  switch (a) {
    case 0:
    case 360:
      return 'to top'
    case 90:
      return 'to right'
    case 180:
      return 'to bottom'
    case 270:
      return 'to left'
    default:
      return `${a}deg`
  }
}

function gradientFnName(type: GradientType, repeating: boolean): string {
  return `${repeating ? 'repeating-' : ''}${type}-gradient`
}

function formatAt(x: number, y: number): string {
  return `at ${clampPosition(x)}% ${clampPosition(y)}%`
}

export function gradientCssValue(gradient: Gradient): string {
  const stops = sortStops(gradient.stops).map(formatStopCss).join(', ')
  const fn = gradientFnName(gradient.type, gradient.repeating)
  if (gradient.type === 'linear') {
    return `${fn}(${linearGradientAxis(gradient.angle)}, ${stops})`
  }
  if (gradient.type === 'radial') {
    return `${fn}(${gradient.shape} ${gradient.size} ${formatAt(gradient.posX, gradient.posY)}, ${stops})`
  }
  return `${fn}(from ${clampAngle(gradient.angle)}deg ${formatAt(gradient.posX, gradient.posY)}, ${stops})`
}

export function exportCss(gradient: Gradient): string {
  return `background: ${gradientCssValue(gradient)};`
}

export function exportTailwind(gradient: Gradient): string {
  const inner = gradientCssValue(gradient)
    .replace(/, /g, ',')
    .replace(/ /g, '_')
  return `bg-[${inner}]`
}

export function exportJson(gradient: Gradient): string {
  const stops = sortStops(gradient.stops).map((s) => ({
    hex: s.hex.toUpperCase(),
    position: clampPosition(s.position)
  }))
  const repeating = gradient.repeating
  if (gradient.type === 'linear') {
    return JSON.stringify(
      {
        type: 'linear',
        repeating,
        angle: clampAngle(gradient.angle),
        stops
      },
      null,
      2
    )
  }
  if (gradient.type === 'radial') {
    return JSON.stringify(
      {
        type: 'radial',
        repeating,
        shape: gradient.shape,
        size: gradient.size,
        position: {
          x: clampPosition(gradient.posX),
          y: clampPosition(gradient.posY)
        },
        stops
      },
      null,
      2
    )
  }
  return JSON.stringify(
    {
      type: 'conic',
      repeating,
      angle: clampAngle(gradient.angle),
      position: {
        x: clampPosition(gradient.posX),
        y: clampPosition(gradient.posY)
      },
      stops
    },
    null,
    2
  )
}

export function exportGradient(
  format: GradientExportFormat,
  gradient: Gradient
): string {
  switch (format) {
    case 'css':
      return exportCss(gradient)
    case 'tailwind':
      return exportTailwind(gradient)
    case 'json':
      return exportJson(gradient)
  }
}
