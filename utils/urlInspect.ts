const RELATIVE_BASE = 'https://url-inspector.invalid'

export type UrlPart = {
  key: string
  label: string
  value: string
}

export type QueryParamRow = {
  encodedName: string
  encodedValue: string
  name: string
  value: string
}

export type UrlInspectOk = {
  ok: true
  normalizedHref: string
  assumedHttps: boolean
  protocolRelative: boolean
  relative: boolean
  parts: UrlPart[]
  params: QueryParamRow[]
}

export type UrlInspectErr = {
  ok: false
  error: string | null
}

export type UrlInspectResult = UrlInspectOk | UrlInspectErr

export type QueryParamDraft = {
  id: string
  name: string
  value: string
}

export type UrlDraft = {
  protocolRelative: boolean
  relative: boolean
  assumedHttps: boolean
  protocol: string
  username: string
  password: string
  hostname: string
  port: string
  pathname: string
  hash: string
  params: QueryParamDraft[]
}

const EDITABLE_PART_KEYS = [
  'protocol',
  'username',
  'password',
  'hostname',
  'port',
  'pathname',
  'hash'
] as const

export type EditablePartKey = (typeof EDITABLE_PART_KEYS)[number]

export function isEditablePartKey(key: string): key is EditablePartKey {
  return (EDITABLE_PART_KEYS as readonly string[]).includes(key)
}

export function createParamId(): string {
  return `q-${Math.random().toString(36).slice(2, 10)}`
}

export function draftFromInspect(result: UrlInspectOk): UrlDraft {
  const byKey = Object.fromEntries(result.parts.map((p) => [p.key, p.value]))
  return {
    protocolRelative: result.protocolRelative,
    relative: result.relative,
    assumedHttps: result.assumedHttps,
    protocol: result.protocolRelative ? '' : (byKey.protocol ?? ''),
    username: byKey.username ?? '',
    password: byKey.password ?? '',
    hostname: byKey.hostname ?? '',
    port: byKey.port ?? '',
    pathname: byKey.pathname ?? '',
    hash: byKey.hash ?? '',
    params: result.params.map((row) => ({
      id: createParamId(),
      name: row.name,
      value: row.value
    }))
  }
}

export function serializeSearch(params: QueryParamDraft[]): string {
  const pairs = params
    .filter((row) => row.name !== '' || row.value !== '')
    .map((row) => `${encodeQueryToken(row.name)}=${encodeQueryToken(row.value)}`)
  return pairs.length ? `?${pairs.join('&')}` : ''
}

export function encodeQueryToken(token: string): string {
  return encodeURIComponent(token).replace(/%20/g, '+')
}

export function buildHref(draft: UrlDraft): string {
  const search = serializeSearch(draft.params)
  const hash = normalizeHash(draft.hash)
  const relative = draft.relative && !draft.hostname
  const pathname = normalizePathname(draft.pathname, relative)

  if (relative) {
    return `${pathname}${search}${hash}`
  }

  const auth = formatUserinfo(draft.username, draft.password)
  const host = draft.port ? `${draft.hostname}:${draft.port}` : draft.hostname

  if (draft.protocolRelative && !draft.protocol) {
    return `//${auth}${host}${pathname}${search}${hash}`
  }

  const protocol = normalizeProtocol(draft.protocol || 'https:')
  return `${protocol}//${auth}${host}${pathname}${search}${hash}`
}

export function partsFromDraft(draft: UrlDraft): UrlPart[] {
  const href = buildHref(draft)
  const search = serializeSearch(draft.params)
  const relative = draft.relative && !draft.hostname
  const protocol = relative
    ? ''
    : draft.protocolRelative && !draft.protocol
      ? 'https:'
      : normalizeProtocol(draft.protocol || 'https:')
  const host = relative
    ? ''
    : draft.port
      ? `${draft.hostname}:${draft.port}`
      : draft.hostname
  const origin = relative || !draft.hostname ? '' : `${protocol}//${host}`

  return [
    { key: 'href', label: 'Href', value: href },
    { key: 'origin', label: 'Origin', value: origin },
    { key: 'protocol', label: 'Protocol', value: draft.protocol },
    { key: 'username', label: 'Username', value: draft.username },
    { key: 'password', label: 'Password', value: draft.password },
    { key: 'host', label: 'Host', value: host },
    { key: 'hostname', label: 'Hostname', value: draft.hostname },
    { key: 'port', label: 'Port', value: draft.port },
    { key: 'pathname', label: 'Path', value: draft.pathname },
    { key: 'search', label: 'Query', value: search },
    { key: 'hash', label: 'Hash', value: draft.hash }
  ]
}

function normalizeProtocol(protocol: string): string {
  const trimmed = protocol.trim()
  if (!trimmed) return 'https:'
  return trimmed.endsWith(':') ? trimmed : `${trimmed}:`
}

function normalizeHash(hash: string): string {
  const trimmed = hash.trim()
  if (!trimmed) return ''
  const body = trimmed.startsWith('#') ? trimmed.slice(1) : trimmed
  if (!body) return ''
  try {
    return `#${encodeURI(body)}`
  } catch {
    return `#${body}`
  }
}

function normalizePathname(pathname: string, relative: boolean): string {
  const trimmed = pathname.trim()
  if (!trimmed) return relative ? '' : '/'
  try {
    const encoded = encodeURI(trimmed)
    if (relative) return encoded
    return encoded.startsWith('/') ? encoded : `/${encoded}`
  } catch {
    return trimmed
  }
}

function formatUserinfo(username: string, password: string): string {
  if (!username && !password) return ''
  const user = encodeURIComponent(username)
  return password ? `${user}:${encodeURIComponent(password)}@` : `${user}@`
}

export function inspectUrl(raw: string): UrlInspectResult {
  const input = raw.trim()
  if (!input) return { ok: false, error: null }

  const parsed = parseHref(input)
  if (!parsed) {
    return {
      ok: false,
      error:
        'This does not look like a URL. Try a full href (https://…), a host without a scheme, or a path starting with /.'
    }
  }

  const { url, assumedHttps, protocolRelative, relative } = parsed

  const origin = relative ? '' : url.origin
  const protocol = relative ? '' : url.protocol
  const username = relative ? '' : url.username
  const password = relative ? '' : url.password
  const host = relative ? '' : url.host
  const hostname = relative ? '' : url.hostname
  const port = relative ? '' : url.port
  const queryOnly = relative && (input.startsWith('?') || input.startsWith('#'))
  const pathname = queryOnly ? '' : url.pathname
  const query = url.search
  const hash = url.hash
  const normalizedHref = relative
    ? `${pathname}${query}${hash}`
    : protocolRelative
      ? url.href.replace(/^https:/, '')
      : url.href

  const parts: UrlPart[] = [
    { key: 'href', label: 'Href', value: normalizedHref },
    { key: 'origin', label: 'Origin', value: origin },
    { key: 'protocol', label: 'Protocol', value: protocol },
    { key: 'username', label: 'Username', value: username },
    { key: 'password', label: 'Password', value: password },
    { key: 'host', label: 'Host', value: host },
    { key: 'hostname', label: 'Hostname', value: hostname },
    { key: 'port', label: 'Port', value: port },
    { key: 'pathname', label: 'Path', value: pathname },
    { key: 'search', label: 'Query', value: query },
    { key: 'hash', label: 'Hash', value: hash }
  ]

  return {
    ok: true,
    normalizedHref,
    assumedHttps,
    protocolRelative,
    relative,
    parts,
    params: parseQueryParams(query)
  }
}

function parseHref(input: string): {
  url: URL
  assumedHttps: boolean
  protocolRelative: boolean
  relative: boolean
} | null {
  try {
    return {
      url: new URL(input),
      assumedHttps: false,
      protocolRelative: false,
      relative: false
    }
  } catch {
    /* try fallbacks */
  }

  if (input.startsWith('//')) {
    try {
      return {
        url: new URL(`https:${input}`),
        assumedHttps: true,
        protocolRelative: true,
        relative: false
      }
    } catch {
      return null
    }
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(input)) {
    return null
  }

  if (input.startsWith('/') || input.startsWith('?') || input.startsWith('#')) {
    try {
      return {
        url: new URL(input, RELATIVE_BASE),
        assumedHttps: false,
        protocolRelative: false,
        relative: true
      }
    } catch {
      return null
    }
  }

  try {
    return {
      url: new URL(`https://${input}`),
      assumedHttps: true,
      protocolRelative: false,
      relative: false
    }
  } catch {
    return null
  }
}

export function parseQueryParams(search: string): QueryParamRow[] {
  const raw = search.startsWith('?') ? search.slice(1) : search
  if (!raw) return []

  return raw.split('&').map((pair) => {
    const eq = pair.indexOf('=')
    const encodedName = eq === -1 ? pair : pair.slice(0, eq)
    const encodedValue = eq === -1 ? '' : pair.slice(eq + 1)
    return {
      encodedName,
      encodedValue,
      name: decodeQueryToken(encodedName),
      value: decodeQueryToken(encodedValue)
    }
  })
}

function decodeQueryToken(token: string): string {
  try {
    return decodeURIComponent(token.replace(/\+/g, ' '))
  } catch {
    return token.replace(/\+/g, ' ')
  }
}
