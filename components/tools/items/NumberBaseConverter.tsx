'use client'

import { useMemo, useState } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
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

const NumberBaseConverter = () => {
  const [activeId, setActiveId] = useState<FieldId>('dec')
  const [activeText, setActiveText] = useState('')
  const [lastGood, setLastGood] = useState<bigint | null>(null)
  const [extras, setExtras] = useState<ExtraRow[]>([])
  const [copiedId, setCopiedId] = useState<FieldId | null>(null)

  const { unlockAchievement } = useAchievementContext()

  const resolveBase = (id: FieldId): number => {
    const fixed = FIXED_FIELDS.find((f) => f.id === id)
    if (fixed) return fixed.base
    return extras.find((r) => r.id === id)?.base ?? 10
  }

  const activeBase = resolveBase(activeId)

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
    setExtras((prev) =>
      prev.map((r) => (r.id === id ? { ...r, base } : r))
    )

    if (activeId !== id || !activeText.trim()) return
    if (!isValidBase(base)) return

    const result = parseInteger(activeText, base)
    if (result.ok) setLastGood(result.value)
  }

  const addBase = () => {
    setExtras((prev) => [...prev, { id: nextExtraId(), base: suggestBase(prev) }])
  }

  const removeExtra = (id: string) => {
    setExtras((prev) => prev.filter((r) => r.id !== id))
    if (activeId !== id) return

    setActiveId('dec')
    if (lastGood !== null) {
      setActiveText(formatInteger(lastGood, 10))
    } else {
      setActiveText('')
    }
  }

  const handleClear = () => {
    setActiveId('dec')
    setActiveText('')
    setLastGood(null)
    setExtras([])
    setCopiedId(null)
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
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 1500)
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
          copied={copiedId === id}
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
              copied={copiedId === row.id}
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

export default NumberBaseConverter
