'use client'

import {
  Suspense,
  useDeferredValue,
  useMemo,
  useRef,
  useState
} from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
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
  toolMediumCardClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  toolWarningIntroClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { bool, enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { downloadTextFile, readTextFile } from '@/utils/download'
import {
  LOG_LEVELS,
  LOG_SOFT_LIMIT_BYTES,
  computeLevelStats,
  detectLogMode,
  entriesToText,
  filterEntries,
  formatBytes,
  getSizeWarning,
  groupRepeatedMessages,
  parseLog,
  type LogLevel,
  type LogMode
} from '@/utils/logAnalyze'

const MODES = ['plain', 'jsonl'] as const
const MODE_LABELS: Record<LogMode, string> = {
  plain: 'Plain text',
  jsonl: 'JSON lines'
}

/** Above this many chars the line-numbered editor is replaced by a summary (perf). */
const EDITOR_MAX_CHARS = 300_000
/** Max rows rendered in the results list. */
const MAX_RENDERED_ENTRIES = 500
const MAX_GROUPS = 10

const SAMPLE_PLAIN = `2026-11-13 09:00:01,120 INFO  [app.main] Server started on port 8080
2026-11-13 09:00:02,004 DEBUG [app.db] Connection pool size=10
2026-11-13 09:00:05,311 WARNING [app.cache] Cache miss for key user:1042
2026-11-13 09:00:05,512 WARNING [app.cache] Cache miss for key user:2210
2026-11-13 09:00:06,870 ERROR [app.api] Unhandled exception in /orders/991
Traceback (most recent call last):
  File "/srv/app/api.py", line 42, in handle_order
    total = compute_total(order)
  File "/srv/app/pricing.py", line 17, in compute_total
    return sum(i.price for i in order.items)
TypeError: unsupported operand type(s) for +: 'int' and 'NoneType'
2026-11-13 09:00:07,001 INFO  [app.api] Request completed in 41 ms
2026-11-13 09:00:09,990 ERROR [app.api] Unhandled exception in /orders/1002
2026-11-13 09:00:10,500 FATAL [app.main] Out of memory, shutting down`

const SAMPLE_JSONL = [
  '{"level":"info","time":"2026-11-13T09:00:01.120Z","context":"Bootstrap","message":"Nest application successfully started"}',
  '{"level":"debug","time":"2026-11-13T09:00:02.004Z","context":"Db","message":"Query took 12ms"}',
  '{"level":"warn","time":"2026-11-13T09:00:05.311Z","context":"Cache","message":"Cache miss for key user:1042"}',
  '{"level":"error","time":"2026-11-13T09:00:06.870Z","context":"ExceptionsHandler","message":"Order 991 failed","stack":"Error: boom\\n    at OrdersService.create"}',
  '{"level":"error","time":"2026-11-13T09:00:09.990Z","context":"ExceptionsHandler","message":"Order 1002 failed"}',
  '{"level":50,"time":1794560410000,"msg":"pino numeric error level"}'
].join('\n')

const LEVEL_STYLES: Record<LogLevel, { badge: string; row: string }> = {
  DEBUG: { badge: 'bg-neutral-700/60 text-neutral-300', row: '' },
  INFO: { badge: 'bg-sky-500/15 text-sky-300', row: '' },
  WARN: { badge: 'bg-amber-500/15 text-amber-300', row: '' },
  ERROR: {
    badge: 'bg-red-500/20 text-red-300',
    row: 'border-red-500/30 bg-red-500/[0.07]'
  },
  FATAL: {
    badge: 'bg-fuchsia-500/20 text-fuchsia-300',
    row: 'border-fuchsia-500/40 bg-fuchsia-500/[0.08]'
  },
  UNKNOWN: { badge: 'bg-neutral-800 text-neutral-400', row: '' }
}

function toTimeMs(value: string): number | null {
  if (!value) return null
  const ms = Date.parse(value)
  return Number.isFinite(ms) ? ms : null
}

function LogAnalyzerInner() {
  const [url, setUrl] = useToolUrlState({
    m: enumParam<LogMode>('plain', MODES),
    q: str(''),
    cs: bool(false),
    re: bool(false)
  })
  const [text, setText] = useState('')
  const [levels, setLevels] = useState<ReadonlySet<LogLevel>>(
    () => new Set<LogLevel>(LOG_LEVELS)
  )
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const mode = url.m
  const deferredText = useDeferredValue(text)
  const analyzing = deferredText !== text

  const size = useMemo(() => getSizeWarning(deferredText), [deferredText])

  const parsed = useMemo(
    () => parseLog(deferredText, mode),
    [deferredText, mode]
  )

  const filtered = useMemo(
    () =>
      filterEntries(parsed.entries, {
        levels,
        keyword: url.q,
        caseSensitive: url.cs,
        useRegex: url.re,
        fromMs: toTimeMs(from),
        toMs: toTimeMs(to)
      }),
    [parsed.entries, levels, url.q, url.cs, url.re, from, to]
  )

  // Stats reflect everything parsed (so level chips show what is available).
  const stats = useMemo(() => computeLevelStats(parsed.entries), [parsed.entries])
  const groups = useMemo(
    () => groupRepeatedMessages(filtered.entries).slice(0, MAX_GROUPS),
    [filtered.entries]
  )

  const hasTimestamps = useMemo(
    () => parsed.entries.some((e) => e.timestamp !== null),
    [parsed.entries]
  )

  const visible = filtered.entries.slice(0, MAX_RENDERED_ENTRIES)
  const editorHidden = text.length > EDITOR_MAX_CHARS

  const setMode = (m: LogMode) => setUrl((s) => ({ ...s, m }))

  const toggleLevel = (level: LogLevel) => {
    setLevels((prev) => {
      const next = new Set(prev)
      if (next.has(level)) next.delete(level)
      else next.add(level)
      return next
    })
  }

  const handleFile = async (file: File | null) => {
    if (!file) return
    try {
      const content = await readTextFile(file)
      setText(content)
      setMode(detectLogMode(content))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open file.')
    }
  }

  const loadSample = (m: LogMode) => {
    setText(m === 'plain' ? SAMPLE_PLAIN : SAMPLE_JSONL)
    setMode(m)
  }

  const handleClear = () => {
    setText('')
    setFrom('')
    setTo('')
    setLevels(new Set<LogLevel>(LOG_LEVELS))
    setUrl((s) => ({ ...s, q: '' }))
  }

  const exportText = () => entriesToText(filtered.entries)

  const handleCopy = () => {
    navigator.clipboard.writeText(exportText())
    unlockAchievement('clipboard-master')
    flash()
  }

  const handleExport = () => {
    downloadTextFile(exportText(), 'filtered.log')
  }

  const hasInput = text.trim().length > 0

  return (
    <ToolLayout title="Log analyzer">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Paste or open a log file (plain text or JSON lines), filter by level
            and keyword, spot repeated messages, and export what matches.
            Parsing happens locally - nothing is uploaded. For complex patterns,
            refine expressions in the{' '}
            <Link
              href="/t/regex-tester"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              Regex tester
            </Link>
            .
          </p>
        }
      >
        {size.overLimit ? (
          <div className={toolWarningIntroClass} role="alert">
            Large input ({formatBytes(size.bytes)}, soft limit{' '}
            {formatBytes(LOG_SOFT_LIMIT_BYTES)}). Analysis still runs, but the
            editor is hidden and only the first {MAX_RENDERED_ENTRIES} matching
            entries are rendered. Use filters and export for the full result.
          </div>
        ) : null}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <ToolChipRow>
            {MODES.map((m) => (
              <ToolChipButton
                key={m}
                active={mode === m}
                onClick={() => setMode(m)}
              >
                {MODE_LABELS[m]}
              </ToolChipButton>
            ))}
          </ToolChipRow>
          <div className="flex flex-wrap gap-2">
            <SecondaryButton onClick={() => loadSample('plain')}>
              Sample (plain)
            </SecondaryButton>
            <SecondaryButton onClick={() => loadSample('jsonl')}>
              Sample (JSONL)
            </SecondaryButton>
            <SecondaryButton onClick={() => fileRef.current?.click()}>
              Open file
            </SecondaryButton>
          </div>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept=".log,.txt,.jsonl,.ndjson,text/plain,application/x-ndjson"
          className="hidden"
          aria-label="Open log file"
          onChange={(e) => {
            void handleFile(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />

        {editorHidden ? (
          <div className={toolMediumCardClass}>
            <p className="text-sm text-neutral-200">
              {formatBytes(size.bytes)} loaded ({parsed.totalLines.toLocaleString()}{' '}
              lines). The editor is hidden for performance.
            </p>
            <p className={toolHintMetaClass}>
              Clear the input to paste something else.
            </p>
          </div>
        ) : (
          <TextAreaWithLineNumbers
            value={text}
            setValue={setText}
            placeholder={
              mode === 'plain'
                ? '2026-11-13 09:00:06 ERROR [app] Something failed…'
                : '{"level":"error","message":"Something failed","time":"2026-11-13T09:00:06Z"}'
            }
          />
        )}

        <div className={toolToolbarEndClass}>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <ToolInputPanel>
        <h3 className={`${toolSectionTitleClass} mb-4`}>Filters</h3>

        <div
          role="group"
          aria-label="Filter by log level"
          className="mb-4 flex flex-wrap items-center gap-3"
        >
          <ToolChipRow>
            {LOG_LEVELS.map((level) => (
              <ToolChipButton
                key={level}
                active={levels.has(level)}
                onClick={() => toggleLevel(level)}
                title={`Toggle ${level}`}
              >
                {level} · {stats.counts[level].toLocaleString()}
              </ToolChipButton>
            ))}
          </ToolChipRow>
          <div className="flex gap-2">
            <SecondaryButton
              onClick={() => setLevels(new Set<LogLevel>(['ERROR', 'FATAL']))}
            >
              Errors only
            </SecondaryButton>
            <SecondaryButton
              onClick={() => setLevels(new Set<LogLevel>(LOG_LEVELS))}
            >
              All levels
            </SecondaryButton>
          </div>
        </div>

        <label className={toolLabelClass} htmlFor="log-keyword">
          Keyword
        </label>
        <input
          id="log-keyword"
          type="text"
          value={url.q}
          onChange={(e) => setUrl((s) => ({ ...s, q: e.target.value }))}
          placeholder={url.re ? 'Regular expression…' : 'Search in entries…'}
          className={`${toolCompactInputClass} !h-10 font-mono !text-sm`}
          spellCheck={false}
          autoComplete="off"
        />
        <div className="mt-3 flex flex-wrap gap-5">
          <label className={toolCheckboxLabelClass}>
            <input
              type="checkbox"
              checked={url.cs}
              onChange={(e) => setUrl((s) => ({ ...s, cs: e.target.checked }))}
            />
            Case sensitive
          </label>
          <label className={toolCheckboxLabelClass}>
            <input
              type="checkbox"
              checked={url.re}
              onChange={(e) => setUrl((s) => ({ ...s, re: e.target.checked }))}
            />
            Regex
          </label>
        </div>

        {hasTimestamps ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className={toolLabelClass} htmlFor="log-from">
                From (timestamp)
              </label>
              <input
                id="log-from"
                type="datetime-local"
                step={1}
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className={toolCompactInputClass}
              />
            </div>
            <div>
              <label className={toolLabelClass} htmlFor="log-to">
                To (timestamp)
              </label>
              <input
                id="log-to"
                type="datetime-local"
                step={1}
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className={toolCompactInputClass}
              />
            </div>
          </div>
        ) : null}
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h3 className={toolSectionTitleClass}>Results</h3>
          <div className="flex items-center gap-2">
            <span className={toolHintMetaClass} role="status" aria-live="polite">
              {analyzing
                ? 'Analyzing…'
                : `${filtered.entries.length.toLocaleString()} of ${stats.total.toLocaleString()} entries`}
            </span>
            <ToolCopyButton
              copied={copied === true}
              onClick={handleCopy}
              disabled={filtered.entries.length === 0}
            />
            <SecondaryButton
              onClick={handleExport}
              disabled={filtered.entries.length === 0}
            >
              Export .log
            </SecondaryButton>
          </div>
        </div>

        {filtered.regexError ? (
          <div className={`${toolErrorBoxClass} mb-4`}>
            Invalid regex: {filtered.regexError}
          </div>
        ) : null}

        {mode === 'jsonl' && parsed.invalidJsonLines > 0 ? (
          <div className={`${toolWarningIntroClass} !mb-4`}>
            {parsed.invalidJsonLines.toLocaleString()} line(s) were not valid JSON
            objects and were treated as plain text.
          </div>
        ) : null}

        {!hasInput ? (
          <p className={toolEmptyHintClass}>
            Paste a log, open a file, or load a sample to begin.
          </p>
        ) : stats.total === 0 ? (
          <p className={toolEmptyHintClass}>No log entries found.</p>
        ) : (
          <div className="space-y-6">
            <div>
              <h4 className="mb-2 text-sm font-medium text-neutral-300">
                Level statistics
              </h4>
              <div className="flex flex-wrap gap-2">
                {LOG_LEVELS.filter((l) => stats.counts[l] > 0).map((level) => {
                  const pct = ((stats.counts[level] / stats.total) * 100).toFixed(1)
                  return (
                    <span
                      key={level}
                      className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1 text-xs font-medium ${LEVEL_STYLES[level].badge}`}
                    >
                      {level}
                      <span className="font-mono">
                        {stats.counts[level].toLocaleString()} ({pct}%)
                      </span>
                    </span>
                  )
                })}
              </div>
            </div>

            {groups.length > 0 ? (
              <div>
                <h4 className="mb-2 text-sm font-medium text-neutral-300">
                  Repeated messages
                </h4>
                <ul className="space-y-1.5">
                  {groups.map((g) => (
                    <li
                      key={g.key}
                      className="flex items-start gap-3 rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 text-sm"
                    >
                      <span className="shrink-0 rounded-md bg-neutral-800 px-2 py-0.5 font-mono text-xs text-neutral-100">
                        ×{g.count.toLocaleString()}
                      </span>
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[g.level].badge}`}
                      >
                        {g.level}
                      </span>
                      <span className="min-w-0 flex-1 break-all font-mono text-neutral-200">
                        {g.message}
                      </span>
                      <span className="shrink-0 text-xs text-neutral-500">
                        L{g.firstLine}
                        {g.lastLine !== g.firstLine ? `–${g.lastLine}` : ''}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div>
              <h4 className="mb-2 text-sm font-medium text-neutral-300">
                Entries
              </h4>
              {filtered.entries.length === 0 ? (
                <p className={toolEmptyHintClass}>
                  No entries match the current filters.
                </p>
              ) : (
                <>
                  <ul className="max-h-[32rem] space-y-1 overflow-auto">
                    {visible.map((entry) => (
                      <li
                        key={entry.id}
                        className={`rounded-lg border border-white/10 bg-neutral-900/50 px-3 py-2 ${LEVEL_STYLES[entry.level].row}`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="w-14 shrink-0 pt-0.5 text-right font-mono text-xs text-neutral-500">
                            {entry.lineStart}
                          </span>
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-medium ${LEVEL_STYLES[entry.level].badge}`}
                          >
                            {entry.level}
                          </span>
                          <pre className="min-w-0 flex-1 whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-neutral-200">
                            {entry.raw}
                          </pre>
                        </div>
                      </li>
                    ))}
                  </ul>
                  {filtered.entries.length > visible.length ? (
                    <p className={`${toolHintMetaClass} mt-2`}>
                      Showing the first {visible.length.toLocaleString()} of{' '}
                      {filtered.entries.length.toLocaleString()} matching entries.
                      Export includes all matches.
                    </p>
                  ) : null}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default function LogAnalyzer() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Log analyzer">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <LogAnalyzerInner />
    </Suspense>
  )
}
