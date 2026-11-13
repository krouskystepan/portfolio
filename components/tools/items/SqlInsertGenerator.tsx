'use client'

import type { SetStateAction } from 'react'
import { Suspense, useMemo, useState } from 'react'
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
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolLabelClass,
  toolNumberInputClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolWarningIntroClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import {
  bool,
  enumParam,
  int,
  str,
  useToolUrlState
} from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { downloadTextFile, pickTextFile, readTextFile } from '@/utils/download'
import {
  CSV_DELIMITERS,
  DEFAULT_TABLE_NAME,
  MAX_BATCH_SIZE,
  SQL_DIALECT_LABELS,
  SQL_DIALECTS,
  SQL_INPUT_FORMATS,
  buildInsertStatements,
  parseSqlInput,
  tableNameIssue,
  type CsvDelimiter,
  type SqlDialect,
  type SqlInputFormat,
  type SqlInsertResult
} from '@/utils/sqlInsert'

const PREVIEW_CHAR_LIMIT = 80_000

const INPUT_FORMAT_LABELS: Record<SqlInputFormat, string> = {
  auto: 'Auto',
  json: 'JSON',
  csv: 'CSV'
}

const DELIMITER_LABELS: Record<CsvDelimiter, string> = {
  auto: 'Auto',
  comma: 'Comma',
  semicolon: 'Semicolon',
  tab: 'Tab',
  pipe: 'Pipe'
}

const SAMPLE_JSON = `[
  { "id": 1, "name": "Ada O'Brien", "active": true, "score": 9.5, "note": null },
  { "id": 2, "name": "Grace \\"Amazing\\" Hopper", "active": false, "score": 7, "note": "line1\\nline2" }
]`

type Computed =
  | {
      ok: true
      result: SqlInsertResult
      format: 'json' | 'csv'
      columns: number
    }
  | { ok: false; error: string }

function SqlInsertGeneratorInner() {
  const [url, setUrl] = useToolUrlState({
    i: str('', { text: true }),
    tbl: str(DEFAULT_TABLE_NAME),
    d: enumParam<SqlDialect>('postgres', SQL_DIALECTS),
    fmt: enumParam<SqlInputFormat>('auto', SQL_INPUT_FORMATS),
    delim: enumParam<CsvDelimiter>('auto', CSV_DELIMITERS),
    b: int(1, { min: 1, max: MAX_BATCH_SIZE }),
    q: bool(true),
    ic: bool(false),
    tx: bool(false),
    jb: bool(false),
    inf: bool(true),
    en: bool(true)
  })
  const [fileError, setFileError] = useState<string | null>(null)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const input = url.i
  const tableIssue = tableNameIssue(url.tbl)

  const computed = useMemo<Computed | null>(() => {
    if (!input.trim()) return null
    try {
      const parsed = parseSqlInput({
        text: input,
        format: url.fmt,
        csv: {
          delimiter: url.delim,
          inferTypes: url.inf,
          emptyAsNull: url.en
        }
      })
      const result = buildInsertStatements(parsed, {
        table: url.tbl,
        dialect: url.d,
        batchSize: url.b,
        quoteIdentifiers: url.q,
        ignoreConflicts: url.ic,
        wrapInTransaction: url.tx,
        jsonbCast: url.jb
      })
      return {
        ok: true,
        result,
        format: parsed.format,
        columns: parsed.columns.length
      }
    } catch (err) {
      return {
        ok: false,
        error: err instanceof Error ? err.message : 'Could not build SQL.'
      }
    }
  }, [
    input,
    url.fmt,
    url.delim,
    url.inf,
    url.en,
    url.tbl,
    url.d,
    url.b,
    url.q,
    url.ic,
    url.tx,
    url.jb
  ])

  const sql = computed?.ok ? computed.result.sql : ''
  const preview =
    sql.length > PREVIEW_CHAR_LIMIT
      ? `${sql.slice(0, PREVIEW_CHAR_LIMIT)}\n-- … preview truncated (${sql.length.toLocaleString()} chars). Copy or download for the full script.`
      : sql

  const setInput = (value: SetStateAction<string>) =>
    setUrl((current) => ({
      ...current,
      i: typeof value === 'function' ? value(current.i) : value
    }))

  const showCsvOptions =
    url.fmt === 'csv' ||
    (url.fmt === 'auto' && computed?.ok === true && computed.format === 'csv')

  const handleCopy = async () => {
    if (!sql) return
    await navigator.clipboard.writeText(sql)
    unlockAchievement('clipboard-master')
    flash()
  }

  const handleLoadFile = async () => {
    setFileError(null)
    const file = await pickTextFile('.json,.csv,.tsv,.txt,.ndjson')
    if (!file) return
    try {
      setInput(await readTextFile(file))
    } catch (err) {
      setFileError(err instanceof Error ? err.message : 'Failed to read file.')
    }
  }

  const handleClear = () => {
    setUrl((current) => ({ ...current, i: '' }))
    setFileError(null)
  }

  const toggle = (
    key: 'q' | 'ic' | 'tx' | 'jb' | 'inf' | 'en',
    label: string,
    hint?: string
  ) => (
    <label className={toolCheckboxLabelClass} title={hint}>
      <input
        type="checkbox"
        checked={url[key]}
        onChange={(e) =>
          setUrl((current) => ({ ...current, [key]: e.target.checked }))
        }
        className="size-4 rounded border-white/20 bg-neutral-900"
      />
      {label}
    </label>
  )

  return (
    <ToolLayout title="SQL Insert Generator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Paste a JSON array of objects (or NDJSON) or a CSV with a header row
            and get <code>INSERT</code> statements for PostgreSQL, MySQL, or
            SQLite. Strings are escaped per dialect, <code>null</code> becomes{' '}
            <code>NULL</code>, and nested objects are stored as JSON text. All
            processing stays in your browser.
          </p>
        }
      >
        <div className={toolWarningIntroClass}>
          Meant for seed / fixture data. Review the output before running it
          against a database you care about - escaping is dialect-aware but this
          is not a substitute for parameterized queries in application code.
        </div>

        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste JSON array / NDJSON / CSV here..."
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="sql-table" className={toolLabelClass}>
              Table name
            </label>
            <input
              id="sql-table"
              value={url.tbl}
              onChange={(e) =>
                setUrl((current) => ({ ...current, tbl: e.target.value }))
              }
              spellCheck={false}
              placeholder={DEFAULT_TABLE_NAME}
              className={`${toolCompactInputClass} font-mono`}
              aria-invalid={tableIssue != null}
            />
            <p className={`${toolHintMetaClass} mt-1`}>
              {tableIssue ?? 'Use schema.table for a qualified name.'}
            </p>
          </div>

          <div>
            <span className={toolLabelClass}>Dialect</span>
            <ToolChipRow>
              {SQL_DIALECTS.map((dialect) => (
                <ToolChipButton
                  key={dialect}
                  active={url.d === dialect}
                  onClick={() =>
                    setUrl((current) => ({ ...current, d: dialect }))
                  }
                >
                  {SQL_DIALECT_LABELS[dialect]}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>

          <div>
            <span className={toolLabelClass}>Input format</span>
            <ToolChipRow>
              {SQL_INPUT_FORMATS.map((format) => (
                <ToolChipButton
                  key={format}
                  active={url.fmt === format}
                  onClick={() =>
                    setUrl((current) => ({ ...current, fmt: format }))
                  }
                >
                  {INPUT_FORMAT_LABELS[format]}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>

          <div>
            <label htmlFor="sql-batch" className={toolLabelClass}>
              Rows per INSERT
            </label>
            <input
              id="sql-batch"
              type="number"
              min={1}
              max={MAX_BATCH_SIZE}
              value={url.b}
              onChange={(e) =>
                setUrl((current) => ({
                  ...current,
                  b: Math.max(1, parseInt(e.target.value) || 1)
                }))
              }
              className={toolNumberInputClass}
            />
            <p className={`${toolHintMetaClass} mt-1`}>
              1 = one statement per row; higher batches rows into one multi-row{' '}
              <code>VALUES</code>.
            </p>
          </div>
        </div>

        {showCsvOptions ? (
          <div className="mt-4 flex flex-wrap items-start gap-x-6 gap-y-3">
            <div>
              <span className={toolLabelClass}>CSV delimiter</span>
              <ToolChipRow>
                {CSV_DELIMITERS.map((delimiter) => (
                  <ToolChipButton
                    key={delimiter}
                    active={url.delim === delimiter}
                    onClick={() =>
                      setUrl((current) => ({ ...current, delim: delimiter }))
                    }
                  >
                    {DELIMITER_LABELS[delimiter]}
                  </ToolChipButton>
                ))}
              </ToolChipRow>
            </div>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
              {toggle(
                'inf',
                'Infer numbers / booleans',
                'Leading zeros (e.g. 007) stay strings'
              )}
              {toggle('en', 'Empty cell → NULL')}
            </div>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
          {toggle(
            'q',
            'Quote identifiers',
            'Always quote table / column names'
          )}
          {toggle(
            'ic',
            url.d === 'mysql' ? 'INSERT IGNORE' : 'ON CONFLICT DO NOTHING'
          )}
          {toggle('tx', 'Wrap in transaction')}
          {url.d === 'postgres'
            ? toggle('jb', 'Cast JSON cells to ::jsonb')
            : null}
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
          <SecondaryButton onClick={() => setInput(SAMPLE_JSON)}>
            Sample
          </SecondaryButton>
          <SecondaryButton onClick={handleLoadFile}>Load file</SecondaryButton>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
        {fileError ? (
          <p className="mt-2 text-sm text-red-400">{fileError}</p>
        ) : null}
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>SQL</h2>
          {sql ? (
            <div className="flex flex-wrap items-center gap-2">
              <SecondaryButton
                onClick={() =>
                  downloadTextFile(
                    sql,
                    'inserts.sql',
                    'application/sql;charset=utf-8'
                  )
                }
              >
                Download
              </SecondaryButton>
              <ToolCopyButton copied={copied === true} onClick={handleCopy} />
            </div>
          ) : null}
        </div>

        {computed && !computed.ok ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {computed.error}
          </div>
        ) : computed?.ok ? (
          <div className="space-y-3">
            <p className={toolHintMetaClass}>
              {computed.result.rowCount.toLocaleString()} rows ·{' '}
              {computed.columns} columns ·{' '}
              {computed.result.statementCount.toLocaleString()} statements ·
              parsed as {computed.format.toUpperCase()}
            </p>
            {computed.result.warnings.map((warning) => (
              <p key={warning} className="text-xs text-amber-300/90">
                {warning}
              </p>
            ))}
            <pre className={`${toolPreOutputClass} !break-words`}>
              {preview}
            </pre>
          </div>
        ) : (
          <p className={toolEmptyHintClass}>
            Generated INSERT statements will appear here.
          </p>
        )}
      </div>
    </ToolLayout>
  )
}

export default function SqlInsertGenerator() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="SQL Insert Generator">
          <p className={toolEmptyHintClass}>Loading…</p>
        </ToolLayout>
      }
    >
      <SqlInsertGeneratorInner />
    </Suspense>
  )
}
