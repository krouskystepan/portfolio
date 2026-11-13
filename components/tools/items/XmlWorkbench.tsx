'use client'

import { Suspense, useDeferredValue, useMemo, useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolCompactInputClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { bool, enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { downloadTextFile, pickTextFile, readTextFile } from '@/utils/download'
import {
  JSON_SAMPLE,
  XML_MAX_INPUT_CHARS,
  XML_SAMPLE,
  formatXml,
  jsonToXml,
  minifyXml,
  validateXml,
  xmlToJson,
  type XmlIndent,
  type XmlIssue,
  type XmlResult
} from '@/utils/xmlWorkbench'

type XmlMode = 'format' | 'minify' | 'validate' | 'xml2json' | 'json2xml'

const MODES: { id: XmlMode; label: string }[] = [
  { id: 'format', label: 'Format' },
  { id: 'minify', label: 'Minify' },
  { id: 'validate', label: 'Validate' },
  { id: 'xml2json', label: 'XML → JSON' },
  { id: 'json2xml', label: 'JSON → XML' }
]

const MODE_IDS = MODES.map((m) => m.id) as readonly XmlMode[]
const INDENT_IDS = ['2', '4', 'tab'] as const satisfies readonly XmlIndent[]

function IssueBox({ issue, source }: { issue: XmlIssue; source: string }) {
  const lineText =
    issue.line !== undefined ? source.split('\n')[issue.line - 1] : undefined
  return (
    <div className={toolErrorBoxClass}>
      <p className="break-words">{issue.message}</p>
      {issue.line !== undefined ? (
        <p className="mt-2 text-xs text-red-300/80">
          Line {issue.line}
          {issue.col !== undefined ? `, column ${issue.col}` : ''}
        </p>
      ) : null}
      {lineText !== undefined && lineText.length > 0 ? (
        <pre className="mt-2 overflow-x-auto whitespace-pre rounded-md bg-neutral-950/60 p-2 text-xs text-red-200">
          {lineText.length > 200 ? `${lineText.slice(0, 200)}…` : lineText}
        </pre>
      ) : null}
    </div>
  )
}

function XmlWorkbenchInner() {
  const [url, setUrl] = useToolUrlState({
    mode: enumParam<XmlMode>('format', MODE_IDS),
    xml: str('', { text: true }),
    json: str('', { text: true }),
    indent: enumParam<XmlIndent>('2', INDENT_IDS),
    values: bool(false),
    wrap: bool(true),
    root: str('root'),
    decl: bool(true)
  })
  const { mode, indent } = url
  const isJsonInput = mode === 'json2xml'
  const input = isJsonInput ? url.json : url.xml
  const deferredInput = useDeferredValue(input)

  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()
  const [fileError, setFileError] = useState<string | null>(null)

  const setInput = (value: string) =>
    setUrl((s) => (isJsonInput ? { ...s, json: value } : { ...s, xml: value }))

  const result = useMemo((): XmlResult | null => {
    if (!deferredInput.trim()) return null
    switch (mode) {
      case 'format':
        return formatXml(deferredInput, indent)
      case 'minify':
        return minifyXml(deferredInput)
      case 'validate': {
        const v = validateXml(deferredInput)
        return v.valid
          ? {
              ok: true,
              output: 'Well-formed XML.',
              notes: v.notes
            }
          : { ok: false, error: v.error }
      }
      case 'xml2json':
        return xmlToJson(deferredInput, {
          convertValues: url.values,
          indent
        })
      case 'json2xml':
        return jsonToXml(deferredInput, {
          rootName: url.root,
          wrapRoot: url.wrap,
          indent,
          declaration: url.decl
        })
    }
  }, [deferredInput, mode, indent, url.values, url.root, url.wrap, url.decl])

  const output = result?.ok ? result.output : ''
  const canExport = result?.ok === true && mode !== 'validate'
  const outputIsJson = mode === 'xml2json'

  const handleCopy = async () => {
    if (!canExport) return
    await navigator.clipboard.writeText(output)
    unlockAchievement('clipboard-master')
    flash()
  }

  const handleDownload = () => {
    if (!canExport) return
    downloadTextFile(
      output,
      outputIsJson ? 'converted.json' : 'document.xml',
      outputIsJson ? 'application/json;charset=utf-8' : 'application/xml;charset=utf-8'
    )
  }

  const handleImport = async () => {
    setFileError(null)
    try {
      const file = await pickTextFile(
        isJsonInput
          ? '.json,application/json,text/plain'
          : '.xml,.svg,.xsd,.xsl,.txt,text/xml,application/xml,text/plain'
      )
      if (!file) return
      if (file.size > XML_MAX_INPUT_CHARS * 2) {
        setFileError('File is too large for this tool.')
        return
      }
      setInput(await readTextFile(file))
    } catch (err) {
      setFileError((err as Error).message || 'Could not read the file.')
    }
  }

  const sample = isJsonInput ? JSON_SAMPLE : XML_SAMPLE
  const tooBig = input.length > 500_000

  return (
    <ToolLayout title="XML Workbench">
      <ToolInputPanel
        intro={
          <div className={toolIntroTextClass}>
            <p>
              Format, minify and check XML for{' '}
              <strong className="font-medium text-neutral-200">well-formedness</strong>{' '}
              (no XSD / DTD validation), or convert between XML and JSON. Everything
              runs in your browser. Entity declarations are blocked to avoid XXE and
              entity-expansion attacks.
            </p>
            <p className="mt-2">
              <strong className="font-medium text-neutral-200">
                Conversion is not lossless.
              </strong>{' '}
              XML → JSON maps attributes to <code>@_name</code>, text to{' '}
              <code>#text</code>, comments to <code>#comment</code> and CDATA to{' '}
              <code>#cdata</code>; repeated siblings become arrays (a single child is
              a plain value), and element order across different names, mixed-content
              position, DOCTYPE and processing instructions other than the XML
              declaration are not preserved. Namespace prefixes are kept as plain
              names. JSON → XML reverses those rules, so round trips can differ.
            </p>
          </div>
        }
      >
        <div className="mb-4" role="tablist" aria-label="XML workbench mode">
          <ToolChipRow>
            {MODES.map((m) => (
              <ToolChipButton
                key={m.id}
                active={mode === m.id}
                onClick={() => setUrl((s) => ({ ...s, mode: m.id }))}
              >
                {m.label}
              </ToolChipButton>
            ))}
          </ToolChipRow>
        </div>

        <TextAreaWithLineNumbers
          value={input}
          setValue={(v) =>
            setUrl((s) => {
              const current = isJsonInput ? s.json : s.xml
              const next = typeof v === 'function' ? v(current) : v
              return isJsonInput ? { ...s, json: next } : { ...s, xml: next }
            })
          }
          placeholder={
            isJsonInput ? 'Paste JSON to convert to XML…' : 'Paste XML here…'
          }
        />

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          {mode !== 'minify' && mode !== 'validate' ? (
            <div className="flex items-center gap-2 text-sm text-neutral-300">
              <span>Indent</span>
              <ToolChipRow>
                {INDENT_IDS.map((id) => (
                  <ToolChipButton
                    key={id}
                    active={indent === id}
                    onClick={() => setUrl((s) => ({ ...s, indent: id }))}
                  >
                    {id === 'tab' ? 'Tab' : id}
                  </ToolChipButton>
                ))}
              </ToolChipRow>
            </div>
          ) : null}

          {mode === 'xml2json' ? (
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={url.values}
                onChange={() => setUrl((s) => ({ ...s, values: !s.values }))}
                className="size-4 accent-custom_blue"
              />
              Convert numbers &amp; booleans
            </label>
          ) : null}

          {mode === 'json2xml' ? (
            <>
              <label className={toolCheckboxLabelClass}>
                <input
                  type="checkbox"
                  checked={url.wrap}
                  onChange={() => setUrl((s) => ({ ...s, wrap: !s.wrap }))}
                  className="size-4 accent-custom_blue"
                />
                Wrap in root element
              </label>
              {url.wrap ? (
                <label className="flex items-center gap-2 text-sm text-neutral-300">
                  Root
                  <input
                    type="text"
                    value={url.root}
                    onChange={(e) =>
                      setUrl((s) => ({ ...s, root: e.target.value }))
                    }
                    className={`${toolCompactInputClass} w-36 font-mono`}
                    spellCheck={false}
                  />
                </label>
              ) : null}
              <label className={toolCheckboxLabelClass}>
                <input
                  type="checkbox"
                  checked={url.decl}
                  onChange={() => setUrl((s) => ({ ...s, decl: !s.decl }))}
                  className="size-4 accent-custom_blue"
                />
                XML declaration
              </label>
            </>
          ) : null}
        </div>

        <div className={toolToolbarBetweenClass}>
          <div className="flex flex-wrap gap-1.5">
            <SecondaryButton onClick={() => setInput(sample)}>
              Load sample
            </SecondaryButton>
            <SecondaryButton onClick={() => void handleImport()}>
              Import file
            </SecondaryButton>
          </div>
          <ClearButton onClick={() => setInput('')}>Clear</ClearButton>
        </div>
        {fileError ? (
          <p className="mt-3 text-sm text-red-400">{fileError}</p>
        ) : null}
        {tooBig ? (
          <p className={`${toolHintMetaClass} mt-3`}>
            Large input ({Math.round(input.length / 1000).toLocaleString()} KB):
            processing may feel slow. Limit is{' '}
            {XML_MAX_INPUT_CHARS.toLocaleString()} characters.
          </p>
        ) : null}
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>
            {mode === 'validate' ? 'Validation' : 'Result'}
          </h2>
          {canExport ? (
            <div className="flex flex-wrap gap-1.5">
              <SecondaryButton onClick={handleDownload}>Download</SecondaryButton>
              <ToolCopyButton copied={copied === true} onClick={() => void handleCopy()} />
            </div>
          ) : null}
        </div>

        {result === null ? (
          <pre className={toolPreOutputClass}>
            <span className="text-neutral-500">
              {isJsonInput
                ? 'XML output appears here.'
                : 'Paste XML above to see the result.'}
            </span>
          </pre>
        ) : result.ok ? (
          <div className="space-y-3">
            {mode === 'validate' ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                Well-formed XML. No syntax errors found.
              </div>
            ) : (
              <pre className={`${toolPreOutputClass} max-h-[32rem] whitespace-pre`}>
                {output}
              </pre>
            )}
            {result.notes.map((note) => (
              <p
                key={note}
                className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-xs text-amber-100/95"
              >
                {note}
              </p>
            ))}
          </div>
        ) : (
          <IssueBox issue={result.error} source={deferredInput} />
        )}
      </div>
    </ToolLayout>
  )
}

export default function XmlWorkbench() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="XML Workbench">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <XmlWorkbenchInner />
    </Suspense>
  )
}
