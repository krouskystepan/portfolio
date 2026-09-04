export type TriadBits = {
  r: boolean
  w: boolean
  x: boolean
}

export type SpecialBits = {
  setuid: boolean
  setgid: boolean
  sticky: boolean
}

export type PermissionMode = {
  owner: TriadBits
  group: TriadBits
  other: TriadBits
  special: SpecialBits
}

export type ParseModeResult =
  | { ok: true; mode: PermissionMode }
  | { ok: false; error: string }

export type ParseOctalResult = ParseModeResult

export const DEFAULT_MODE: PermissionMode = {
  owner: { r: true, w: true, x: true },
  group: { r: true, w: false, x: true },
  other: { r: true, w: false, x: true },
  special: { setuid: false, setgid: false, sticky: false }
}

function triadToDigit(triad: TriadBits): number {
  return (triad.r ? 4 : 0) + (triad.w ? 2 : 0) + (triad.x ? 1 : 0)
}

function digitToTriad(digit: number): TriadBits {
  return {
    r: (digit & 4) !== 0,
    w: (digit & 2) !== 0,
    x: (digit & 1) !== 0
  }
}

function specialToDigit(special: SpecialBits): number {
  return (
    (special.setuid ? 4 : 0) +
    (special.setgid ? 2 : 0) +
    (special.sticky ? 1 : 0)
  )
}

function digitToSpecial(digit: number): SpecialBits {
  return {
    setuid: (digit & 4) !== 0,
    setgid: (digit & 2) !== 0,
    sticky: (digit & 1) !== 0
  }
}

/** Permission triad as 3 octal digits; prepend special digit when any special bit is set. */
export function bitsToOctal(mode: PermissionMode): string {
  const body =
    String(triadToDigit(mode.owner)) +
    String(triadToDigit(mode.group)) +
    String(triadToDigit(mode.other))
  const special = specialToDigit(mode.special)
  return special > 0 ? `${special}${body}` : body
}

function execChar(
  execute: boolean,
  special: boolean,
  onWithX: 's' | 't',
  onWithoutX: 'S' | 'T'
): string {
  if (special) return execute ? onWithX : onWithoutX
  return execute ? 'x' : '-'
}

/** Classic `ls -l` style mode string, e.g. `rwxr-xr-x` or `rwsr-xr-t`. */
export function bitsToSymbolic(mode: PermissionMode): string {
  const o = mode.owner
  const g = mode.group
  const t = mode.other
  const s = mode.special

  return (
    (o.r ? 'r' : '-') +
    (o.w ? 'w' : '-') +
    execChar(o.x, s.setuid, 's', 'S') +
    (g.r ? 'r' : '-') +
    (g.w ? 'w' : '-') +
    execChar(g.x, s.setgid, 's', 'S') +
    (t.r ? 'r' : '-') +
    (t.w ? 'w' : '-') +
    execChar(t.x, s.sticky, 't', 'T')
  )
}

function parseRw(char: string, label: string): ParseModeResult | boolean {
  if (char === 'r') return true
  if (char === '-') return false
  return { ok: false, error: `Invalid ${label} flag '${char}' (expected r or -).` }
}

function parseWw(char: string, label: string): ParseModeResult | boolean {
  if (char === 'w') return true
  if (char === '-') return false
  return { ok: false, error: `Invalid ${label} flag '${char}' (expected w or -).` }
}

function parseOwnerExec(char: string): ParseModeResult | { x: boolean; setuid: boolean } {
  switch (char) {
    case 'x':
      return { x: true, setuid: false }
    case '-':
      return { x: false, setuid: false }
    case 's':
      return { x: true, setuid: true }
    case 'S':
      return { x: false, setuid: true }
    default:
      return {
        ok: false,
        error: `Invalid owner execute flag '${char}' (expected x, s, S, or -).`
      }
  }
}

function parseGroupExec(char: string): ParseModeResult | { x: boolean; setgid: boolean } {
  switch (char) {
    case 'x':
      return { x: true, setgid: false }
    case '-':
      return { x: false, setgid: false }
    case 's':
      return { x: true, setgid: true }
    case 'S':
      return { x: false, setgid: true }
    default:
      return {
        ok: false,
        error: `Invalid group execute flag '${char}' (expected x, s, S, or -).`
      }
  }
}

function parseOtherExec(char: string): ParseModeResult | { x: boolean; sticky: boolean } {
  switch (char) {
    case 'x':
      return { x: true, sticky: false }
    case '-':
      return { x: false, sticky: false }
    case 't':
      return { x: true, sticky: true }
    case 'T':
      return { x: false, sticky: true }
    default:
      return {
        ok: false,
        error: `Invalid other execute flag '${char}' (expected x, t, T, or -).`
      }
  }
}

/**
 * Accept `rwxr-xr-x`, optional `ls -l` prefix (`-rwxr-xr-x`), and special forms
 * (`rwsr-xr-t`, `rwxr-sr-x`, etc.).
 */
export function parseSymbolic(input: string): ParseModeResult {
  let trimmed = input.trim()

  // Strip leading file-type char from `ls -l` (`-`, `d`, `l`, …).
  if (trimmed.length === 10 && /^[bcdlps-]/.test(trimmed[0])) {
    trimmed = trimmed.slice(1)
  }

  if (trimmed.length !== 9) {
    return {
      ok: false,
      error: 'Symbolic mode must be 9 characters (e.g. rwxr-xr-x).'
    }
  }

  const or = parseRw(trimmed[0], 'owner read')
  if (typeof or !== 'boolean') return or
  const ow = parseWw(trimmed[1], 'owner write')
  if (typeof ow !== 'boolean') return ow
  const ox = parseOwnerExec(trimmed[2])
  if ('ok' in ox) return ox

  const gr = parseRw(trimmed[3], 'group read')
  if (typeof gr !== 'boolean') return gr
  const gw = parseWw(trimmed[4], 'group write')
  if (typeof gw !== 'boolean') return gw
  const gx = parseGroupExec(trimmed[5])
  if ('ok' in gx) return gx

  const tr = parseRw(trimmed[6], 'other read')
  if (typeof tr !== 'boolean') return tr
  const tw = parseWw(trimmed[7], 'other write')
  if (typeof tw !== 'boolean') return tw
  const tx = parseOtherExec(trimmed[8])
  if ('ok' in tx) return tx

  return {
    ok: true,
    mode: {
      owner: { r: or, w: ow, x: ox.x },
      group: { r: gr, w: gw, x: gx.x },
      other: { r: tr, w: tw, x: tx.x },
      special: {
        setuid: ox.setuid,
        setgid: gx.setgid,
        sticky: tx.sticky
      }
    }
  }
}

/**
 * Accept `755`, `0755`, or a 4-digit mode with special nibble (`4755`).
 * Leading zeros on a 3-digit body are fine; more than 4 significant digits is an error.
 */
export function parseOctal(input: string): ParseModeResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter an octal mode (e.g. 755).' }
  }

  if (!/^[0-7]+$/.test(trimmed)) {
    return {
      ok: false,
      error: 'Octal mode must use digits 0-7 only.'
    }
  }

  if (trimmed.length > 4) {
    return {
      ok: false,
      error: 'Use 3 digits (e.g. 755) or 4 with special bits (e.g. 4755).'
    }
  }

  const padded = trimmed.padStart(trimmed.length === 4 ? 4 : 3, '0')
  const hasSpecial = padded.length === 4
  const specialDigit = hasSpecial ? Number(padded[0]) : 0
  const ownerDigit = Number(padded[hasSpecial ? 1 : 0])
  const groupDigit = Number(padded[hasSpecial ? 2 : 1])
  const otherDigit = Number(padded[hasSpecial ? 3 : 2])

  return {
    ok: true,
    mode: {
      owner: digitToTriad(ownerDigit),
      group: digitToTriad(groupDigit),
      other: digitToTriad(otherDigit),
      special: hasSpecial
        ? digitToSpecial(specialDigit)
        : {
            setuid: false,
            setgid: false,
            sticky: false
          }
    }
  }
}

/** Prefer octal when the input looks numeric; otherwise try symbolic. */
export function parseMode(input: string): ParseModeResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter a mode (e.g. 755 or rwxr-xr-x).' }
  }

  if (/^[0-7]+$/.test(trimmed)) {
    return parseOctal(trimmed)
  }

  // Digits mixed with junk → octal-style error
  if (/^\d+$/.test(trimmed)) {
    return parseOctal(trimmed)
  }

  return parseSymbolic(trimmed)
}

export function cloneMode(mode: PermissionMode): PermissionMode {
  return {
    owner: { ...mode.owner },
    group: { ...mode.group },
    other: { ...mode.other },
    special: { ...mode.special }
  }
}
