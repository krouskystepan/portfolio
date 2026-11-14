'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton,
  RemoveButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCompactInputClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { readTextFile } from '@/utils/download'
import {
  ASSERTION_KINDS,
  ASSERTION_KIND_LABELS,
  JSON_VALUE_TYPES,
  LENGTH_OPERATOR_LABELS,
  buildHumanList,
  buildSnippet,
  collectPaths,
  createCheck,
  detectPathSyntax,
  evaluateChecks,
  suggestChecks,
  type AssertionCheck,
  type AssertionKind,
  type AssertionResult,
  type LengthOperator,
  type SnippetFormat
} from '@/utils/jsonAssert'

const SNIPPET_FORMATS = ['expect', 'generic'] as const
const SNIPPET_LABELS: Record<SnippetFormat, string> = {
  expect: 'Jest / Vitest',
  generic: 'Generic'
}
const LENGTH_OPERATORS: readonly LengthOperator[] = ['eq', 'gte', 'lte']

const SAMPLE_JSON = JSON.stringify(
  {
    status: 'ok',
    user: { id: 42, name: 'Ada Lovelace', roles: ['admin', 'dev'], active: true },
    items: [
      { sku: 'A-1', qty: 2 },
      { sku: 'B-7', qty: 1 }
    ],
    meta: { next: null }
  },
  null,
  2
)

const selectClass = `${toolCompactInputClass} cursor-pointer`

type ParsedSample =
  | { ok: true; value: unknown }
  | { ok: false; error: string }
  | null

function JsonAssertionBuilderInner() {
  const [url, setUrl] = useToolUrlState({
    s: str('', { text: true }),
    f: enumParam<SnippetFormat>('expect', SNIPPET_FORMATS)
  })
  const [checks, setChecks] = useState<AssertionCheck[]>([])
  const [results, setResults] = useState<AssertionResult[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const sample = url.s
  const format = url.f

  const setSample = (v: React.SetStateAction<string>) =>
    setUrl((s) => ({ ...s, s: typeof v === 'function' ? v(s.s) : v }))

  const parsed: ParsedSample = useMemo(() => {
    if (!sample.trim()) return null
    try {
      return { ok: true, value: JSON.parse(sample) as unknown }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Invalid JSON'
      }
    }
  }, [sample])

  const paths = useMemo(
    () => (parsed?.ok ? collectPaths(parsed.value) : []),
    [parsed]
  )

  useEffect(() => {
    let cancelled = false
    if (!parsed?.ok || checks.length === 0) {
      setResults([])
      return
    }
    void evaluateChecks(parsed.value, checks).then((next) => {
      if (!cancelled) setResults(next)
    })
    return () => {
      cancelled = true
    }
  }, [parsed, checks])

  const snippet = useMemo(() => buildSnippet(results, format), [results, format])
  const humanList = useMemo(() => buildHumanList(results), [results])

  const updateCheck = (id: string, patch: Partial<AssertionCheck>) =>
    setChecks((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))

  const changeKind = (id: string, kind: AssertionKind) => {
    const defaults = createCheck(kind)
    updateCheck(id, {
      kind,
      expected: defaults.expected,
      lengthOp: defaults.lengthOp
    })
  }

  const addCheck = () => setChecks((prev) => [...prev, createCheck('exists')])

  const handleSuggest = () => {
    if (!parsed?.ok) return
    setChecks(suggestChecks(parsed.value))
  }

  const handleClear = () => {
    setSample('')
    setChecks([])
    setResults([])
  }

  const handleFile = async (file: File | null) => {
    if (!file) return
    try {
      setSample(await readTextFile(file))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open file.')
    }
  }

  const copy = (key: string, content: string) => {
    navigator.clipboard.writeText(content)
    unlockAchievement('clipboard-master')
    flash(key)
  }

  const passedCount = results.filter((r) => r.passed).length

  return (
    <ToolLayout title="JSON assertion builder">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Paste a sample response, then build checks with a dot path (
            <code>user.items[0].id</code>) or JSONPath (<code>$.items[*].sku</code>
            ). JSONPath checks use the first match. Output is copyable as
            Jest/Vitest-style <code>expect</code> lines or generic assertions.
            Explore paths in{' '}
            <Link
              href="/t/json-query"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              JSON Query
            </Link>
            , or diff a full response in the{' '}
            <Link
              href="/t/api-response-validator"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              API response validator
            </Link>
            .
          </p>
        }
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium text-neutral-300">Sample JSON</h3>
          <div className="flex gap-2">
            <SecondaryButton onClick={() => setSample(SAMPLE_JSON)}>
              Sample
            </SecondaryButton>
            <SecondaryButton onClick={() => fileRef.current?.click()}>
              Open
            </SecondaryButton>
          </div>
        </div>
        <TextAreaWithLineNumbers
          value={sample}
          setValue={setSample}
          placeholder='{"user": {"id": 42, "name": "Ada"}}'
        />
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json,text/plain"
          className="hidden"
          aria-label="Open JSON file"
          onChange={(e) => {
            void handleFile(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />
        {parsed && !parsed.ok ? (
          <div className={`${toolErrorBoxClass} mt-4`} role="alert">
            {parsed.error}
          </div>
        ) : null}
        <div className={toolToolbarEndClass}>
          <PrimaryButton onClick={handleSuggest} disabled={!parsed?.ok}>
            Generate checks from sample
          </PrimaryButton>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <ToolInputPanel>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h3 className={toolSectionTitleClass}>Checks</h3>
          <SecondaryButton onClick={addCheck}>Add check</SecondaryButton>
        </div>

        <datalist id="json-assert-paths">
          {paths.map((p) => (
            <option key={p} value={p} />
          ))}
        </datalist>

        {checks.length === 0 ? (
          <p className={toolEmptyHintClass}>
            No checks yet. Add one, or generate them from the sample.
          </p>
        ) : (
          <ul className="space-y-2">
            {checks.map((check, index) => {
              const label = `Check ${index + 1}`
              return (
                <li
                  key={check.id}
                  className="grid gap-2 rounded-lg border border-white/10 bg-neutral-900/50 p-3 md:grid-cols-[9rem_minmax(0,1fr)_minmax(0,1fr)_auto]"
                >
                  <select
                    aria-label={`${label} type`}
                    value={check.kind}
                    onChange={(e) =>
                      changeKind(check.id, e.target.value as AssertionKind)
                    }
                    className={selectClass}
                  >
                    {ASSERTION_KINDS.map((kind) => (
                      <option key={kind} value={kind}>
                        {ASSERTION_KIND_LABELS[kind]}
                      </option>
                    ))}
                  </select>

                  <input
                    aria-label={`${label} path`}
                    list="json-assert-paths"
                    value={check.path}
                    onChange={(e) =>
                      updateCheck(check.id, { path: e.target.value })
                    }
                    placeholder="user.id or $.user.id"
                    className={`${toolCompactInputClass} font-mono`}
                    spellCheck={false}
                  />

                  {check.kind === 'exists' ? (
                    <span className="flex h-8 items-center text-xs text-neutral-500">
                      {detectPathSyntax(check.path) === 'jsonpath'
                        ? 'JSONPath'
                        : 'Dot path'}
                    </span>
                  ) : check.kind === 'type' ? (
                    <select
                      aria-label={`${label} expected type`}
                      value={check.expected}
                      onChange={(e) =>
                        updateCheck(check.id, { expected: e.target.value })
                      }
                      className={selectClass}
                    >
                      {JSON_VALUE_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  ) : check.kind === 'arrayLength' ? (
                    <div className="flex gap-2">
                      <select
                        aria-label={`${label} length operator`}
                        value={check.lengthOp}
                        onChange={(e) =>
                          updateCheck(check.id, {
                            lengthOp: e.target.value as LengthOperator
                          })
                        }
                        className={`${selectClass} !w-16`}
                      >
                        {LENGTH_OPERATORS.map((op) => (
                          <option key={op} value={op}>
                            {LENGTH_OPERATOR_LABELS[op]}
                          </option>
                        ))}
                      </select>
                      <input
                        aria-label={`${label} expected length`}
                        type="number"
                        min={0}
                        value={check.expected}
                        onChange={(e) =>
                          updateCheck(check.id, { expected: e.target.value })
                        }
                        className={toolCompactInputClass}
                      />
                    </div>
                  ) : (
                    <input
                      aria-label={`${label} expected value`}
                      value={check.expected}
                      onChange={(e) =>
                        updateCheck(check.id, { expected: e.target.value })
                      }
                      placeholder={
                        check.kind === 'equals'
                          ? 'JSON value, e.g. 42 or "ok"'
                          : 'Substring, item, or key'
                      }
                      className={`${toolCompactInputClass} font-mono`}
                      spellCheck={false}
                    />
                  )}

                  <RemoveButton
                    aria-label={`Remove ${label}`}
                    onClick={() =>
                      setChecks((prev) => prev.filter((c) => c.id !== check.id))
                    }
                  />
                </li>
              )
            })}
          </ul>
        )}
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h3 className={toolSectionTitleClass}>Results</h3>
          {results.length > 0 ? (
            <div className="flex items-center gap-2">
              <span
                className={toolHintMetaClass}
                role="status"
                aria-live="polite"
              >
                {passedCount}/{results.length} passing
              </span>
              <ToolCopyButton
                copied={copied === 'human'}
                idleLabel="Copy list"
                onClick={() => copy('human', humanList)}
              />
            </div>
          ) : null}
        </div>

        {results.length === 0 ? (
          <p className={toolEmptyHintClass}>
            {parsed?.ok
              ? 'Add checks to see results and copyable assertions.'
              : 'Provide valid sample JSON first.'}
          </p>
        ) : (
          <div className="space-y-6">
            <ul className="space-y-1.5">
              {results.map((r) => (
                <li
                  key={r.check.id}
                  className={`flex items-start gap-3 rounded-lg border px-3 py-2 text-sm ${
                    r.passed
                      ? 'border-emerald-500/25 bg-emerald-500/[0.06]'
                      : 'border-red-500/30 bg-red-500/[0.07]'
                  }`}
                >
                  <span
                    className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${
                      r.passed
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-red-500/20 text-red-300'
                    }`}
                  >
                    {r.passed ? 'PASS' : 'FAIL'}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="break-all font-mono text-neutral-100">
                      {r.description}
                    </div>
                    <div className="text-xs text-neutral-400">{r.detail}</div>
                  </div>
                </li>
              ))}
            </ul>

            <div>
              <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                <ToolChipRow>
                  {SNIPPET_FORMATS.map((f) => (
                    <ToolChipButton
                      key={f}
                      active={format === f}
                      onClick={() => setUrl((s) => ({ ...s, f }))}
                    >
                      {SNIPPET_LABELS[f]}
                    </ToolChipButton>
                  ))}
                </ToolChipRow>
                <ToolCopyButton
                  copied={copied === 'snippet'}
                  idleLabel="Copy snippet"
                  onClick={() => copy('snippet', snippet)}
                />
              </div>
              <pre className={toolPreOutputClass}>{snippet}</pre>
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default function JsonAssertionBuilder() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="JSON assertion builder">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <JsonAssertionBuilderInner />
    </Suspense>
  )
}
