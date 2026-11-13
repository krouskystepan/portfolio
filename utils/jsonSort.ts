/** Deep-sort object keys alphabetically for stable JSON output. */
export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep)
  }
  if (value !== null && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>).sort(
      ([a], [b]) => a.localeCompare(b)
    )
    const out: Record<string, unknown> = {}
    for (const [key, nested] of entries) {
      out[key] = sortKeysDeep(nested)
    }
    return out
  }
  return value
}

/** Parse JSON and stringify with deep-sorted keys (pretty by default). */
export function stableStringify(value: unknown, space: number | null = 2): string {
  const sorted = sortKeysDeep(value)
  return space === null
    ? JSON.stringify(sorted)
    : JSON.stringify(sorted, null, space)
}
