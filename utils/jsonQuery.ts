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
  }
]

export type JsonQueryResult = {
  ok: true
  value: unknown
  ms: number
} | {
  ok: false
  error: string
  ms: number
}

export async function evaluateJsonPath(
  data: unknown,
  expression: string
): Promise<JsonQueryResult> {
  const started = performance.now()
  try {
    const { JSONPath } = await import('jsonpath-plus')
    const value = JSONPath({ path: expression, json: data as object, wrap: true })
    return { ok: true, value, ms: performance.now() - started }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'JSONPath evaluation failed',
      ms: performance.now() - started
    }
  }
}

export async function evaluateJsonata(
  data: unknown,
  expression: string
): Promise<JsonQueryResult> {
  const started = performance.now()
  try {
    const jsonata = (await import('jsonata')).default
    const expr = jsonata(expression)
    const value = await expr.evaluate(data)
    return { ok: true, value, ms: performance.now() - started }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : 'JSONata evaluation failed',
      ms: performance.now() - started
    }
  }
}

export function formatQueryResult(value: unknown): string {
  if (typeof value === 'string') return value
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}
