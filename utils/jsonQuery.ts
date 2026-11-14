export type JsonQueryMode = 'jsonpath' | 'jsonata'

export type JsonQueryExample = {
  id: string
  label: string
  mode: JsonQueryMode
  json: string
  expression: string
}

export const JSON_QUERY_EXAMPLES: JsonQueryExample[] = [
  {
    id: 'store-books',
    label: 'JSONPath — book prices',
    mode: 'jsonpath',
    json: JSON.stringify(
      {
        store: {
          book: [
            { category: 'fiction', title: 'Sayings', price: 8.95 },
            { category: 'fiction', title: 'Sword', price: 12.99 },
            { category: 'reference', title: 'Moby', price: 22.5 }
          ]
        }
      },
      null,
      2
    ),
    expression: '$.store.book[*].price'
  },
  {
    id: 'jsonata-filter',
    label: 'JSONata — filter & map',
    mode: 'jsonata',
    json: JSON.stringify(
      {
        items: [
          { name: 'alpha', qty: 2, price: 10 },
          { name: 'beta', qty: 0, price: 5 },
          { name: 'gamma', qty: 3, price: 7 }
        ]
      },
      null,
      2
    ),
    expression: 'items[qty > 0].{ "name": name, "total": qty * price }'
  },
  {
    id: 'jsonpath-filter',
    label: 'JSONPath — filter by price',
    mode: 'jsonpath',
    json: JSON.stringify(
      {
        products: [
          { id: 1, name: 'Widget', price: 9 },
          { id: 2, name: 'Gadget', price: 25 },
          { id: 3, name: 'Doohickey', price: 15 }
        ]
      },
      null,
      2
    ),
    expression: '$.products[?(@.price > 10)]'
  },
  {
    id: 'jsonata-reshape',
    label: 'JSONata — reshape',
    mode: 'jsonata',
    json: JSON.stringify(
      {
        user: { id: 7, name: 'Ada' },
        roles: ['admin', 'editor']
      },
      null,
      2
    ),
    expression:
      '{ "id": user.id, "label": user.name & " (" & $count(roles) & " roles)" }'
  }
]

export type JsonQueryResult =
  | {
      ok: true
      value: unknown
      ms: number
    }
  | {
      ok: false
      error: string
      ms: number
    }

/** Soft cap for displayed array length; full value still used for copy/download. */
export const RESULT_ARRAY_DISPLAY_CAP = 500

function errorMessage(err: unknown, fallback: string): string {
  if (err instanceof Error && err.message) return err.message
  if (typeof err === 'string' && err) return err
  if (
    typeof err === 'object' &&
    err !== null &&
    'message' in err &&
    typeof (err as { message: unknown }).message === 'string' &&
    (err as { message: string }).message
  ) {
    return (err as { message: string }).message
  }
  return fallback
}

export async function evaluateJsonPath(
  data: unknown,
  expression: string
): Promise<JsonQueryResult> {
  const started = performance.now()
  const trimmed = expression.trim()
  if (!trimmed) {
    return {
      ok: false,
      error: 'Expression is empty',
      ms: performance.now() - started
    }
  }
  try {
    const { JSONPath } = await import('jsonpath-plus')
    const value = JSONPath({
      path: trimmed,
      json: data as object,
      wrap: true
    })
    return { ok: true, value, ms: performance.now() - started }
  } catch (err) {
    return {
      ok: false,
      error: errorMessage(err, 'JSONPath evaluation failed'),
      ms: performance.now() - started
    }
  }
}

export async function evaluateJsonata(
  data: unknown,
  expression: string
): Promise<JsonQueryResult> {
  const started = performance.now()
  const trimmed = expression.trim()
  if (!trimmed) {
    return {
      ok: false,
      error: 'Expression is empty',
      ms: performance.now() - started
    }
  }
  try {
    const jsonata = (await import('jsonata')).default
    const expr = jsonata(trimmed)
    const value = await expr.evaluate(data)
    return { ok: true, value, ms: performance.now() - started }
  } catch (err) {
    return {
      ok: false,
      error: errorMessage(err, 'JSONata evaluation failed'),
      ms: performance.now() - started
    }
  }
}

/** Serialize a query result for display / export. Never returns undefined. */
export function formatQueryResult(value: unknown): string {
  if (value === undefined) return 'undefined'
  if (typeof value === 'string') return value
  try {
    const text = JSON.stringify(value, null, 2)
    return text === undefined ? 'undefined' : text
  } catch {
    return String(value)
  }
}

export function isEmptyQueryResult(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (Array.isArray(value) && value.length === 0) return true
  return false
}

/**
 * Build display text + optional truncation note for large arrays.
 * Copy/download should still use `formatQueryResult(value)`.
 */
export function formatQueryResultForDisplay(
  value: unknown,
  charCap = 200_000
): { text: string; note: string | null } {
  if (isEmptyQueryResult(value)) {
    if (value === undefined) {
      return {
        text: 'undefined',
        note: 'No match (JSONata returned undefined).'
      }
    }
    if (value === null) {
      return { text: 'null', note: null }
    }
    return { text: '[]', note: 'No matches.' }
  }

  if (Array.isArray(value) && value.length > RESULT_ARRAY_DISPLAY_CAP) {
    const preview = value.slice(0, RESULT_ARRAY_DISPLAY_CAP)
    let text = formatQueryResult(preview)
    const note = `Showing first ${RESULT_ARRAY_DISPLAY_CAP.toLocaleString()} of ${value.length.toLocaleString()} items. Copy or download for the full result.`
    if (text.length > charCap) {
      text = `${text.slice(0, charCap)}\n…`
    }
    return { text, note }
  }

  let text = formatQueryResult(value)
  if (text.length > charCap) {
    return {
      text: `${text.slice(0, charCap)}\n…`,
      note: `Preview truncated (${text.length.toLocaleString()} chars). Copy or download for the full result.`
    }
  }
  return { text, note: null }
}
