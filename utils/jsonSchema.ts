import type { JSONSchema7 } from 'json-schema'

export type SchemaValidationError = {
  path: string
  message: string
}

function inferType(value: unknown): JSONSchema7['type'] {
  if (value === null) return 'null'
  if (Array.isArray(value)) return 'array'
  switch (typeof value) {
    case 'string':
      return 'string'
    case 'number':
      return Number.isInteger(value) ? 'integer' : 'number'
    case 'boolean':
      return 'boolean'
    case 'object':
      return 'object'
    default:
      return 'string'
  }
}

function mergeSchemas(a: JSONSchema7, b: JSONSchema7): JSONSchema7 {
  if (a.type !== b.type) {
    const types = new Set<string>()
    for (const t of [a.type, b.type]) {
      if (Array.isArray(t)) t.forEach((x) => types.add(String(x)))
      else if (t) types.add(String(t))
    }
    return { type: [...types] as JSONSchema7['type'] }
  }

  if (a.type === 'object' || b.type === 'object') {
    const propsA = a.properties ?? {}
    const propsB = b.properties ?? {}
    const keys = new Set([...Object.keys(propsA), ...Object.keys(propsB)])
    const properties: Record<string, JSONSchema7> = {}
    const required: string[] = []

    for (const key of keys) {
      const left = propsA[key] as JSONSchema7 | undefined
      const right = propsB[key] as JSONSchema7 | undefined
      if (left && right) properties[key] = mergeSchemas(left, right)
      else properties[key] = (left ?? right)!

      const inA = key in propsA
      const inB = key in propsB
      const reqA = a.required?.includes(key) ?? inA
      const reqB = b.required?.includes(key) ?? inB
      if (reqA && reqB && inA && inB) required.push(key)
    }

    return {
      type: 'object',
      properties,
      ...(required.length ? { required } : {}),
      additionalProperties: false
    }
  }

  if (a.type === 'array' || b.type === 'array') {
    const itemsA = (a.items ?? {}) as JSONSchema7
    const itemsB = (b.items ?? {}) as JSONSchema7
    return {
      type: 'array',
      items:
        Object.keys(itemsA).length && Object.keys(itemsB).length
          ? mergeSchemas(itemsA, itemsB)
          : Object.keys(itemsA).length
            ? itemsA
            : itemsB
    }
  }

  return { type: a.type }
}

/** Generate a draft-07-ish schema from a sample JSON value. */
export function generateSchemaFromSample(value: unknown): JSONSchema7 {
  const type = inferType(value)

  if (type === 'object' && value !== null && typeof value === 'object') {
    const obj = value as Record<string, unknown>
    const properties: Record<string, JSONSchema7> = {}
    const required: string[] = []
    for (const [key, nested] of Object.entries(obj)) {
      properties[key] = generateSchemaFromSample(nested)
      required.push(key)
    }
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'object',
      properties,
      required,
      additionalProperties: false
    }
  }

  if (type === 'array' && Array.isArray(value)) {
    if (value.length === 0) {
      return {
        $schema: 'http://json-schema.org/draft-07/schema#',
        type: 'array',
        items: {}
      }
    }
    let items = generateSchemaFromSample(value[0])
    for (let i = 1; i < value.length; i++) {
      items = mergeSchemas(items, generateSchemaFromSample(value[i]))
    }
    // strip nested $schema from items
    const { $schema: _drop, ...itemSchema } = items
    void _drop
    return {
      $schema: 'http://json-schema.org/draft-07/schema#',
      type: 'array',
      items: itemSchema
    }
  }

  return {
    $schema: 'http://json-schema.org/draft-07/schema#',
    type
  }
}

function pointerToPath(pointer: string): string {
  if (!pointer) return '(root)'
  return pointer
    .split('/')
    .slice(1)
    .map((seg) => seg.replace(/~1/g, '/').replace(/~0/g, '~'))
    .join('.') || '(root)'
}

/** Validate JSON against a schema using Ajv (lazy-loaded). */
export async function validateAgainstSchema(
  schema: object,
  data: unknown
): Promise<{ valid: boolean; errors: SchemaValidationError[] }> {
  const { default: Ajv } = await import('ajv')
  const ajv = new Ajv({ allErrors: true, strict: false })
  const validate = ajv.compile(schema)
  const valid = Boolean(validate(data))
  const errors: SchemaValidationError[] = (validate.errors ?? []).map((err) => ({
    path: pointerToPath(err.instancePath || ''),
    message: err.message ?? 'Validation failed'
  }))
  return { valid, errors }
}
