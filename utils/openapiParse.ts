/**
 * Lightweight OpenAPI 3.x reader (view-only, client-side).
 *
 * Not a validator or a full $ref dereferencer: it extracts the pieces the
 * viewer needs (paths, methods, parameters, request/response schema
 * summaries) and resolves local `#/...` refs one level deep.
 */
import yaml from 'js-yaml'

export const OPENAPI_METHODS = [
  'get',
  'put',
  'post',
  'delete',
  'options',
  'head',
  'patch',
  'trace'
] as const
export type OpenApiMethod = (typeof OPENAPI_METHODS)[number]

export type SchemaProperty = {
  name: string
  type: string
  required: boolean
  description?: string
}

export type SchemaSummary = {
  /** Short type label, e.g. `Pet`, `string (date-time)`, `Pet[]`. */
  label: string
  /** Local `$ref` when the schema is a reference, e.g. `#/components/schemas/Pet`. */
  ref?: string
  description?: string
  properties?: SchemaProperty[]
  enumValues?: string[]
}

export type ApiParameter = {
  name: string
  in: string
  required: boolean
  description?: string
  type: string
  ref?: string
}

export type ApiMediaContent = {
  mediaType: string
  schema?: SchemaSummary
}

export type ApiRequestBody = {
  description?: string
  required: boolean
  content: ApiMediaContent[]
}

export type ApiResponse = {
  status: string
  description?: string
  content: ApiMediaContent[]
}

export type ApiEndpoint = {
  /** Stable key: `GET /pets/{id}`. */
  id: string
  method: Uppercase<OpenApiMethod>
  path: string
  summary?: string
  description?: string
  operationId?: string
  tags: string[]
  deprecated: boolean
  parameters: ApiParameter[]
  requestBody?: ApiRequestBody
  responses: ApiResponse[]
  security: string[]
}

export type ApiServer = { url: string; description?: string }
export type ApiTag = { name: string; description?: string }

export type ParsedOpenApi = {
  openapi: string
  title: string
  apiVersion?: string
  description?: string
  servers: ApiServer[]
  tags: ApiTag[]
  endpoints: ApiEndpoint[]
  /** Component schemas, summarized (name -> summary). */
  schemas: Record<string, SchemaSummary>
  warnings: string[]
}

export type ParseOpenApiResult =
  | { ok: true; doc: ParsedOpenApi }
  | { ok: false; error: string }

type Json = Record<string, unknown>

const MAX_PROPERTIES = 100
const MAX_REF_HOPS = 12

function isRecord(value: unknown): value is Json {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function asString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return undefined
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.flatMap((item) => {
    const s = asString(item)
    return s === undefined ? [] : [s]
  })
}

function asRecordArray(value: unknown): Json[] {
  return Array.isArray(value) ? value.filter(isRecord) : []
}

// --- $ref handling ----------------------------------------------------------

function refName(ref: string): string {
  const last = ref.split('/').pop() ?? ref
  try {
    return decodeURIComponent(last).replace(/~1/g, '/').replace(/~0/g, '~')
  } catch {
    return last
  }
}

/** Resolve a local JSON-pointer `$ref` (`#/components/...`). */
export function resolveLocalRef(root: Json, ref: string): unknown {
  if (!ref.startsWith('#/')) return undefined
  let current: unknown = root
  for (const rawSegment of ref.slice(2).split('/')) {
    let segment = rawSegment
    try {
      segment = decodeURIComponent(rawSegment)
    } catch {
      segment = rawSegment
    }
    segment = segment.replace(/~1/g, '/').replace(/~0/g, '~')
    if (!isRecord(current) || !(segment in current)) return undefined
    current = current[segment]
  }
  return current
}

/** Follow `$ref` chains until a non-ref object (or give up). */
function deref(root: Json, value: unknown): { value: unknown; ref?: string } {
  let current = value
  let firstRef: string | undefined
  for (let hop = 0; hop < MAX_REF_HOPS; hop += 1) {
    if (!isRecord(current) || typeof current.$ref !== 'string') {
      return { value: current, ref: firstRef }
    }
    firstRef ??= current.$ref
    const next = resolveLocalRef(root, current.$ref)
    if (next === undefined) return { value: undefined, ref: firstRef }
    current = next
  }
  return { value: undefined, ref: firstRef }
}

// --- Schema summaries -------------------------------------------------------

function typeLabel(root: Json, schema: unknown, depth = 0): string {
  if (!isRecord(schema)) return 'any'
  if (typeof schema.$ref === 'string') return refName(schema.$ref)
  if (depth > 3) return 'object'

  for (const [key, joiner] of [
    ['oneOf', ' | '],
    ['anyOf', ' | '],
    ['allOf', ' & ']
  ] as const) {
    const parts = schema[key]
    if (Array.isArray(parts) && parts.length > 0) {
      return parts.map((p) => typeLabel(root, p, depth + 1)).join(joiner)
    }
  }

  const rawType = schema.type
  const type = Array.isArray(rawType)
    ? asStringArray(rawType).join(' | ')
    : asString(rawType)

  if (type === 'array') {
    return `${typeLabel(root, schema.items, depth + 1)}[]`
  }
  if (Array.isArray(schema.enum)) {
    return `${type ?? 'enum'} enum`
  }
  if (type === 'object' || (!type && isRecord(schema.properties))) {
    if (isRecord(schema.additionalProperties)) {
      return `map<string, ${typeLabel(root, schema.additionalProperties, depth + 1)}>`
    }
    return 'object'
  }
  if (type) {
    const format = asString(schema.format)
    return format ? `${type} (${format})` : type
  }
  return 'any'
}

function collectProperties(
  root: Json,
  schema: unknown,
  depth = 0
): SchemaProperty[] {
  const resolved = deref(root, schema).value
  if (!isRecord(resolved) || depth > 3) return []

  const out: SchemaProperty[] = []
  const required = new Set(asStringArray(resolved.required))

  if (Array.isArray(resolved.allOf)) {
    for (const part of resolved.allOf) {
      out.push(...collectProperties(root, part, depth + 1))
    }
  }

  if (isRecord(resolved.properties)) {
    for (const [name, propSchema] of Object.entries(resolved.properties)) {
      if (out.length >= MAX_PROPERTIES) break
      const propResolved = deref(root, propSchema).value
      out.push({
        name,
        type: typeLabel(root, propSchema),
        required: required.has(name),
        description: isRecord(propResolved)
          ? asString(propResolved.description)
          : undefined
      })
    }
  }

  // `required` can also be declared next to allOf parts.
  if (required.size > 0) {
    for (const prop of out) {
      if (required.has(prop.name)) prop.required = true
    }
  }
  return out
}

export function summarizeSchema(root: Json, schema: unknown): SchemaSummary {
  const { value: resolved, ref } = deref(root, schema)
  const own = isRecord(schema) && typeof schema.$ref === 'string' ? schema.$ref : ref

  let targetForProps: unknown = resolved
  // Arrays of objects: show the item's fields.
  if (isRecord(resolved) && asString(resolved.type) === 'array') {
    targetForProps = resolved.items
  }

  const properties = collectProperties(root, targetForProps)
  const enumValues =
    isRecord(resolved) && Array.isArray(resolved.enum)
      ? resolved.enum.slice(0, 50).map((v) => asString(v) ?? JSON.stringify(v))
      : undefined

  return {
    label: typeLabel(root, schema),
    ref: own,
    description: isRecord(resolved) ? asString(resolved.description) : undefined,
    properties: properties.length > 0 ? properties : undefined,
    enumValues: enumValues && enumValues.length > 0 ? enumValues : undefined
  }
}

// --- Operations -------------------------------------------------------------

function mediaContent(root: Json, content: unknown): ApiMediaContent[] {
  if (!isRecord(content)) return []
  return Object.entries(content).map(([mediaType, media]) => ({
    mediaType,
    schema:
      isRecord(media) && media.schema !== undefined
        ? summarizeSchema(root, media.schema)
        : undefined
  }))
}

function parseParameter(root: Json, raw: unknown): ApiParameter | null {
  const { value, ref } = deref(root, raw)
  if (!isRecord(value)) return null
  const name = asString(value.name)
  const location = asString(value.in)
  if (!name || !location) return null

  let type = 'any'
  if (value.schema !== undefined) {
    type = typeLabel(root, value.schema)
  } else if (isRecord(value.content)) {
    type = Object.keys(value.content)[0] ?? 'any'
  }

  return {
    name,
    in: location,
    required: value.required === true || location === 'path',
    description: asString(value.description),
    type,
    ref
  }
}

function mergeParameters(
  root: Json,
  pathLevel: unknown,
  opLevel: unknown
): ApiParameter[] {
  const merged = new Map<string, ApiParameter>()
  for (const list of [pathLevel, opLevel]) {
    if (!Array.isArray(list)) continue
    for (const raw of list) {
      const param = parseParameter(root, raw)
      if (param) merged.set(`${param.in}:${param.name}`, param)
    }
  }
  const order: Record<string, number> = { path: 0, query: 1, header: 2, cookie: 3 }
  return Array.from(merged.values()).sort(
    (a, b) => (order[a.in] ?? 9) - (order[b.in] ?? 9)
  )
}

function parseRequestBody(root: Json, raw: unknown): ApiRequestBody | undefined {
  const { value } = deref(root, raw)
  if (!isRecord(value)) return undefined
  return {
    description: asString(value.description),
    required: value.required === true,
    content: mediaContent(root, value.content)
  }
}

function parseResponses(root: Json, raw: unknown): ApiResponse[] {
  if (!isRecord(raw)) return []
  const responses = Object.entries(raw).map(([status, response]) => {
    const { value } = deref(root, response)
    return {
      status,
      description: isRecord(value) ? asString(value.description) : undefined,
      content: isRecord(value) ? mediaContent(root, value.content) : []
    }
  })
  // 200 < 404 < default
  const weight = (s: string) => (/^\d/.test(s) ? Number.parseInt(s, 10) : 9999)
  return responses.sort((a, b) => weight(a.status) - weight(b.status))
}

function securityNames(raw: unknown): string[] {
  const names = new Set<string>()
  for (const requirement of asRecordArray(raw)) {
    for (const name of Object.keys(requirement)) names.add(name)
  }
  return Array.from(names)
}

function parseEndpoints(root: Json, warnings: string[]): ApiEndpoint[] {
  const paths = root.paths
  if (!isRecord(paths)) {
    warnings.push('No `paths` object found - the document has no endpoints.')
    return []
  }

  const rootSecurity = securityNames(root.security)
  const endpoints: ApiEndpoint[] = []

  for (const [path, pathItemRaw] of Object.entries(paths)) {
    const { value: pathItem } = deref(root, pathItemRaw)
    if (!isRecord(pathItem)) continue

    for (const method of OPENAPI_METHODS) {
      const op = pathItem[method]
      if (!isRecord(op)) continue

      const upper = method.toUpperCase() as Uppercase<OpenApiMethod>
      const opSecurity = Array.isArray(op.security)
        ? securityNames(op.security)
        : rootSecurity

      endpoints.push({
        id: `${upper} ${path}`,
        method: upper,
        path,
        summary: asString(op.summary),
        description: asString(op.description),
        operationId: asString(op.operationId),
        tags: asStringArray(op.tags),
        deprecated: op.deprecated === true,
        parameters: mergeParameters(root, pathItem.parameters, op.parameters),
        requestBody: parseRequestBody(root, op.requestBody),
        responses: parseResponses(root, op.responses),
        security: opSecurity
      })
    }
  }
  return endpoints
}

// --- Public API -------------------------------------------------------------

export function parseOpenApiText(text: string): ParseOpenApiResult {
  const trimmed = text.trim()
  if (!trimmed) return { ok: false, error: 'Paste or upload an OpenAPI 3 document.' }

  let data: unknown
  if (trimmed.startsWith('{')) {
    try {
      data = JSON.parse(trimmed)
    } catch (error) {
      return {
        ok: false,
        error: `Invalid JSON: ${error instanceof Error ? error.message : 'parse error'}`
      }
    }
  } else {
    try {
      data = yaml.load(trimmed)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'parse error'
      return { ok: false, error: `Invalid YAML: ${message}` }
    }
  }

  return parseOpenApiObject(data)
}

export function parseOpenApiObject(data: unknown): ParseOpenApiResult {
  if (!isRecord(data)) {
    return { ok: false, error: 'The document must be a JSON/YAML object.' }
  }
  if ('swagger' in data) {
    return {
      ok: false,
      error: `Swagger ${asString(data.swagger) ?? '2.x'} is not supported - this viewer reads OpenAPI 3.x.`
    }
  }
  const version = asString(data.openapi)
  if (!version) {
    return {
      ok: false,
      error: 'Missing `openapi` field. Expected an OpenAPI 3.x document (e.g. openapi: 3.0.3).'
    }
  }
  if (!version.startsWith('3.')) {
    return {
      ok: false,
      error: `OpenAPI ${version} is not supported - only 3.x documents can be viewed.`
    }
  }

  const warnings: string[] = []
  const info = isRecord(data.info) ? data.info : {}
  const endpoints = parseEndpoints(data, warnings)

  const schemas: Record<string, SchemaSummary> = {}
  const components = isRecord(data.components) ? data.components : {}
  if (isRecord(components.schemas)) {
    for (const [name, schema] of Object.entries(components.schemas)) {
      schemas[name] = summarizeSchema(data, schema)
    }
  }

  if (isRecord(data.webhooks)) {
    warnings.push('Webhooks are not shown (OpenAPI 3.1).')
  }

  return {
    ok: true,
    doc: {
      openapi: version,
      title: asString(info.title) ?? 'Untitled API',
      apiVersion: asString(info.version),
      description: asString(info.description),
      servers: asRecordArray(data.servers).flatMap((s) => {
        const url = asString(s.url)
        return url ? [{ url, description: asString(s.description) }] : []
      }),
      tags: asRecordArray(data.tags).flatMap((t) => {
        const name = asString(t.name)
        return name ? [{ name, description: asString(t.description) }] : []
      }),
      endpoints,
      schemas,
      warnings
    }
  }
}

/** Case-insensitive AND search across method, path, summary, tags, operationId. */
export function filterEndpoints(
  endpoints: readonly ApiEndpoint[],
  query: string,
  method: ApiEndpoint['method'] | 'ALL' = 'ALL'
): ApiEndpoint[] {
  const tokens = query.toLowerCase().split(/\s+/).filter(Boolean)
  return endpoints.filter((endpoint) => {
    if (method !== 'ALL' && endpoint.method !== method) return false
    if (tokens.length === 0) return true
    const haystack = [
      endpoint.method,
      endpoint.path,
      endpoint.summary,
      endpoint.description,
      endpoint.operationId,
      ...endpoint.tags
    ]
      .filter((part): part is string => Boolean(part))
      .join(' ')
      .toLowerCase()
    return tokens.every((token) => haystack.includes(token))
  })
}

export type EndpointGroup = { tag: string; endpoints: ApiEndpoint[] }

/** Group by first tag (untagged -> "default"), preserving document tag order. */
export function groupEndpointsByTag(
  endpoints: readonly ApiEndpoint[],
  tagOrder: readonly string[] = []
): EndpointGroup[] {
  const groups = new Map<string, ApiEndpoint[]>()
  for (const endpoint of endpoints) {
    const tag = endpoint.tags[0] ?? 'default'
    const list = groups.get(tag)
    if (list) list.push(endpoint)
    else groups.set(tag, [endpoint])
  }
  const rank = (tag: string) => {
    const index = tagOrder.indexOf(tag)
    return index === -1 ? tagOrder.length : index
  }
  return Array.from(groups.entries())
    .sort((a, b) => rank(a[0]) - rank(b[0]))
    .map(([tag, list]) => ({ tag, endpoints: list }))
}

export const SAMPLE_OPENAPI_JSON = `{
  "openapi": "3.0.3",
  "info": {
    "title": "Petstore (sample)",
    "version": "1.0.0",
    "description": "A tiny pet store API used to try the viewer."
  },
  "servers": [{ "url": "https://api.example.com/v1", "description": "Production" }],
  "tags": [
    { "name": "pets", "description": "Everything about pets" },
    { "name": "store", "description": "Orders" }
  ],
  "paths": {
    "/pets": {
      "get": {
        "tags": ["pets"],
        "summary": "List pets",
        "operationId": "listPets",
        "parameters": [
          { "name": "limit", "in": "query", "description": "Max items", "schema": { "type": "integer", "format": "int32" } },
          { "name": "status", "in": "query", "schema": { "type": "string", "enum": ["available", "pending", "sold"] } }
        ],
        "responses": {
          "200": {
            "description": "A page of pets",
            "content": { "application/json": { "schema": { "type": "array", "items": { "$ref": "#/components/schemas/Pet" } } } }
          },
          "default": { "description": "Unexpected error", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Error" } } } }
        }
      },
      "post": {
        "tags": ["pets"],
        "summary": "Create a pet",
        "operationId": "createPet",
        "security": [{ "bearerAuth": [] }],
        "requestBody": {
          "required": true,
          "content": { "application/json": { "schema": { "$ref": "#/components/schemas/NewPet" } } }
        },
        "responses": {
          "201": { "description": "Created", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Pet" } } } },
          "400": { "description": "Invalid input" }
        }
      }
    },
    "/pets/{petId}": {
      "parameters": [
        { "name": "petId", "in": "path", "required": true, "schema": { "type": "string" } }
      ],
      "get": {
        "tags": ["pets"],
        "summary": "Get a pet by id",
        "operationId": "getPet",
        "responses": {
          "200": { "description": "The pet", "content": { "application/json": { "schema": { "$ref": "#/components/schemas/Pet" } } } },
          "404": { "description": "Not found" }
        }
      },
      "delete": {
        "tags": ["pets"],
        "summary": "Delete a pet",
        "operationId": "deletePet",
        "deprecated": true,
        "responses": { "204": { "description": "Deleted" } }
      }
    },
    "/store/orders": {
      "post": {
        "tags": ["store"],
        "summary": "Place an order",
        "requestBody": {
          "content": { "application/json": { "schema": { "type": "object", "properties": { "petId": { "type": "string" }, "quantity": { "type": "integer" } }, "required": ["petId"] } } }
        },
        "responses": { "200": { "description": "Order placed" } }
      }
    }
  },
  "components": {
    "securitySchemes": { "bearerAuth": { "type": "http", "scheme": "bearer" } },
    "schemas": {
      "NewPet": {
        "type": "object",
        "required": ["name"],
        "properties": {
          "name": { "type": "string" },
          "tag": { "type": "string" }
        }
      },
      "Pet": {
        "allOf": [
          { "$ref": "#/components/schemas/NewPet" },
          { "type": "object", "required": ["id"], "properties": { "id": { "type": "integer", "format": "int64" }, "createdAt": { "type": "string", "format": "date-time" } } }
        ]
      },
      "Error": {
        "type": "object",
        "required": ["code", "message"],
        "properties": { "code": { "type": "integer" }, "message": { "type": "string" } }
      }
    }
  }
}
`
