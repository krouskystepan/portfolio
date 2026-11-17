import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import {
  XML_SAMPLE,
  XML_SOAP_SAMPLE,
  formatXml,
  jsonToXml,
  minifyXml,
  validateXml,
  xmlToJson
} from './xmlWorkbench.ts'

describe('validateXml', () => {
  it('accepts well-formed sample with encoding declaration and namespaces', () => {
    const result = validateXml(XML_SAMPLE)
    assert.equal(result.valid, true)
  })

  it('accepts generic SOAP envelope', () => {
    const result = validateXml(XML_SOAP_SAMPLE)
    assert.equal(result.valid, true)
  })

  it('rejects empty input', () => {
    const result = validateXml('   ')
    assert.equal(result.valid, false)
    if (!result.valid) assert.match(result.error.message, /empty/i)
  })

  it('rejects malformed XML with line info when available', () => {
    const result = validateXml('<root><child></root>')
    assert.equal(result.valid, false)
    if (!result.valid) {
      assert.ok(result.error.message.length > 0)
      assert.ok(result.error.line === undefined || result.error.line >= 1)
    }
  })

  it('blocks entity declarations (XXE / expansion)', () => {
    const result = validateXml(
      '<!DOCTYPE foo [<!ENTITY x "y">]><root>&x;</root>'
    )
    assert.equal(result.valid, false)
    if (!result.valid) assert.match(result.error.message, /ENTITY/i)
  })

  it('blocks external DTD SYSTEM references', () => {
    const result = validateXml(
      '<!DOCTYPE foo SYSTEM "http://example.com/x.dtd"><foo/>'
    )
    assert.equal(result.valid, false)
    if (!result.valid) assert.match(result.error.message, /External DTD/i)
  })

  it('notes internal DOCTYPE without failing', () => {
    const result = validateXml('<!DOCTYPE catalog><catalog/>')
    assert.equal(result.valid, true)
    if (result.valid) {
      assert.ok(result.notes.some((n) => /DOCTYPE/i.test(n)))
    }
  })
})

describe('formatXml / minifyXml', () => {
  it('pretty-prints with 2-space indent', () => {
    const result = formatXml('<a><b>1</b><c/></a>', '2')
    assert.equal(result.ok, true)
    if (result.ok) {
      assert.equal(
        result.output,
        `<a>
  <b>1</b>
  <c/>
</a>`
      )
    }
  })

  it('minifies by stripping insignificant whitespace', () => {
    const result = minifyXml('<a>\n  <b>1</b>\n  <empty/>\n</a>')
    assert.equal(result.ok, true)
    if (result.ok) assert.equal(result.output, '<a><b>1</b><empty/></a>')
  })

  it('preserves encoding declaration on format', () => {
    const result = formatXml(
      '<?xml version="1.0" encoding="UTF-8"?><root/>',
      '2'
    )
    assert.equal(result.ok, true)
    if (result.ok) {
      assert.match(result.output, /encoding="UTF-8"/)
      assert.match(result.output, /<root\s*\/>/)
    }
  })

  it('keeps namespace prefixes and attributes', () => {
    const result = formatXml(
      '<ns:root xmlns:ns="urn:x" id="1"><ns:child a="b"/></ns:root>',
      '2'
    )
    assert.equal(result.ok, true)
    if (result.ok) {
      assert.match(result.output, /xmlns:ns="urn:x"/)
      assert.match(result.output, /ns:child/)
      assert.match(result.output, /id="1"/)
    }
  })
})

describe('xmlToJson / jsonToXml', () => {
  it('maps attributes to @_ and text to #text', () => {
    const result = xmlToJson('<item id="1">hello</item>', {
      convertValues: false,
      indent: '2'
    })
    assert.equal(result.ok, true)
    if (result.ok) {
      const parsed = JSON.parse(result.output) as {
        item: { '@_id': string; '#text': string }
      }
      assert.equal(parsed.item['@_id'], '1')
      assert.equal(parsed.item['#text'], 'hello')
    }
  })

  it('converts numeric and boolean attribute values when enabled', () => {
    const result = xmlToJson('<item id="1" featured="true"/>', {
      convertValues: true,
      indent: '2'
    })
    assert.equal(result.ok, true)
    if (result.ok) {
      const parsed = JSON.parse(result.output) as {
        item: { '@_id': number; '@_featured': boolean }
      }
      assert.equal(parsed.item['@_id'], 1)
      assert.equal(parsed.item['@_featured'], true)
    }
  })

  it('turns repeated siblings into arrays', () => {
    const result = xmlToJson('<list><item/><item/></list>', {
      convertValues: false,
      indent: '2'
    })
    assert.equal(result.ok, true)
    if (result.ok) {
      const parsed = JSON.parse(result.output) as { list: { item: unknown[] } }
      assert.ok(Array.isArray(parsed.list.item))
      assert.equal(parsed.list.item.length, 2)
    }
  })

  it('keeps namespace prefixes as plain names', () => {
    const result = xmlToJson(
      '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body/></soap:Envelope>',
      { convertValues: false, indent: '2' }
    )
    assert.equal(result.ok, true)
    if (result.ok) {
      const parsed = JSON.parse(result.output) as Record<string, unknown>
      assert.ok('soap:Envelope' in parsed)
    }
  })

  it('documents mixed-content collapse (text nodes merge)', () => {
    const result = xmlToJson('<p>hello <em>world</em>!</p>', {
      convertValues: false,
      indent: '2'
    })
    assert.equal(result.ok, true)
    if (result.ok) {
      const parsed = JSON.parse(result.output) as {
        p: { em: string; '#text': string }
      }
      assert.equal(parsed.p.em, 'world')
      // Non-preserveOrder mapping merges adjacent text — not lossless.
      assert.ok(typeof parsed.p['#text'] === 'string')
    }
  })

  it('round-trips simple documents with wrapRoot off', () => {
    const xml = '<catalog><item id="1"/><item id="2"/></catalog>'
    const asJson = xmlToJson(xml, { convertValues: false, indent: '2' })
    assert.equal(asJson.ok, true)
    if (!asJson.ok) return
    const back = jsonToXml(asJson.output, {
      rootName: 'root',
      wrapRoot: false,
      indent: '2',
      declaration: false
    })
    assert.equal(back.ok, true)
    if (back.ok) {
      assert.match(back.output, /<catalog>/)
      assert.match(back.output, /id="1"/)
      assert.match(back.output, /id="2"/)
    }
  })

  it('requires a root name when wrapRoot is on', () => {
    const result = jsonToXml('{"a":1}', {
      rootName: '123bad',
      wrapRoot: true,
      indent: '2',
      declaration: false
    })
    assert.equal(result.ok, false)
  })

  it('wraps top-level arrays as repeated <item> elements', () => {
    const result = jsonToXml('[1,2]', {
      rootName: 'list',
      wrapRoot: true,
      indent: '2',
      declaration: false
    })
    assert.equal(result.ok, true)
    if (result.ok) {
      assert.match(result.output, /<list>/)
      assert.match(result.output, /<item>1<\/item>/)
      assert.ok(result.notes.some((n) => /array/i.test(n)))
    }
  })
})
