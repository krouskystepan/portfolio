'use client'

import { Suspense, useMemo, useState } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolInputClass,
  toolIntroTextClass,
  toolLabelClass,
  toolNumberInputClass,
  toolToolbarBetweenClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import {
  MAX_BASE,
  MIN_BASE,
  formatInteger,
  isValidBase,
  parseInteger
} from '@/utils/numberBase'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { csv, str, useToolUrlState } from '@/hooks/useToolUrlState'

type FixedId = 'bin' | 'oct' | 'dec' | 'hex'
type FieldId = FixedId | string

const FIXED_FIELDS: {
  id: FixedId
  base: number
  label: string
  placeholder: string
}[] = [
  { id: 'bin', base: 2, label: 'Binary', placeholder: '1010' },
  { id: 'oct', base: 8, label: 'Octal', placeholder: '252' },
  { id: 'dec', base: 10, label: 'Decimal', placeholder: '170' },
  { id: 'hex', base: 16, label: 'Hex', placeholder: 'aa' }
]

const FIXED_ID_SET = new Set<string>(FIXED_FIELDS.map((f) => f.id))

type ExtraRow = { id: string; base: number }

let extraSeq = 0
function nextExtraId() {
  extraSeq += 1
  return `extra-${extraSeq}`
}

function suggestBase(extras: ExtraRow[]): number {
  const used = new Set([
    ...FIXED_FIELDS.map((f) => f.base),
    ...extras.map((r) => r.base)
  ])
  for (const candidate of [3, 4, 5, 6, 7, 9, 12, 32, 36]) {
    if (!used.has(candidate)) return candidate
  }
  for (let b = MIN_BASE; b <= MAX_BASE; b++) {
    if (!used.has(b)) return b
  }
  return 36
}

function parseExtraBases(raw: string[]): ExtraRow[] {
  return raw
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isFinite(n))
    .map((base) => ({ id: nextExtraId(), base }))
}

function resolveActiveId(id: string, extras: ExtraRow[]): FieldId {
  if (FIXED_ID_SET.has(id)) return id as FixedId
  const base = Number.parseInt(id, 10)
  if (Number.isFinite(base)) {
    const match = extras.find((e) => e.base === base)
    if (match) return match.id
  }
  return 'dec'
}

/** Sync key for URL: fixed field id, or base number when an extra is active. */
function syncActiveId(id: FieldId, extras: ExtraRow[]): string {
  if (FIXED_ID_SET.has(id)) return id
  const row = extras.find((r) => r.id === id)
  return row ? String(row.base) : 'dec'
}

function extrasToCsv(extras: ExtraRow[]): string[] {
  return extras.map((r) => String(r.base))
}

function resolveBaseFrom(id: FieldId, extras: ExtraRow[]): number {
  const fixed = FIXED_FIELDS.find((f) => f.id === id)
  if (fixed) return fixed.base
  return extras.find((r) => r.id === id)?.base ?? 10
}

function hydrateNumberBase(url: {
  v: string
  id: string
  extra: string[]
}): {
  extras: ExtraRow[]
  activeId: FieldId
  activeText: string
  lastGood: bigint | null
} {
  const extras = parseExtraBases(url.extra)
  const activeId = resolveActiveId(url.id, extras)
  const base = resolveBaseFrom(activeId, extras)
  let lastGood: bigint | null = null
  if (url.v.trim() && isValidBase(base)) {
    const result = parseInteger(url.v, base)
    if (result.ok) lastGood = result.value
  }
  return { extras, activeId, activeText: url.v, lastGood }
}

function NumberBaseConverterInner() {
  const [url, setUrl] = useToolUrlState({
    v: str('', { text: true }),
    id: str('dec'),
    extra: csv([])
  })

  const [boot] = useState(() => hydrateNumberBase(url))
  const [extras, setExtras] = useState<ExtraRow[]>(boot.extras)
  const [activeId, setActiveId] = useState<FieldId>(boot.activeId)
  const [activeText, setActiveText] = useState(boot.activeText)
  const [lastGood, setLastGood] = useState<bigint | null>(boot.lastGood)
  const { copied, flash } = useCopyFeedback()

  const { unlockAchievement } = useAchievementContext()

  const resolveBase = (id: FieldId): number => resolveBaseFrom(id, extras)

  const activeBase = resolveBase(activeId)

  const syncUrl = (
    next: Partial<{ v: string; id: FieldId; extras: ExtraRow[] }>
  ) => {
    const nextExtras = next.extras ?? extras
    const nextId = next.id ?? activeId
    const nextV = next.v ?? activeText
    setUrl({
      v: nextV,
      id: syncActiveId(nextId, nextExtras),
      extra: extrasToCsv(nextExtras)
    })
  }

  const parsed = useMemo(() => {
    if (!activeText.trim()) return null
    if (!isValidBase(activeBase)) {
      return {
        ok: false as const,
        error: `Base must be ${MIN_BASE}-${MAX_BASE}.`
      }
    }
    return parseInteger(activeText, activeBase)
  }, [activeText, activeBase])

  const error =
    activeText.trim() && parsed && !parsed.ok ? parsed.error : null

  const displayValue = (id: FieldId, base: number) => {
    if (id === activeId) return activeText
    if (lastGood === null || !isValidBase(base)) return ''
    return formatInteger(lastGood, base, {
      group: base === 2 || base === 16
    })
  }

  const applyInput = (id: FieldId, base: number, text: string) => {
    setActiveId(id)
    setActiveText(text)
    syncUrl({ id, v: text })

    if (!text.trim()) {
      setLastGood(null)
      return
    }
    if (!isValidBase(base)) return

    const result = parseInteger(text, base)
    if (result.ok) setLastGood(result.value)
  }

  const setExtraBase = (id: string, raw: string) => {
    const next = Number.parseInt(raw, 10)
    const base = Number.isFinite(next) ? next : 0
    const nextExtras = extras.map((r) => (r.id === id ? { ...r, base } : r))
    setExtras(nextExtras)
    syncUrl({
      extras: nextExtras,
      id: activeId === id ? id : activeId
    })

    if (activeId !== id || !activeText.trim()) return
    if (!isValidBase(base)) return

    const result = parseInteger(activeText, base)
    if (result.ok) setLastGood(result.value)
  }

  const addBase = () => {
    const nextExtras = [
      ...extras,
      { id: nextExtraId(), base: suggestBase(extras) }
    ]
    setExtras(nextExtras)
    syncUrl({ extras: nextExtras })
  }

  const removeExtra = (id: string) => {
    const nextExtras = extras.filter((r) => r.id !== id)
    setExtras(nextExtras)
    if (activeId !== id) {
      syncUrl({ extras: nextExtras })
      return
    }

    setActiveId('dec')
    if (lastGood !== null) {
      const text = formatInteger(lastGood, 10)
      setActiveText(text)
      syncUrl({ extras: nextExtras, id: 'dec', v: text })
    } else {
      setActiveText('')
      syncUrl({ extras: nextExtras, id: 'dec', v: '' })
    }
  }

  const handleClear = () => {
    setActiveId('dec')
    setActiveText('')
    setLastGood(null)
    setExtras([])
    setUrl({ v: '', id: 'dec', extra: [] })
  }

  const copyRaw = (id: FieldId, base: number) => {
    if (!isValidBase(base)) return ''
    if (id === activeId) {
      return parsed?.ok ? formatInteger(parsed.value, base) : ''
    }
    return lastGood !== null ? formatInteger(lastGood, base) : ''
  }

  const handleCopy = async (id: FieldId, base: number) => {
    const raw = copyRaw(id, base)
    if (!raw) return
    await navigator.clipboard.writeText(raw)
    unlockAchievement('clipboard-master')
    flash(id)
  }

  const canCopy = (id: FieldId, base: number) => {
    if (!isValidBase(base)) return false
    if (id === activeId) return Boolean(parsed?.ok)
    return lastGood !== null
  }

  const renderFixedField = (
    id: FixedId,
    base: number,
    label: string,
    placeholder: string
  ) => (
    <div key={id}>
      <div className="mb-2 flex items-center justify-between gap-3">
        <label className={`${toolLabelClass} mb-0`} htmlFor={`nb-${id}`}>
          {label}{' '}
          <span className="font-normal text-neutral-500">(base {base})</span>
        </label>
        <ToolCopyButton
          copied={copied === id}
          onClick={() => handleCopy(id, base)}
          disabled={!canCopy(id, base)}
        />
      </div>
      <input
        id={`nb-${id}`}
        value={displayValue(id, base)}
        onChange={(e) => applyInput(id, base, e.target.value)}
        placeholder={placeholder}
        spellCheck={false}
        autoComplete="off"
        className={`${toolInputClass} font-mono`}
      />
      {activeId === id && error ? (
        <div className={`${toolErrorBoxClass} mt-2 p-2 text-xs`}>{error}</div>
      ) : null}
    </div>
  )

  const renderExtraField = (row: ExtraRow) => {
    const baseOk = isValidBase(row.base)
    return (
      <div key={row.id}>
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            className={`${toolLabelClass} mb-0 flex items-center gap-2`}
            htmlFor={`nb-${row.id}`}
          >
            Base
            <input
              type="number"
              min={MIN_BASE}
              max={MAX_BASE}
              value={row.base || ''}
              onChange={(e) => setExtraBase(row.id, e.target.value)}
              onClick={(e) => e.stopPropagation()}
              aria-label="Custom base"
              className={`${toolNumberInputClass} max-w-[4.5rem] font-mono`}
            />
          </label>
          <div className="flex items-center gap-2">
            <ToolCopyButton
              copied={copied === row.id}
              onClick={() => handleCopy(row.id, row.base)}
              disabled={!canCopy(row.id, row.base)}
            />
            <button
              type="button"
              onClick={() => removeExtra(row.id)}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition hover:bg-neutral-800 hover:text-neutral-100"
            >
              Remove
            </button>
          </div>
        </div>
        <input
          id={`nb-${row.id}`}
          value={displayValue(row.id, row.base)}
          onChange={(e) => applyInput(row.id, row.base, e.target.value)}
          placeholder={
            baseOk ? `value in base ${row.base}` : `${MIN_BASE}-${MAX_BASE}`
          }
          spellCheck={false}
          autoComplete="off"
          disabled={!baseOk}
          className={`${toolInputClass} font-mono disabled:cursor-not-allowed disabled:opacity-50`}
        />
        {activeId === row.id && error ? (
          <div className={`${toolErrorBoxClass} mt-2 p-2 text-xs`}>{error}</div>
        ) : null}
      </div>
    )
  }

  return (
    <ToolLayout title="Number base converter">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Type a number in any field. The other bases update automatically.
            Add extra bases ({MIN_BASE}-{MAX_BASE}) if you need them.
          </p>
        }
      >
        <div className="space-y-4">
          {FIXED_FIELDS.map((field) =>
            renderFixedField(
              field.id,
              field.base,
              field.label,
              field.placeholder
            )
          )}
          {extras.map((row) => renderExtraField(row))}
        </div>

        <div className={toolToolbarBetweenClass}>
          <SecondaryButton onClick={addBase}>Add base</SecondaryButton>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>
    </ToolLayout>
  )
}

export default function NumberBaseConverter() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Number base converter">
          <p className={toolEmptyHintClass}>Loading…</p>
        </ToolLayout>
      }
    >
      <NumberBaseConverterInner />
    </Suspense>
  )
}
