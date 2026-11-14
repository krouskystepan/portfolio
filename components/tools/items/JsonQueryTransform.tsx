'use client'

import { Suspense, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolLabelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  toolFlexEndButtonsClass,
  toolCheckboxLabelClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { bool, enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { downloadTextFile } from '@/utils/download'
import {
  evaluateJsonPath,
  evaluateJsonata,
  formatQueryResult,
  formatQueryResultForDisplay,
  JSON_QUERY_EXAMPLES,
  type JsonQueryMode
} from '@/utils/jsonQuery'

const MODES = ['jsonpath', 'jsonata'] as const

function JsonQueryTransformInner() {
  const [url, setUrl] = useToolUrlState({
    mode: enumParam<JsonQueryMode>('jsonpath', MODES),
    json: str(JSON_QUERY_EXAMPLES[0].json, { text: true }),
    expr: str(JSON_QUERY_EXAMPLES[0].expression, { text: true }),
    live: bool(false)
  })
  const [exportText, setExportText] = useState('')
  const [displayText, setDisplayText] = useState('')
  const [displayNote, setDisplayNote] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [timing, setTiming] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const run = useCallback(async () => {
    if (!url.json.trim() || !url.expr.trim()) return
    setBusy(true)
    setError(null)
    try {
      const data = JSON.parse(url.json) as unknown
      const result =
        url.mode === 'jsonpath'
          ? await evaluateJsonPath(data, url.expr)
          : await evaluateJsonata(data, url.expr)
      setTiming(result.ms)
      if (!result.ok) {
        setError(result.error)
        setExportText('')
        setDisplayText('')
        setDisplayNote(null)
        return
      }
      const full = formatQueryResult(result.value)
      const display = formatQueryResultForDisplay(result.value)
      setExportText(full)
      setDisplayText(display.text)
      setDisplayNote(display.note)
    } catch (err) {
      setTiming(null)
      setError(err instanceof Error ? err.message : 'Invalid JSON input')
      setExportText('')
      setDisplayText('')
      setDisplayNote(null)
    } finally {
      setBusy(false)
    }
  }, [url.json, url.expr, url.mode])

  useEffect(() => {
    if (!url.live || !url.json.trim() || !url.expr.trim()) return
    const timer = window.setTimeout(() => {
      void run()
    }, 350)
    return () => window.clearTimeout(timer)
  }, [url.live, url.json, url.expr, url.mode, run])

  const loadExample = (ex: (typeof JSON_QUERY_EXAMPLES)[number]) => {
    setUrl((s) => ({
      ...s,
      mode: ex.mode,
      json: ex.json,
      expr: ex.expression
    }))
    setError(null)
    setExportText('')
    setDisplayText('')
    setDisplayNote(null)
    setTiming(null)
  }

  return (
    <ToolLayout title="JSON Query & Transform">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Query with{' '}
            <strong className="text-neutral-200">JSONPath Plus</strong> or
            transform with <strong className="text-neutral-200">JSONata</strong>
            . For format / schema / CSV, use the{' '}
            <Link
              href="/t/data-workbench"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              Data Workbench
            </Link>
            . Building test checks? Try the{' '}
            <Link
              href="/t/json-assertion-builder"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              JSON assertion builder
            </Link>
            . All evaluation stays in your browser.
          </p>
        }
      >
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <ToolChipRow>
            <ToolChipButton
              active={url.mode === 'jsonpath'}
              onClick={() => setUrl((s) => ({ ...s, mode: 'jsonpath' }))}
            >
              JSONPath
            </ToolChipButton>
            <ToolChipButton
              active={url.mode === 'jsonata'}
              onClick={() => setUrl((s) => ({ ...s, mode: 'jsonata' }))}
            >
              JSONata
            </ToolChipButton>
          </ToolChipRow>
          <label className={toolCheckboxLabelClass}>
            <input
              type="checkbox"
              checked={url.live}
              onChange={(e) =>
                setUrl((s) => ({ ...s, live: e.target.checked }))
              }
              className="size-4 rounded border-white/20 bg-neutral-900"
            />
            Live evaluate
          </label>
        </div>

        <div className="mb-3">
          <span className={toolLabelClass}>Examples</span>
          <ToolChipRow>
            {JSON_QUERY_EXAMPLES.map((ex) => (
              <ToolChipButton
                key={ex.id}
                active={false}
                tone="accent"
                onClick={() => loadExample(ex)}
              >
                {ex.label}
              </ToolChipButton>
            ))}
          </ToolChipRow>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <h3 className={toolLabelClass}>JSON input</h3>
            <TextAreaWithLineNumbers
              value={url.json}
              setValue={(v) =>
                setUrl((s) => ({
                  ...s,
                  json: typeof v === 'function' ? v(s.json) : v
                }))
              }
              placeholder="Paste JSON…"
            />
          </div>
          <div>
            <h3 className={toolLabelClass}>
              {url.mode === 'jsonpath'
                ? 'JSONPath expression'
                : 'JSONata expression'}
            </h3>
            <TextAreaWithLineNumbers
              value={url.expr}
              setValue={(v) =>
                setUrl((s) => ({
                  ...s,
                  expr: typeof v === 'function' ? v(s.expr) : v
                }))
              }
              placeholder={
                url.mode === 'jsonpath'
                  ? '$.store.book[*].price'
                  : 'items[qty > 0].name'
              }
            />
          </div>
        </div>

        <div className={toolToolbarBetweenClass}>
          <p className={toolHintMetaClass}>
            {url.mode === 'jsonpath'
              ? 'Dialect: JSONPath Plus (filters, wildcards, recursive descent).'
              : 'JSONata can filter, map, and reshape documents.'}
            {timing != null ? ` · Last run ${timing.toFixed(1)} ms` : ''}
          </p>
          <div className={toolFlexEndButtonsClass}>
            <PrimaryButton
              onClick={() => void run()}
              disabled={!url.json.trim() || !url.expr.trim() || busy}
            >
              {busy ? 'Running…' : 'Run'}
            </PrimaryButton>
            <ClearButton
              onClick={() => {
                setUrl((s) => ({ ...s, json: '', expr: '' }))
                setExportText('')
                setDisplayText('')
                setDisplayNote(null)
                setError(null)
                setTiming(null)
              }}
            >
              Clear
            </ClearButton>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>
          {exportText ? (
            <div className="flex flex-wrap gap-2">
              <SecondaryButton
                onClick={() =>
                  downloadTextFile(
                    exportText,
                    'query-result.json',
                    'application/json;charset=utf-8'
                  )
                }
              >
                Download
              </SecondaryButton>
              <ToolCopyButton
                copied={copied === true}
                onClick={() => {
                  navigator.clipboard.writeText(exportText)
                  unlockAchievement('clipboard-master')
                  flash()
                }}
              />
            </div>
          ) : null}
        </div>

        {error ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {error}
          </div>
        ) : displayText ? (
          <>
            {displayNote ? (
              <p className={`${toolHintMetaClass} mb-2`}>{displayNote}</p>
            ) : null}
            <pre className={toolPreOutputClass}>{displayText}</pre>
          </>
        ) : (
          <div className={toolEmptyHintClass}>
            Run an expression to see the result here.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default function JsonQueryTransform() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="JSON Query & Transform">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <JsonQueryTransformInner />
    </Suspense>
  )
}
