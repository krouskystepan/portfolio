// utils/colorUtils.ts

export type ColorFormats = Record<string, string>
type RGB = { r: number; g: number; b: number }

export const parseColor = (value: string): ColorFormats | null => {
  value = value.trim().toLowerCase()

  const ctx = document.createElement('canvas').getContext('2d')
  if (ctx) {
    ctx.fillStyle = value
    if (ctx.fillStyle !== '#000000' || value === 'black') {
      const rgb = ctx.fillStyle
      if (rgb.startsWith('#')) return hexToAll(rgb)
    }
  }

  // HEX
  if (/^#([a-f0-9]{3}|[a-f0-9]{6})$/i.test(value))
    return hexToAll(value.startsWith('#') ? value : `#${value}`)

  // RGB / RGBA
  if (
    /^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i.test(
      value
    )
  ) {
    const match = value.match(/\d*\.?\d+/g)
    if (!match) return null
    const [r, g, b, a] = match.map(Number)
    return rgbToAll(r, g, b, a ?? 1)
  }

  // HSL / HSLA
  if (
    /^hsla?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%(?:\s*,\s*(\d*\.?\d+))?\s*\)$/i.test(
      value
    )
  ) {
    const match = value.match(/\d*\.?\d+/g)
    if (!match) return null
    const [h, s, l, a] = match.map(Number)
    return hslToAll(h, s, l, a ?? 1)
  }

  // HWB
  if (
    /^hwb\s*\(\s*(\d{1,3})\s+(\d{1,3})%\s+(\d{1,3})%(?:\s*\/\s*(\d*\.?\d+))?\s*\)$/i.test(
      value
    )
  ) {
    const match = value.match(/\d*\.?\d+/g)
    if (!match) return null
    const [h, w, b, a] = match.map(Number)
    const { r, g, b: blue } = hwbToRgb(h, w, b)
    return rgbToAll(r, g, blue, a ?? 1)
  }

  // LAB
  if (/^lab\s*\(/i.test(value)) {
    const match = value.match(/-?\d*\.?\d+/g)
    if (!match) return null
    const [L, a, b] = match.map(Number)
    const { r, g, b: blue } = labToRgb(L, a, b)
    return rgbToAll(r, g, blue)
  }

  // LCH
  if (/^lch\s*\(/i.test(value)) {
    const match = value.match(/\d*\.?\d+/g)
    if (!match) return null
    const [L, C, H] = match.map(Number)
    const { r, g, b } = lchToRgb(L, C, H)
    return rgbToAll(r, g, b)
  }

  return null
}

// === Core Converters ===

const hexToAll = (hex: string) => {
  const full = hex.length === 4 ? expandShortHex(hex) : hex
  const r = parseInt(full.slice(1, 3), 16)
  const g = parseInt(full.slice(3, 5), 16)
  const b = parseInt(full.slice(5, 7), 16)
  return buildAllFormats(r, g, b, 1)
}

const expandShortHex = (hex: string) =>
  '#' +
  hex
    .slice(1)
    .split('')
    .map((ch) => ch + ch)
    .join('')

const rgbToAll = (r: number, g: number, b: number, a = 1) =>
  buildAllFormats(r, g, b, a)

const buildAllFormats = (r: number, g: number, b: number, a: number) => {
  const hex = rgbToHex(r, g, b)
  const rgb = `rgb(${r}, ${g}, ${b})`
  const rgba = a < 1 ? `rgba(${r}, ${g}, ${b}, ${a})` : undefined
  const hsl = rgbToHsl(r, g, b)
  const hsla = a < 1 ? `hsla(${rgbToHue(r, g, b)}, 100%, 50%, ${a})` : undefined
  const hwb = `hwb(${Math.round(rgbToHue(r, g, b))} 0% 0%${a < 1 ? ` / ${a}` : ''})`
  const lab = rgbToLab(r, g, b)
  const lch = rgbToLch(r, g, b)

  const result: Record<string, string> = {
    HEX: hex,
    RGB: rgb,
    HSL: hsl,
    HWB: hwb,
  }
  if (rgba) result.RGBA = rgba
  if (hsla) result.HSLA = hsla
  result.LAB = lab
  result.LCH = lch
  if (a < 1) result.Alpha = a.toString()
  return result
}

const rgbToHex = (r: number, g: number, b: number) =>
  '#' +
  [r, g, b]
    .map((x) => Math.max(0, Math.min(255, x)).toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase()

const rgbToHsl = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0,
    s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(
    l * 100
  )}%)`
}

const rgbToHue = (r: number, g: number, b: number) => {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  if (max !== min) {
    const d = max - min
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }
  return h * 360
}

// === LAB & LCH ===

const rgbToLab = (r: number, g: number, b: number) => {
  const [x, y, z] = rgbToXyz(r, g, b)
  const [L, a, b2] = xyzToLab(x, y, z)
  return `lab(${L.toFixed(1)} ${a.toFixed(1)} ${b2.toFixed(1)})`
}

const rgbToLch = (r: number, g: number, b: number) => {
  const [x, y, z] = rgbToXyz(r, g, b)
  const [L, a, b2] = xyzToLab(x, y, z)
  const C = Math.sqrt(a * a + b2 * b2)
  const H = (Math.atan2(b2, a) * 180) / Math.PI
  return `lch(${L.toFixed(1)} ${C.toFixed(1)} ${H.toFixed(1)})`
}

const rgbToXyz = (r: number, g: number, b: number) => {
  r = pivotRgb(r / 255)
  g = pivotRgb(g / 255)
  b = pivotRgb(b / 255)
  return [
    (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047,
    r * 0.2126 + g * 0.7152 + b * 0.0722,
    (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883,
  ]
}

const pivotRgb = (n: number) =>
  n > 0.04045 ? Math.pow((n + 0.055) / 1.055, 2.4) : n / 12.92

const xyzToLab = (x: number, y: number, z: number) => {
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116)
  const fx = f(x)
  const fy = f(y)
  const fz = f(z)
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)]
}

// === Other ===

const hslToAll = (h: number, s: number, l: number, a = 1) => {
  const rgb = hslToRgb(h, s, l)
  return buildAllFormats(rgb.r, rgb.g, rgb.b, a)
}

const hslToRgb = (h: number, s: number, l: number): RGB => {
  s /= 100
  l /= 100
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  let [r, g, b] = [0, 0, 0]

  if (h < 60) [r, g, b] = [c, x, 0]
  else if (h < 120) [r, g, b] = [x, c, 0]
  else if (h < 180) [r, g, b] = [0, c, x]
  else if (h < 240) [r, g, b] = [0, x, c]
  else if (h < 300) [r, g, b] = [x, 0, c]
  else [r, g, b] = [c, 0, x]

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  }
}

const hwbToRgb = (h: number, w: number, b: number): RGB => {
  const ratio = w + b
  if (ratio > 100) {
    w = (w / ratio) * 100
    b = (b / ratio) * 100
  }
  const c = 1 - w / 100 - b / 100
  const rgbHsl = hslToRgb(h, 100, 50)
  return {
    r: Math.round(rgbHsl.r * c + 255 * (w / 100)),
    g: Math.round(rgbHsl.g * c + 255 * (w / 100)),
    b: Math.round(rgbHsl.b * c + 255 * (w / 100)),
  }
}

const labToRgb = (L: number, a: number, b: number): RGB => {
  let y = (L + 16) / 116
  let x = a / 500 + y
  let z = y - b / 200

  const xyz = [x, y, z].map((v) =>
    Math.pow(v, 3) > 0.008856 ? Math.pow(v, 3) : (v - 16 / 116) / 7.787
  )

  x = xyz[0] * 0.95047
  y = xyz[1]
  z = xyz[2] * 1.08883

  const rgb = [
    x * 3.2406 + y * -1.5372 + z * -0.4986,
    x * -0.9689 + y * 1.8758 + z * 0.0415,
    x * 0.0557 + y * -0.204 + z * 1.057,
  ].map((v) =>
    v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : v * 12.92
  )

  return {
    r: Math.round(Math.max(0, Math.min(255, rgb[0] * 255))),
    g: Math.round(Math.max(0, Math.min(255, rgb[1] * 255))),
    b: Math.round(Math.max(0, Math.min(255, rgb[2] * 255))),
  }
}

const lchToRgb = (L: number, C: number, H: number): RGB => {
  const hr = (H * Math.PI) / 180
  const a = Math.cos(hr) * C
  const b = Math.sin(hr) * C
  return labToRgb(L, a, b)
}

export { hexToAll, rgbToAll, hslToAll, hwbToRgb, labToRgb, lchToRgb }
