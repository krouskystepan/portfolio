'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'sonner'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
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
import { bool, enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { readTextFile } from '@/utils/download'
import {
  ISSUE_KIND_LABELS,
  SAMPLE_ACTUAL,
  SAMPLE_EXPECTED,
  countIssuesByKind,
  formatReport,
  validateApiResponse,
  type ArrayCompareMode,
  type IssueKind,
  type ValidationReport
} from '@/utils/apiResponseValidate'
import { generateSchemaFromSample } from '@/utils/jsonSchema'

const ARRAY_MODES = ['template', 'index'] as const
const ARRAY_MODE_LABELS: Record<ArrayCompareMode, string> = {
  template: 'First item = template',
  index: 'Compare by index'
}

const ISSUE_BADGE: Record<IssueKind, string> = {
  missing: 'bg-red-500/20 text-red-300',
  unexpected: 'bg-amber-500/20 text-amber-300',
  'type-mismatch': 'bg-orange-500/20 text-orange-300',
  'value-mismatch': 'bg-sky-500/20 text-sky-300',
  'array-length': 'bg-fuchsia-500/20 text-fuchsia-300'
}

type FileTarget = 'actual' | 'expected' | 'schema'

function ApiResponseValidatorInner() {
  const [url, setUrl] = useToolUrlState({
    a: str('', { text: true }),
    e: str('', { text: true }),
    sc: str('', { text: true }),
    ux: bool(true),
    cv: bool(false),
    nl: bool(false),
    am: enumParam<ArrayCompareMode>('template', ARRAY_MODES)
  })
  const [report, setReport] = useState<ValidationReport | null>(null)
  const [busy, setBusy] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const fileTargetRef = useRef<FileTarget>('actual')
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const setField =
    (key: 'a' | 'e' | 'sc') => (v: React.SetStateAction<string>) =>
      setUrl((s) => ({ ...s, [key]: typeof v === 'function' ? v(s[key]) : v }))

  const options = useMemo(
    () => ({
      reportUnexpected: url.ux,
      compareValues: url.cv,
      allowNull: url.nl,
      arrayMode: url.am
    }),
    [url.ux, url.cv, url.nl, url.am]
  )

  useEffect(() => {
    let cancelled = false
    const hasActual = url.a.trim().length > 0
    const hasReference = url.e.trim().length > 0 || url.sc.trim().length > 0
    if (!hasActual || !hasReference) {
      setReport(null)
      setBusy(false)
      return
    }
    setBusy(true)
    const timer = setTimeout(() => {
      void validateApiResponse({
        actualText: url.a,
        expectedText: url.e,
        schemaText: url.sc,
        options
      }).then((next) => {
        if (cancelled) return
        setReport(next)
        setBusy(false)
      })
    }, 200)
    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [url.a, url.e, url.sc, options])

  const counts = useMemo(
    () => (report?.structureIssues ? countIssuesByKind(report.structureIssues) : null),
    [report]
  )

  const openFile = (target: FileTarget) => {
    fileTargetRef.current = target
    fileRef.current?.click()
  }

  const handleFile = async (file: File | null) => {
    if (!file) return
    try {
      const content = await readTextFile(file)
      setField(
        fileTargetRef.current === 'actual'
          ? 'a'
          : fileTargetRef.current === 'expected'
            ? 'e'
            : 'sc'
      )(content)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open file.')
    }
  }

  const loadSample = () =>
    setUrl((s) => ({ ...s, a: SAMPLE_ACTUAL, e: SAMPLE_EXPECTED, sc: '' }))

  const generateSchema = () => {
    try {
      const value = JSON.parse(url.e) as unknown
      setField('sc')(JSON.stringify(generateSchemaFromSample(value), null, 2))
    } catch (err) {
      toast.error(
        err instanceof Error
          ? `Expected sample is not valid JSON: ${err.message}`
          : 'Expected sample is not valid JSON'
      )
    }
  }

  const handleClear = () =>
    setUrl((s) => ({ ...s, a: '', e: '', sc: '' }))

  const handleCopy = () => {
    if (!report) return
    navigator.clipboard.writeText(formatReport(report))
    unlockAchievement('clipboard-master')
    flash()
  }

  const totalIssues =
    (report?.structureIssues?.length ?? 0) +
    (report?.schemaIssues?.length ?? 0) +
    (report?.parseIssues.length ?? 0)

  return (
    <ToolLayout title="API response validator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Compare an actual API response with an expected sample structure,
            and optionally validate it against a JSON Schema. Issues are
            reported with a path such as <code>$.data.items[2].id</code>.
          </p>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-neutral-300">
                Actual response
              </h3>
              <SecondaryButton onClick={() => openFile('actual')}>
                Open
              </SecondaryButton>
            </div>
            <TextAreaWithLineNumbers
              value={url.a}
              setValue={setField('a')}
              placeholder='{"id": "1", "name": "Ada"}'
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-neutral-300">
                Expected sample
              </h3>
              <SecondaryButton onClick={() => openFile('expected')}>
                Open
              </SecondaryButton>
            </div>
            <TextAreaWithLineNumbers
              value={url.e}
              setValue={setField('e')}
              placeholder='{"id": 1, "name": "Ada", "email": "ada@example.com"}'
            />
          </div>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="text-sm font-medium text-neutral-300">
              JSON Schema (optional)
            </h3>
            <div className="flex gap-2">
              <SecondaryButton
                onClick={generateSchema}
                disabled={!url.e.trim()}
              >
                From expected
              </SecondaryButton>
              <SecondaryButton onClick={() => openFile('schema')}>
                Open
              </SecondaryButton>
            </div>
          </div>
          <TextAreaWithLineNumbers
            value={url.sc}
            setValue={setField('sc')}
            placeholder='{"type": "object", "required": ["id"], "properties": {"id": {"type": "integer"}}}'
          />
        </div>

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

        <fieldset className="mt-4">
          <legend className="mb-2 text-sm font-medium text-neutral-300">
            Comparison options
          </legend>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={url.ux}
                onChange={(e) => setUrl((s) => ({ ...s, ux: e.target.checked }))}
              />
              Report unexpected properties
            </label>
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={url.cv}
                onChange={(e) => setUrl((s) => ({ ...s, cv: e.target.checked }))}
              />
              Compare primitive values
            </label>
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={url.nl}
                onChange={(e) => setUrl((s) => ({ ...s, nl: e.target.checked }))}
              />
              Allow null for any type
            </label>
            <ToolChipRow>
              {ARRAY_MODES.map((m) => (
                <ToolChipButton
                  key={m}
                  active={url.am === m}
                  onClick={() => setUrl((s) => ({ ...s, am: m }))}
                >
                  {ARRAY_MODE_LABELS[m]}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>
        </fieldset>

        <div className={toolToolbarEndClass}>
          <SecondaryButton onClick={loadSample}>Load sample</SecondaryButton>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h3 className={toolSectionTitleClass}>Validation result</h3>
          {report ? (
            <div className="flex items-center gap-2">
              <span
                className={toolHintMetaClass}
                role="status"
                aria-live="polite"
              >
                {busy
                  ? 'Validating…'
                  : report.ok
                    ? 'No issues'
                    : `${totalIssues} issue${totalIssues === 1 ? '' : 's'}`}
              </span>
              <ToolCopyButton
                copied={copied === true}
                idleLabel="Copy report"
                onClick={handleCopy}
              />
            </div>
          ) : null}
        </div>

        {!report ? (
          <p className={toolEmptyHintClass}>
            Provide an actual response plus an expected sample and/or a schema.
          </p>
        ) : (
          <div className="space-y-6">
            {report.ok ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
                The response matches the expected structure
                {report.schemaIssues ? ' and the schema' : ''}.
              </div>
            ) : null}

            {report.parseIssues.length > 0 ? (
              <div className="space-y-2" role="alert">
                {report.parseIssues.map((p, i) => (
                  <div key={`${p.field}-${i}`} className={toolErrorBoxClass}>
                    <strong>
                      {p.field === 'actual'
                        ? 'Actual response'
                        : p.field === 'expected'
                          ? 'Expected sample'
                          : 'Schema'}
                    </strong>
                    <div className="mt-1">{p.message}</div>
                  </div>
                ))}
              </div>
            ) : null}

            {report.structureIssues && report.structureIssues.length > 0 ? (
              <div>
                <h4 className="mb-2 text-sm font-medium text-neutral-300">
                  Structure vs expected sample
                </h4>
                {counts ? (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {(Object.keys(counts) as IssueKind[])
                      .filter((k) => counts[k] > 0)
                      .map((k) => (
                        <span
                          key={k}
                          className={`rounded-md px-2.5 py-1 text-xs font-medium ${ISSUE_BADGE[k]}`}
                        >
                          {ISSUE_KIND_LABELS[k]} · {counts[k]}
                        </span>
                      ))}
                  </div>
                ) : null}
                <ul className="space-y-1.5">
                  {report.structureIssues.map((issue, i) => (
                    <li
                      key={`${issue.path}-${issue.kind}-${i}`}
                      className="flex items-start gap-3 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 text-sm"
                    >
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${ISSUE_BADGE[issue.kind]}`}
                      >
                        {ISSUE_KIND_LABELS[issue.kind]}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="break-all font-mono text-neutral-100">
                          {issue.path}
                        </div>
                        <div className="text-xs text-neutral-400">
                          {issue.message}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : report.structureIssues ? (
              <p className="text-sm text-emerald-300">
                Structure: matches the expected sample.
              </p>
            ) : null}

            {report.schemaIssues && report.schemaIssues.length > 0 ? (
              <div>
                <h4 className="mb-2 text-sm font-medium text-neutral-300">
                  Schema validation
                </h4>
                <ul className="space-y-1.5">
                  {report.schemaIssues.map((issue, i) => (
                    <li
                      key={`${issue.path}-${i}`}
                      className="rounded-lg border border-red-500/30 bg-red-500/[0.07] px-3 py-2 text-sm"
                    >
                      <div className="break-all font-mono text-neutral-100">
                        {issue.path}
                      </div>
                      <div className="text-xs text-neutral-400">
                        {issue.message}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : report.schemaIssues ? (
              <p className="text-sm text-emerald-300">
                Schema: response is valid.
              </p>
            ) : null}
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default function ApiResponseValidator() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="API response validator">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <ApiResponseValidatorInner />
    </Suspense>
  )
}
