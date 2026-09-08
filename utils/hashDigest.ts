import SparkMD5 from 'spark-md5'

export type HashAlgo = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export const ALL_ALGOS: HashAlgo[] = [
  'MD5',
  'SHA-1',
  'SHA-256',
  'SHA-384',
  'SHA-512'
]

export type HashFormat = 'hex' | 'base64'

const HEX_LOWER = '0123456789abcdef'
const HEX_UPPER = '0123456789ABCDEF'

export function encodeBytes(
  bytes: ArrayBuffer,
  format: HashFormat,
  uppercase: boolean
): string {
  const view = new Uint8Array(bytes)
  if (format === 'base64') {
    let binary = ''
    for (let i = 0; i < view.length; i++) {
      binary += String.fromCharCode(view[i]!)
    }
    return btoa(binary)
  }

  const alphabet = uppercase ? HEX_UPPER : HEX_LOWER
  let hex = ''
  for (let i = 0; i < view.length; i++) {
    const b = view[i]!
    hex += alphabet[b >> 4]! + alphabet[b & 0xf]!
  }
  return hex
}

function md5ArrayBuffer(data: ArrayBuffer): ArrayBuffer {
  const hex = SparkMD5.ArrayBuffer.hash(data)
  const out = new Uint8Array(16)
  for (let i = 0; i < 16; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }
  return out.buffer
}

export async function digestBytes(
  data: ArrayBuffer,
  algo: HashAlgo
): Promise<ArrayBuffer> {
  if (algo === 'MD5') return md5ArrayBuffer(data)
  return crypto.subtle.digest(algo, data)
}

export async function digestAll(
  data: ArrayBuffer,
  algos: HashAlgo[]
): Promise<Partial<Record<HashAlgo, ArrayBuffer>>> {
  const unique = [...new Set(algos)]
  const entries = await Promise.all(
    unique.map(async (algo) => [algo, await digestBytes(data, algo)] as const)
  )
  return Object.fromEntries(entries)
}

export function textToUtf8Bytes(text: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(text)
  return encoded.buffer.slice(
    encoded.byteOffset,
    encoded.byteOffset + encoded.byteLength
  )
}

export function hashesMatch(a: string, b: string): boolean {
  const strip = (s: string) => s.replace(/\s+/g, '')
  const left = strip(a)
  const right = strip(b)
  if (!left || !right) return false
  // Hex digests are case-insensitive; Base64 is case-sensitive.
  if (/^[0-9a-f]+$/i.test(left) && /^[0-9a-f]+$/i.test(right)) {
    return left.toLowerCase() === right.toLowerCase()
  }
  return left === right
}

const CLI_SHA_BITS: Record<Exclude<HashAlgo, 'MD5'>, number> = {
  'SHA-1': 1,
  'SHA-256': 256,
  'SHA-384': 384,
  'SHA-512': 512
}

function shellSingleQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`
}

export function cliHint(
  algo: HashAlgo,
  source: 'text' | 'file',
  sample?: string
): string {
  if (source === 'file') {
    const path = sample?.trim() || 'file'
    if (algo === 'MD5') return `md5sum ${path}`
    if (algo === 'SHA-256') return `sha256sum ${path}`
    return `shasum -a ${CLI_SHA_BITS[algo]} ${path}`
  }

  const quoted = shellSingleQuote(sample ?? '')
  if (algo === 'MD5') return `printf '%s' ${quoted} | md5sum`
  if (algo === 'SHA-256') return `printf '%s' ${quoted} | sha256sum`
  return `printf '%s' ${quoted} | shasum -a ${CLI_SHA_BITS[algo]}`
}

/** Format byte size for display (e.g. file picker meta). */
export function formatByteSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}
