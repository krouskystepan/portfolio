export type BodyKind = 'none' | 'json' | 'text' | 'urlencoded' | 'multipart'

export type FormField = {
  name: string
  value: string
  fromFile: boolean
}

export type RequestModel = {
  method: string
  url: string
  headers: Record<string, string>
  body?: string
  bodyKind: BodyKind
  auth?: { user: string; pass: string }
  cookies?: string
  warnings: string[]
  formFields?: FormField[]
}

export type ParseCurlResult =
  | { ok: true; model: RequestModel }
  | { ok: false; error: string }

export const HTTP_CLIENTS = ['fetch', 'axios', 'python'] as const

export type HttpClient = (typeof HTTP_CLIENTS)[number]

export const EXAMPLE_CURL = `curl 'https://api.example.com/users' \\
  -H 'Accept: application/json' \\
  -H 'Content-Type: application/json' \\
  --data-raw '{"name":"Ada","role":"admin"}'`

class CurlParseError extends Error {}

const SHORT_TO_LONG: Record<string, string> = {
  X: 'request',
  H: 'header',
  d: 'data',
  u: 'user',
  b: 'cookie',
  A: 'user-agent',
  e: 'referer',
  F: 'form',
  I: 'head',
  G: 'get',
  L: 'location',
  k: 'insecure',
  v: 'verbose',
  s: 'silent',
  S: 'show-error',
  o: 'output',
  O: 'remote-name',
  w: 'write-out',
  x: 'proxy',
  U: 'proxy-user',
  m: 'max-time',
  E: 'cert',
  T: 'upload-file',
  r: 'range',
  i: 'include',
  f: 'fail',
  g: 'globoff',
  j: 'junk-session-cookies',
  J: 'remote-header-name',
  c: 'cookie-jar',
  K: 'config',
  '4': 'ipv4',
  '6': 'ipv6',
  '#': 'progress-bar',
  N: 'no-buffer'
}

const VALUE_FLAGS = new Set([
  'request',
  'header',
  'data',
  'data-raw',
  'data-binary',
  'data-urlencode',
  'user',
  'cookie',
  'user-agent',
  'referer',
  'form',
  'form-string',
  'url',
  'json',
  'output',
  'write-out',
  'proxy',
  'proxy-user',
  'connect-timeout',
  'max-time',
  'retry',
  'retry-delay',
  'retry-max-time',
  'cert',
  'key',
  'cacert',
  'capath',
  'unix-socket',
  'abstract-unix-socket',
  'resolve',
  'connect-to',
  'interface',
  'dns-servers',
  'max-redirs',
  'cookie-jar',
  'config',
  'engine',
  'ciphers',
  'proxy-header',
  'hsts',
  'range',
  'upload-file',
  'max-filesize',
  'speed-limit',
  'speed-time',
  'limit-rate',
  'url-query',
  'pinnedpubkey',
  'pass',
  'tlsuser',
  'tlspassword',
  'proxy-cacert',
  'socks5'
])

const SUPPORTED_FLAGS = new Set([
  'request',
  'header',
  'data',
  'data-raw',
  'data-binary',
  'data-urlencode',
  'get',
  'user',
  'cookie',
  'user-agent',
  'referer',
  'form',
  'form-string',
  'head',
  'url',
  'json'
])

const BOOL_FLAGS = new Set([
  'get',
  'head',
  'location',
  'location-trusted',
  'insecure',
  'compressed',
  'verbose',
  'silent',
  'show-error',
  'include',
  'remote-name',
  'http1.0',
  'http1.1',
  'http2',
  'http2-prior-knowledge',
  'http3',
  'ipv4',
  'ipv6',
  'progress-bar',
  'fail',
  'fail-early',
  'fail-with-body',
  'globoff',
  'no-buffer',
  'remote-header-name',
  'junk-session-cookies',
  'path-as-is',
  'raw',
  'tlsv1',
  'tlsv1.0',
  'tlsv1.1',
  'tlsv1.2',
  'tlsv1.3',
  'proxytunnel',
  'digest',
  'ntlm',
  'negotiate',
  'anyauth',
  'basic',
  'compressed-ssh',
  'no-keepalive',
  'keepalive',
  'tr-encoding'
])

const IGNORE_NOTES: Record<string, string> = {
  location: 'Follow redirects (-L / --location) is ignored in generated code.',
  'location-trusted':
    'Follow redirects (--location-trusted) is ignored in generated code.',
  insecure: 'Insecure SSL (-k / --insecure) is ignored.',
  compressed:
    '--compressed is ignored. Browsers and axios decode gzip automatically.',
  verbose: 'Verbose mode (-v) does not apply to generated code.',
  silent: 'Silent mode (-s) does not apply to generated code.',
  'show-error': 'Show-error (-S) does not apply to generated code.',
  include: 'Response-header include (-i) does not apply to generated code.',
  output: 'Output file (-o / --output) is ignored.',
  'remote-name': 'Remote-name (-O) is ignored.',
  'write-out': 'Write-out (-w) is ignored.',
  proxy: 'Proxy flags are ignored; configure a proxy in your runtime instead.',
  'proxy-user':
    'Proxy flags are ignored; configure a proxy in your runtime instead.',
  'http1.0': 'HTTP version flags are ignored.',
  'http1.1': 'HTTP version flags are ignored.',
  http2: 'HTTP version flags are ignored.',
  'http2-prior-knowledge': 'HTTP version flags are ignored.',
  http3: 'HTTP version flags are ignored.',
  ipv4: 'IP version flags are ignored.',
  ipv6: 'IP version flags are ignored.',
  'connect-timeout': 'Timeouts are ignored in generated code.',
  'max-time': 'Timeouts are ignored in generated code.',
  retry: 'Retry flags are ignored in generated code.',
  'upload-file':
    'File upload (-T / --upload-file) is not converted; paste a body or use -F.',
  'cookie-jar': 'Cookie jar (-c) is ignored.',
  'url-query': '--url-query is ignored; add query params to the URL instead.',
  'progress-bar': 'Progress output is ignored.',
  fail: 'Fail-on-error (-f) does not apply to generated code.',
  globoff: 'Globbing flags are ignored.',
  'no-buffer': 'Output buffering flags are ignored.'
}

function isWs(ch: string): boolean {
  return ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r'
}

function stripLeadingCurl(input: string): string {
  let s = input.replace(/^\uFEFF/, '')
  s = s.replace(/^[ \t\r\n]+/, '')
  s = s.replace(/^\$[ \t]*/, '')
  s = s.replace(/^curl(?:\.exe)?[ \t]*/i, '')
  return s
}

function decodeAnsiC(inner: string): string {
  let out = ''
  for (let i = 0; i < inner.length; i++) {
    const ch = inner[i]!
    if (ch !== '\\' || i + 1 >= inner.length) {
      out += ch
      continue
    }
    const n = inner[++i]!
    switch (n) {
      case 'n':
        out += '\n'
        break
      case 'r':
        out += '\r'
        break
      case 't':
        out += '\t'
        break
      case 'a':
        out += '\u0007'
        break
      case 'b':
        out += '\b'
        break
      case 'f':
        out += '\f'
        break
      case 'v':
        out += '\v'
        break
      case '\\':
      case "'":
      case '"':
      case '?':
        out += n
        break
      case 'x': {
        let hex = ''
        while (hex.length < 2 && i + 1 < inner.length && isHex(inner[i + 1]!)) {
          hex += inner[++i]
        }
        out += hex ? String.fromCharCode(parseInt(hex, 16)) : `x`
        break
      }
      case 'u':
      case 'U': {
        const width = n === 'u' ? 4 : 8
        let hex = ''
        while (
          hex.length < width &&
          i + 1 < inner.length &&
          isHex(inner[i + 1]!)
        ) {
          hex += inner[++i]
        }
        out +=
          hex.length === width
            ? String.fromCodePoint(parseInt(hex, 16))
            : n + hex
        break
      }
      default: {
        if (n >= '0' && n <= '7') {
          let oct = n
          while (
            oct.length < 3 &&
            i + 1 < inner.length &&
            inner[i + 1]! >= '0' &&
            inner[i + 1]! <= '7'
          ) {
            oct += inner[++i]
          }
          out += String.fromCharCode(parseInt(oct, 8))
        } else {
          out += n
        }
      }
    }
  }
  return out
}

function isHex(ch: string): boolean {
  return (
    (ch >= '0' && ch <= '9') ||
    (ch >= 'a' && ch <= 'f') ||
    (ch >= 'A' && ch <= 'F')
  )
}

function tokenize(input: string): string[] {
  const tokens: string[] = []
  const s = input
  const len = s.length
  let i = 0

  const skipWs = () => {
    while (i < len) {
      if (isWs(s[i]!)) {
        i++
        continue
      }
      const cont = s[i]
      if (
        (cont === '\\' || cont === '`' || cont === '^') &&
        (s[i + 1] === '\n' || (s[i + 1] === '\r' && s[i + 2] === '\n'))
      ) {
        i += s[i + 1] === '\r' ? 3 : 2
        continue
      }
      break
    }
  }

  const readArg = (): string => {
    let out = ''
    while (i < len) {
      const c = s[i]!
      if (isWs(c)) break

      if (c === "'" || (c === '$' && s[i + 1] === "'")) {
        const ansi = c === '$'
        if (ansi) i++
        i++
        let inner = ''
        while (i < len && s[i] !== "'") {
          inner += s[i]
          i++
        }
        if (i >= len) {
          throw new CurlParseError(
            ansi
              ? "Unclosed $'…' string in curl command."
              : 'Unclosed single quote in curl command.'
          )
        }
        i++
        out += ansi ? decodeAnsiC(inner) : inner
        continue
      }

      if (c === '"') {
        i++
        while (i < len && s[i] !== '"') {
          if (s[i] === '\\' && i + 1 < len) {
            const n = s[i + 1]!
            if (n === '"' || n === '\\' || n === '$' || n === '`') {
              out += n
              i += 2
              continue
            }
            if (n === '\n' || (n === '\r' && s[i + 2] === '\n')) {
              i += n === '\r' ? 3 : 2
              continue
            }
          }
          out += s[i]
          i++
        }
        if (i >= len) {
          throw new CurlParseError('Unclosed double quote in curl command.')
        }
        i++
        continue
      }

      if (c === '\\' || c === '`' || c === '^') {
        const n = s[i + 1]
        if (n === undefined) {
          i++
          break
        }
        if (n === '\n' || (n === '\r' && s[i + 2] === '\n')) {
          i += n === '\r' ? 3 : 2
          continue
        }
        if (c === '^' && n !== '\r' && n !== '\n' && n !== ' ') {
          out += c
          i++
          continue
        }
        out += n
        i += 2
        continue
      }

      out += c
      i++
    }
    return out
  }

  while (i < len) {
    skipWs()
    if (i >= len) break
    tokens.push(readArg())
  }
  return tokens
}

function displayFlag(name: string): string {
  return name.length === 1 ? `-${name}` : `--${name}`
}

function getHeader(
  headers: Record<string, string>,
  name: string
): { key: string; value: string } | undefined {
  const needle = name.toLowerCase()
  for (const [key, value] of Object.entries(headers)) {
    if (key.toLowerCase() === needle) return { key, value }
  }
  return undefined
}

function setHeader(
  headers: Record<string, string>,
  name: string,
  value: string,
  warnings: string[],
  allowDuplicateWarn = true
) {
  const existing = getHeader(headers, name)
  if (existing) {
    if (allowDuplicateWarn && existing.value !== value) {
      warnings.push(
        `Duplicate header '${existing.key}' - using the last value.`
      )
    }
    delete headers[existing.key]
  }
  headers[name] = value
}

function looksLikeSchemeUrl(url: string): boolean {
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(url)
}

function looksLikePositionalUrl(token: string): boolean {
  if (
    looksLikeSchemeUrl(token) ||
    token.startsWith('/') ||
    token.startsWith('[')
  ) {
    return true
  }
  if (token.startsWith('localhost') || token.startsWith('127.0.0.1')) {
    return true
  }
  return /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/|\?|$)/.test(token)
}

function utf8ToBase64(value: string): string {
  const bytes = new TextEncoder().encode(value)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]!)
  }
  return btoa(binary)
}

function parseHeaderLine(raw: string): { name: string; value: string } | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const colon = trimmed.indexOf(':')
  if (colon === -1) return { name: trimmed, value: '' }
  const name = trimmed.slice(0, colon).trim()
  const value = trimmed.slice(colon + 1).trim()
  if (!name) return null
  return { name, value }
}

function encodeDataUrlencode(piece: string, warnings: string[]): string {
  if (!piece.includes('=') && piece.includes('@')) {
    const at = piece.indexOf('@')
    const name = piece.slice(0, at)
    warnings.push(
      `File reference in --data-urlencode (${piece}) is not read; using a placeholder.`
    )
    const placeholder = `<file:${piece.slice(at)}>`
    return name
      ? `${name}=${encodeURIComponent(placeholder)}`
      : encodeURIComponent(placeholder)
  }
  const eq = piece.indexOf('=')
  if (eq === -1) return encodeURIComponent(piece)
  if (eq === 0) return encodeURIComponent(piece.slice(1))
  const name = piece.slice(0, eq)
  const value = piece.slice(eq + 1)
  return `${name}=${encodeURIComponent(value)}`
}

function parseFormField(raw: string, warnings: string[]): FormField {
  const eq = raw.indexOf('=')
  if (eq === -1) {
    return { name: raw, value: '', fromFile: false }
  }
  const name = raw.slice(0, eq)
  let rest = raw.slice(eq + 1)
  const typeSep = rest.indexOf(';')
  if (typeSep !== -1) rest = rest.slice(0, typeSep)
  if (rest.startsWith('@') || rest.startsWith('<')) {
    warnings.push(
      `Form file '${name}=${rest}' becomes a placeholder string; files are not read from disk.`
    )
    return { name, value: `<file:${rest}>`, fromFile: true }
  }
  return { name, value: rest, fromFile: false }
}

function looksLikeJsonObject(text: string): boolean {
  const t = text.trim()
  if (!t.startsWith('{') && !t.startsWith('[')) return false
  try {
    JSON.parse(t)
    return true
  } catch {
    return false
  }
}

function contentTypeIs(
  headers: Record<string, string>,
  needle: string
): boolean {
  const ct = getHeader(headers, 'Content-Type')?.value.toLowerCase() ?? ''
  return ct.includes(needle)
}

function parseUrlEncodedPairs(body: string): Record<string, string> | null {
  if (!body.includes('=')) return null
  try {
    const params = new URLSearchParams(body)
    const obj: Record<string, string> = {}
    const seen = new Set<string>()
    for (const [key, value] of params.entries()) {
      if (seen.has(key)) return null
      seen.add(key)
      obj[key] = value
    }
    if (seen.size === 0) return null
    return obj
  } catch {
    return null
  }
}

function warnShellExpansion(tokens: string[], warnings: string[]) {
  for (const token of tokens) {
    if (/[$`]/.test(token)) {
      warnings.push(
        'Shell expansion is not applied; `$` and backticks were left as literal text.'
      )
      return
    }
  }
}

function parseArgv(tokens: string[]): RequestModel {
  const warnings: string[] = []
  const headers: Record<string, string> = {}
  const dataPieces: string[] = []
  const formFields: FormField[] = []
  let url: string | undefined
  let method: string | undefined
  let forceGet = false
  let forceHead = false
  let auth: { user: string; pass: string } | undefined
  let cookies: string | undefined
  let jsonMode = false

  let i = 0
  const peek = () => tokens[i]
  const take = () => tokens[i++]

  const takeValue = (flag: string, attached?: string): string => {
    if (attached !== undefined) return attached
    const next = peek()
    if (next === undefined || (next.startsWith('-') && next !== '-')) {
      throw new CurlParseError(`Flag ${displayFlag(flag)} requires a value.`)
    }
    return take()!
  }

  const ignoreFlag = (name: string) => {
    const note =
      IGNORE_NOTES[name] ?? `Unsupported flag ${displayFlag(name)} is ignored.`
    if (!warnings.includes(note)) warnings.push(note)
  }

  const addUrl = (nextUrl: string) => {
    if (!nextUrl) return
    if (url && url !== nextUrl) {
      warnings.push('Multiple URLs found - using the last one.')
    }
    url = nextUrl
  }

  const applyLong = (name: string, attached?: string) => {
    if (name === 'request') {
      method = takeValue(name, attached).toUpperCase()
      return
    }
    if (name === 'header') {
      const line = parseHeaderLine(takeValue(name, attached))
      if (!line) {
        warnings.push('Empty -H / --header value was ignored.')
        return
      }
      setHeader(headers, line.name, line.value, warnings)
      return
    }
    if (name === 'data' || name === 'data-raw' || name === 'data-binary') {
      let value = takeValue(name, attached)
      if (
        (name === 'data' || name === 'data-binary') &&
        value.startsWith('@')
      ) {
        warnings.push(
          `File body ${value} is not read; using a placeholder string.`
        )
        value = `<file:${value}>`
      }
      dataPieces.push(value)
      return
    }
    if (name === 'data-urlencode') {
      dataPieces.push(encodeDataUrlencode(takeValue(name, attached), warnings))
      return
    }
    if (name === 'json') {
      jsonMode = true
      dataPieces.push(takeValue(name, attached))
      if (!getHeader(headers, 'Content-Type')) {
        setHeader(headers, 'Content-Type', 'application/json', warnings, false)
      }
      if (!getHeader(headers, 'Accept')) {
        setHeader(headers, 'Accept', 'application/json', warnings, false)
      }
      return
    }
    if (name === 'user') {
      const raw = takeValue(name, attached)
      const colon = raw.indexOf(':')
      const user = colon === -1 ? raw : raw.slice(0, colon)
      const pass = colon === -1 ? '' : raw.slice(colon + 1)
      auth = { user, pass }
      if (colon === -1) {
        warnings.push(
          'Password omitted on -u / --user; using an empty password.'
        )
      }
      return
    }
    if (name === 'cookie') {
      const raw = takeValue(name, attached)
      if (!raw.includes('=') && !raw.includes(';')) {
        warnings.push(
          `Cookie file '${raw}' is not read; pass name=value cookies instead.`
        )
        return
      }
      cookies = cookies ? `${cookies}; ${raw}` : raw
      return
    }
    if (name === 'user-agent') {
      setHeader(headers, 'User-Agent', takeValue(name, attached), warnings)
      return
    }
    if (name === 'referer') {
      const raw = takeValue(name, attached)
      const referer = raw.split(';')[0] ?? raw
      setHeader(headers, 'Referer', referer, warnings)
      return
    }
    if (name === 'form' || name === 'form-string') {
      formFields.push(parseFormField(takeValue(name, attached), warnings))
      return
    }
    if (name === 'head') {
      forceHead = true
      return
    }
    if (name === 'get') {
      forceGet = true
      return
    }
    if (name === 'url') {
      addUrl(takeValue(name, attached))
      return
    }
    if (SUPPORTED_FLAGS.has(name)) return

    if (BOOL_FLAGS.has(name)) {
      ignoreFlag(name)
      return
    }

    if (VALUE_FLAGS.has(name)) {
      takeValue(name, attached)
      ignoreFlag(name)
      return
    }

    if (attached !== undefined) {
      ignoreFlag(name)
      return
    }
    const next = peek()
    if (
      next !== undefined &&
      !next.startsWith('-') &&
      !looksLikePositionalUrl(next)
    ) {
      take()
    }
    ignoreFlag(name)
  }

  const applyShortCluster = (cluster: string) => {
    let j = 0
    while (j < cluster.length) {
      const ch = cluster[j]!
      const long = SHORT_TO_LONG[ch]
      if (!long) {
        const rest = cluster.slice(j + 1)
        if (rest.length > 0) {
          ignoreFlag(ch)
          return
        }
        const next = peek()
        if (
          next !== undefined &&
          !next.startsWith('-') &&
          !looksLikePositionalUrl(next)
        ) {
          take()
        }
        ignoreFlag(ch)
        j++
        continue
      }
      if (VALUE_FLAGS.has(long)) {
        const attached = cluster.slice(j + 1)
        applyLong(long, attached.length > 0 ? attached : undefined)
        return
      }
      applyLong(long)
      j++
    }
  }

  while (i < tokens.length) {
    const tok = take()!
    if (tok === '--') {
      while (i < tokens.length) addUrl(take()!)
      break
    }
    if (tok.startsWith('--')) {
      const body = tok.slice(2)
      const eq = body.indexOf('=')
      if (eq === -1) applyLong(body)
      else applyLong(body.slice(0, eq), body.slice(eq + 1))
      continue
    }
    if (tok.startsWith('-') && tok.length > 1) {
      applyShortCluster(tok.slice(1))
      continue
    }
    addUrl(tok)
  }

  if (!url) {
    throw new CurlParseError('Could not find a URL in this curl command.')
  }

  if (auth && !getHeader(headers, 'Authorization')) {
    setHeader(
      headers,
      'Authorization',
      `Basic ${utf8ToBase64(`${auth.user}:${auth.pass}`)}`,
      warnings,
      false
    )
  }

  if (cookies) {
    const existing = getHeader(headers, 'Cookie')
    if (existing) {
      setHeader(
        headers,
        existing.key,
        `${existing.value}; ${cookies}`,
        warnings,
        false
      )
      warnings.push('Merged -b / --cookie with the existing Cookie header.')
    } else {
      setHeader(headers, 'Cookie', cookies, warnings, false)
    }
  }

  let body: string | undefined
  if (formFields.length > 0 && dataPieces.length > 0) {
    warnings.push('Both -F and -d were set; using multipart form fields only.')
  }

  if (formFields.length === 0 && dataPieces.length > 0) {
    body = dataPieces.join('&')
  }

  if (forceGet && body) {
    url = `${url}${url.includes('?') ? '&' : '?'}${body}`
    body = undefined
  }

  let resolvedMethod: string
  if (method) resolvedMethod = method
  else if (forceHead) resolvedMethod = 'HEAD'
  else if (forceGet) resolvedMethod = 'GET'
  else if (formFields.length > 0 || body !== undefined) resolvedMethod = 'POST'
  else resolvedMethod = 'GET'

  let bodyKind: BodyKind = 'none'
  if (formFields.length > 0) {
    bodyKind = 'multipart'
    const ct = getHeader(headers, 'Content-Type')
    if (ct && ct.value.toLowerCase().includes('multipart/form-data')) {
      delete headers[ct.key]
      warnings.push(
        'Omitting Content-Type so the runtime can set the multipart boundary.'
      )
    }
  } else if (body !== undefined) {
    if (
      jsonMode ||
      contentTypeIs(headers, 'json') ||
      looksLikeJsonObject(body)
    ) {
      bodyKind = 'json'
      if (!getHeader(headers, 'Content-Type')) {
        setHeader(headers, 'Content-Type', 'application/json', warnings, false)
        warnings.push(
          'Added Content-Type: application/json because the body looks like JSON.'
        )
      }
    } else if (
      contentTypeIs(headers, 'application/x-www-form-urlencoded') ||
      parseUrlEncodedPairs(body)
    ) {
      bodyKind = 'urlencoded'
      if (!getHeader(headers, 'Content-Type')) {
        setHeader(
          headers,
          'Content-Type',
          'application/x-www-form-urlencoded',
          warnings,
          false
        )
      }
    } else {
      bodyKind = 'text'
    }
  }

  if (
    (resolvedMethod === 'GET' || resolvedMethod === 'HEAD') &&
    bodyKind !== 'none' &&
    bodyKind !== 'multipart'
  ) {
    warnings.push(`${resolvedMethod} with a request body is unusual.`)
  }

  if (!looksLikeSchemeUrl(url)) {
    warnings.push(
      'URL has no scheme (http/https). fetch requires an absolute URL.'
    )
  }

  return {
    method: resolvedMethod,
    url,
    headers,
    body,
    bodyKind,
    auth,
    cookies,
    warnings,
    formFields: formFields.length > 0 ? formFields : undefined
  }
}

export function parseCurl(input: string): ParseCurlResult {
  const trimmed = input.trim()
  if (!trimmed) {
    return { ok: false, error: 'Paste a curl command to convert.' }
  }

  try {
    const stripped = stripLeadingCurl(trimmed)
    if (!stripped) {
      return { ok: false, error: 'Could not find a URL in this curl command.' }
    }

    const head = stripped.slice(0, 12).toLowerCase()
    if (
      head.startsWith('wget ') ||
      head.startsWith('http ') ||
      head.startsWith('httpie') ||
      head.startsWith('fetch(') ||
      head.startsWith('axios')
    ) {
      return { ok: false, error: 'This does not look like a curl command.' }
    }

    const tokens = tokenize(stripped)
    if (
      tokens[0]?.toLowerCase() === 'curl' ||
      tokens[0]?.toLowerCase() === 'curl.exe'
    ) {
      tokens.shift()
    }
    if (tokens.length === 0) {
      return { ok: false, error: 'Could not find a URL in this curl command.' }
    }

    const model = parseArgv(tokens)
    warnShellExpansion(tokens, model.warnings)
    return { ok: true, model }
  } catch (err) {
    if (err instanceof CurlParseError) {
      return { ok: false, error: err.message }
    }
    return { ok: false, error: 'Could not parse this curl command.' }
  }
}

const IDENT_RE = /^[A-Za-z_$][A-Za-z0-9_$]*$/

function jsString(value: string): string {
  if (!/['\\\n\r\t\u0000-\u001f]/.test(value)) {
    return `'${value}'`
  }
  if (!value.includes("'")) {
    return `'${value
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\t/g, '\\t')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029')}'`
  }
  return JSON.stringify(value)
}

function jsKey(name: string): string {
  return IDENT_RE.test(name) ? name : jsString(name)
}

function indent(level: number): string {
  return '  '.repeat(level)
}

function formatJsValue(value: unknown, level: number): string {
  if (value === null) return 'null'
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'null'
  }
  if (typeof value === 'string') return jsString(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const inner = value
      .map((item) => `${indent(level + 1)}${formatJsValue(item, level + 1)}`)
      .join(',\n')
    return `[\n${inner},\n${indent(level)}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const inner = entries
      .map(
        ([key, item]) =>
          `${indent(level + 1)}${jsKey(key)}: ${formatJsValue(item, level + 1)}`
      )
      .join(',\n')
    return `{\n${inner},\n${indent(level)}}`
  }
  return 'null'
}

function formatHeadersObject(
  headers: Record<string, string>,
  level: number
): string {
  const entries = Object.entries(headers)
  if (entries.length === 0) return '{}'
  const inner = entries
    .map(
      ([key, value]) => `${indent(level + 1)}${jsKey(key)}: ${jsString(value)}`
    )
    .join(',\n')
  return `{\n${inner},\n${indent(level)}}`
}

function formatUrlSearchParams(body: string, level: number): string | null {
  const pairs = parseUrlEncodedPairs(body)
  if (!pairs) return null
  return `new URLSearchParams(${formatJsValue(pairs, level)}).toString()`
}

function formatPyValue(value: unknown, level: number): string {
  if (value === null) return 'None'
  if (typeof value === 'boolean') return value ? 'True' : 'False'
  if (typeof value === 'number') {
    return Number.isFinite(value) ? String(value) : 'None'
  }
  if (typeof value === 'string') return jsString(value)
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    const inner = value
      .map((item) => `${indent(level + 1)}${formatPyValue(item, level + 1)}`)
      .join(',\n')
    return `[\n${inner},\n${indent(level)}]`
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
    if (entries.length === 0) return '{}'
    const inner = entries
      .map(
        ([key, item]) =>
          `${indent(level + 1)}${jsString(key)}: ${formatPyValue(item, level + 1)}`
      )
      .join(',\n')
    return `{\n${inner},\n${indent(level)}}`
  }
  return 'None'
}

function omitHeaders(
  headers: Record<string, string>,
  names: readonly string[]
): Record<string, string> {
  if (names.length === 0) return { ...headers }
  const skip = new Set(names.map((name) => name.toLowerCase()))
  const out: Record<string, string> = {}
  for (const [key, value] of Object.entries(headers)) {
    if (!skip.has(key.toLowerCase())) out[key] = value
  }
  return out
}

function jsonBodyLiteral(body: string, level: number): string | null {
  try {
    return formatJsValue(JSON.parse(body), level)
  } catch {
    return null
  }
}

function formPrelude(fields: FormField[]): string {
  const lines = ['const form = new FormData();']
  for (const field of fields) {
    lines.push(
      `form.append(${jsString(field.name)}, ${jsString(field.value)});`
    )
  }
  return lines.join('\n')
}

function emitFetchBody(model: RequestModel, level: number): string | undefined {
  if (model.bodyKind === 'multipart') return 'form'
  if (model.body === undefined) return undefined
  if (model.bodyKind === 'json') {
    const literal = jsonBodyLiteral(model.body, level)
    if (literal) return `JSON.stringify(${literal})`
    return jsString(model.body)
  }
  if (model.bodyKind === 'urlencoded') {
    return formatUrlSearchParams(model.body, level) ?? jsString(model.body)
  }
  return jsString(model.body)
}

function emitAxiosData(model: RequestModel, level: number): string | undefined {
  if (model.bodyKind === 'multipart') return 'form'
  if (model.body === undefined) return undefined
  if (model.bodyKind === 'json') {
    return jsonBodyLiteral(model.body, level) ?? jsString(model.body)
  }
  if (model.bodyKind === 'urlencoded') {
    return formatUrlSearchParams(model.body, level) ?? jsString(model.body)
  }
  return jsString(model.body)
}

export function toFetchCode(model: RequestModel): string {
  const headers = { ...model.headers }
  const prelude =
    model.bodyKind === 'multipart' && model.formFields
      ? `${formPrelude(model.formFields)}\n\n`
      : ''

  const options: string[] = []
  if (model.method !== 'GET') {
    options.push(`${indent(1)}method: ${jsString(model.method)}`)
  }
  if (Object.keys(headers).length > 0) {
    options.push(`${indent(1)}headers: ${formatHeadersObject(headers, 1)}`)
  }
  const body = emitFetchBody(model, 1)
  if (body !== undefined) {
    options.push(`${indent(1)}body: ${body}`)
  }

  if (options.length === 0) {
    return `${prelude}await fetch(${jsString(model.url)});`
  }
  return `${prelude}await fetch(${jsString(model.url)}, {\n${options.join(',\n')},\n});`
}

const HTTP_VERBS = new Set([
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options'
])

const AXIOS_BODY_VERBS = new Set(['post', 'put', 'patch'])

function indentBlock(code: string, level: number): string {
  const pad = indent(level)
  return code
    .split('\n')
    .map((line) => (line.length === 0 ? line : pad + line))
    .join('\n')
}

function axiosCall(callee: string, args: string[], prelude: string): string {
  if (args.length === 1 && !args[0]!.includes('\n')) {
    return `${prelude}await ${callee}(${args[0]});`
  }
  return `${prelude}await ${callee}(\n${args.map((arg) => indentBlock(arg, 1)).join(',\n')},\n);`
}

export function toAxiosCode(model: RequestModel): string {
  const headers = { ...model.headers }
  const prelude =
    model.bodyKind === 'multipart' && model.formFields
      ? `${formPrelude(model.formFields)}\n\n`
      : ''

  const method = model.method.toLowerCase()
  const url = jsString(model.url)
  const data = emitAxiosData(model, 0)
  const headerConfig =
    Object.keys(headers).length > 0
      ? `{\n${indent(1)}headers: ${formatHeadersObject(headers, 1)},\n}`
      : undefined

  if (!HTTP_VERBS.has(method)) {
    const fields = [
      `${indent(1)}method: ${jsString(method)}`,
      `${indent(1)}url: ${url}`
    ]
    if (Object.keys(headers).length > 0) {
      fields.push(`${indent(1)}headers: ${formatHeadersObject(headers, 1)}`)
    }
    if (data !== undefined) {
      fields.push(`${indent(1)}data: ${emitAxiosData(model, 1)}`)
    }
    return `${prelude}await axios({\n${fields.join(',\n')},\n});`
  }

  if (AXIOS_BODY_VERBS.has(method)) {
    if (data === undefined && !headerConfig) {
      return axiosCall(`axios.${method}`, [url], prelude)
    }
    if (data === undefined) {
      return axiosCall(`axios.${method}`, [url, 'null', headerConfig!], prelude)
    }
    if (!headerConfig) {
      return axiosCall(`axios.${method}`, [url, data], prelude)
    }
    return axiosCall(`axios.${method}`, [url, data, headerConfig], prelude)
  }

  if (data !== undefined) {
    const fields: string[] = []
    if (Object.keys(headers).length > 0) {
      fields.push(`${indent(1)}headers: ${formatHeadersObject(headers, 1)}`)
    }
    fields.push(`${indent(1)}data: ${emitAxiosData(model, 1)}`)
    return axiosCall(
      `axios.${method}`,
      [url, `{\n${fields.join(',\n')},\n}`],
      prelude
    )
  }

  if (headerConfig) {
    return axiosCall(`axios.${method}`, [url, headerConfig], prelude)
  }
  return axiosCall(`axios.${method}`, [url], prelude)
}

export function toPythonCode(model: RequestModel): string {
  const drop: string[] = []
  const extra: string[] = []

  if (model.auth) {
    const authHeader = getHeader(model.headers, 'Authorization')
    if (authHeader?.value.startsWith('Basic ')) drop.push('Authorization')
  }

  if (model.bodyKind === 'multipart' && model.formFields) {
    drop.push('Content-Type')
    const files: Record<string, string> = {}
    const data: Record<string, string> = {}
    for (const field of model.formFields) {
      if (field.fromFile) files[field.name] = field.value
      else data[field.name] = field.value
    }
    if (Object.keys(data).length > 0) {
      extra.push(`${indent(1)}data=${formatPyValue(data, 1)}`)
    }
    if (Object.keys(files).length > 0) {
      extra.push(`${indent(1)}files=${formatPyValue(files, 1)}`)
    }
  } else if (model.body !== undefined) {
    if (model.bodyKind === 'json') {
      let literal: string | null = null
      try {
        literal = formatPyValue(JSON.parse(model.body), 1)
      } catch {
        literal = null
      }
      if (literal) {
        const ct = getHeader(model.headers, 'Content-Type')
        if (ct?.value.toLowerCase().includes('json')) drop.push('Content-Type')
        extra.push(`${indent(1)}json=${literal}`)
      } else {
        extra.push(`${indent(1)}data=${jsString(model.body)}`)
      }
    } else if (model.bodyKind === 'urlencoded') {
      const pairs = parseUrlEncodedPairs(model.body)
      if (pairs) {
        const ct = getHeader(model.headers, 'Content-Type')
        if (ct?.value.toLowerCase().includes('urlencoded')) {
          drop.push('Content-Type')
        }
        extra.push(`${indent(1)}data=${formatPyValue(pairs, 1)}`)
      } else {
        extra.push(`${indent(1)}data=${jsString(model.body)}`)
      }
    } else {
      extra.push(`${indent(1)}data=${jsString(model.body)}`)
    }
  }

  const headers = omitHeaders(model.headers, drop)
  const args: string[] = []
  if (Object.keys(headers).length > 0) {
    args.push(`${indent(1)}headers=${formatPyValue(headers, 1)}`)
  }
  args.push(...extra)
  if (model.auth) {
    args.push(
      `${indent(1)}auth=(${jsString(model.auth.user)}, ${jsString(model.auth.pass)})`
    )
  }

  const method = model.method.toLowerCase()
  const urlArg = jsString(model.url)
  let call: string
  if (HTTP_VERBS.has(method)) {
    call =
      args.length === 0
        ? `response = requests.${method}(${urlArg})`
        : `response = requests.${method}(\n${indent(1)}${urlArg},\n${args.join(',\n')},\n)`
  } else if (args.length === 0) {
    call = `response = requests.request(${jsString(model.method)}, ${urlArg})`
  } else {
    call = `response = requests.request(\n${indent(1)}${jsString(model.method)},\n${indent(1)}${urlArg},\n${args.join(',\n')},\n)`
  }

  return `import requests\n\n${call}`
}

export function generateHttpCode(
  model: RequestModel,
  client: HttpClient
): string {
  if (client === 'axios') return toAxiosCode(model)
  if (client === 'python') return toPythonCode(model)
  return toFetchCode(model)
}
