/**
 * Helpers for the HTTP request builder (browser `fetch` only - no proxy).
 *
 * Nothing in this module persists data. Credentials passed to
 * `buildRequest` are used to compose headers and are never stored.
 */

export const HTTP_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'] as const
export type HttpMethod = (typeof HTTP_METHODS)[number]

export type BodyMode = 'none' | 'json' | 'raw'
export type AuthMode = 'none' | 'bearer' | 'basic'

export type KeyValueRow = {
  id: string
  name: string
  value: string
  enabled: boolean
}

export type AuthInput =
  | { mode: 'none' }
  | { mode: 'bearer'; token: string }
  | { mode: 'basic'; username: string; password: string }

export type BuildRequestInput = {
  method: HttpMethod
  url: string
  query: readonly KeyValueRow[]
  headers: readonly KeyValueRow[]
  bodyMode: BodyMode
  body: string
  auth: AuthInput
  /** Used to resolve `/relative` URLs. Defaults to none (absolute URLs only). */
  baseHref?: string
}

export type BuiltRequest = {
  ok: true
  url: string
  method: HttpMethod
  init: RequestInit
  /** Headers that will actually be sent (after filtering). */
  headers: [string, string][]
  /** Non-fatal notes (skipped headers, overridden Authorization, ...). */
  warnings: string[]
}

export type BuildRequestError = { ok: false; error: string }
export type BuildRequestResult = BuiltRequest | BuildRequestError

let rowCounter = 0
export function createRowId(): string {
  rowCounter += 1
  return `kv-${Date.now().toString(36)}-${rowCounter}`
}

export function createRow(
  name = '',
  value = '',
  enabled = true
): KeyValueRow {
  return { id: createRowId(), name, value, enabled }
}

export function methodAllowsBody(method: HttpMethod): boolean {
  return method !== 'GET'
}

// --- Headers ----------------------------------------------------------------

const HEADER_NAME_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/

/** Names the browser controls; `fetch` silently drops them. */
const FORBIDDEN_HEADER_NAMES = new Set([
  'accept-charset',
  'accept-encoding',
  'access-control-request-headers',
  'access-control-request-method',
  'connection',
  'content-length',
  'cookie',
  'cookie2',
  'date',
  'dnt',
  'expect',
  'host',
  'keep-alive',
  'origin',
  'referer',
  'set-cookie',
  'te',
  'trailer',
  'transfer-encoding',
  'upgrade',
  'via'
])

export function isForbiddenHeaderName(name: string): boolean {
  const lower = name.trim().toLowerCase()
  return (
    FORBIDDEN_HEADER_NAMES.has(lower) ||
    lower.startsWith('proxy-') ||
    lower.startsWith('sec-')
  )
}

export function isValidHeaderName(name: string): boolean {
  return HEADER_NAME_RE.test(name)
}

/** Header values must be ISO-8859-1 and free of control line breaks. */
export function isValidHeaderValue(value: string): boolean {
  for (let i = 0; i < value.length; i += 1) {
    const code = value.charCodeAt(i)
    if (code > 255 || code === 10 || code === 13 || code === 0) return false
  }
  return true
}

function utf8ToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text)
  let binary = ''
  bytes.forEach((b) => {
    binary += String.fromCharCode(b)
  })
  return btoa(binary)
}

/** `Authorization` header value for the given auth input, or null for none. */
export function buildAuthorizationValue(auth: AuthInput): string | null {
  if (auth.mode === 'bearer') {
    const token = auth.token.trim()
    return token ? `Bearer ${token}` : null
  }
  if (auth.mode === 'basic') {
    if (!auth.username && !auth.password) return null
    return `Basic ${utf8ToBase64(`${auth.username}:${auth.password}`)}`
  }
  return null
}

// --- URL & query ------------------------------------------------------------

/** Resolve user input to an absolute http(s) URL, or explain why not. */
export function resolveRequestUrl(
  raw: string,
  baseHref?: string
): { ok: true; url: URL } | { ok: false; error: string } {
  const trimmed = raw.trim()
  if (!trimmed) return { ok: false, error: 'Enter a URL.' }

  let candidate = trimmed
  if (trimmed.startsWith('//')) {
    candidate = `https:${trimmed}`
  } else if (trimmed.startsWith('/')) {
    if (!baseHref) {
      return {
        ok: false,
        error: 'Relative URLs need a host. Use a full URL like https://api.example.com/path.'
      }
    }
  } else if (
    !/^[a-zA-Z][a-zA-Z\d+.-]*:\/\//.test(trimmed) &&
    !/^(mailto|data|javascript|blob|file|about):/i.test(trimmed)
  ) {
    // No scheme (also covers `localhost:3000/path`): http for local hosts, else https.
    const isLocal = /^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?([/?#]|$)/i.test(trimmed)
    candidate = `${isLocal ? 'http' : 'https'}://${trimmed}`
  }

  try {
    const isRelative = trimmed.startsWith('/') && !trimmed.startsWith('//')
    const url = isRelative ? new URL(candidate, baseHref) : new URL(candidate)
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      return {
        ok: false,
        error: `Only http: and https: URLs can be fetched (got ${url.protocol}).`
      }
    }
    return { ok: true, url }
  } catch {
    return { ok: false, error: 'That does not look like a valid URL.' }
  }
}

/** Query rows that are enabled and have a non-empty key. */
function activeRows(rows: readonly KeyValueRow[]): KeyValueRow[] {
  return rows.filter((row) => row.enabled && row.name.trim() !== '')
}

/** Append enabled query rows to a URL (existing query in the URL is kept). */
export function applyQueryRows(url: URL, rows: readonly KeyValueRow[]): URL {
  const next = new URL(url.href)
  for (const row of activeRows(rows)) {
    next.searchParams.append(row.name.trim(), row.value)
  }
  return next
}

/** Split `?a=1&b=2` out of a URL string into base URL + rows. */
export function splitUrlQuery(raw: string): {
  base: string
  rows: KeyValueRow[]
} {
  const hashIndex = raw.indexOf('#')
  const hash = hashIndex >= 0 ? raw.slice(hashIndex) : ''
  const withoutHash = hashIndex >= 0 ? raw.slice(0, hashIndex) : raw
  const qIndex = withoutHash.indexOf('?')
  if (qIndex < 0) return { base: raw, rows: [] }
  const base = withoutHash.slice(0, qIndex) + hash
  const params = new URLSearchParams(withoutHash.slice(qIndex + 1))
  const rows: KeyValueRow[] = []
  params.forEach((value, name) => {
    rows.push(createRow(name, value))
  })
  return { base, rows }
}

/** Preview of the URL that will be requested, or null if not yet valid. */
export function previewRequestUrl(
  raw: string,
  query: readonly KeyValueRow[],
  baseHref?: string
): string | null {
  const resolved = resolveRequestUrl(raw, baseHref)
  if (!resolved.ok) return null
  return applyQueryRows(resolved.url, query).href
}

const SENSITIVE_QUERY_KEY_RE =
  /(token|secret|password|passwd|pwd|auth|bearer|api[-_]?key|apikey|access[-_]?key|signature|sig|session|credential)/i

/** True when a URL likely embeds credentials (userinfo or secret-like query keys). */
export function urlLooksSensitive(raw: string): boolean {
  const resolved = resolveRequestUrl(raw, 'https://example.invalid')
  if (!resolved.ok) return false
  const { username, password, searchParams } = resolved.url
  if (username || password) return true
  for (const key of searchParams.keys()) {
    if (SENSITIVE_QUERY_KEY_RE.test(key)) return true
  }
  return false
}

// --- Build request ----------------------------------------------------------

export function tryFormatJson(text: string): string | null {
  try {
    return JSON.stringify(JSON.parse(text), null, 2)
  } catch {
    return null
  }
}

export function buildRequest(input: BuildRequestInput): BuildRequestResult {
  const resolved = resolveRequestUrl(input.url, input.baseHref)
  if (!resolved.ok) return { ok: false, error: resolved.error }

  const warnings: string[] = []
  const finalUrl = applyQueryRows(resolved.url, input.query)
  // `fetch` rejects URLs with embedded credentials; move them to Basic auth hint.
  if (finalUrl.username || finalUrl.password) {
    return {
      ok: false,
      error:
        'URLs with user:password@ are rejected by fetch. Use Basic auth below instead.'
    }
  }

  const headerMap = new Map<string, { name: string; value: string }>()
  for (const row of activeRows(input.headers)) {
    const name = row.name.trim()
    if (!isValidHeaderName(name)) {
      return { ok: false, error: `Invalid header name: "${name}".` }
    }
    if (isForbiddenHeaderName(name)) {
      warnings.push(
        `"${name}" is controlled by the browser and will not be sent.`
      )
      continue
    }
    if (!isValidHeaderValue(row.value)) {
      return {
        ok: false,
        error: `Header "${name}" has a value the browser cannot send (non-Latin-1 character or line break).`
      }
    }
    headerMap.set(name.toLowerCase(), { name, value: row.value })
  }

  const authorization = buildAuthorizationValue(input.auth)
  if (authorization) {
    if (headerMap.has('authorization')) {
      warnings.push(
        'The Authorization header row was replaced by the Auth section.'
      )
    }
    headerMap.set('authorization', {
      name: 'Authorization',
      value: authorization
    })
  } else if (input.auth.mode !== 'none') {
    warnings.push('Auth is selected but empty - no Authorization header added.')
  }

  let body: string | undefined
  if (input.bodyMode !== 'none' && input.body.trim() !== '') {
    if (!methodAllowsBody(input.method)) {
      warnings.push(`${input.method} requests cannot carry a body - body ignored.`)
    } else if (input.bodyMode === 'json') {
      const formatted = tryFormatJson(input.body)
      if (formatted === null) {
        return { ok: false, error: 'Body is not valid JSON.' }
      }
      body = input.body
      if (!headerMap.has('content-type')) {
        headerMap.set('content-type', {
          name: 'Content-Type',
          value: 'application/json'
        })
      }
      if (!headerMap.has('accept')) {
        headerMap.set('accept', {
          name: 'Accept',
          value: 'application/json, text/plain, */*'
        })
      }
    } else {
      body = input.body
    }
  }

  const headers: [string, string][] = Array.from(headerMap.values()).map(
    (h) => [h.name, h.value]
  )

  const init: RequestInit = {
    method: input.method,
    headers: Object.fromEntries(headers),
    credentials: 'omit',
    cache: 'no-store',
    redirect: 'follow',
    referrerPolicy: 'no-referrer',
    ...(body !== undefined ? { body } : {})
  }

  return {
    ok: true,
    url: finalUrl.href,
    method: input.method,
    init,
    headers,
    warnings
  }
}

// --- Fetch timing & response ------------------------------------------------

export type ResponseMeta = {
  status: number
  statusText: string
  ok: boolean
  url: string
  redirected: boolean
  responseType: ResponseType
  contentType: string
  /** Time until response headers arrived. */
  headersMs: number
  /** Time until the full body was read. */
  totalMs: number
  /** Decoded body size in bytes (not necessarily the on-the-wire size). */
  sizeBytes: number
  headers: [string, string][]
}

export type ExecuteSuccess = {
  ok: true
  meta: ResponseMeta
  /** Raw text (empty for binary bodies). */
  bodyText: string
  /** Pretty-printed text when the body is JSON, else same as `bodyText`. */
  bodyDisplay: string
  isJson: boolean
  isBinary: boolean
}

export type ExecuteFailure = {
  ok: false
  failure: FetchFailure
  elapsedMs: number
}

export type ExecuteResult = ExecuteSuccess | ExecuteFailure

export type ExecuteOptions = {
  timeoutMs?: number
  signal?: AbortSignal
  /** Protocol of the page, e.g. `https:` - used to detect mixed content. */
  pageProtocol?: string
}

const BINARY_TYPE_RE =
  /^(image|audio|video|font)\/|application\/(octet-stream|pdf|zip|gzip|x-tar|wasm|vnd\.|x-7z|x-rar)/i

export function isBinaryContentType(contentType: string): boolean {
  return BINARY_TYPE_RE.test(contentType.trim())
}

export function isJsonContentType(contentType: string): boolean {
  return /(^|\/|\+)json\b/i.test(contentType)
}

/** Pretty-print JSON bodies; pass other text through unchanged. */
export function prettyBody(
  text: string,
  contentType: string
): { text: string; isJson: boolean } {
  const trimmed = text.trim()
  const looksJson =
    isJsonContentType(contentType) ||
    trimmed.startsWith('{') ||
    trimmed.startsWith('[')
  if (!looksJson || trimmed === '') return { text, isJson: false }
  const formatted = tryFormatJson(trimmed)
  return formatted === null
    ? { text, isJson: false }
    : { text: formatted, isJson: true }
}

export async function executeRequest(
  built: Pick<BuiltRequest, 'url' | 'init' | 'method' | 'headers'>,
  options: ExecuteOptions = {}
): Promise<ExecuteResult> {
  const controller = new AbortController()
  let timedOut = false
  let timer: ReturnType<typeof setTimeout> | null = null

  const onExternalAbort = () => controller.abort()
  if (options.signal) {
    if (options.signal.aborted) controller.abort()
    else options.signal.addEventListener('abort', onExternalAbort)
  }
  if (options.timeoutMs && options.timeoutMs > 0) {
    timer = setTimeout(() => {
      timedOut = true
      controller.abort()
    }, options.timeoutMs)
  }

  const start = performance.now()
  try {
    const response = await fetch(built.url, {
      ...built.init,
      signal: controller.signal
    })
    const headersMs = performance.now() - start
    const buffer = await response.arrayBuffer()
    const totalMs = performance.now() - start

    const contentType = response.headers.get('content-type') ?? ''
    const isBinary = isBinaryContentType(contentType)
    const bodyText = isBinary
      ? ''
      : new TextDecoder('utf-8').decode(new Uint8Array(buffer))
    const pretty = isBinary
      ? { text: '', isJson: false }
      : prettyBody(bodyText, contentType)

    const headers: [string, string][] = []
    response.headers.forEach((value, name) => {
      headers.push([name, value])
    })
    headers.sort((a, b) => a[0].localeCompare(b[0]))

    return {
      ok: true,
      meta: {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        url: response.url || built.url,
        redirected: response.redirected,
        responseType: response.type,
        contentType,
        headersMs,
        totalMs,
        sizeBytes: buffer.byteLength,
        headers
      },
      bodyText,
      bodyDisplay: pretty.text,
      isJson: pretty.isJson,
      isBinary
    }
  } catch (error) {
    return {
      ok: false,
      failure: classifyFetchError(error, {
        url: built.url,
        method: built.method,
        headers: built.headers,
        hasBody: built.init.body !== undefined,
        timedOut,
        timeoutMs: options.timeoutMs,
        pageProtocol: options.pageProtocol
      }),
      elapsedMs: performance.now() - start
    }
  } finally {
    if (timer) clearTimeout(timer)
    options.signal?.removeEventListener('abort', onExternalAbort)
  }
}

// --- Response formatting ----------------------------------------------------

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return '-'
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value >= 100 ? value.toFixed(0) : value.toFixed(1)} ${units[unit]}`
}

export function formatDuration(ms: number): string {
  if (!Number.isFinite(ms) || ms < 0) return '-'
  if (ms < 1000) return `${Math.round(ms)} ms`
  return `${(ms / 1000).toFixed(2)} s`
}

export type StatusTone = 'info' | 'success' | 'redirect' | 'client' | 'server'

export function statusTone(status: number): StatusTone {
  if (status >= 500) return 'server'
  if (status >= 400) return 'client'
  if (status >= 300) return 'redirect'
  if (status >= 200) return 'success'
  return 'info'
}

export type ResponseSummaryItem = { label: string; value: string }

/** Compact label/value pairs for the response header strip. */
export function formatResponseMeta(meta: ResponseMeta): ResponseSummaryItem[] {
  const items: ResponseSummaryItem[] = [
    {
      label: 'Status',
      value: `${meta.status}${meta.statusText ? ` ${meta.statusText}` : ''}`
    },
    { label: 'Time', value: formatDuration(meta.totalMs) },
    { label: 'Headers in', value: formatDuration(meta.headersMs) },
    { label: 'Size', value: formatBytes(meta.sizeBytes) }
  ]
  if (meta.contentType) {
    items.push({ label: 'Type', value: meta.contentType })
  }
  if (meta.redirected) {
    items.push({ label: 'Final URL', value: meta.url })
  }
  return items
}

// --- Failure classification (CORS-ish) --------------------------------------

export type FetchFailureKind =
  | 'aborted'
  | 'timeout'
  | 'mixed-content'
  | 'network-or-cors'
  | 'unknown'

export type FetchFailure = {
  kind: FetchFailureKind
  title: string
  message: string
  hints: string[]
}

export type FailureContext = {
  url: string
  method: HttpMethod
  headers: readonly [string, string][]
  hasBody: boolean
  timedOut?: boolean
  timeoutMs?: number
  pageProtocol?: string
}

const CORS_SAFELISTED_HEADERS = new Set([
  'accept',
  'accept-language',
  'content-language',
  'content-type',
  'range'
])
const SIMPLE_CONTENT_TYPES = new Set([
  'application/x-www-form-urlencoded',
  'multipart/form-data',
  'text/plain'
])

/** Heuristic: would the browser send an OPTIONS preflight first? */
export function likelyNeedsPreflight(
  method: HttpMethod,
  headers: readonly [string, string][]
): boolean {
  if (method !== 'GET' && method !== 'POST') return true
  for (const [name, value] of headers) {
    const lower = name.toLowerCase()
    if (!CORS_SAFELISTED_HEADERS.has(lower)) return true
    if (lower === 'content-type') {
      const essence = value.split(';')[0].trim().toLowerCase()
      if (!SIMPLE_CONTENT_TYPES.has(essence)) return true
    }
  }
  return false
}

function isLocalHostname(hostname: string): boolean {
  return (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname.endsWith('.localhost')
  )
}

export function classifyFetchError(
  error: unknown,
  ctx: FailureContext
): FetchFailure {
  const isAbort =
    (error instanceof DOMException && error.name === 'AbortError') ||
    (error instanceof Error && error.name === 'AbortError')

  if (isAbort) {
    if (ctx.timedOut) {
      return {
        kind: 'timeout',
        title: 'Request timed out',
        message: `No complete response within ${formatDuration(ctx.timeoutMs ?? 0)}.`,
        hints: [
          'The server may be slow or unreachable. Try again or raise the timeout.'
        ]
      }
    }
    return {
      kind: 'aborted',
      title: 'Request cancelled',
      message: 'The request was cancelled before a response arrived.',
      hints: []
    }
  }

  if (error instanceof TypeError) {
    let target: URL | null = null
    try {
      target = new URL(ctx.url)
    } catch {
      target = null
    }

    if (
      target &&
      ctx.pageProtocol === 'https:' &&
      target.protocol === 'http:' &&
      !isLocalHostname(target.hostname)
    ) {
      return {
        kind: 'mixed-content',
        title: 'Blocked: mixed content',
        message:
          'This page is served over HTTPS, so the browser refuses to call an insecure http:// URL.',
        hints: ['Use the https:// version of the URL if the server supports it.']
      }
    }

    const hints: string[] = [
      'CORS: the server must answer with an Access-Control-Allow-Origin header that allows this site. Browsers hide the exact reason from JavaScript, so a CORS block looks the same as a network error ("Failed to fetch").'
    ]
    if (likelyNeedsPreflight(ctx.method, ctx.headers)) {
      hints.push(
        `This request will trigger a CORS preflight (OPTIONS) because of the method or headers (e.g. ${ctx.method}, Authorization, Content-Type: application/json). The server must also allow them via Access-Control-Allow-Methods / Access-Control-Allow-Headers.`
      )
    }
    if (target && isLocalHostname(target.hostname)) {
      hints.push(
        'For localhost targets, confirm the server is running and sends CORS headers for this origin.'
      )
    }
    hints.push(
      'Other causes: DNS failure, offline network, invalid TLS certificate, a VPN/firewall, or a browser extension (ad blocker) blocking the request.',
      'Open DevTools > Network/Console to see the precise browser message. This tool has no server-side proxy, so it cannot bypass CORS.'
    )
    return {
      kind: 'network-or-cors',
      title: 'Request failed - likely CORS or network error',
      message:
        'The browser could not complete the request. The response (if any) was blocked from being read by this page.',
      hints
    }
  }

  return {
    kind: 'unknown',
    title: 'Request failed',
    message:
      error instanceof Error ? error.message : 'An unknown error occurred.',
    hints: []
  }
}

// --- Display helpers --------------------------------------------------------

/** Mask secret-looking query values and userinfo for on-screen history. */
export function redactUrl(raw: string): string {
  try {
    const url = new URL(raw)
    if (url.username) url.username = '***'
    if (url.password) url.password = '***'
    for (const key of Array.from(url.searchParams.keys())) {
      if (SENSITIVE_QUERY_KEY_RE.test(key)) url.searchParams.set(key, '***')
    }
    return url.href
  } catch {
    return raw
  }
}
