'use client'

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolCompactInputClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolInputClass,
  toolIntroTextClass,
  toolLabelClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  toolValueRowClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import {
  TIMESTAMP_UNIT_LABELS,
  TIMESTAMP_UNITS,
  convertTimestampInput,
  describeUnit,
  epochValues,
  nowEpoch,
  relativeTime,
  shiftTimestampInput,
  type TimestampUnit
} from '@/utils/timestamp'
import {
  describeInstant,
  isValidTimeZone,
  listTimeZones,
  localTimeZone
} from '@/utils/timezones'

const HOUR = 60 * 60
const DAY = 24 * HOUR

type ResultRowData = {
  key: string
  label: string
  value: string
  hint?: string
}

function TimestampConverterInner() {
  const [url, setUrl] = useToolUrlState({
    t: str('', { text: true }),
    u: enumParam<TimestampUnit>('auto', TIMESTAMP_UNITS),
    z: str('')
  })

  const input = url.t
  const unit = url.u
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const browserZone = localTimeZone()
  const selectedZone = url.z && isValidTimeZone(url.z) ? url.z : ''
  const zones = useMemo(() => listTimeZones(), [])

  const conversion = useMemo(
    () => (input.trim() ? convertTimestampInput(input, unit) : null),
    [input, unit]
  )

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(key)
  }

  const handleShift = (deltaSeconds: number) => {
    const next = shiftTimestampInput(input, unit, deltaSeconds)
    if (next != null) setUrl((current) => ({ ...current, t: next }))
  }

  const handleClear = () => {
    setUrl((current) => ({ ...current, t: '' }))
  }

  const rows: ResultRowData[] = []
  let unitNote: string | null = null
  let dateNote: string | null = null

  if (conversion?.ok) {
    const { value } = conversion
    const ms = value.date.getTime()
    const values = epochValues(value.nanos)
    const local = describeInstant(ms, browserZone)

    unitNote = describeUnit(value)
    if (value.kind === 'date') {
      dateNote =
        'Date strings without an offset (e.g. 2024-01-01T12:00:00) are read as your local time; add Z or +01:00 to be explicit.'
    }

    rows.push({
      key: 'iso',
      label: 'ISO 8601 (UTC)',
      value: value.date.toISOString()
    })
    rows.push({
      key: 'local',
      label: `Local (${browserZone})`,
      value: local.long,
      hint: `${local.wall} · ${local.offset}`
    })
    if (selectedZone && selectedZone !== browserZone) {
      const zoned = describeInstant(ms, selectedZone)
      rows.push({
        key: 'zone',
        label: selectedZone,
        value: zoned.long,
        hint: `${zoned.wall} · ${zoned.offset}`
      })
    }
    rows.push({
      key: 'utc',
      label: 'UTC string',
      value: value.date.toUTCString()
    })
    rows.push({
      key: 'relative',
      label: 'Relative',
      value: relativeTime(value.date)
    })
    rows.push({ key: 's', label: 'Unix seconds', value: values.s })
    rows.push({ key: 'ms', label: 'Unix milliseconds', value: values.ms })
    rows.push({ key: 'us', label: 'Unix microseconds', value: values.us })
    rows.push({ key: 'ns', label: 'Unix nanoseconds', value: values.ns })
  }

  const disabled = !input.trim()

  return (
    <ToolLayout title="Timestamp Converter">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Enter a Unix timestamp (seconds, milliseconds, microseconds, or
            nanoseconds) or a date string. The unit is detected from the size of
            the number - <code>1700000000</code> is seconds,{' '}
            <code>1700000000000</code> is milliseconds - and you can always
            override it. To compare wall-clock times across cities use the{' '}
            <Link
              href="/t/timezone-converter"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              Timezone Converter
            </Link>
            .
          </p>
        }
      >
        <input
          value={input}
          onChange={(e) =>
            setUrl((current) => ({ ...current, t: e.target.value }))
          }
          spellCheck={false}
          placeholder="e.g. 1700000000, 1700000000000 or 2024-01-01T12:00:00Z"
          className={`${toolInputClass} font-mono`}
          aria-label="Timestamp or date string"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <span className={toolLabelClass}>Unit for numeric input</span>
            <ToolChipRow>
              {TIMESTAMP_UNITS.map((option) => (
                <ToolChipButton
                  key={option}
                  active={unit === option}
                  onClick={() =>
                    setUrl((current) => ({ ...current, u: option }))
                  }
                >
                  {TIMESTAMP_UNIT_LABELS[option]}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>
          <div>
            <label htmlFor="ts-zone" className={toolLabelClass}>
              Also show in time zone
            </label>
            <select
              id="ts-zone"
              value={selectedZone}
              onChange={(e) =>
                setUrl((current) => ({ ...current, z: e.target.value }))
              }
              className={toolCompactInputClass}
            >
              <option value="">Browser local only ({browserZone})</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={toolToolbarBetweenClass}>
          <ToolChipRow>
            <ToolChipButton
              active
              tone="accent"
              onClick={() =>
                setUrl((current) => ({ ...current, t: nowEpoch(current.u) }))
              }
            >
              Now
            </ToolChipButton>
            <ToolChipButton
              active
              tone="accent"
              disabled={disabled}
              onClick={() => handleShift(-DAY)}
            >
              -1 day
            </ToolChipButton>
            <ToolChipButton
              active
              tone="accent"
              disabled={disabled}
              onClick={() => handleShift(-HOUR)}
            >
              -1 hour
            </ToolChipButton>
            <ToolChipButton
              active
              tone="accent"
              disabled={disabled}
              onClick={() => handleShift(HOUR)}
            >
              +1 hour
            </ToolChipButton>
            <ToolChipButton
              active
              tone="accent"
              disabled={disabled}
              onClick={() => handleShift(DAY)}
            >
              +1 day
            </ToolChipButton>
          </ToolChipRow>

          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Result</h2>

        {conversion && !conversion.ok ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {conversion.error}
          </div>
        ) : rows.length > 0 ? (
          <div className="space-y-3 text-sm">
            {unitNote ? <p className={toolHintMetaClass}>{unitNote}</p> : null}
            {dateNote ? <p className={toolHintMetaClass}>{dateNote}</p> : null}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {rows.map((row) => (
                <ResultRow
                  key={row.key}
                  copyKey={row.key}
                  label={row.label}
                  value={row.value}
                  hint={row.hint}
                  onCopy={handleCopy}
                  copied={copied === row.key}
                />
              ))}
            </div>
          </div>
        ) : (
          <p className={toolEmptyHintClass}>
            Converted values will appear here.
          </p>
        )}
      </div>
    </ToolLayout>
  )
}

type ResultRowProps = {
  copyKey: string
  label: string
  value: string
  hint?: string
  onCopy: (key: string, text: string) => void
  copied: boolean
}

const ResultRow = ({
  copyKey,
  label,
  value,
  hint,
  onCopy,
  copied
}: ResultRowProps) => (
  <div className={toolValueRowClass}>
    <div className="min-w-0 flex-1">
      <span className="font-medium text-white">{label}: </span>
      <span className="break-all text-neutral-300">{value}</span>
      {hint ? (
        <span className="mt-0.5 block font-mono text-xs text-neutral-500">
          {hint}
        </span>
      ) : null}
    </div>
    <ToolCopyButton copied={copied} onClick={() => onCopy(copyKey, value)} />
  </div>
)

export default function TimestampConverter() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Timestamp Converter">
          <p className={toolEmptyHintClass}>Loading…</p>
        </ToolLayout>
      }
    >
      <TimestampConverterInner />
    </Suspense>
  )
}
