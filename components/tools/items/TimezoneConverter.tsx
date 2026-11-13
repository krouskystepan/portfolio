'use client'

import Link from 'next/link'
import { Suspense, useMemo } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  RemoveButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCompactInputClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolLabelClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolValueRowClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { csv, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import {
  calendarDayDiff,
  describeInstant,
  formatOffset,
  instantToWall,
  isValidTimeZone,
  listTimeZones,
  localTimeZone,
  parseDateTimeLocal,
  toDateTimeLocalValue,
  wallToInstant,
  zoneOffsetMs,
  type WallResolution
} from '@/utils/timezones'

const DEFAULT_TARGETS = [
  'UTC',
  'America/New_York',
  'Europe/London',
  'Asia/Tokyo'
]
const MAX_TARGETS = 12

const QUICK_ZONES: readonly string[] = [
  'UTC',
  'America/Los_Angeles',
  'America/New_York',
  'Europe/London',
  'Europe/Berlin',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney'
]

const RESOLUTION_NOTES: Record<Exclude<WallResolution, 'ok'>, string> = {
  gap: 'This wall-clock time does not exist in the source zone (DST spring-forward). It was moved forward by the length of the gap.',
  ambiguous:
    'This wall-clock time happens twice in the source zone (DST fall-back). The earlier occurrence is used.'
}

function TimezoneConverterInner() {
  const [url, setUrl] = useToolUrlState({
    dt: str(''),
    from: str(''),
    to: csv(DEFAULT_TARGETS)
  })
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const browserZone = localTimeZone()
  const zones = useMemo(() => listTimeZones(), [])
  const fromZone =
    url.from && isValidTimeZone(url.from) ? url.from : browserZone
  const targets = useMemo(
    () => url.to.filter((zone) => isValidTimeZone(zone)),
    [url.to]
  )

  const source = useMemo(() => {
    if (!url.dt) return null
    const wall = parseDateTimeLocal(url.dt)
    if (!wall)
      return { ok: false as const, error: 'Enter a valid date and time.' }
    const { ms, resolution } = wallToInstant(wall, fromZone)
    return { ok: true as const, ms, resolution, wall }
  }, [url.dt, fromZone])

  const handleNow = () => {
    const wall = instantToWall(Date.now(), fromZone)
    setUrl((current) => ({ ...current, dt: toDateTimeLocalValue(wall) }))
  }

  const handleFromChange = (zone: string) => {
    // Keep the same instant when the source zone changes.
    setUrl((current) => {
      const nextFrom = zone && isValidTimeZone(zone) ? zone : browserZone
      const wall = current.dt ? parseDateTimeLocal(current.dt) : null
      if (!wall) return { ...current, from: zone }
      const prevFrom =
        current.from && isValidTimeZone(current.from)
          ? current.from
          : browserZone
      const { ms } = wallToInstant(wall, prevFrom)
      return {
        ...current,
        from: zone,
        dt: toDateTimeLocalValue(instantToWall(ms, nextFrom))
      }
    })
  }

  const addTarget = (zone: string) => {
    if (!zone || !isValidTimeZone(zone)) return
    setUrl((current) =>
      current.to.includes(zone) || current.to.length >= MAX_TARGETS
        ? current
        : { ...current, to: [...current.to, zone] }
    )
  }

  const removeTarget = (zone: string) => {
    setUrl((current) => ({
      ...current,
      to: current.to.filter((z) => z !== zone)
    }))
  }

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(key)
  }

  const sourceDisplay =
    source?.ok === true ? describeInstant(source.ms, fromZone) : null

  return (
    <ToolLayout title="Timezone Converter">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Pick a date and time in one zone and see it in others, with the UTC
            offset and zone abbreviation at that instant - so daylight saving
            rules are applied for the date you choose, not today&apos;s. Uses
            your browser&apos;s built-in <code>Intl</code> time zone database;
            nothing leaves your device. For raw epoch values see the{' '}
            <Link
              href="/t/timestamp-converter"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              Timestamp Converter
            </Link>
            .
          </p>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="tz-dt" className={toolLabelClass}>
              Date &amp; time
            </label>
            <input
              id="tz-dt"
              type="datetime-local"
              step={1}
              value={url.dt}
              onChange={(e) =>
                setUrl((current) => ({ ...current, dt: e.target.value }))
              }
              className={`${toolCompactInputClass} !h-9`}
            />
          </div>
          <div>
            <label htmlFor="tz-from" className={toolLabelClass}>
              From time zone
            </label>
            <select
              id="tz-from"
              value={url.from && isValidTimeZone(url.from) ? url.from : ''}
              onChange={(e) => handleFromChange(e.target.value)}
              className={`${toolCompactInputClass} !h-9`}
            >
              <option value="">Browser local ({browserZone})</option>
              {zones.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <ToolChipRow>
            <ToolChipButton active tone="accent" onClick={handleNow}>
              Now
            </ToolChipButton>
          </ToolChipRow>
          <ClearButton
            onClick={() => setUrl((current) => ({ ...current, dt: '' }))}
          >
            Clear
          </ClearButton>
        </div>

        <div className="mt-4">
          <span className={toolLabelClass}>Convert to</span>
          <ToolChipRow>
            {QUICK_ZONES.map((zone) => (
              <ToolChipButton
                key={zone}
                active={targets.includes(zone)}
                onClick={() =>
                  targets.includes(zone) ? removeTarget(zone) : addTarget(zone)
                }
              >
                {zone === 'UTC'
                  ? 'UTC'
                  : zone.split('/').pop()?.replace(/_/g, ' ')}
              </ToolChipButton>
            ))}
          </ToolChipRow>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              aria-label="Add a time zone"
              value=""
              onChange={(e) => addTarget(e.target.value)}
              disabled={targets.length >= MAX_TARGETS}
              className={`${toolCompactInputClass} max-w-xs`}
            >
              <option value="">Add time zone…</option>
              {zones
                .filter((zone) => !targets.includes(zone))
                .map((zone) => (
                  <option key={zone} value={zone}>
                    {zone}
                  </option>
                ))}
            </select>
            <p className={toolHintMetaClass}>
              {targets.length}/{MAX_TARGETS} zones
            </p>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Result</h2>

        {source && !source.ok ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {source.error}
          </div>
        ) : source?.ok && sourceDisplay ? (
          <div className="space-y-3">
            <p className={toolHintMetaClass}>
              {fromZone}: {sourceDisplay.wall} ({sourceDisplay.offset}) · UTC{' '}
              {new Date(source.ms).toISOString()}
            </p>
            {source.resolution !== 'ok' ? (
              <p className="text-xs text-amber-300/90">
                {RESOLUTION_NOTES[source.resolution]}
              </p>
            ) : null}

            {targets.length === 0 ? (
              <p className={toolEmptyHintClass}>
                Add at least one target time zone.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                {targets.map((zone) => {
                  const display = describeInstant(source.ms, zone)
                  const dayDiff = calendarDayDiff(
                    sourceDisplay.wallDate,
                    display.wallDate
                  )
                  const sameOffset =
                    zoneOffsetMs(source.ms, zone) ===
                    zoneOffsetMs(source.ms, fromZone)
                  const copyText = `${display.wall} ${formatOffset(
                    zoneOffsetMs(source.ms, zone)
                  )}`
                  return (
                    <li key={zone} className={toolValueRowClass}>
                      <div className="min-w-0 flex-1">
                        <span className="block text-xs text-neutral-500">
                          {zone} · {display.abbreviation} · {display.offset}
                        </span>
                        <span className="break-all font-mono text-neutral-100">
                          {display.wall}
                        </span>
                        <span className="block text-xs text-neutral-400">
                          {display.long}
                          {dayDiff !== 0
                            ? ` · ${dayDiff > 0 ? '+' : ''}${dayDiff} day${Math.abs(dayDiff) === 1 ? '' : 's'}`
                            : ''}
                          {sameOffset && zone !== fromZone
                            ? ' · same offset as source'
                            : ''}
                        </span>
                      </div>
                      <div className="flex shrink-0 flex-col gap-1">
                        <ToolCopyButton
                          copied={copied === zone}
                          onClick={() => handleCopy(zone, copyText)}
                        />
                        <RemoveButton
                          onClick={() => removeTarget(zone)}
                          aria-label={`Remove ${zone}`}
                        >
                          Remove
                        </RemoveButton>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        ) : (
          <p className={toolEmptyHintClass}>
            Pick a date and time (or press Now) to convert it.
          </p>
        )}
      </div>
    </ToolLayout>
  )
}

export default function TimezoneConverter() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Timezone Converter">
          <p className={toolEmptyHintClass}>Loading…</p>
        </ToolLayout>
      }
    >
      <TimezoneConverterInner />
    </Suspense>
  )
}
