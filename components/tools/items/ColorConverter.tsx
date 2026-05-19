'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { ColorFormats, parseColor } from '@/utils/colorUtils'
import { useState } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolInputClass,
  toolPanelClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolValueRowClass,
  ToolCopyButton
} from '@/components/tools/_shared/toolUi'

const ColorConverter = () => {
  const [input, setInput] = useState('')
  const [converted, setConverted] = useState<ColorFormats>({})
  const [error, setError] = useState<string | null>(null)
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})

  const { unlockAchievement } = useAchievementContext()

  const handleConvert = () => {
    if (!input.trim()) return
    const result = parseColor(input)
    if (result) {
      setConverted(result)
      setError(null)
    } else {
      setConverted({})
      setError('Unsupported color format.')
    }
  }

  const handleClear = () => {
    setInput('')
    setConverted({})
    setError(null)
  }

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')

    setCopiedStates((prev) => ({ ...prev, [label]: true }))
    setTimeout(() => {
      setCopiedStates((prev) => ({ ...prev, [label]: false }))
    }, 1500)
  }

  return (
    <ToolLayout title="Color Converter">
      <div className={toolPanelClass}>
        <h2 className={`mb-3 text-base leading-snug sm:text-lg ${toolSectionTitleClass}`}>
          Enter any color (HEX, RGB, RGBA, HSL, HSLA, HWB, LAB, LCH, or name)
        </h2>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your color here..."
          className={toolInputClass}
        />

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <PrimaryButton onClick={handleConvert} disabled={!input.trim()}>
            Convert
          </PrimaryButton>

          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </div>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Result</h2>

        {error ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {error}
          </div>
        ) : Object.keys(converted).length > 0 ? (
          <div className="space-y-3 text-sm">
            <div
              className="h-20 w-full rounded-xl border border-white/20 shadow-inner"
              style={{
                backgroundColor:
                  converted.RGBA ??
                  converted.RGB ??
                  converted.HEX ??
                  converted.HSL ??
                  'transparent'
              }}
            />

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(converted).map(([label, val]) => (
                <div key={label} className={toolValueRowClass}>
                  <div className="min-w-0 flex-1 text-xs leading-snug sm:text-sm">
                    <span className="font-medium text-white">{label}:</span>{' '}
                    <span className="break-all text-neutral-300">{val}</span>
                  </div>
                  <ToolCopyButton
                    copied={Boolean(copiedStates[label])}
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

export default ColorConverter
