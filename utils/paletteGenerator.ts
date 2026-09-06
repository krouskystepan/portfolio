import {
  hexToRgb,
  hslToHex,
  rgbToHex,
  rgbToHsl,
  type HSL
} from '@/utils/colorUtils'

export type HarmonyMode =
  | 'random'
  | 'complementary'
  | 'analogous'
  | 'triadic'
  | 'tetradic'
  | 'monochromatic'
  | 'shades'

export type PaletteColor = { id: string; hex: string; locked: boolean }

export type BlindnessMode =
  | 'none'
  | 'protanopia'
  | 'deuteranopia'
  | 'tritanopia'

export type ExportFormat = 'css' | 'tailwind' | 'json' | 'svg' | 'hex'

export const MIN_PALETTE = 2
export const MAX_PALETTE = 12
export const DEFAULT_PALETTE_COUNT = 5

export function createColorId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function makePaletteColor(
  hex: string,
  locked = false,
  id = createColorId()
): PaletteColor {
  return { id, hex, locked }
}

/** Deterministic SSR/hydration placeholder — never use Math.random() / UUID here. */
export const SSR_PLACEHOLDER_HEXES = [
  '#6B7280',
  '#78716C',
  '#64748B',
  '#71717A',
  '#57534E'
] as const

export function createPlaceholderPalette(
  count = DEFAULT_PALETTE_COUNT
): PaletteColor[] {
  const n = Math.min(MAX_PALETTE, Math.max(MIN_PALETTE, count))
  return Array.from({ length: n }, (_, i) =>
    makePaletteColor(
      SSR_PLACEHOLDER_HEXES[i % SSR_PLACEHOLDER_HEXES.length],
      false,
      `palette-ssr-${i}`
    )
  )
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

const wrapHue = (h: number) => ((h % 360) + 360) % 360

const rand = (min: number, max: number) =>
  min + Math.random() * (max - min)

const normalizeHex = (hex: string): string | null => {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

const randomHsl = (): HSL => ({
  h: rand(0, 360),
  s: rand(45, 85),
  l: rand(35, 70)
})

const hslFromSeed = (seedHex?: string): HSL => {
  if (seedHex) {
    const rgb = hexToRgb(seedHex)
    if (rgb) return rgbToHsl(rgb.r, rgb.g, rgb.b)
  }
  return randomHsl()
}

const hueOffsetsForMode = (mode: HarmonyMode): number[] => {
  switch (mode) {
    case 'complementary':
      return [0, 180]
    case 'analogous':
      return [-30, 0, 30]
    case 'triadic':
      return [0, 120, 240]
    case 'tetradic':
      return [0, 90, 180, 270]
    case 'monochromatic':
    case 'shades':
    case 'random':
      return [0]
  }
}

/** Build `count` HSL colors from a mode + base. */
function buildHslList(count: number, mode: HarmonyMode, base: HSL): HSL[] {
  const n = clamp(count, MIN_PALETTE, MAX_PALETTE)

  if (mode === 'random') {
    return Array.from({ length: n }, () => randomHsl())
  }

  if (mode === 'monochromatic') {
    return Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1)
      return {
        h: base.h,
        s: clamp(base.s + (t - 0.5) * 30, 25, 90),
        l: clamp(25 + t * 55, 18, 88)
      }
    })
  }

  if (mode === 'shades') {
    return Array.from({ length: n }, (_, i) => {
      const t = n === 1 ? 0.5 : i / (n - 1)
      return {
        h: base.h,
        s: clamp(base.s, 15, 90),
        l: clamp(12 + t * 76, 8, 92)
      }
    })
  }

  const offsets = hueOffsetsForMode(mode)
  const colors: HSL[] = []

  for (let i = 0; i < n; i++) {
    const offset = offsets[i % offsets.length]
    const cycle = Math.floor(i / offsets.length)
    const lightnessShift = cycle * 12
    colors.push({
      h: wrapHue(base.h + offset + (mode === 'analogous' ? 0 : cycle * 8)),
      s: clamp(base.s + (i % 2 === 0 ? 0 : -8), 30, 90),
      l: clamp(base.l + (i % 2 === 0 ? lightnessShift : -lightnessShift * 0.6), 22, 78)
    })
  }

  return colors
}

function applyLocks(
  generated: string[],
  existing?: PaletteColor[]
): PaletteColor[] {
  return generated.map((hex, i) => {
    const prev = existing?.[i]
    if (prev?.locked) {
      return makePaletteColor(prev.hex, true, prev.id)
    }
    return makePaletteColor(hex, prev?.locked ?? false, prev?.id)
  })
}

export function generatePalette(opts: {
  count: number
  mode: HarmonyMode
  seedHex?: string
  existing?: PaletteColor[]
}): PaletteColor[] {
  const count = clamp(opts.count, MIN_PALETTE, MAX_PALETTE)
  const seed =
    opts.seedHex ??
    opts.existing?.find((c) => c.locked)?.hex ??
    opts.existing?.[0]?.hex
  const base = hslFromSeed(seed)
  const hsls = buildHslList(count, opts.mode, base)
  const hexes = hsls.map((c) => hslToHex(c.h, c.s, c.l))

  if (opts.existing && opts.existing.length === count) {
    return applyLocks(hexes, opts.existing)
  }

  // Resize: keep locks / ids that still fit
  const existing = opts.existing ?? []
  return hexes.map((hex, i) => {
    const prev = existing[i]
    if (prev?.locked) {
      return makePaletteColor(prev.hex, true, prev.id)
    }
    return makePaletteColor(hex, false, prev?.id)
  })
}

export function regenerateUnlocked(
  colors: PaletteColor[],
  mode: HarmonyMode
): PaletteColor[] {
  if (colors.every((c) => c.locked)) return colors
  // Always pick a new base so harmony modes aren't stuck on the same seed.
  // Locked swatches are restored via `existing` / applyLocks.
  return generatePalette({
    count: colors.length,
    mode,
    existing: colors
  })
}

function srgbChannel(c: number) {
  const v = c / 255
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex: string): number {
  const rgb = hexToRgb(hex)
  if (!rgb) return 0
  return (
    0.2126 * srgbChannel(rgb.r) +
    0.7152 * srgbChannel(rgb.g) +
    0.0722 * srgbChannel(rgb.b)
  )
}

export function contrastRatio(a: string, b: string): number {
  const la = relativeLuminance(a)
  const lb = relativeLuminance(b)
  const lighter = Math.max(la, lb)
  const darker = Math.min(la, lb)
  return (lighter + 0.05) / (darker + 0.05)
}

export function wcagLevel(ratio: number): 'AAA' | 'AA' | 'fail' {
  if (ratio >= 7) return 'AAA'
  if (ratio >= 4.5) return 'AA'
  return 'fail'
}

/** Prefer white or black text on a solid swatch. */
export function contrastingText(hex: string): '#FFFFFF' | '#000000' {
  return relativeLuminance(hex) > 0.4 ? '#000000' : '#FFFFFF'
}

// Approximate CVD simulation matrices (linear RGB), Machado et al. style.
const BLINDNESS_MATRICES: Record<
  Exclude<BlindnessMode, 'none'>,
  readonly [readonly [number, number, number], readonly [number, number, number], readonly [number, number, number]]
> = {
  protanopia: [
    [0.56667, 0.43333, 0],
    [0.55833, 0.44167, 0],
    [0, 0.24167, 0.75833]
  ],
  deuteranopia: [
    [0.625, 0.375, 0],
    [0.7, 0.3, 0],
    [0, 0.3, 0.7]
  ],
  tritanopia: [
    [0.95, 0.05, 0],
    [0, 0.43333, 0.56667],
    [0, 0.475, 0.525]
  ]
}

function linearToSrgb(v: number) {
  const c = clamp(v, 0, 1)
  return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055
}

export function simulateBlindness(hex: string, mode: BlindnessMode): string {
  if (mode === 'none') {
    const n = normalizeHex(hex)
    return n ?? '#000000'
  }
  const rgb = hexToRgb(hex)
  if (!rgb) return '#000000'
  const lr = srgbChannel(rgb.r)
  const lg = srgbChannel(rgb.g)
  const lb = srgbChannel(rgb.b)
  const m = BLINDNESS_MATRICES[mode]
  const r = m[0][0] * lr + m[0][1] * lg + m[0][2] * lb
  const g = m[1][0] * lr + m[1][1] * lg + m[1][2] * lb
  const b = m[2][0] * lr + m[2][1] * lg + m[2][2] * lb
  return rgbToHex(
    Math.round(linearToSrgb(r) * 255),
    Math.round(linearToSrgb(g) * 255),
    Math.round(linearToSrgb(b) * 255)
  )
}

export function shadeRamp(hex: string, steps = 10): string[] {
  const rgb = hexToRgb(hex)
  if (!rgb) return Array.from({ length: steps }, () => '#000000')
  const { h, s } = rgbToHsl(rgb.r, rgb.g, rgb.b)
  const n = Math.max(2, steps)
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const l = 8 + t * 84
    return hslToHex(h, clamp(s, 10, 95), l)
  })
}

export function exportCssVars(colors: string[]): string {
  const lines = colors.map((hex, i) => `  --color-${i + 1}: ${hex};`)
  return `:root {\n${lines.join('\n')}\n}`
}

export function exportTailwind(colors: string[]): string {
  const entries = colors.map(
    (hex, i) => `        ${i + 1}: '${hex.toLowerCase()}',`
  )
  return `module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        palette: {\n${entries.join('\n')}\n        }\n      }\n    }\n  }\n}`
}

export function exportJson(colors: string[]): string {
  return JSON.stringify(
    {
      colors: colors.map((hex, i) => ({
        name: `color-${i + 1}`,
        hex: hex.toUpperCase()
      }))
    },
    null,
    2
  )
}

export function exportSvg(colors: string[]): string {
  const n = colors.length || 1
  const w = 80
  const h = 120
  const rects = colors
    .map(
      (hex, i) =>
        `  <rect x="${i * w}" y="0" width="${w}" height="${h}" fill="${hex}"/>`
    )
    .join('\n')
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${n * w}" height="${h}" viewBox="0 0 ${n * w} ${h}">\n${rects}\n</svg>`
}

export function exportHexList(colors: string[]): string {
  return colors.map((c) => c.toUpperCase()).join('\n')
}

export function exportPalette(
  format: ExportFormat,
  colors: string[]
): string {
  switch (format) {
    case 'css':
      return exportCssVars(colors)
    case 'tailwind':
      return exportTailwind(colors)
    case 'json':
      return exportJson(colors)
    case 'svg':
      return exportSvg(colors)
    case 'hex':
      return exportHexList(colors)
  }
}

export function parseShareParam(c: string): string[] | null {
  const parts = c
    .trim()
    .split(/[-\s,]+/)
    .map((p) => p.replace(/^#/, ''))
    .filter(Boolean)
  if (parts.length < MIN_PALETTE || parts.length > MAX_PALETTE) return null
  const hexes: string[] = []
  for (const part of parts) {
    const n = normalizeHex(part)
    if (!n) return null
    hexes.push(n)
  }
  return hexes
}

export function toShareParam(hexes: string[]): string {
  return hexes.map((h) => h.replace(/^#/, '').toLowerCase()).join('-')
}

/** Shortest-path hue midpoint in HSL — the blend between two swatches. */
export function midpointColor(aHex: string, bHex: string): string {
  const aRgb = hexToRgb(aHex)
  const bRgb = hexToRgb(bHex)
  if (!aRgb || !bRgb) return aHex
  const a = rgbToHsl(aRgb.r, aRgb.g, aRgb.b)
  const b = rgbToHsl(bRgb.r, bRgb.g, bRgb.b)

  let dh = b.h - a.h
  if (dh > 180) dh -= 360
  if (dh < -180) dh += 360

  return hslToHex(
    wrapHue(a.h + dh / 2),
    (a.s + b.s) / 2,
    (a.l + b.l) / 2
  )
}

/**
 * Insert the midpoint color after `afterIndex` (between that swatch and the next).
 * Returns null if the palette is already at max size or the index is invalid.
 */
export function insertMidpointBetween(
  colors: PaletteColor[],
  afterIndex: number
): PaletteColor[] | null {
  if (colors.length >= MAX_PALETTE) return null
  if (afterIndex < 0 || afterIndex >= colors.length - 1) return null
  const mid = midpointColor(colors[afterIndex].hex, colors[afterIndex + 1].hex)
  const next = [
    ...colors.slice(0, afterIndex + 1),
    makePaletteColor(mid, false),
    ...colors.slice(afterIndex + 1)
  ]
  return next
}

/** Remove a swatch; returns null if at minimum size or index is invalid. */
export function removeColorAt(
  colors: PaletteColor[],
  index: number
): PaletteColor[] | null {
  if (colors.length <= MIN_PALETTE) return null
  if (index < 0 || index >= colors.length) return null
  return [...colors.slice(0, index), ...colors.slice(index + 1)]
}

export function moveColor(
  colors: PaletteColor[],
  fromIndex: number,
  toIndex: number
): PaletteColor[] {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= colors.length ||
    toIndex >= colors.length
  ) {
    return colors
  }
  const next = [...colors]
  const [item] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, item)
  return next
}

export const HARMONY_MODES: { id: HarmonyMode; label: string }[] = [
  { id: 'random', label: 'Random' },
  { id: 'complementary', label: 'Complementary' },
  { id: 'analogous', label: 'Analogous' },
  { id: 'triadic', label: 'Triadic' },
  { id: 'tetradic', label: 'Tetradic' },
  { id: 'monochromatic', label: 'Mono' },
  { id: 'shades', label: 'Shades' }
]

export const BLINDNESS_MODES: { id: BlindnessMode; label: string }[] = [
  { id: 'none', label: 'None' },
  { id: 'protanopia', label: 'Protanopia' },
  { id: 'deuteranopia', label: 'Deuteranopia' },
  { id: 'tritanopia', label: 'Tritanopia' }
]
