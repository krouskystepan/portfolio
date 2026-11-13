/**
 * DNS-over-HTTPS (JSON API) lookups from the browser.
 *
 * Privacy: every lookup sends the queried hostname to the chosen public
 * resolver (Cloudflare or Google). Nothing else is sent, and no query runs
 * until the user explicitly submits one.
 */

import { reverseDnsName } from './ipAddress'

export type DnsProviderId = 'cloudflare' | 'google'

export type DnsProvider = {
  id: DnsProviderId
  label: string
  operator: string
  /** Endpoint that receives the hostname. */
  endpoint: string
  privacyUrl: string
  /** Extra request headers (Cloudflare requires an explicit Accept). */
  headers: Record<string, string>
}

export const DNS_PROVIDERS: Record<DnsProviderId, DnsProvider> = {
  cloudflare: {
    id: 'cloudflare',
    label: 'Cloudflare (1.1.1.1)',
    operator: 'Cloudflare, Inc.',
    endpoint: 'https://cloudflare-dns.com/dns-query',
    privacyUrl:
      'https://developers.cloudflare.com/1.1.1.1/privacy/public-dns-resolver/',
    headers: { accept: 'application/dns-json' }
  },
  google: {
    id: 'google',
    label: 'Google Public DNS',
    operator: 'Google LLC',
    endpoint: 'https://dns.google/resolve',
    privacyUrl: 'https://developers.google.com/speed/public-dns/privacy',
    headers: { accept: 'application/json' }
  }
}

export const DNS_PROVIDER_IDS: readonly DnsProviderId[] = [
  'cloudflare',
  'google'
]

export const DNS_RECORD_TYPES = [
  'A',
  'AAAA',
  'CNAME',
  'MX',
  'NS',
  'TXT',
  'SOA',
  'CAA',
  'SRV',
  'PTR'
] as const

export type DnsRecordType = (typeof DNS_RECORD_TYPES)[number]

export const DEFAULT_DNS_TYPES: readonly DnsRecordType[] = ['A']
export const MAX_DNS_TYPES = 6
const REQUEST_TIMEOUT_MS = 8000

const TYPE_CODES: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  33: 'SRV',
  257: 'CAA',
  43: 'DS',
  46: 'RRSIG',
  48: 'DNSKEY',
  64: 'SVCB',
  65: 'HTTPS'
}

const RCODES: Record<number, { name: string; hint: string }> = {
  0: { name: 'NOERROR', hint: 'Query succeeded.' },
  1: { name: 'FORMERR', hint: 'The resolver could not parse the query.' },
  2: {
    name: 'SERVFAIL',
    hint: 'The resolver could not get an answer (broken DNSSEC or unreachable nameservers).'
  },
  3: { name: 'NXDOMAIN', hint: 'This name does not exist.' },
  4: { name: 'NOTIMP', hint: 'The resolver does not support this query type.' },
  5: { name: 'REFUSED', hint: 'The resolver refused the query.' }
}

export function isDnsRecordType(value: string): value is DnsRecordType {
  return (DNS_RECORD_TYPES as readonly string[]).includes(value)
}

export type DnsRecord = {
  name: string
  type: string
  ttl: number
  data: string
}

export type DnsAnswer = {
  type: DnsRecordType
  status: number
  statusName: string
  statusHint: string
  answers: DnsRecord[]
  authority: DnsRecord[]
  /** Flags returned by the resolver. */
  flags: {
    truncated: boolean
    recursionAvailable: boolean
    authenticated: boolean
  }
  /** Extended error text some resolvers attach (Google `Comment`). */
  comment: string | null
}

export type DnsTypeOutcome =
  | { type: DnsRecordType; ok: true; answer: DnsAnswer }
  | { type: DnsRecordType; ok: false; error: string }

// --- Input handling ---------------------------------------------------------

export type NormalizedQuery = { name: string; isReverse: boolean }

/**
 * Accepts hostnames (including unicode, converted to punycode) and, for PTR
 * lookups, IP addresses (converted to in-addr.arpa / ip6.arpa).
 */
export function normalizeDnsName(
  raw: string,
  types: readonly DnsRecordType[]
): { ok: true; value: NormalizedQuery } | { ok: false; error: string } {
  let text = raw.trim()
  if (!text) return { ok: false, error: 'Enter a domain name.' }

  const wantsPtr = types.includes('PTR')
  const reverse = reverseDnsName(text)
  if (reverse) {
    if (!wantsPtr) {
      return {
        ok: false,
        error:
          'That is an IP address. Select the PTR record type to look up its reverse DNS name.'
      }
    }
    return { ok: true, value: { name: reverse, isReverse: true } }
  }

  // Strip scheme / path if a URL was pasted.
  text = text.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split(/[/?#]/)[0]
  text = text.replace(/:\d+$/, '')
  if (text.endsWith('.')) text = text.slice(0, -1)
  if (!text) return { ok: false, error: 'Enter a domain name.' }

  let ascii = text
  if (/[^\x00-\x7f]/.test(text)) {
    try {
      ascii = new URL(`http://${text}`).hostname
    } catch {
      return { ok: false, error: 'Could not convert this name to punycode.' }
    }
  }
  ascii = ascii.toLowerCase()

  if (ascii.length > 253) {
    return { ok: false, error: 'Names are limited to 253 characters.' }
  }
  const labels = ascii.split('.')
  for (const label of labels) {
    if (label.length === 0) return { ok: false, error: 'Empty label in name.' }
    if (label.length > 63) {
      return { ok: false, error: 'Labels are limited to 63 characters.' }
    }
    // Underscores are legal in service names (_dmarc, _sip._tcp).
    if (!/^[a-z0-9_]([a-z0-9_-]*[a-z0-9_])?$/.test(label)) {
      return {
        ok: false,
        error: `Invalid label "${label}": use letters, digits, hyphens, underscores.`
      }
    }
  }
  return { ok: true, value: { name: ascii, isReverse: false } }
}

// --- Response parsing -------------------------------------------------------

type JsonObject = Record<string, unknown>

function isObject(value: unknown): value is JsonObject {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function parseRecords(value: unknown): DnsRecord[] {
  if (!Array.isArray(value)) return []
  const out: DnsRecord[] = []
  for (const item of value) {
    if (!isObject(item)) continue
    const { name, type, TTL, data } = item
    if (typeof name !== 'string' || typeof data !== 'string') continue
    const typeNumber = typeof type === 'number' ? type : -1
    out.push({
      name,
      type:
        TYPE_CODES[typeNumber] ?? (typeNumber >= 0 ? `TYPE${typeNumber}` : '?'),
      ttl: typeof TTL === 'number' ? TTL : 0,
      data
    })
  }
  return out
}

export function parseDohResponse(
  type: DnsRecordType,
  body: unknown
): DnsAnswer {
  if (!isObject(body) || typeof body.Status !== 'number') {
    throw new Error('Unexpected response from the DNS resolver.')
  }
  const status = body.Status
  const rcode = RCODES[status] ?? {
    name: `RCODE ${status}`,
    hint: 'The resolver returned an uncommon status code.'
  }
  return {
    type,
    status,
    statusName: rcode.name,
    statusHint: rcode.hint,
    answers: parseRecords(body.Answer),
    authority: parseRecords(body.Authority),
    flags: {
      truncated: body.TC === true,
      recursionAvailable: body.RA === true,
      authenticated: body.AD === true
    },
    comment: typeof body.Comment === 'string' ? body.Comment : null
  }
}

// --- Fetch ------------------------------------------------------------------

export function buildDohUrl(
  provider: DnsProvider,
  name: string,
  type: DnsRecordType
): string {
  const url = new URL(provider.endpoint)
  url.searchParams.set('name', name)
  url.searchParams.set('type', type)
  return url.toString()
}

function describeFetchError(err: unknown, provider: DnsProvider): string {
  if (err instanceof DOMException && err.name === 'AbortError') {
    return `Timed out after ${REQUEST_TIMEOUT_MS / 1000}s waiting for ${provider.label}.`
  }
  if (err instanceof TypeError) {
    return `Could not reach ${provider.label}. A network filter, VPN, ad blocker, or offline state may be blocking DNS-over-HTTPS requests to ${new URL(provider.endpoint).host} - try the other provider.`
  }
  return err instanceof Error ? err.message : 'DNS request failed.'
}

export async function lookupDns(
  providerId: DnsProviderId,
  name: string,
  type: DnsRecordType,
  signal?: AbortSignal
): Promise<DnsTypeOutcome> {
  const provider = DNS_PROVIDERS[providerId]
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort)

  try {
    const response = await fetch(buildDohUrl(provider, name, type), {
      headers: provider.headers,
      signal: controller.signal,
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      cache: 'no-store'
    })
    if (!response.ok) {
      return {
        type,
        ok: false,
        error: `${provider.label} returned HTTP ${response.status}.`
      }
    }
    const body: unknown = await response.json()
    return { type, ok: true, answer: parseDohResponse(type, body) }
  } catch (err) {
    return { type, ok: false, error: describeFetchError(err, provider) }
  } finally {
    clearTimeout(timer)
    signal?.removeEventListener('abort', onAbort)
  }
}

export async function lookupDnsTypes(
  providerId: DnsProviderId,
  name: string,
  types: readonly DnsRecordType[],
  signal?: AbortSignal
): Promise<DnsTypeOutcome[]> {
  return Promise.all(
    types.map((type) => lookupDns(providerId, name, type, signal))
  )
}
