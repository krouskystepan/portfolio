export type UrlCodecMode = 'component' | 'uri'

export function encodeUrlText(input: string, mode: UrlCodecMode): string {
  if (!input) return ''
  return mode === 'uri' ? encodeURI(input) : encodeURIComponent(input)
}

export function decodeUrlText(
  input: string,
  mode: UrlCodecMode
): { value: string; warning: string | null } {
  if (!input) return { value: '', warning: null }

  const decode = mode === 'uri' ? decodeURI : decodeURIComponent
  try {
    return { value: decode(input), warning: null }
  } catch {
    return {
      value: decodePercentLenient(input),
      warning:
        'Not fully valid percent-encoding (a % must be followed by two hex digits). Valid sequences were decoded; the rest was left unchanged.'
    }
  }
}

function decodePercentLenient(input: string): string {
  let out = ''
  const bytes: number[] = []
  const decoder = new TextDecoder('utf-8')

  const flushBytes = () => {
    if (bytes.length === 0) return
    out += decoder.decode(Uint8Array.from(bytes), { stream: false })
    bytes.length = 0
  }

  for (let i = 0; i < input.length; i++) {
    if (
      input[i] === '%' &&
      i + 2 < input.length &&
      isHexByte(input[i + 1], input[i + 2])
    ) {
      bytes.push(parseInt(input.slice(i + 1, i + 3), 16))
      i += 2
      continue
    }
    flushBytes()
    out += input[i]
  }

  flushBytes()
  return out
}

function isHexByte(a: string, b: string): boolean {
  return isHexChar(a) && isHexChar(b)
}

function isHexChar(c: string): boolean {
  return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'f') || (c >= 'A' && c <= 'F')
}
