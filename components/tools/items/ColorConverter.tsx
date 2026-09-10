'use client'

import { Suspense, useEffect, useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import { ColorFormats, parseColor } from '@/utils/colorUtils'
import { HexAlphaColorPicker } from 'react-colorful'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton,
} from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolInputClass,
  toolIntroTextClass,
  toolPickerShellClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolValueRowClass,
  ToolCopyButton,
  ToolInputPanel,
} from '@/components/tools/_shared/toolUi'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'

/** Keep overrides light so the 2D spectrum stays a square, not a thin bar. */
const pickerShellClass =
  `${toolPickerShellClass} ` +
  '[&_.react-colorful__alpha]:!mt-3 [&_.react-colorful__alpha]:!h-3 [&_.react-colorful__alpha]:!rounded-lg ' +
  '[&_.react-colorful__alpha-pointer]:!h-3.5 [&_.react-colorful__alpha-pointer]:!w-3.5'

const previewCheckerClass =
  'h-14 w-full overflow-hidden rounded-xl ' +
  'bg-[length:12px_12px] ' +
  'bg-[position:0_0,0_6px,6px_-6px,-6px_0] ' +
  'bg-[linear-gradient(45deg,#2a2a2a_25%,transparent_25%),linear-gradient(-45deg,#2a2a2a_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#2a2a2a_75%),linear-gradient(-45deg,transparent_75%,#2a2a2a_75%)] ' +
  'bg-neutral-800'

const toHexAlpha = (converted: ColorFormats) => {
  const hex = (converted.HEX ?? '#000000').toLowerCase()
  const alpha = converted.Alpha != null ? Number.parseFloat(converted.Alpha) : 1
  const aa = Math.round(Math.min(1, Math.max(0, alpha)) * 255)
    .toString(16)
    .padStart(2, '0')
  return `${hex}${aa}`
}

const normalizePickerValue = (value: string) => {
  if (/^#[0-9a-f]{8}$/i.test(value)) {
    const r = Number.parseInt(value.slice(1, 3), 16)
    const g = Number.parseInt(value.slice(3, 5), 16)
    const b = Number.parseInt(value.slice(5, 7), 16)
    const a =
      Math.round((Number.parseInt(value.slice(7, 9), 16) / 255) * 1000) / 1000
    // Fully opaque → plain hex (no alpha in formats)
    if (a >= 1) return value.slice(0, 7)
    return `rgba(${r}, ${g}, ${b}, ${a})`
  }
  return value
}

function ColorConverterInner() {
  const [url, setUrl] = useToolUrlState({
    color: str('', { text: true }),
  })

  const input = url.color
  const [converted, setConverted] = useState<ColorFormats>({})
  const [error, setError] = useState<string | null>(null)
  const { copied, flash } = useCopyFeedback()

  const { unlockAchievement } = useAchievementContext()

  const runConvert = (value: string) => {
    if (!value.trim()) return
    const result = parseColor(value)
    if (result) {
      setConverted(result)
      setError(null)
    } else {
      setConverted({})
      setError('Unsupported color format.')
    }
  }

  useEffect(() => {
    if (input.trim()) runConvert(input)
    // Hydrate preview once from URL on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConvert = () => {
    runConvert(input)
  }

  const handleClear = () => {
    setUrl({ color: '' })
    setConverted({})
    setError(null)
  }

  const handlePickerChange = (value: string) => {
    const normalized = normalizePickerValue(value)
    setUrl({ color: normalized })
    const result = parseColor(normalized)
    if (result) {
      setConverted(result)
      setError(null)
    }
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(label)
  }

  const showPicker = Object.keys(converted).length > 0
  const previewColor =
    converted.RGBA ?? converted.RGB ?? converted.HEX ?? 'transparent'

  return (
    <ToolLayout title="Color picker & converter">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Pick a color below, or enter HEX, RGB, RGBA, HSL, HSLA, HWB, LAB,
            LCH, or a name
          </p>
        }
      >
        <input
          value={input}
          onChange={(e) => setUrl({ color: e.target.value })}
          placeholder="Enter your color here..."
          className={toolInputClass}
        />

        <div className="mt-4 flex flex-col gap-1.5 sm:flex-row sm:flex-wrap sm:justify-end">
          <PrimaryButton onClick={handleConvert} disabled={!input.trim()}>
            Convert
          </PrimaryButton>

          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Result</h2>

        {error ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {error}
          </div>
        ) : showPicker ? (
          <div className="space-y-3 text-sm">
            <div className={pickerShellClass}>
              <HexAlphaColorPicker
                color={toHexAlpha(converted)}
                onChange={handlePickerChange}
              />
            </div>

            <div className={previewCheckerClass} title={previewColor}>
              <div
                className="h-full w-full"
                style={{ backgroundColor: previewColor }}
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(converted).map(([label, val]) => (
                <div key={label} className={toolValueRowClass}>
                  <div className="min-w-0 flex-1 text-xs leading-snug sm:text-sm">
                    <span className="font-medium text-white">{label}:</span>{' '}
                    <span className="break-all text-neutral-300">{val}</span>
                  </div>
                  <ToolCopyButton
                    copied={copied === label}
                    onClick={() => handleCopy(val, label)}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className={toolEmptyHintClass}>
            Converted values will appear here.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default function ColorConverter() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Color picker & converter">
          <p className={toolEmptyHintClass}>Loading…</p>
        </ToolLayout>
      }
    >
      <ColorConverterInner />
    </Suspense>
  )
}
