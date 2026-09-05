export type Ipv4Octets = [number, number, number, number]

export type SubnetInput = {
  ip: number // uint32
  prefix: number // 0–32
}

export type SubnetInfo = {
  ip: string
  prefix: number
  network: string
  broadcast: string
  netmask: string
  wildcard: string
  cidr: string // network/prefix
  firstHost: string | null // null for /31, /32
  lastHost: string | null
  usableHosts: number // 0 for /31+/32; 2^n-2 otherwise
  ipDecimal: number
}

/** Default: 192.168.1.10/24 */
export const DEFAULT_INPUT: SubnetInput = {
  ip: 0xc0a8010a,
  prefix: 24
}

export const CIDR_PRESETS: { label: string; cidr: string }[] = [
  { label: '192.168.1.0/24', cidr: '192.168.1.0/24' },
  { label: '10.0.0.0/8', cidr: '10.0.0.0/8' },
  { label: '172.16.0.0/12', cidr: '172.16.0.0/12' },
  { label: '192.168.0.0/16', cidr: '192.168.0.0/16' },
  { label: '127.0.0.1/32', cidr: '127.0.0.1/32' }
]

export function formatIpv4(value: number): string {
  const v = value >>> 0
  return [
    (v >>> 24) & 0xff,
    (v >>> 16) & 0xff,
    (v >>> 8) & 0xff,
    v & 0xff
  ].join('.')
}

export function parseIpv4(
  text: string
): { ok: true; value: number } | { ok: false; error: string } {
  const trimmed = text.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter an IPv4 address.' }
  }

  const parts = trimmed.split('.')
  if (parts.length !== 4) {
    return { ok: false, error: 'IPv4 must have four octets (e.g. 192.168.1.10).' }
  }

  let value = 0
  for (const part of parts) {
    if (!/^\d+$/.test(part)) {
      return { ok: false, error: 'Each octet must be a number 0–255.' }
    }
    // Reject leading zeros like 01 (except a lone "0")
    if (part.length > 1 && part.startsWith('0')) {
      return { ok: false, error: 'Octets must not have leading zeros.' }
    }
    const n = Number(part)
    if (n > 255) {
      return { ok: false, error: 'Each octet must be 0–255.' }
    }
    value = ((value << 8) | n) >>> 0
  }

  return { ok: true, value }
}

export function prefixToMask(prefix: number): number {
  if (prefix <= 0) return 0
  if (prefix >= 32) return 0xffffffff
  return (~0 << (32 - prefix)) >>> 0
}

export function maskToPrefix(
  mask: number
): { ok: true; prefix: number } | { ok: false; error: string } {
  const m = mask >>> 0
  if (m === 0) return { ok: true, prefix: 0 }

  // Contiguous high-bit mask: m | (m - 1) fills all bits to the right of the LSB 1.
  if (((m | (m - 1)) >>> 0) !== 0xffffffff) {
    return {
      ok: false,
      error: 'Subnet mask must be contiguous (e.g. 255.255.255.0).'
    }
  }

  let prefix = 0
  let bits = m
  while (bits) {
    prefix += bits & 1
    bits >>>= 1
  }
  return { ok: true, prefix }
}

export function parseCidr(
  text: string
): { ok: true; input: SubnetInput } | { ok: false; error: string } {
  const trimmed = text.trim()
  if (!trimmed) {
    return { ok: false, error: 'Enter a CIDR (e.g. 192.168.1.10/24).' }
  }

  const slash = trimmed.indexOf('/')
  if (slash < 0) {
    return {
      ok: false,
      error: 'CIDR must include a prefix (e.g. 192.168.1.10/24).'
    }
  }

  const ipPart = trimmed.slice(0, slash)
  const prefixPart = trimmed.slice(slash + 1).trim()

  const ipResult = parseIpv4(ipPart)
  if (!ipResult.ok) return ipResult

  if (!/^\d+$/.test(prefixPart)) {
    return { ok: false, error: 'Prefix must be an integer 0–32.' }
  }
  const prefix = Number(prefixPart)
  if (prefix > 32) {
    return { ok: false, error: 'Prefix must be an integer 0–32.' }
  }

  return { ok: true, input: { ip: ipResult.value, prefix } }
}

export function calculateSubnet(input: SubnetInput): SubnetInfo {
  const prefix = Math.min(32, Math.max(0, Math.trunc(input.prefix)))
  const ip = input.ip >>> 0
  const mask = prefixToMask(prefix)
  const wildcard = (~mask) >>> 0
  const network = (ip & mask) >>> 0
  const broadcast = (network | wildcard) >>> 0

  const isHostOnly = prefix >= 31
  const usableHosts = isHostOnly
    ? 0
    : prefix === 0
      ? 4294967294 // 2^32 - 2
      : 2 ** (32 - prefix) - 2

  return {
    ip: formatIpv4(ip),
    prefix,
    network: formatIpv4(network),
    broadcast: formatIpv4(broadcast),
    netmask: formatIpv4(mask),
    wildcard: formatIpv4(wildcard),
    cidr: `${formatIpv4(network)}/${prefix}`,
    firstHost: isHostOnly ? null : formatIpv4((network + 1) >>> 0),
    lastHost: isHostOnly ? null : formatIpv4((broadcast - 1) >>> 0),
    usableHosts,
    ipDecimal: ip
  }
}

export function formatCidr(input: SubnetInput): string {
  return `${formatIpv4(input.ip >>> 0)}/${Math.min(32, Math.max(0, Math.trunc(input.prefix)))}`
}
