'use client'

import { Suspense, useDeferredValue, useMemo } from 'react'
import { format, type KeywordCase, type SqlLanguage } from 'sql-formatter'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolErrorBoxClass,
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
import { downloadTextFile } from '@/utils/download'

const DIALECTS = [
  { id: 'sql', label: 'Standard SQL' },
  { id: 'postgresql', label: 'PostgreSQL' },
  { id: 'mysql', label: 'MySQL' },
  { id: 'mariadb', label: 'MariaDB' },
  { id: 'sqlite', label: 'SQLite' },
  { id: 'transactsql', label: 'T-SQL (SQL Server)' },
  { id: 'plsql', label: 'PL/SQL (Oracle)' },
  { id: 'bigquery', label: 'BigQuery' },
  { id: 'snowflake', label: 'Snowflake' },
  { id: 'redshift', label: 'Redshift' },
  { id: 'spark', label: 'Spark' },
  { id: 'hive', label: 'Hive' },
  { id: 'trino', label: 'Trino' },
  { id: 'db2', label: 'DB2' },
  { id: 'duckdb', label: 'DuckDB' },
  { id: 'clickhouse', label: 'ClickHouse' }
] as const satisfies readonly { id: SqlLanguage; label: string }[]

type DialectId = (typeof DIALECTS)[number]['id']
const DIALECT_IDS = DIALECTS.map((d) => d.id) as readonly DialectId[]

const CASE_IDS = ['upper', 'lower', 'preserve'] as const satisfies readonly KeywordCase[]
const INDENT_IDS = ['2', '4', 'tab'] as const
type IndentId = (typeof INDENT_IDS)[number]

const SAMPLE = `select u.id,u.name,count(o.id) as orders from users u left join orders o on o.user_id=u.id where u.created_at>='2024-01-01' and (u.status='active' or u.status='trial') group by u.id,u.name having count(o.id)>0 order by orders desc limit 20;`

const selectClass =
  'ring-custom_blue/40 h-8 rounded-md border border-white/10 bg-neutral-900/80 px-2.5 text-xs text-neutral-100 outline-none focus:ring-1'

function formatSql(
  sql: string,
  opts: {
    language: DialectId
    indent: IndentId
    keywordCase: KeywordCase
    dense: boolean
  }
): { value: string; error: string | null } {
  if (!sql.trim()) return { value: '', error: null }
  try {
    return {
      value: format(sql, {
        language: opts.language,
        tabWidth: opts.indent === 'tab' ? 2 : Number(opts.indent),
        useTabs: opts.indent === 'tab',
        keywordCase: opts.keywordCase,
        denseOperators: opts.dense
      }),
      error: null
    }
  } catch (err) {
    return {
      value: '',
      error: (err as Error).message || 'Could not format this SQL.'
    }
  }
}

function SqlFormatterInner() {
  const [url, setUrl] = useToolUrlState({
    sql: str('', { text: true }),
    dialect: enumParam<DialectId>('sql', DIALECT_IDS),
    indent: enumParam<IndentId>('2', INDENT_IDS),
    kw: enumParam<KeywordCase>('upper', CASE_IDS),
    dense: bool(false)
  })
  const input = url.sql
  const deferred = useDeferredValue(input)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const result = useMemo(
    () =>
      formatSql(deferred, {
        language: url.dialect,
        indent: url.indent,
        keywordCase: url.kw,
        dense: url.dense
      }),
    [deferred, url.dialect, url.indent, url.kw, url.dense]
  )

  const handleCopy = async () => {
    if (!result.value) return
    await navigator.clipboard.writeText(result.value)
    unlockAchievement('clipboard-master')
    flash()
  }

  return (
    <ToolLayout title="SQL Formatter">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Beautify SQL with dialect-aware formatting. Statements are formatted
            locally, never executed or sent anywhere.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={(v) =>
            setUrl((s) => ({
              ...s,
              sql: typeof v === 'function' ? v(s.sql) : v
            }))
          }
          placeholder="Paste SQL here…"
        />

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3">
          <label className="flex items-center gap-2 text-sm text-neutral-300">
            Dialect
            <select
              value={url.dialect}
              onChange={(e) =>
                setUrl((s) => ({ ...s, dialect: e.target.value as DialectId }))
              }
              className={selectClass}
            >
              {DIALECTS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.label}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <span>Keywords</span>
            <ToolChipRow>
              {CASE_IDS.map((id) => (
                <ToolChipButton
                  key={id}
                  active={url.kw === id}
                  onClick={() => setUrl((s) => ({ ...s, kw: id }))}
                >
                  {id === 'upper' ? 'UPPER' : id === 'lower' ? 'lower' : 'Keep'}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>

          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <span>Indent</span>
            <ToolChipRow>
              {INDENT_IDS.map((id) => (
                <ToolChipButton
                  key={id}
                  active={url.indent === id}
                  onClick={() => setUrl((s) => ({ ...s, indent: id }))}
                >
                  {id === 'tab' ? 'Tab' : id}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>

          <label className={toolCheckboxLabelClass}>
            <input
              type="checkbox"
              checked={url.dense}
              onChange={() => setUrl((s) => ({ ...s, dense: !s.dense }))}
              className="size-4 accent-custom_blue"
            />
            Dense operators
          </label>
        </div>

        <div className={toolToolbarBetweenClass}>
          <SecondaryButton
            onClick={() => setUrl((s) => ({ ...s, sql: SAMPLE }))}
          >
            Load sample
          </SecondaryButton>
          <ClearButton onClick={() => setUrl((s) => ({ ...s, sql: '' }))}>
            Clear
          </ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Formatted SQL</h2>
          {result.value ? (
            <div className="flex flex-wrap gap-1.5">
              <SecondaryButton
                onClick={() =>
                  downloadTextFile(result.value, 'query.sql', 'application/sql;charset=utf-8')
                }
              >
                Download
              </SecondaryButton>
              <ToolCopyButton
                copied={copied === true}
                onClick={() => void handleCopy()}
              />
            </div>
          ) : null}
        </div>
        {result.error ? (
          <div className={toolErrorBoxClass}>{result.error}</div>
        ) : (
          <pre className={`${toolPreOutputClass} max-h-[32rem] whitespace-pre`}>
            {result.value || (
              <span className="text-neutral-500">Formatted SQL appears here.</span>
            )}
          </pre>
        )}
      </div>
    </ToolLayout>
  )
}

export default function SqlFormatter() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="SQL Formatter">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <SqlFormatterInner />
    </Suspense>
  )
}
