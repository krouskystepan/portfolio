import { XMLBuilder, XMLParser, XMLValidator } from 'fast-xml-parser'

/** Hard input cap (characters) to keep the main thread responsive. */
export const XML_MAX_INPUT_CHARS = 2_000_000

export type XmlIndent = '2' | '4' | 'tab'

export type XmlIssue = {
  message: string
  line?: number
  col?: number
}

export type XmlResult =
  | { ok: true; output: string; notes: string[] }
  | { ok: false; error: XmlIssue }

export type XmlValidationResult =
  | { valid: true; notes: string[] }
  | { valid: false; error: XmlIssue }

const ATTR_PREFIX = '@_'
const TEXT_NODE = '#text'
const COMMENT_NODE = '#comment'
const CDATA_NODE = '#cdata'

const XML_NAME_RE = /^[A-Za-z_][A-Za-z0-9_.-]*(?::[A-Za-z_][A-Za-z0-9_.-]*)?$/

export function indentString(indent: XmlIndent): string {
  if (indent === 'tab') return '\t'
  return ' '.repeat(Number(indent))
}

export function isValidXmlName(name: string): boolean {
  return XML_NAME_RE.test(name)
}

function fail(message: string, line?: number, col?: number): { ok: false; error: XmlIssue } {
  return { ok: false, error: { message, line, col } }
}

/**
 * XXE / entity-expansion guard. fast-xml-parser never resolves external
 * entities, but we also refuse custom entity declarations (billion-laughs
 * style expansion) and external DTD subsets outright.
 */
function guardInput(xml: string): XmlIssue | null {
  if (xml.length > XML_MAX_INPUT_CHARS) {
    return {
      message: `Input is too large (${xml.length.toLocaleString()} characters). Limit is ${XML_MAX_INPUT_CHARS.toLocaleString()}.`
    }
  }
  if (/<!ENTITY/i.test(xml)) {
    return {
      message:
        'Entity declarations (<!ENTITY …>) are blocked for safety (XXE / entity expansion). Remove them to continue.'
    }
  }
  return null
}

function locate(xml: string, index: number): { line: number; col: number } {
  const before = xml.slice(0, index)
  const line = before.split('\n').length
  const col = index - before.lastIndexOf('\n')
  return { line, col }
}

/** Extract line/column from the various DOMParser parsererror message formats. */
function parseDomError(text: string): XmlIssue {
  const chrome = /error on line (\d+) at column (\d+):\s*([^\n]*)/i.exec(text)
  if (chrome) {
    return {
      message: chrome[3].trim() || 'Malformed XML.',
      line: Number(chrome[1]),
      col: Number(chrome[2])
    }
  }
  const firefox = /Line Number (\d+), Column (\d+)/i.exec(text)
  if (firefox) {
    const first = text.split('\n')[0]?.replace(/^XML Parsing Error:\s*/i, '').trim()
    return {
      message: first || 'Malformed XML.',
      line: Number(firefox[1]),
      col: Number(firefox[2])
    }
  }
  const trimmed = text.trim().split('\n')[0] ?? ''
  return { message: trimmed || 'Malformed XML.' }
}

function domWellFormed(xml: string): XmlIssue | null {
  if (typeof DOMParser === 'undefined') return null
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  const err = doc.getElementsByTagName('parsererror')[0]
  if (!err) return null
  return parseDomError(err.textContent ?? '')
}

/** Well-formedness only (no XSD / DTD validation). */
export function validateXml(xml: string): XmlValidationResult {
  if (!xml.trim()) {
    return { valid: false, error: { message: 'Input is empty.' } }
  }
  const blocked = guardInput(xml)
  if (blocked) return { valid: false, error: blocked }

  const result = XMLValidator.validate(xml)
  if (result !== true) {
    return {
      valid: false,
      error: {
        message: result.err.msg,
        line: result.err.line,
        col: result.err.col
      }
    }
  }

  // Second opinion: the browser parser also checks namespaces and single root.
  const dom = domWellFormed(xml)
  if (dom) return { valid: false, error: dom }

  const notes: string[] = []
  if (/<!DOCTYPE/i.test(xml)) {
    notes.push('DOCTYPE found: it is not validated and is dropped by Format / Minify.')
  }
  return { valid: true, notes }
}

const sharedParserOptions = {
  ignoreAttributes: false,
  attributeNamePrefix: ATTR_PREFIX,
  textNodeName: TEXT_NODE,
  commentPropName: COMMENT_NODE,
  cdataPropName: CDATA_NODE,
  allowBooleanAttributes: true
} as const

/** Order-preserving round trip used by Format and Minify. Entities stay as written. */
function reserialize(xml: string, pretty: boolean, indent: XmlIndent): XmlResult {
  const check = validateXml(xml)
  if (!check.valid) return { ok: false, error: check.error }

  try {
    const parser = new XMLParser({
      ...sharedParserOptions,
      preserveOrder: true,
      parseTagValue: false,
      parseAttributeValue: false,
      trimValues: true,
      processEntities: false
    })
    const tree: unknown = parser.parse(xml)
    const builder = new XMLBuilder({
      ...sharedParserOptions,
      preserveOrder: true,
      format: pretty,
      indentBy: indentString(indent),
      suppressEmptyNode: true,
      processEntities: false
    })
    const built = builder.build(tree)
    const output = typeof built === 'string' ? built.trim() : ''
    return { ok: true, output, notes: check.notes }
  } catch (err) {
    return fail((err as Error).message || 'Could not process XML.')
  }
}

export function formatXml(xml: string, indent: XmlIndent): XmlResult {
  return reserialize(xml, true, indent)
}

export function minifyXml(xml: string): XmlResult {
  return reserialize(xml, false, '2')
}

export type XmlToJsonOptions = {
  /** Convert numeric / boolean-looking text and attributes to JSON types. */
  convertValues: boolean
  indent: XmlIndent
}

export function xmlToJson(xml: string, options: XmlToJsonOptions): XmlResult {
  const check = validateXml(xml)
  if (!check.valid) return { ok: false, error: check.error }

  try {
    const parser = new XMLParser({
      ...sharedParserOptions,
      parseTagValue: options.convertValues,
      parseAttributeValue: options.convertValues,
      trimValues: true,
      // Built-in entities only; entity declarations are rejected up front.
      processEntities: true
    })
    const parsed: unknown = parser.parse(xml)
    const space = options.indent === 'tab' ? '\t' : Number(options.indent)
    return {
      ok: true,
      output: JSON.stringify(parsed, null, space),
      notes: check.notes
    }
  } catch (err) {
    return fail((err as Error).message || 'Could not convert XML to JSON.')
  }
}

export type JsonToXmlOptions = {
  rootName: string
  /** Wrap the JSON value in `rootName`. Off: JSON must be an object with a single top-level key. */
  wrapRoot: boolean
  indent: XmlIndent
  declaration: boolean
}

function jsonRootError(message: string): { ok: false; error: XmlIssue } {
  return fail(message)
}

export function jsonToXml(json: string, options: JsonToXmlOptions): XmlResult {
  if (!json.trim()) return jsonRootError('Input is empty.')
  if (json.length > XML_MAX_INPUT_CHARS) {
    return jsonRootError(
      `Input is too large (${json.length.toLocaleString()} characters).`
    )
  }

  let value: unknown
  try {
    value = JSON.parse(json)
  } catch (err) {
    const message = (err as Error).message || 'Invalid JSON.'
    const posMatch = /position (\d+)/.exec(message)
    if (posMatch) {
      const { line, col } = locate(json, Number(posMatch[1]))
      return fail(message, line, col)
    }
    return fail(message)
  }

  let document: unknown
  const notes: string[] = []
  if (options.wrapRoot) {
    const root = options.rootName.trim()
    if (!isValidXmlName(root)) {
      return jsonRootError(
        'Root element name must be a valid XML name (letters, digits, "_", "-", "."; cannot start with a digit).'
      )
    }
    if (Array.isArray(value)) {
      document = { [root]: { item: value } }
      notes.push('Top-level array was wrapped as repeated <item> elements.')
    } else {
      document = { [root]: value }
    }
  } else {
    if (
      value === null ||
      typeof value !== 'object' ||
      Array.isArray(value) ||
      Object.keys(value).length !== 1
    ) {
      return jsonRootError(
        'Without a wrapper root, the JSON must be an object with exactly one top-level key (that key becomes the root element).'
      )
    }
    document = value
  }

  try {
    const builder = new XMLBuilder({
      ignoreAttributes: false,
      attributeNamePrefix: ATTR_PREFIX,
      textNodeName: TEXT_NODE,
      commentPropName: COMMENT_NODE,
      cdataPropName: CDATA_NODE,
      format: true,
      indentBy: indentString(options.indent),
      suppressEmptyNode: true,
      processEntities: true
    })
    const body = builder.build(document)
    if (typeof body !== 'string') return jsonRootError('Could not build XML.')
    const output = (
      options.declaration
        ? `<?xml version="1.0" encoding="UTF-8"?>\n${body}`
        : body
    ).trim()

    const check = validateXml(output)
    if (!check.valid) {
      notes.push(
        `Generated XML is not well-formed (${check.error.message}). JSON keys must be valid XML names.`
      )
    }
    return { ok: true, output, notes }
  } catch (err) {
    return fail((err as Error).message || 'Could not convert JSON to XML.')
  }
}

export const XML_SAMPLE = `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns:meta="urn:example:meta" updated="2026-01-15">
  <!-- Sample catalog -->
  <meta:info owner="docs"/>
  <item id="1" featured="true"><name>Widget &amp; Co</name><price currency="EUR">9.99</price></item>
  <item id="2"><name>Gadget</name><price currency="EUR">24.5</price><tags><tag>new</tag><tag>sale</tag></tags></item>
</catalog>`

export const JSON_SAMPLE = `{
  "catalog": {
    "@_updated": "2026-01-15",
    "item": [
      { "@_id": "1", "name": "Widget & Co", "price": { "@_currency": "EUR", "#text": 9.99 } },
      { "@_id": "2", "name": "Gadget", "price": 24.5 }
    ]
  }
}`
