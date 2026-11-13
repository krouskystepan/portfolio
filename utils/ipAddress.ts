/**
 * Client-side IPv4 / IPv6 parsing and classification (no network calls).
 * Classification follows the IANA special-purpose registries; classful
 * A-E labels are legacy and shown for reference only.
 */

export type IpVersion = 4 | 6

export type IpFacts = { label: string; value: string }[]

export type IpClassification = {
  /** Short badges, most specific first (e.g. "Private", "Loopback"). */
  tags: string[]
  /** Human summary of how the address is routed / used. */
  scope: string
  /** Matching special-purpose block, if any. */
  block: string | null
  /** True when the address is routable on the public internet. */
  isGlobal: boolean
}

export type Ipv4Info = {
  version: 4
  input: string
  address: string
  octets: [number, number, number, number]
  decimal: string
  hex: string
  binary: string
  /** Legacy classful label (A-E), kept for reference. */
  classfulClass: 'A' | 'B' | 'C' | 'D' | 'E'
  classification: IpClassification
  reverseDns: string
  ipv4MappedIpv6: string
}

export type Ipv6Info = {
  version: 6
  input: string
  zone: string | null
  hextets: number[]
  expanded: string
  compressed: string
  /** Mixed notation when the address embeds an IPv4 (mapped / NAT64). */
  mixed: string | null
  decimal: string
  hex: string
  classification: IpClassification
  reverseDns: string
  embeddedIpv4: string | null
}

export type IpParseResult =
  | { ok: true; info: Ipv4Info | Ipv6Info }
  | { ok: false; error: string }

// --- IPv4 -------------------------------------------------------------------

export function parseIpv4Octets(
  text: string
): [number, number, number, number] | null {
  const parts = text.split('.')
  if (parts.length !== 4) return null
  const octets: number[] = []
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null
    // Reject leading zeros ("010" is ambiguous: octal in some parsers).
    if (part.length > 1 && part.startsWith('0')) return null
    const n = Number(part)
    if (n > 255) return null
    octets.push(n)
  }
  return [octets[0], octets[1], octets[2], octets[3]]
}

function ipv4ToInt(o: readonly number[]): number {
  return ((o[0] << 24) | (o[1] << 16) | (o[2] << 8) | o[3]) >>> 0
}

type Ipv4Block = {
  cidr: string
  name: string
  tag: string
  /** Defaults to false. */
  global?: boolean
  scope: string
}

function inCidr4(n: number, base: string, prefix: number): boolean {
  const octets = parseIpv4Octets(base)
  if (!octets) return false
  const mask = prefix === 0 ? 0 : (0xffffffff << (32 - prefix)) >>> 0
  return (n & mask) >>> 0 === (ipv4ToInt(octets) & mask) >>> 0
}

/** Order matters: most specific first. */
const IPV4_BLOCKS: readonly Ipv4Block[] = [
  {
    cidr: '255.255.255.255/32',
    name: 'Limited broadcast',
    tag: 'Broadcast',
    scope: 'Local network only; never forwarded by routers'
  },
  {
    cidr: '127.0.0.0/8',
    name: 'Loopback',
    tag: 'Loopback',
    scope: 'This host only'
  },
  {
    cidr: '0.0.0.0/8',
    name: '"This" network / unspecified',
    tag: 'Unspecified',
    scope: 'Source address only; "any" when binding sockets'
  },
  {
    cidr: '10.0.0.0/8',
    name: 'Private-use (RFC 1918)',
    tag: 'Private',
    scope: 'Private networks; not routable on the internet'
  },
  {
    cidr: '172.16.0.0/12',
    name: 'Private-use (RFC 1918)',
    tag: 'Private',
    scope: 'Private networks; not routable on the internet'
  },
  {
    cidr: '192.168.0.0/16',
    name: 'Private-use (RFC 1918)',
    tag: 'Private',
    scope: 'Private networks; not routable on the internet'
  },
  {
    cidr: '100.64.0.0/10',
    name: 'Shared address space / CGNAT (RFC 6598)',
    tag: 'CGNAT',
    scope: 'Carrier-grade NAT between ISP and subscriber'
  },
  {
    cidr: '169.254.0.0/16',
    name: 'Link-local (RFC 3927)',
    tag: 'Link-local',
    scope: 'Same network segment; auto-configuration (APIPA)'
  },
  {
    cidr: '192.0.0.0/24',
    name: 'IETF protocol assignments (RFC 6890)',
    tag: 'Reserved',
    scope: 'Reserved for protocol use'
  },
  {
    cidr: '192.0.2.0/24',
    name: 'Documentation TEST-NET-1 (RFC 5737)',
    tag: 'Documentation',
    scope: 'Examples and docs only'
  },
  {
    cidr: '198.51.100.0/24',
    name: 'Documentation TEST-NET-2 (RFC 5737)',
    tag: 'Documentation',
    scope: 'Examples and docs only'
  },
  {
    cidr: '203.0.113.0/24',
    name: 'Documentation TEST-NET-3 (RFC 5737)',
    tag: 'Documentation',
    scope: 'Examples and docs only'
  },
  {
    cidr: '192.88.99.0/24',
    name: '6to4 relay anycast (deprecated, RFC 7526)',
    tag: 'Deprecated',
    scope: 'Deprecated anycast prefix'
  },
  {
    cidr: '198.18.0.0/15',
    name: 'Benchmarking (RFC 2544)',
    tag: 'Benchmarking',
    scope: 'Network device benchmarking'
  },
  {
    cidr: '224.0.0.0/4',
    name: 'Multicast (RFC 5771)',
    tag: 'Multicast',
    scope: 'One-to-many delivery'
  },
  {
    cidr: '240.0.0.0/4',
    name: 'Reserved for future use (Class E)',
    tag: 'Reserved',
    scope: 'Reserved; not usable on the public internet'
  }
]

function classifyIpv4(octets: readonly number[]): IpClassification {
  const n = ipv4ToInt(octets)
  for (const block of IPV4_BLOCKS) {
    const [base, prefixText] = block.cidr.split('/')
    if (inCidr4(n, base, Number(prefixText))) {
      return {
        tags: [block.tag],
        scope: block.scope,
        block: `${block.name} - ${block.cidr}`,
        isGlobal: block.global === true
      }
    }
  }
  return {
    tags: ['Public'],
    scope: 'Globally routable unicast address',
    block: null,
    isGlobal: true
  }
}

function classfulClass(first: number): Ipv4Info['classfulClass'] {
  if (first < 128) return 'A'
  if (first < 192) return 'B'
  if (first < 224) return 'C'
  if (first < 240) return 'D'
  return 'E'
}

function inspectIpv4(
  input: string,
  octets: [number, number, number, number]
): Ipv4Info {
  const n = ipv4ToInt(octets)
  const hex = n.toString(16).padStart(8, '0')
  return {
    version: 4,
    input,
    address: octets.join('.'),
    octets,
    decimal: String(n),
    hex: `0x${hex.toUpperCase()}`,
    binary: octets.map((o) => o.toString(2).padStart(8, '0')).join('.'),
    classfulClass: classfulClass(octets[0]),
    classification: classifyIpv4(octets),
    reverseDns: `${[...octets].reverse().join('.')}.in-addr.arpa`,
    ipv4MappedIpv6: `::ffff:${hex.slice(0, 4).replace(/^0+(?=.)/, '')}:${hex
      .slice(4)
      .replace(/^0+(?=.)/, '')}`
  }
}

// --- IPv6 -------------------------------------------------------------------

/** Parse the text part of an IPv6 address (no brackets / zone). */
export function parseIpv6Hextets(text: string): number[] | null {
  if (!text.includes(':')) return null
  if (/[^0-9a-fA-F:.]/.test(text)) return null

  let work = text
  // Trailing dotted-quad becomes two hextets.
  const lastColon = work.lastIndexOf(':')
  const tail = work.slice(lastColon + 1)
  let tailHextets: number[] = []
  if (tail.includes('.')) {
    const octets = parseIpv4Octets(tail)
    if (!octets) return null
    tailHextets = [(octets[0] << 8) | octets[1], (octets[2] << 8) | octets[3]]
    work = work.slice(0, lastColon + 1)
    // "::1.2.3.4" -> "::" ; "1:2:3:4:5:6:1.2.3.4" -> "1:2:3:4:5:6:"
    if (work.endsWith('::')) {
      // keep as-is
    } else if (work.endsWith(':')) {
      work = work.slice(0, -1)
    }
  }

  const doubleCount = work.split('::').length - 1
  if (doubleCount > 1 || work.includes(':::')) return null

  const parseGroups = (part: string): number[] | null => {
    if (part === '') return []
    const groups = part.split(':')
    const out: number[] = []
    for (const g of groups) {
      if (!/^[0-9a-fA-F]{1,4}$/.test(g)) return null
      out.push(parseInt(g, 16))
    }
    return out
  }

  if (doubleCount === 1) {
    const [headText, rest] = work.split('::')
    const head = parseGroups(headText)
    const tailGroups = parseGroups(rest)
    if (!head || !tailGroups) return null
    const total = head.length + tailGroups.length + tailHextets.length
    if (total > 7) return null // "::" must stand for at least one group
    const zeros = new Array<number>(8 - total).fill(0)
    return [...head, ...zeros, ...tailGroups, ...tailHextets]
  }

  const groups = parseGroups(work)
  if (!groups) return null
  const all = [...groups, ...tailHextets]
  return all.length === 8 ? all : null
}

/** RFC 5952: lowercase, drop leading zeros, compress the longest run of 2+ zeros. */
export function compressIpv6(hextets: readonly number[]): string {
  let bestStart = -1
  let bestLen = 0
  let i = 0
  while (i < 8) {
    if (hextets[i] !== 0) {
      i += 1
      continue
    }
    let j = i
    while (j < 8 && hextets[j] === 0) j += 1
    if (j - i > bestLen) {
      bestStart = i
      bestLen = j - i
    }
    i = j
  }
  const hex = hextets.map((h) => h.toString(16))
  if (bestLen < 2) return hex.join(':')
  const head = hex.slice(0, bestStart).join(':')
  const tail = hex.slice(bestStart + bestLen).join(':')
  return `${head}::${tail}`
}

function expandIpv6(hextets: readonly number[]): string {
  return hextets.map((h) => h.toString(16).padStart(4, '0')).join(':')
}

function ipv6ToBigInt(hextets: readonly number[]): bigint {
  let value = BigInt(0)
  for (const h of hextets) value = (value << BigInt(16)) | BigInt(h)
  return value
}

function startsWith(h: readonly number[], prefix: readonly number[]): boolean {
  return prefix.every((p, i) => h[i] === p)
}

function embeddedV4(h: readonly number[]): string {
  return `${h[6] >> 8}.${h[6] & 0xff}.${h[7] >> 8}.${h[7] & 0xff}`
}

const MULTICAST_SCOPES: Record<number, string> = {
  1: 'interface-local',
  2: 'link-local',
  3: 'realm-local',
  4: 'admin-local',
  5: 'site-local',
  8: 'organization-local',
  14: 'global'
}

function classifyIpv6(h: readonly number[]): {
  classification: IpClassification
  embeddedIpv4: string | null
} {
  const first = h[0]
  const allZeroTo = (end: number) => h.slice(0, end).every((x) => x === 0)

  if (h.every((x) => x === 0)) {
    return {
      classification: {
        tags: ['Unspecified'],
        scope: 'Source address only; "any" when binding sockets',
        block: 'Unspecified - ::/128',
        isGlobal: false
      },
      embeddedIpv4: null
    }
  }
  if (allZeroTo(7) && h[7] === 1) {
    return {
      classification: {
        tags: ['Loopback'],
        scope: 'This host only',
        block: 'Loopback - ::1/128',
        isGlobal: false
      },
      embeddedIpv4: null
    }
  }
  if (allZeroTo(5) && h[5] === 0xffff) {
    return {
      classification: {
        tags: ['IPv4-mapped'],
        scope: 'IPv4 address represented inside IPv6 sockets',
        block: 'IPv4-mapped - ::ffff:0:0/96',
        isGlobal: false
      },
      embeddedIpv4: embeddedV4(h)
    }
  }
  if (startsWith(h, [0x64, 0xff9b]) && h.slice(2, 6).every((x) => x === 0)) {
    return {
      classification: {
        tags: ['NAT64'],
        scope: 'IPv4/IPv6 translation (well-known prefix)',
        block: 'NAT64 - 64:ff9b::/96',
        isGlobal: true
      },
      embeddedIpv4: embeddedV4(h)
    }
  }
  if (startsWith(h, [0x100, 0, 0, 0])) {
    return {
      classification: {
        tags: ['Discard'],
        scope: 'Discard-only prefix (remotely triggered black hole)',
        block: 'Discard-only - 100::/64',
        isGlobal: false
      },
      embeddedIpv4: null
    }
  }
  if (first === 0x2001 && h[1] === 0x0db8) {
    return {
      classification: {
        tags: ['Documentation'],
        scope: 'Examples and docs only',
        block: 'Documentation - 2001:db8::/32',
        isGlobal: false
      },
      embeddedIpv4: null
    }
  }
  if (first === 0x2001 && h[1] === 0) {
    return {
      classification: {
        tags: ['Teredo'],
        scope: 'Tunnelling IPv6 over IPv4 NAT (legacy)',
        block: 'Teredo - 2001::/32',
        isGlobal: true
      },
      embeddedIpv4: null
    }
  }
  if (first === 0x2001 && (h[1] & 0xfff0) === 0x0020) {
    return {
      classification: {
        tags: ['ORCHIDv2'],
        scope: 'Non-routed cryptographic hash identifiers',
        block: 'ORCHIDv2 - 2001:20::/28',
        isGlobal: false
      },
      embeddedIpv4: null
    }
  }
  if (first === 0x2002) {
    return {
      classification: {
        tags: ['6to4'],
        scope: 'IPv6 over IPv4 tunnelling (deprecated)',
        block: '6to4 - 2002::/16',
        isGlobal: true
      },
      embeddedIpv4: `${h[1] >> 8}.${h[1] & 0xff}.${h[2] >> 8}.${h[2] & 0xff}`
    }
  }
  if ((first & 0xffc0) === 0xfe80) {
    return {
      classification: {
        tags: ['Link-local'],
        scope: 'Same network segment; needs a zone / interface to use',
        block: 'Link-local unicast - fe80::/10',
        isGlobal: false
      },
      embeddedIpv4: null
    }
  }
  if ((first & 0xfe00) === 0xfc00) {
    return {
      classification: {
        tags: ['Unique local'],
        scope: 'Private networks; not routable on the internet',
        block: 'Unique local (ULA) - fc00::/7',
        isGlobal: false
      },
      embeddedIpv4: null
    }
  }
  if ((first & 0xff00) === 0xff00) {
    const scopeId = first & 0x000f
    const scopeName = MULTICAST_SCOPES[scopeId] ?? `scope ${scopeId}`
    return {
      classification: {
        tags: ['Multicast', scopeName],
        scope: 'One-to-many delivery',
        block: 'Multicast - ff00::/8',
        isGlobal: scopeId === 14
      },
      embeddedIpv4: null
    }
  }
  if ((first & 0xe000) === 0x2000) {
    return {
      classification: {
        tags: ['Global unicast'],
        scope: 'Globally routable unicast address',
        block: 'Global unicast - 2000::/3',
        isGlobal: true
      },
      embeddedIpv4: null
    }
  }
  return {
    classification: {
      tags: ['Reserved'],
      scope: 'Not assigned to a documented use',
      block: null,
      isGlobal: false
    },
    embeddedIpv4: null
  }
}

function inspectIpv6(
  input: string,
  hextets: number[],
  zone: string | null
): Ipv6Info {
  const { classification, embeddedIpv4 } = classifyIpv6(hextets)
  const value = ipv6ToBigInt(hextets)
  const nibbles = hextets
    .map((h) => h.toString(16).padStart(4, '0'))
    .join('')
    .split('')
    .reverse()
    .join('.')

  let mixed: string | null = null
  if (embeddedIpv4 && classification.tags[0] === 'IPv4-mapped') {
    mixed = `::ffff:${embeddedIpv4}`
  } else if (embeddedIpv4 && classification.tags[0] === 'NAT64') {
    mixed = `64:ff9b::${embeddedIpv4}`
  }

  return {
    version: 6,
    input,
    zone,
    hextets,
    expanded: expandIpv6(hextets),
    compressed: compressIpv6(hextets),
    mixed,
    decimal: value.toString(10),
    hex: `0x${value.toString(16).padStart(32, '0')}`,
    classification,
    reverseDns: `${nibbles}.ip6.arpa`,
    embeddedIpv4
  }
}

// --- Public API -------------------------------------------------------------

export function parseIpAddress(raw: string): IpParseResult {
  let text = raw.trim()
  if (!text) return { ok: false, error: 'Enter an IPv4 or IPv6 address.' }

  if (text.startsWith('[') && text.endsWith(']')) text = text.slice(1, -1)
  if (text.includes('/')) {
    return {
      ok: false,
      error:
        'This looks like CIDR notation - use the CIDR Calculator for prefixes.'
    }
  }

  if (!text.includes(':')) {
    const octets = parseIpv4Octets(text)
    if (!octets) {
      return {
        ok: false,
        error:
          'Not a valid IPv4 address: use four decimal octets 0-255 without leading zeros.'
      }
    }
    return { ok: true, info: inspectIpv4(raw.trim(), octets) }
  }

  let zone: string | null = null
  const percent = text.indexOf('%')
  if (percent >= 0) {
    zone = text.slice(percent + 1)
    text = text.slice(0, percent)
    if (!zone) return { ok: false, error: 'Zone identifier is empty.' }
  }

  const hextets = parseIpv6Hextets(text)
  if (!hextets) {
    return {
      ok: false,
      error:
        'Not a valid IPv6 address: use up to eight hex groups, at most one "::".'
    }
  }
  return { ok: true, info: inspectIpv6(raw.trim(), hextets, zone) }
}

/** `in-addr.arpa` / `ip6.arpa` name for PTR lookups, or null if not an IP. */
export function reverseDnsName(raw: string): string | null {
  const result = parseIpAddress(raw)
  return result.ok ? result.info.reverseDns : null
}

export function ipFacts(info: Ipv4Info | Ipv6Info): IpFacts {
  if (info.version === 4) {
    return [
      { label: 'Address', value: info.address },
      { label: 'Decimal', value: info.decimal },
      { label: 'Hex', value: info.hex },
      { label: 'Binary', value: info.binary },
      { label: 'Classful (legacy)', value: `Class ${info.classfulClass}` },
      { label: 'IPv4-mapped IPv6', value: info.ipv4MappedIpv6 },
      { label: 'Reverse DNS (PTR)', value: info.reverseDns }
    ]
  }
  const facts: IpFacts = [
    { label: 'Compressed', value: info.compressed },
    { label: 'Expanded', value: info.expanded }
  ]
  if (info.mixed) facts.push({ label: 'Mixed notation', value: info.mixed })
  if (info.zone) facts.push({ label: 'Zone ID', value: info.zone })
  if (info.embeddedIpv4) {
    facts.push({ label: 'Embedded IPv4', value: info.embeddedIpv4 })
  }
  facts.push(
    { label: 'Integer', value: info.decimal },
    { label: 'Hex', value: info.hex },
    { label: 'Reverse DNS (PTR)', value: info.reverseDns }
  )
  return facts
}
