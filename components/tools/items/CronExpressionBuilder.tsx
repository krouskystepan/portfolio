'use client'

import { useEffect, useMemo, useState, type ReactNode } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolInputClass,
  toolIntroTextClass,
  toolLabelClass,
  toolNumberInputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import {
  CRON_PRESETS,
  DEFAULT_FIELDS,
  DOW_NAMES,
  FIELD_KEYS,
  FIELD_LABELS,
  MINUTE_QUICK_VALUES,
  MONTH_NAMES,
  type CronFieldKey,
  type CronFields,
  type CronTimezone,
  type FieldMode,
  buildRange,
  buildSpecific,
  buildStep,
  cloneFields,
  describeCron,
  detectFieldMode,
  fieldsToExpression,
  formatRelativeRun,
  formatRunTime,
  nextRuns,
  parseExpression,
  parseRange,
  parseSpecificList,
  parseStep
} from '@/utils/cronExpression'

type CopyKey = 'expression' | 'description'

const FIELD_MODES: { id: FieldMode; label: string; hint: string }[] = [
  { id: 'every', label: 'Every', hint: '*' },
  { id: 'step', label: 'Interval', hint: '*/N' },
  { id: 'specific', label: 'Pick', hint: '1,2,3' },
  { id: 'range', label: 'Range', hint: 'A-B' },
  { id: 'raw', label: 'Custom', hint: 'advanced' }
]

const FIELD_SHORT: Record<CronFieldKey, string> = {
  minute: 'min',
  hour: 'hour',
  dayOfMonth: 'day',
  month: 'month',
  dayOfWeek: 'dow'
}

const FIELD_HINT: Record<CronFieldKey, string> = {
  minute: '0–59',
  hour: '0–23',
  dayOfMonth: '1–31',
  month: 'JAN–DEC',
  dayOfWeek: 'SUN–SAT'
}

const HOUR_VALUES = Array.from({ length: 24 }, (_, i) => i)
const DOM_QUICK = [1, 15, 28] as const

function modeDefault(
  key: CronFieldKey,
  mode: FieldMode,
  current: string
): string {
  switch (mode) {
    case 'every':
      return '*'
    case 'step':
      return key === 'minute' ? '*/15' : '*/1'
    case 'specific':
      if (key === 'minute') return '0'
      if (key === 'hour') return '9'
      if (key === 'dayOfMonth') return '1'
      if (key === 'month') return 'JAN'
      return 'MON'
    case 'range':
      if (key === 'minute') return '0-30'
      if (key === 'hour') return '9-17'
      if (key === 'dayOfMonth') return '1-15'
      if (key === 'month') return 'JAN-JUN'
      return '1-5'
    case 'raw':
      return current.trim() || '*'
  }
}

/** One chip size for presets, fields, modes, and value picks. */
const chipClass = (active: boolean, tone: 'default' | 'accent' = 'default') => {
  if (active && tone === 'accent') {
    return 'inline-flex h-8 items-center justify-center rounded-md bg-amber-600/90 px-2.5 text-xs font-medium text-white transition hover:bg-amber-500'
  }
  return `inline-flex h-8 items-center justify-center rounded-md px-2.5 text-xs font-medium transition ${
    active
      ? 'bg-custom_blue text-white'
      : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700 hover:text-white'
  }`
}

function ChipButton({
  active,
  onClick,
  children,
  title,
  className = '',
  tone = 'default'
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  title?: string
  className?: string
  tone?: 'default' | 'accent'
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`${chipClass(active, tone)} ${className}`}
    >
      {children}
    </button>
  )
}

function ChipRow({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap gap-1.5">{children}</div>
}

function AddCustomValue({
  min,
  max,
  value,
  onChange,
  onAdd
}: {
  min: number
  max: number
  value: string
  onChange: (v: string) => void
  onAdd: () => void
}) {
  const handleChange = (raw: string) => {
    onChange(raw.replace(/\D/g, '').slice(0, String(max).length))
  }

  return (
    <div className="inline-flex h-8 items-center gap-1">
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => handleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            onAdd()
          }
        }}
        placeholder="+"
        aria-label={`Add number ${min} to ${max}`}
        className="h-8 w-9 rounded-md bg-neutral-800 px-1 text-center font-mono text-xs text-neutral-100 outline-none ring-custom_blue/40 placeholder:text-neutral-500 focus:ring-1"
      />
      <ChipButton active={false} onClick={onAdd} title={`Add (${min}–${max})`}>
        +
      </ChipButton>
    </div>
  )
}

function FieldControls({
  fieldKey,
  value,
  onChange
}: {
  fieldKey: CronFieldKey
  value: string
  onChange: (next: string) => void
}) {
  const mode = detectFieldMode(value)
  const step = parseStep(value) ?? (fieldKey === 'minute' ? 15 : 1)
  const range = parseRange(value) ?? {
    from: modeDefault(fieldKey, 'range', value).split('-')[0],
    to: modeDefault(fieldKey, 'range', value).split('-')[1]
  }
  const specific = parseSpecificList(value)
  const [customValue, setCustomValue] = useState('')

  const setMode = (next: FieldMode) => {
    onChange(modeDefault(fieldKey, next, value))
  }

  const toggleSpecific = (token: string | number) => {
    const tokenStr = String(token)
    const current = parseSpecificList(value)
    const exists = current.some(
      (v) => v.toUpperCase() === tokenStr.toUpperCase()
    )
    const next = exists
      ? current.filter((v) => v.toUpperCase() !== tokenStr.toUpperCase())
      : [...current, tokenStr]
    onChange(buildSpecific(next))
  }

  const isSpecificActive = (token: string | number) =>
    specific.some((v) => v.toUpperCase() === String(token).toUpperCase())

  const addCustomNumber = (min: number, max: number) => {
    if (!/^\d+$/.test(customValue)) return
    const n = Number(customValue)
    if (!Number.isInteger(n) || n < min || n > max) return
    toggleSpecific(n)
    setCustomValue('')
  }

  return (
    <div className="space-y-2">
      <ChipRow>
        {FIELD_MODES.map(({ id, label, hint }) => (
          <ChipButton
            key={id}
            active={mode === id}
            onClick={() => setMode(id)}
            title={hint}
          >
            {label}
          </ChipButton>
        ))}
      </ChipRow>

      {mode === 'every' ? (
        <p className={`${toolHintMetaClass} m-0`}>
          Unrestricted (
          <span className="font-mono text-neutral-300">*</span>
          ). Switch to Pick / Range to limit this field.
        </p>
      ) : null}

      {mode === 'step' ? (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-neutral-400">Every</span>
          <input
            id={`step-${fieldKey}`}
            type="number"
            min={1}
            max={fieldKey === 'hour' ? 23 : fieldKey === 'minute' ? 59 : 31}
            value={step}
            onChange={(e) => {
              const n = Number(e.target.value)
              if (!Number.isFinite(n) || n < 1) return
              onChange(buildStep(n))
            }}
            className={`${toolNumberInputClass} h-8 max-w-16`}
          />
          <span className="text-xs text-neutral-400">
            {fieldKey === 'minute'
              ? 'minutes'
              : fieldKey === 'hour'
                ? 'hours'
                : 'units'}
          </span>
          <span className="font-mono text-xs text-neutral-500">
            → {buildStep(step)}
          </span>
        </div>
      ) : null}

      {mode === 'range' ? (
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={range.from}
            onChange={(e) => onChange(buildRange(e.target.value, range.to))}
            spellCheck={false}
            className={`${toolInputClass} max-w-20 py-1.5 font-mono`}
            aria-label={`${FIELD_LABELS[fieldKey]} range start`}
          />
          <span className="text-neutral-500">to</span>
          <input
            value={range.to}
            onChange={(e) => onChange(buildRange(range.from, e.target.value))}
            spellCheck={false}
            className={`${toolInputClass} max-w-20 py-1.5 font-mono`}
            aria-label={`${FIELD_LABELS[fieldKey]} range end`}
          />
        </div>
      ) : null}

      {mode === 'raw' ? (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value || '*')}
          spellCheck={false}
          autoComplete="off"
          className={`${toolInputClass} max-w-xs py-1.5 font-mono`}
          placeholder="*, */5, 0,15, 1-5, MON…"
        />
      ) : null}

      {mode === 'specific' && fieldKey === 'minute' ? (
        <ChipRow>
          {MINUTE_QUICK_VALUES.map((m) => (
            <ChipButton
              key={m}
              active={isSpecificActive(m)}
              onClick={() => toggleSpecific(m)}
              className="font-mono"
            >
              :{String(m).padStart(2, '0')}
            </ChipButton>
          ))}
          {specific
            .filter(
              (v) => !MINUTE_QUICK_VALUES.some((m) => String(m) === v)
            )
            .map((v) => (
              <ChipButton
                key={v}
                active
                onClick={() => toggleSpecific(v)}
                className="font-mono"
              >
                :{String(v).padStart(2, '0')}
              </ChipButton>
            ))}
          <AddCustomValue
            min={0}
            max={59}
            value={customValue}
            onChange={setCustomValue}
            onAdd={() => addCustomNumber(0, 59)}
          />
        </ChipRow>
      ) : null}

      {mode === 'specific' && fieldKey === 'hour' ? (
        <ChipRow>
          {HOUR_VALUES.map((h) => (
            <ChipButton
              key={h}
              active={isSpecificActive(h)}
              onClick={() => toggleSpecific(h)}
              className="min-w-9 font-mono"
            >
              {String(h).padStart(2, '0')}
            </ChipButton>
          ))}
        </ChipRow>
      ) : null}

      {mode === 'specific' && fieldKey === 'dayOfMonth' ? (
        <ChipRow>
          {DOM_QUICK.map((d) => (
            <ChipButton
              key={d}
              active={isSpecificActive(d)}
              onClick={() => toggleSpecific(d)}
              className="font-mono"
            >
              {d}
            </ChipButton>
          ))}
          {specific
            .filter((v) => !DOM_QUICK.some((d) => String(d) === v))
            .map((v) => (
              <ChipButton
                key={v}
                active
                onClick={() => toggleSpecific(v)}
                className="font-mono"
              >
                {v}
              </ChipButton>
            ))}
          <AddCustomValue
            min={1}
            max={31}
            value={customValue}
            onChange={setCustomValue}
            onAdd={() => addCustomNumber(1, 31)}
          />
        </ChipRow>
      ) : null}

      {mode === 'specific' && fieldKey === 'month' ? (
        <ChipRow>
          {MONTH_NAMES.map((m) => (
            <ChipButton
              key={m}
              active={isSpecificActive(m)}
              onClick={() => toggleSpecific(m)}
              className="font-mono"
            >
              {m}
            </ChipButton>
          ))}
        </ChipRow>
      ) : null}

      {mode === 'specific' && fieldKey === 'dayOfWeek' ? (
        <ChipRow>
          {DOW_NAMES.map((d) => (
            <ChipButton
              key={d}
              active={isSpecificActive(d)}
              onClick={() => toggleSpecific(d)}
              className="font-mono"
            >
              {d}
            </ChipButton>
          ))}
        </ChipRow>
      ) : null}
    </div>
  )
}

const CronExpressionBuilder = () => {
  const [fields, setFields] = useState<CronFields>(() =>
    cloneFields(DEFAULT_FIELDS)
  )
  const [expressionText, setExpressionText] = useState(() =>
    fieldsToExpression(DEFAULT_FIELDS)
  )
  const [expressionError, setExpressionError] = useState<string | null>(null)
  const [timezone, setTimezone] = useState<CronTimezone>('local')
  const [activeField, setActiveField] = useState<CronFieldKey>('minute')
  const [copied, setCopied] = useState<CopyKey | null>(null)
  // Next-run times depend on "now" + local TZ — only render after mount.
  const [ready, setReady] = useState(false)

  const { unlockAchievement } = useAchievementContext()

  useEffect(() => {
    setReady(true)
  }, [])

  const applyFields = (next: CronFields) => {
    setFields(next)
    setExpressionText(fieldsToExpression(next))
    setExpressionError(null)
  }

  const setField = (key: CronFieldKey, value: string) => {
    applyFields({ ...fields, [key]: value.trim() || '*' })
  }

  /** Focusing a calendar field that is still `*` switches it to Pick so the schedule visibly updates. */
  const focusField = (key: CronFieldKey) => {
    setActiveField(key)
    const isCalendar =
      key === 'dayOfMonth' || key === 'month' || key === 'dayOfWeek'
    if (isCalendar && fields[key].trim() === '*') {
      setField(key, modeDefault(key, 'specific', fields[key]))
    }
  }

  const handleExpressionChange = (text: string) => {
    setExpressionText(text)
    if (!text.trim()) {
      setExpressionError(null)
      return
    }
    const result = parseExpression(text)
    if (result.ok) {
      setFields(result.fields)
      setExpressionError(null)
      return
    }
    setExpressionError(result.error)
  }

  const handleExpressionBlur = () => {
    if (!expressionText.trim()) {
      setExpressionText(fieldsToExpression(fields))
      setExpressionError(null)
      return
    }
    setExpressionText(fieldsToExpression(fields))
    setExpressionError(null)
  }

  const applyPreset = (expression: string) => {
    const result = parseExpression(expression)
    if (result.ok) applyFields(result.fields)
  }

  const handleClear = () => {
    applyFields(cloneFields(DEFAULT_FIELDS))
    setTimezone('local')
    setActiveField('minute')
    setCopied(null)
  }

  const expression = fieldsToExpression(fields)

  const description = useMemo(() => {
    try {
      return { value: describeCron(expression), error: null as string | null }
    } catch (err) {
      return {
        value: '',
        error: err instanceof Error ? err.message : 'Invalid expression.'
      }
    }
  }, [expression])

  const runs = useMemo(() => {
    if (!ready) {
      return { value: [] as Date[], error: null as string | null }
    }
    try {
      return {
        value: nextRuns(expression, 10, timezone),
        error: null as string | null
      }
    } catch (err) {
      return {
        value: [] as Date[],
        error:
          err instanceof Error ? err.message : 'Could not compute next runs.'
      }
    }
  }, [expression, timezone, ready])

  const handleCopy = async (key: CopyKey, text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const activePreset = CRON_PRESETS.find((p) => p.expression === expression)

  return (
    <ToolLayout title="Cron expression builder">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Build a <strong>5-field</strong> schedule (
            <code>min hour day month weekday</code>). Works with crontab,
            Celery, and GitHub Actions. Click a field to edit it, or paste an
            expression.
          </p>
        }
      >
        {/* Expression */}
        <div className="rounded-xl border border-white/10 bg-neutral-950/60 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <label
              className={`${toolLabelClass} mb-0`}
              htmlFor="cron-expression"
            >
              Cron expression
            </label>
            <div className="flex items-center gap-2">
              <ToolCopyButton
                copied={copied === 'expression'}
                onClick={() => handleCopy('expression', expression)}
              />
              <button
                type="button"
                onClick={handleClear}
                className="shrink-0 rounded-lg bg-red-800 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 active:scale-95"
              >
                Reset
              </button>
            </div>
          </div>

          <input
            id="cron-expression"
            value={expressionText}
            onChange={(e) => handleExpressionChange(e.target.value)}
            onBlur={handleExpressionBlur}
            placeholder="0 9 * * 1-5"
            spellCheck={false}
            autoComplete="off"
            className={`${toolInputClass} mt-2 font-mono text-lg tracking-wider`}
          />

          {expressionError ? (
            <div className={`${toolErrorBoxClass} mt-3 p-2 text-xs`}>
              {expressionError}
            </div>
          ) : (
            <div className="mt-3 flex flex-wrap items-start justify-between gap-2">
              <p className="min-w-0 flex-1 text-sm leading-relaxed text-neutral-200">
                {description.error ? (
                  <span className="text-red-400">{description.error}</span>
                ) : (
                  description.value
                )}
              </p>
              {description.value ? (
                <ToolCopyButton
                  copied={copied === 'description'}
                  idleLabel="Copy text"
                  onClick={() => handleCopy('description', description.value)}
                />
              ) : null}
            </div>
          )}
        </div>

        {/* Presets */}
        <div className="mt-4">
          <p className={`${toolLabelClass} mb-2`}>Presets</p>
          <ChipRow>
            {CRON_PRESETS.map((preset) => (
              <ChipButton
                key={preset.expression}
                active={activePreset?.expression === preset.expression}
                onClick={() => applyPreset(preset.expression)}
                title={preset.expression}
                tone="accent"
              >
                {preset.label}
              </ChipButton>
            ))}
          </ChipRow>
        </div>

        {/* Fields */}
        <div className="mt-4">
          <p className={`${toolLabelClass} mb-2`}>Fields</p>
          <ChipRow>
            {FIELD_KEYS.map((key) => (
              <ChipButton
                key={key}
                active={activeField === key}
                onClick={() => focusField(key)}
                className="font-mono"
                title={FIELD_LABELS[key]}
              >
                {FIELD_SHORT[key]} {fields[key]}
              </ChipButton>
            ))}
          </ChipRow>

          <div className="mt-3 space-y-2">
            <p className="text-xs text-neutral-500">
              {FIELD_LABELS[activeField]}{' '}
              <span className="font-mono text-neutral-400">
                ({FIELD_HINT[activeField]})
              </span>
            </p>
            <FieldControls
              key={activeField}
              fieldKey={activeField}
              value={fields[activeField]}
              onChange={(next) => setField(activeField, next)}
            />
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>Next 10 runs</h2>
            <ChipRow>
              {(
                [
                  ['local', 'Local'],
                  ['UTC', 'UTC']
                ] as const
              ).map(([id, label]) => (
                <ChipButton
                  key={id}
                  active={timezone === id}
                  onClick={() => setTimezone(id)}
                >
                  {label}
                </ChipButton>
              ))}
            </ChipRow>
          </div>

        {!ready ? (
          <p className={toolEmptyHintClass}>Calculating upcoming times…</p>
        ) : runs.error ? (
          <div className={`${toolErrorBoxClass} p-2 text-xs`}>{runs.error}</div>
        ) : runs.value.length === 0 ? (
          <p className={toolEmptyHintClass}>
            No upcoming runs for this schedule.
          </p>
        ) : (
          <ol className="divide-y divide-white/5">
            {runs.value.map((date, i) => (
              <li
                key={`${date.toISOString()}-${i}`}
                className="flex items-baseline justify-between gap-4 py-2.5 first:pt-0 last:pb-0"
              >
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="w-5 shrink-0 text-right font-mono text-xs text-neutral-600">
                    {i + 1}
                  </span>
                  <span className="font-mono text-sm text-neutral-200">
                    {formatRunTime(date, timezone)}
                  </span>
                </div>
                <span className="shrink-0 text-xs text-neutral-500">
                  {formatRelativeRun(date)}
                </span>
              </li>
            ))}
          </ol>
        )}

        <p className={`${toolHintMetaClass} mt-4`}>
          Times use your browser clock
          {timezone === 'UTC' ? ' converted to UTC' : ''}. Day-of-week{' '}
          <span className="font-mono">0</span>/<span className="font-mono">7</span>{' '}
          = Sunday.
        </p>
      </div>
    </ToolLayout>
  )
}

export default CronExpressionBuilder
