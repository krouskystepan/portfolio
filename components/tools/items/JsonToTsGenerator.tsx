'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useEffect, useState } from 'react'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolLabelClass,
  toolPanelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolSegmentBarClass,
  toolSegmentTabClass,
  toolToolbarEndClass,
  toolInputClass,
  ToolCopyButton
} from '@/components/tools/_shared/toolUi'

type PrimitiveShape = { kind: 'primitive'; ts: string }
type ArrayShape = { kind: 'array'; items: Shape[] }
type ObjectShape = {
  kind: 'object'
  properties: Record<string, { optional: boolean; shape: Shape }>
}

type Shape = PrimitiveShape | ArrayShape | ObjectShape

function jsonToShape(value: unknown): Shape {
  if (value === null) return { kind: 'primitive', ts: 'null' }
  const t = typeof value
  if (t === 'string') return { kind: 'primitive', ts: 'string' }
  if (t === 'number') return { kind: 'primitive', ts: 'number' }
  if (t === 'boolean') return { kind: 'primitive', ts: 'boolean' }
  if (Array.isArray(value)) {
    return { kind: 'array', items: value.map(jsonToShape) }
  }
  if (t === 'object') {
    const o = value as Record<string, unknown>
    const properties: Record<string, { optional: boolean; shape: Shape }> = {}
    for (const k of Object.keys(o)) {
      properties[k] = { optional: false, shape: jsonToShape(o[k]) }
    }
    return { kind: 'object', properties }
  }
  return { kind: 'primitive', ts: 'unknown' }
}

function mergeObjectPropertyShapes(
  a: Record<string, { optional: boolean; shape: Shape }>,
  b: Record<string, { optional: boolean; shape: Shape }>
): Record<string, { optional: boolean; shape: Shape }> {
  const keys = new Set([...Object.keys(a), ...Object.keys(b)])
  const out: Record<string, { optional: boolean; shape: Shape }> = {}
  for (const k of keys) {
    const inA = k in a
    const inB = k in b
    const optional =
      !inA || !inB || Boolean(a[k]?.optional) || Boolean(b[k]?.optional)
    if (inA && inB) {
      out[k] = {
        optional,
        shape: mergeShapes(a[k].shape, b[k].shape)
      }
    } else if (inA) {
      out[k] = { optional: true, shape: a[k].shape }
    } else {
      out[k] = { optional: true, shape: b[k].shape }
    }
  }
  return out
}

function primitiveTypeParts(ts: string): string[] {
  return ts
    .split('|')
    .map((s) => s.trim())
    .filter(Boolean)
}

function mergeShapes(a: Shape, b: Shape): Shape {
  if (a.kind === 'primitive' && b.kind === 'primitive') {
    if (a.ts === b.ts) return a
    const parts = [
      ...new Set([...primitiveTypeParts(a.ts), ...primitiveTypeParts(b.ts)])
    ].sort()
    return { kind: 'primitive', ts: parts.join(' | ') }
  }
  if (a.kind === 'array' && b.kind === 'array') {
    return { kind: 'array', items: [...a.items, ...b.items] }
  }
  if (a.kind === 'object' && b.kind === 'object') {
    return {
      kind: 'object',
      properties: mergeObjectPropertyShapes(a.properties, b.properties)
    }
  }
  return { kind: 'primitive', ts: 'unknown' }
}

function mergeShapesList(items: Shape[]): Shape {
  if (items.length === 0) return { kind: 'primitive', ts: 'unknown' }
  return items.reduce((acc, s) => mergeShapes(acc, s))
}

/** Turns JSON keys / hints into PascalCase without mangling existing PascalCase (e.g. DasdasItem stays DasdasItem). */
function toPascalTypeName(raw: string): string {
  const cleaned = raw.replace(/[^a-zA-Z0-9]/g, ' ').trim()
  if (!cleaned) return ''

  const parts: string[] = []
  for (const chunk of cleaned.split(/\s+/).filter(Boolean)) {
    const spaced = chunk
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    for (const w of spaced.split(/\s+/).filter(Boolean)) {
      parts.push(w[0].toUpperCase() + w.slice(1).toLowerCase())
    }
  }
  return parts.join('')
}

/** Single-letter keys (e.g. `b` → `B`) make unreadable type names; prefix with the parent type. */
function childTypeHintForProperty(
  parentTypeName: string,
  jsonKey: string
): string {
  const base = toPascalTypeName(jsonKey) || 'Record'
  if (base.length === 1 && /^[A-Z]$/.test(base)) {
    return `${parentTypeName}${base}`
  }
  return base
}

function formatPropKey(key: string): string {
  if (/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)) return key
  return `'${key.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`
}

function rootTypeNameFromInput(input: string): string {
  const raw = input.trim() || 'Root'
  const pascal = toPascalTypeName(raw.replace(/[^a-zA-Z0-9_\s-]/g, ''))
  return pascal || 'Root'
}

type EmitCtx = {
  decls: string[]
  usedNames: Set<string>
  rootPascal: string
  allocName: (hint: string) => string
}

function createEmitCtx(rootPascal: string): EmitCtx {
  const usedNames = new Set<string>()
  const decls: string[] = []
  const allocName = (hint: string) => {
    let base = toPascalTypeName(hint.replace(/[^a-zA-Z0-9_\s-]/g, ''))
    if (!base) base = 'Generated'
    let name = base
    let i = 2
    while (usedNames.has(name)) {
      name = `${base}${i}`
      i++
    }
    usedNames.add(name)
    return name
  }
  return { decls, usedNames, rootPascal, allocName }
}

/** Name for the element type of an array: use the parent hint, unless it would clash with the root export name. */
function arrayElementTypeHint(parentHint: string, ctx: EmitCtx): string {
  const base = toPascalTypeName(parentHint)
  if (!base) return 'Row'
  if (base === ctx.rootPascal) return 'Row'
  return base
}

type TsExportMode = 'automatic' | 'compact' | 'type'

const EXPORT_MODE_OPTIONS: {
  value: TsExportMode
  label: string
  hint: string
}[] = [
  {
    value: 'automatic',
    label: 'Automatic',
    hint: 'Named object shapes use export interface. If the JSON root is not a plain object, the tool emits export type (TypeScript cannot model a string, number, or array root as an interface).'
  },
  {
    value: 'compact',
    label: 'Compact',
    hint: 'Single export type with nested objects inlined as { … } - no extra named declarations.'
  },
  {
    value: 'type',
    label: 'Type aliases',
    hint: 'Like Automatic, but every named object shape uses export type Name = { … } instead of export interface.'
  }
]

function emitNamedObject(
  name: string,
  properties: Record<string, { optional: boolean; shape: Shape }>,
  ctx: EmitCtx,
  objectSyntax: 'interface' | 'type'
): void {
  const lines = Object.entries(properties).map(([key, { optional, shape }]) => {
    const childType = emitType(
      shape,
      childTypeHintForProperty(name, key),
      ctx,
      objectSyntax
    )
    return `  ${formatPropKey(key)}${optional ? '?' : ''}: ${childType};`
  })
  if (objectSyntax === 'interface') {
    ctx.decls.push(`export interface ${name} {\n${lines.join('\n')}\n}`)
  } else {
    ctx.decls.push(`export type ${name} = {\n${lines.join('\n')}\n}`)
  }
}

function emitType(
  shape: Shape,
  hint: string,
  ctx: EmitCtx,
  objectSyntax: 'interface' | 'type'
): string {
  if (shape.kind === 'primitive') return shape.ts
  if (shape.kind === 'array') {
    if (shape.items.length === 0) return 'unknown[]'
    const merged = mergeShapesList(shape.items)
    const inner = emitType(
      merged,
      arrayElementTypeHint(hint, ctx),
      ctx,
      objectSyntax
    )
    const needsParens =
      inner.includes('|') || (inner.includes('&') && !inner.startsWith('('))
    return needsParens ? `(${inner})[]` : `${inner}[]`
  }
  const name = ctx.allocName(hint)
  emitNamedObject(name, shape.properties, ctx, objectSyntax)
  return name
}

function formatInlinedType(shape: Shape, baseIndent: string): string {
  if (shape.kind === 'primitive') return shape.ts
  if (shape.kind === 'array') {
    if (shape.items.length === 0) return 'unknown[]'
    const merged = mergeShapesList(shape.items)
    const inner = formatInlinedType(merged, `${baseIndent}  `)
    const needsParens =
      inner.includes('|') || (inner.includes('&') && !inner.startsWith('('))
    return needsParens ? `(${inner})[]` : `${inner}[]`
  }
  const innerIndent = `${baseIndent}  `
  const lines = Object.entries(shape.properties).map(
    ([key, { optional, shape: child }]) => {
      const t = formatInlinedType(child, innerIndent)
      return `${innerIndent}${formatPropKey(key)}${optional ? '?' : ''}: ${t};`
    }
  )
  return `{\n${lines.join('\n')}\n${baseIndent}}`
}

function generateTypeScript(
  json: unknown,
  rootName: string,
  mode: TsExportMode
): string {
  const shape = jsonToShape(json)
  const safeRoot = rootTypeNameFromInput(rootName)

  if (mode === 'compact') {
    const inlined = formatInlinedType(shape, '  ')
    return `export type ${safeRoot} = ${inlined};`
  }

  const objectSyntax: 'interface' | 'type' =
    mode === 'type' ? 'type' : 'interface'
  const ctx = createEmitCtx(safeRoot)

  if (shape.kind === 'object') {
    ctx.usedNames.add(safeRoot)
    emitNamedObject(safeRoot, shape.properties, ctx, objectSyntax)
  } else {
    const typeStr = emitType(shape, safeRoot, ctx, objectSyntax)
    ctx.decls.push(`export type ${safeRoot} = ${typeStr};`)
  }

  return ctx.decls.join('\n\n')
}

const JsonToTsGenerator = ({
  embedded = false
}: { embedded?: boolean } = {}) => {
  const [input, setInput] = useState('')
  const [rootName, setRootName] = useState('Root')
  const [exportMode, setExportMode] = useState<TsExportMode>('automatic')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { unlockAchievement } = useAchievementContext()

  const handleGenerate = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input) as unknown
      const ts = generateTypeScript(parsed, rootName, exportMode)
      setOutput(ts)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
      setOutput('')
    }
  }

  useEffect(() => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input) as unknown
      setOutput(generateTypeScript(parsed, rootName, exportMode))
      setError(null)
    } catch {
      // keep existing error/output from last explicit Generate
    }
    // Only refresh when style or root name changes; JSON edits use Generate.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- input intentionally omitted
  }, [exportMode, rootName])

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    unlockAchievement('clipboard-master')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout title="JSON to TS Type Generator" embedded={embedded}>
      <div className={toolPanelClass}>
        <label className={toolLabelClass} htmlFor="json-ts-root-name">
          Root type name
        </label>
        <input
          id="json-ts-root-name"
          type="text"
          value={rootName}
          onChange={(e) => setRootName(e.target.value)}
          placeholder="Root"
          className={`${toolInputClass} mb-4 font-mono`}
        />

        <p className={toolLabelClass}>Output style</p>
        <div
          className={`${toolSegmentBarClass} mb-2 flex flex-wrap`}
          role="group"
          aria-label="TypeScript output style"
        >
          {EXPORT_MODE_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setExportMode(opt.value)}
              className={`flex-1 ${toolSegmentTabClass(exportMode === opt.value)}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <p className={`${toolHintMetaClass} mb-4`}>
          {EXPORT_MODE_OPTIONS.find((o) => o.value === exportMode)?.hint}
        </p>

        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder='Paste JSON here, e.g. { "id": 1, "name": "Ada" }'
        />

        <div className={toolToolbarEndClass}>
          <PrimaryButton onClick={handleGenerate} disabled={!input.trim()}>
            Generate types
          </PrimaryButton>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>TypeScript</h2>

          {output ? (
            <ToolCopyButton copied={copied} onClick={handleCopy} />
          ) : null}
        </div>

        {error ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {error}
          </div>
        ) : output ? (
          <pre className={toolPreOutputClass}>{output}</pre>
        ) : (
          <div className={toolEmptyHintClass}>
            Generated interfaces and types will appear here.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default JsonToTsGenerator
