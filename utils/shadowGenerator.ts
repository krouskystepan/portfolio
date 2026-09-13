import { hexToRgb, hslToHex, rgbToHex } from '@/utils/colorUtils'

export type ShadowKind = 'box' | 'text'
export type ShadowExportFormat = 'css' | 'tailwind' | 'json'
export type ShadowSurface = 'light' | 'dark'

export type ShadowLayer = {
  id: string
  x: number
  y: number
  blur: number
  spread: number
  hex: string
  alpha: number
  inset: boolean
}

export type ParsedLayer = Omit<ShadowLayer, 'id'>

export const MIN_LAYERS = 1
export const MAX_LAYERS = 6
export const MIN_OFFSET = -100
export const MAX_OFFSET = 100
export const MIN_BLUR = 0
export const MAX_BLUR = 100
export const MIN_SPREAD = -50
export const MAX_SPREAD = 50

export const DEFAULT_KIND: ShadowKind = 'box'
export const DEFAULT_EXPORT: ShadowExportFormat = 'css'
export const DEFAULT_SURFACE: ShadowSurface = 'dark'
export const DEFAULT_SAMPLE = 'Shadow'

export const SHADOW_KINDS: { id: ShadowKind; label: string }[] = [
  { id: 'box', label: 'Box' },
  { id: 'text', label: 'Text' }
]

export const EXPORT_FORMATS: { id: ShadowExportFormat; label: string }[] = [
  { id: 'css', label: 'CSS' },
  { id: 'tailwind', label: 'Tailwind' },
  { id: 'json', label: 'JSON' }
]

export const SHADOW_SURFACES: { id: ShadowSurface; label: string }[] = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' }
]

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

export function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min
  return clamp(Math.round(n), min, max)
}

export function clampOffset(n: number): number {
  return clampInt(n, MIN_OFFSET, MAX_OFFSET)
}

export function clampBlur(n: number): number {
  return clampInt(n, MIN_BLUR, MAX_BLUR)
}

export function clampSpread(n: number): number {
  return clampInt(n, MIN_SPREAD, MAX_SPREAD)
}

/** 0–1, two decimals so URL alpha 0–100 round-trips. */
export function clampAlpha(n: number): number {
  if (!Number.isFinite(n)) return 1
  return Math.round(clamp(n, 0, 1) * 100) / 100
}

export function clampAlphaPct(n: number): number {
  return clampInt(n, 0, 100)
}

const normalizeHex = (hex: string): string | null => {
  const rgb = hexToRgb(hex)
  if (!rgb) return null
  return rgbToHex(rgb.r, rgb.g, rgb.b)
}

export function createLayerId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `sh-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`
}

export function makeLayer(
  layer: ParsedLayer,
  id = createLayerId()
): ShadowLayer {
  return {
    id,
    x: clampOffset(layer.x),
    y: clampOffset(layer.y),
    blur: clampBlur(layer.blur),
    spread: clampSpread(layer.spread),
    hex: normalizeHex(layer.hex) ?? '#000000',
    alpha: clampAlpha(layer.alpha),
    inset: Boolean(layer.inset)
  }
}

/** Soft card - default share example `0_8_24_0_000000_25_0`. */
export const DEFAULT_LAYER_DEFS: readonly ParsedLayer[] = [
  {
    x: 0,
    y: 8,
    blur: 24,
    spread: 0,
    hex: '#000000',
    alpha: 0.25,
    inset: false
  }
]

export type ShadowPreset = {
  id: string
  label: string
  hint: string
  kind: ShadowKind
  layers: readonly ParsedLayer[]
}

export const SHADOW_PRESETS: ShadowPreset[] = [
  {
    id: 'soft-card',
    label: 'Soft card',
    hint: 'Default elevation - 24px blur, 25% black',
    kind: 'box',
    layers: DEFAULT_LAYER_DEFS
  },
  {
    id: 'elevation',
    label: 'Elevation',
    hint: 'Key + ambient - two layered drops',
    kind: 'box',
    layers: [
      {
        x: 0,
        y: 1,
        blur: 2,
        spread: 0,
        hex: '#000000',
        alpha: 0.12,
        inset: false
      },
      {
        x: 0,
        y: 8,
        blur: 24,
        spread: -4,
        hex: '#000000',
        alpha: 0.18,
        inset: false
      }
    ]
  },
  {
    id: 'hard-offset',
    label: 'Hard offset',
    hint: 'Brutalist 8px offset, no blur',
    kind: 'box',
    layers: [
      {
        x: 8,
        y: 8,
        blur: 0,
        spread: 0,
        hex: '#111111',
        alpha: 1,
        inset: false
      }
    ]
  },
  {
    id: 'glow',
    label: 'Glow',
    hint: 'Indigo bloom, two blur radii',
    kind: 'box',
    layers: [
      {
        x: 0,
        y: 0,
        blur: 32,
        spread: 4,
        hex: '#6366F1',
        alpha: 0.55,
        inset: false
      },
      {
        x: 0,
        y: 0,
        blur: 12,
        spread: 0,
        hex: '#A5B4FC',
        alpha: 0.4,
        inset: false
      }
    ]
  },
  {
    id: 'inset',
    label: 'Inset',
    hint: 'Pressed well - inner shadow',
    kind: 'box',
    layers: [
      {
        x: 0,
        y: 2,
        blur: 8,
        spread: 0,
        hex: '#000000',
        alpha: 0.28,
        inset: true
      }
    ]
  },
  {
    id: 'text-soft',
    label: 'Soft',
    hint: 'Readable drop under a heading',
    kind: 'text',
    layers: [
      {
        x: 0,
        y: 2,
        blur: 8,
        spread: 0,
        hex: '#000000',
        alpha: 0.35,
        inset: false
      }
    ]
  },
  {
    id: 'text-neon',
    label: 'Neon',
    hint: 'Cyan / indigo glow stack',
    kind: 'text',
    layers: [
      {
        x: 0,
        y: 0,
        blur: 8,
        spread: 0,
        hex: '#22D3EE',
        alpha: 1,
        inset: false
      },
      {
        x: 0,
        y: 0,
        blur: 24,
        spread: 0,
        hex: '#22D3EE',
        alpha: 0.7,
        inset: false
      },
      {
        x: 0,
        y: 0,
        blur: 48,
        spread: 0,
        hex: '#6366F1',
        alpha: 0.5,
        inset: false
      }
    ]
  },
  {
    id: 'text-retro',
    label: 'Retro 3D',
    hint: 'Stacked hard offsets, no blur',
    kind: 'text',
    layers: [
      {
        x: 1,
        y: 1,
        blur: 0,
        spread: 0,
        hex: '#F43F5E',
        alpha: 1,
        inset: false
      },
      {
        x: 2,
        y: 2,
        blur: 0,
        spread: 0,
        hex: '#FB923C',
        alpha: 1,
        inset: false
      },
      {
        x: 3,
        y: 3,
        blur: 0,
        spread: 0,
        hex: '#FACC15',
        alpha: 1,
        inset: false
      }
    ]
  },
  {
    id: 'text-outline',
    label: 'Outline',
    hint: '1px in four directions',
    kind: 'text',
    layers: [
      {
        x: 1,
        y: 0,
        blur: 0,
        spread: 0,
        hex: '#000000',
        alpha: 1,
        inset: false
      },
      {
        x: -1,
        y: 0,
        blur: 0,
        spread: 0,
        hex: '#000000',
        alpha: 1,
        inset: false
      },
      {
        x: 0,
        y: 1,
        blur: 0,
        spread: 0,
        hex: '#000000',
        alpha: 1,
        inset: false
      },
      {
        x: 0,
        y: -1,
        blur: 0,
        spread: 0,
        hex: '#000000',
        alpha: 1,
        inset: false
      }
    ]
  }
]

export function presetsForKind(kind: ShadowKind): ShadowPreset[] {
  return SHADOW_PRESETS.filter((p) => p.kind === kind)
}

export function layersFromPreset(preset: ShadowPreset): ShadowLayer[] {
  return preset.layers.map((layer) => makeLayer(layer))
}

function layersEqual(a: ShadowLayer[], b: readonly ParsedLayer[]): boolean {
  if (a.length !== b.length) return false
  return a.every((layer, i) => {
    const other = b[i]
    return (
      layer.x === other.x &&
      layer.y === other.y &&
      layer.blur === other.blur &&
      layer.spread === other.spread &&
      layer.hex.toUpperCase() === other.hex.toUpperCase() &&
      layer.alpha === other.alpha &&
      layer.inset === other.inset
    )
  })
}

export function presetMatches(
  preset: ShadowPreset,
  kind: ShadowKind,
  layers: ShadowLayer[]
): boolean {
  return preset.kind === kind && layersEqual(layers, preset.layers)
}

/** Deterministic SSR/hydration placeholder - never use Math.random() / UUID here. */
export function createPlaceholderLayers(
  defs: readonly ParsedLayer[] = DEFAULT_LAYER_DEFS
): ShadowLayer[] {
  return defs.map((layer, i) => makeLayer(layer, `shadow-ssr-${i}`))
}

export function createDefaultLayers(): ShadowLayer[] {
  return DEFAULT_LAYER_DEFS.map((layer) => makeLayer(layer))
}

export function layersFromParsed(parsed: ParsedLayer[]): ShadowLayer[] {
  return parsed.map((layer) => makeLayer(layer))
}

function nz(n: number): number {
  return Object.is(n, -0) ? 0 : n
}

function encodeLayer(layer: ParsedLayer): string {
  const hex = (normalizeHex(layer.hex) ?? '#000000')
    .replace(/^#/, '')
    .toLowerCase()
  return [
    nz(clampOffset(layer.x)),
    nz(clampOffset(layer.y)),
    clampBlur(layer.blur),
    nz(clampSpread(layer.spread)),
    hex,
    clampAlphaPct(Math.round(clampAlpha(layer.alpha) * 100)),
    layer.inset ? 1 : 0
  ].join('_')
}

export function toShareParam(layers: readonly ParsedLayer[]): string {
  return layers.map(encodeLayer).join('-')
}

const LAYER_TOKEN =
  /^(-?\d+)_(-?\d+)_(\d+)_(-?\d+)_([0-9a-fA-F]{6})_(\d{1,3})_([01])/

export function parseShareParam(raw: string): ParsedLayer[] | null {
  const input = raw.trim()
  if (!input) return null
  const layers: ParsedLayer[] = []
  let rest = input
  while (rest) {
    const match = rest.match(LAYER_TOKEN)
    if (!match) return null
    const hex = normalizeHex(match[5])
    const alphaPct = Number.parseInt(match[6], 10)
    if (!hex || !Number.isFinite(alphaPct) || alphaPct > 100) return null
    layers.push({
      x: Number.parseInt(match[1], 10),
      y: Number.parseInt(match[2], 10),
      blur: Number.parseInt(match[3], 10),
      spread: Number.parseInt(match[4], 10),
      hex,
      alpha: clampAlpha(alphaPct / 100),
      inset: match[7] === '1'
    })
    rest = rest.slice(match[0].length)
    if (!rest) break
    if (!rest.startsWith('-')) return null
    rest = rest.slice(1)
  }
  if (layers.length < MIN_LAYERS || layers.length > MAX_LAYERS) return null
  return layers.map((layer) => ({
    x: clampOffset(layer.x),
    y: clampOffset(layer.y),
    blur: clampBlur(layer.blur),
    spread: clampSpread(layer.spread),
    hex: layer.hex,
    alpha: layer.alpha,
    inset: layer.inset
  }))
}

export const DEFAULT_SHARE_PARAM = toShareParam([...DEFAULT_LAYER_DEFS])

export function addLayer(layers: ShadowLayer[]): ShadowLayer[] | null {
  if (layers.length >= MAX_LAYERS) return null
  const last = layers[layers.length - 1] ?? DEFAULT_LAYER_DEFS[0]
  return [
    ...layers,
    makeLayer({
      x: clampOffset(last.x + 2),
      y: clampOffset(last.y + 2),
      blur: last.blur,
      spread: last.spread,
      hex: last.hex,
      alpha: last.alpha,
      inset: last.inset
    })
  ]
}

export function removeLayer(
  layers: ShadowLayer[],
  id: string
): ShadowLayer[] | null {
  if (layers.length <= MIN_LAYERS) return null
  const next = layers.filter((layer) => layer.id !== id)
  return next.length === layers.length ? null : next
}

export function patchLayer(
  layers: ShadowLayer[],
  id: string,
  patch: Partial<ParsedLayer>
): ShadowLayer[] {
  return layers.map((layer) => {
    if (layer.id !== id) return layer
    const next = { ...layer, ...patch }
    if (patch.hex != null) {
      let value = patch.hex.trim()
      if (value && !value.startsWith('#')) value = `#${value}`
      const hex = normalizeHex(value)
      if (!hex) return layer
      next.hex = hex
    }
    return makeLayer(next, layer.id)
  })
}

export function updateLayerHex(
  layers: ShadowLayer[],
  id: string,
  raw: string
): ShadowLayer[] {
  return patchLayer(layers, id, { hex: raw })
}

/** `#rrggbb` or `#rrggbbaa` for HexAlphaColorPicker. */
export function toHexAlpha(hex: string, alpha: number): string {
  const normalized = normalizeHex(hex) ?? '#000000'
  const aa = Math.round(clampAlpha(alpha) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${normalized}${aa}`.toLowerCase()
}

export function fromHexAlpha(
  value: string
): { hex: string; alpha: number } | null {
  const raw = value.trim()
  if (/^#[0-9a-f]{8}$/i.test(raw)) {
    const hex = normalizeHex(raw.slice(0, 7))
    if (!hex) return null
    const alpha =
      Math.round((Number.parseInt(raw.slice(7, 9), 16) / 255) * 100) / 100
    return { hex, alpha: clampAlpha(alpha) }
  }
  const hex = normalizeHex(raw)
  if (!hex) return null
  return { hex, alpha: 1 }
}

function formatAlpha(alpha: number): string {
  const a = clampAlpha(alpha)
  if (a === 0) return '0'
  if (a === 1) return '1'
  return String(a)
}

export function formatShadowColor(hex: string, alpha: number): string {
  const rgb = hexToRgb(hex)
  if (!rgb) return '#000000'
  const a = clampAlpha(alpha)
  if (a >= 1) return rgbToHex(rgb.r, rgb.g, rgb.b)
  return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${formatAlpha(a)})`
}

function formatPx(n: number): string {
  return `${nz(n)}px`
}

export function formatLayerCss(layer: ParsedLayer, kind: ShadowKind): string {
  const parts: string[] = []
  if (kind === 'box' && layer.inset) parts.push('inset')
  parts.push(formatPx(layer.x), formatPx(layer.y), formatPx(layer.blur))
  if (kind === 'box' && clampSpread(layer.spread) !== 0) {
    parts.push(formatPx(layer.spread))
  }
  parts.push(formatShadowColor(layer.hex, layer.alpha))
  return parts.join(' ')
}

export function shadowCssValue(
  kind: ShadowKind,
  layers: readonly ParsedLayer[]
): string {
  return layers.map((layer) => formatLayerCss(layer, kind)).join(', ')
}

export function exportCss(
  kind: ShadowKind,
  layers: readonly ParsedLayer[]
): string {
  const prop = kind === 'box' ? 'box-shadow' : 'text-shadow'
  return `${prop}: ${shadowCssValue(kind, layers)};`
}

export function exportTailwind(
  kind: ShadowKind,
  layers: readonly ParsedLayer[]
): string {
  const inner = shadowCssValue(kind, layers)
    .replace(/, /g, ',')
    .replace(/ /g, '_')
  return kind === 'box' ? `shadow-[${inner}]` : `[text-shadow:${inner}]`
}

export function exportJson(
  kind: ShadowKind,
  layers: readonly ParsedLayer[]
): string {
  const payload = {
    kind,
    layers: layers.map((layer) => {
      const hex = (normalizeHex(layer.hex) ?? '#000000').toUpperCase()
      const base = {
        x: clampOffset(layer.x),
        y: clampOffset(layer.y),
        blur: clampBlur(layer.blur),
        hex,
        alpha: clampAlpha(layer.alpha)
      }
      if (kind === 'text') return base
      return {
        ...base,
        spread: clampSpread(layer.spread),
        inset: Boolean(layer.inset)
      }
    })
  }
  return JSON.stringify(payload, null, 2)
}

export function exportShadow(
  format: ShadowExportFormat,
  kind: ShadowKind,
  layers: readonly ParsedLayer[]
): string {
  switch (format) {
    case 'css':
      return exportCss(kind, layers)
    case 'tailwind':
      return exportTailwind(kind, layers)
    case 'json':
      return exportJson(kind, layers)
  }
}

const randInt = (min: number, max: number) =>
  min + Math.floor(Math.random() * (max - min + 1))

const rand = (min: number, max: number) => min + Math.random() * (max - min)

function randomFillHex(): string {
  return hslToHex(
    Math.random() * 360,
    rand(52, 90),
    rand(42, 68)
  ).toUpperCase()
}

export function randomizeLayers(
  kind: ShadowKind,
  count = 2
): ShadowLayer[] {
  const n = clampInt(count, MIN_LAYERS, MAX_LAYERS)
  const glow = Math.random() < 0.28
  if (glow) {
    const hex = randomFillHex()
    return Array.from({ length: n }, (_, i) =>
      makeLayer({
        x: 0,
        y: 0,
        blur: clampBlur(12 + i * 16 + randInt(0, 12)),
        spread: kind === 'box' && i === 0 ? randInt(0, 6) : 0,
        hex,
        alpha: clampAlpha(0.85 - i * 0.22),
        inset: false
      })
    )
  }
  return Array.from({ length: n }, () => {
    const black = Math.random() < 0.55
    return makeLayer({
      x: randInt(-12, 16),
      y: randInt(-4, 20),
      blur: randInt(0, 36),
      spread: kind === 'box' ? randInt(-4, 6) : 0,
      hex: black ? '#000000' : randomFillHex(),
      alpha: clampAlpha(rand(0.12, 0.5)),
      inset: kind === 'box' && Math.random() < 0.18
    })
  })
}
