export type BaseHexMode = 'base64' | 'base64url' | 'hex'

export type CodecResult =
  | { ok: true; value: string }
  | { ok: false; error: string }

const HEX_ALPHABET = '0123456789abcdef'
const BINARY_CHUNK = 0x8000

function textToBytes(text: string): Uint8Array {
  return new TextEncoder().encode(text)
}

function bytesToBinaryString(bytes: Uint8Array): string {
  const parts: string[] = []
  for (let i = 0; i < bytes.length; i += BINARY_CHUNK) {
    parts.push(String.fromCharCode(...bytes.subarray(i, i + BINARY_CHUNK)))
  }
  return parts.join('')
}

function bytesToBase64(bytes: Uint8Array): string {
  return btoa(bytesToBinaryString(bytes))
}

function bytesToBase64Url(bytes: Uint8Array): string {
  return bytesToBase64(bytes)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')
}

function bytesToHex(bytes: Uint8Array): string {
  let out = ''
  for (let i = 0; i < bytes.length; i++) {
    const b = bytes[i]!
    out += HEX_ALPHABET[b >> 4]! + HEX_ALPHABET[b & 0xf]!
  }
  return out
}

/** Encode UTF-8 text. Hex output is lowercase, no separators. */
export function encodeText(text: string, mode: BaseHexMode): string {
  const bytes = textToBytes(text)
  switch (mode) {
    case 'base64':
      return bytesToBase64(bytes)
    case 'base64url':
      return bytesToBase64Url(bytes)
    case 'hex':
      return bytesToHex(bytes)
  }
}

function decodeBase64Bytes(input: string): Uint8Array {
  // Accept either alphabet, whitespace, and missing padding.
  const cleaned = input
    .replace(/\s+/g, '')
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .replace(/=+$/, '')

  if (!/^[A-Za-z0-9+/]*$/.test(cleaned)) {
    throw new Error('Input contains characters that are not valid Base64.')
  }
  if (cleaned.length % 4 === 1) {
    throw new Error('Invalid Base64 length (truncated input?).')
  }

  const padded = cleaned + '='.repeat((4 - (cleaned.length % 4)) % 4)
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

/** Accepts `48 65`, `0x48,0x65`, `\x48\x65`, `48:65`, or a plain hex run. */
function decodeHexBytes(input: string): Uint8Array {
  const cleaned = input
    .replace(/\\x/gi, '')
    .replace(/0x/gi, '')
    .replace(/[\s,:;-]+/g, '')

  if (!/^[0-9a-fA-F]*$/.test(cleaned)) {
    throw new Error('Input contains characters that are not valid hex.')
  }
  if (cleaned.length % 2 !== 0) {
    throw new Error('Hex input must have an even number of digits.')
  }

  const bytes = new Uint8Array(cleaned.length / 2)
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = Number.parseInt(cleaned.slice(i * 2, i * 2 + 2), 16)
  }
  return bytes
}

/** Decode to UTF-8 text; fails if the bytes are not valid UTF-8. */
export function decodeText(input: string, mode: BaseHexMode): CodecResult {
  if (!input.trim()) return { ok: true, value: '' }
  try {
    const bytes =
      mode === 'hex' ? decodeHexBytes(input) : decodeBase64Bytes(input)
    const value = new TextDecoder('utf-8', { fatal: true }).decode(bytes)
    return { ok: true, value }
  } catch (err) {
    if (err instanceof TypeError) {
      return { ok: false, error: 'Decoded bytes are not valid UTF-8 text.' }
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not decode input.'
    }
  }
}

export function encodeTextSafe(text: string, mode: BaseHexMode): CodecResult {
  try {
    return { ok: true, value: encodeText(text, mode) }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'Could not encode text.'
    }
  }
}
