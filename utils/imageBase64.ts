import { formatByteSize } from '@/utils/hashDigest'

export { formatByteSize }

export type ImageOutputMode = 'raw' | 'data-uri' | 'css' | 'html'

/** Soft cap: Base64 is ~4/3 the size, plus DOM / clipboard cost. */
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024

const EXTENSION_MIME: Readonly<Record<string, string>> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  bmp: 'image/bmp',
  ico: 'image/x-icon',
  svg: 'image/svg+xml'
}

const BINARY_CHUNK = 0x8000

function extensionMime(name: string): string | null {
  const dot = name.lastIndexOf('.')
  if (dot < 0) return null
  return EXTENSION_MIME[name.slice(dot + 1).toLowerCase()] ?? null
}

/** `image/*` MIME, or an empty MIME with a known image extension. */
export function isImageFile(file: Pick<File, 'type' | 'name'>): boolean {
  if (file.type) return file.type.toLowerCase().startsWith('image/')
  return extensionMime(file.name) !== null
}

/** MIME to embed in the data URI (falls back to extension, then PNG). */
export function resolveImageMime(file: Pick<File, 'type' | 'name'>): string {
  if (file.type) return file.type.toLowerCase()
  return extensionMime(file.name) ?? 'image/png'
}

/** Returns a user-facing error, or null when the file is acceptable. */
export function validateImageFile(
  file: Pick<File, 'type' | 'name' | 'size'>
): string | null {
  if (!isImageFile(file)) {
    return 'That file is not an image. Choose a PNG, JPEG, WebP, GIF, SVG, or similar.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `This image is ${formatByteSize(file.size)}. The limit is ${formatByteSize(MAX_IMAGE_BYTES)} to keep the browser responsive.`
  }
  return null
}

/** Chunked binary string build + single `btoa` (same approach as `encodeBytes`). */
export function fileToBase64(bytes: ArrayBuffer): string {
  const view = new Uint8Array(bytes)
  const parts: string[] = []
  for (let i = 0; i < view.length; i += BINARY_CHUNK) {
    parts.push(String.fromCharCode(...view.subarray(i, i + BINARY_CHUNK)))
  }
  return btoa(parts.join(''))
}

export function toDataUri(mime: string, base64: string): string {
  return `data:${mime};base64,${base64}`
}

export function formatOutput(
  mode: ImageOutputMode,
  mime: string,
  base64: string
): string {
  switch (mode) {
    case 'raw':
      return base64
    case 'data-uri':
      return toDataUri(mime, base64)
    case 'css':
      return `url("${toDataUri(mime, base64)}")`
    case 'html':
      return `<img src="${toDataUri(mime, base64)}" alt="" />`
  }
}
