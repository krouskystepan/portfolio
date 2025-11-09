'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { ColorFormats, parseColor } from '@/utils/colorUtils'
import { useState } from 'react'

const ColorConverter = () => {
  const [input, setInput] = useState('')
  const [converted, setConverted] = useState<ColorFormats>({})
  const [error, setError] = useState<string | null>(null)

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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    // toast.success(`${label} copied to clipboard!`)
  }

  return (
    <div>
      <h2 className="mb-8 text-center text-4xl font-bold lg:text-5xl">
        Color Converter
      </h2>
      <div className="mb-8 flex flex-col rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-5 backdrop-blur-sm">
        <h2 className="mb-2 text-lg font-semibold text-neutral-100">
          Enter any color (HEX, RGB, RGBA, HSL, HSLA, HWB, LAB, LCH, or name)
        </h2>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your color here..."
          className="rounded-lg bg-neutral-900 p-3 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-custom_blue"
        />

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleConvert}
            disabled={!input.trim()}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              !input.trim()
                ? 'cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-60'
                : 'bg-custom_blue text-white hover:opacity-90'
            }`}
          >
            Convert
          </button>

          <button
            onClick={handleClear}
            className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 text-neutral-100 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Result</h2>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <strong>Error:</strong> {error}
          </div>
        ) : Object.keys(converted).length > 0 ? (
          <div className="space-y-3 text-sm">
            <div
              className="mt-6 h-20 w-full rounded-xl border border-white/20 shadow-inner"
              style={{
                backgroundColor:
                  converted.RGBA ??
                  converted.RGB ??
                  converted.HEX ??
                  converted.HSL ??
                  'transparent',
              }}
            />

            <div className="grid grid-cols-2 gap-3">
              {Object.entries(converted).map(([label, val]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-neutral-900/40 p-2"
                >
                  <div className="flex-1 truncate">
                    <span className="font-medium text-white">{label}:</span>{' '}
                    <span className="text-neutral-300">{val}</span>
                  </div>
                  <button
                    onClick={() => handleCopy(val, label)}
                    className="rounded-md bg-neutral-800 px-2 py-1 text-xs font-medium text-neutral-100 transition hover:bg-neutral-700 active:scale-95"
                  >
                    Copy
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-sm text-neutral-400">
            Converted values will appear here.
          </div>
        )}
      </div>
    </div>
  )
}

export default ColorConverter
