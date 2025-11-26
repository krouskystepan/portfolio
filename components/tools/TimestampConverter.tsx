'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useState } from 'react'
import ToolLayout from './ToolLayout'

type TimestampResult = {
  readable?: string
  timestamp?: number
}

const TimestampConverter = () => {
  const [input, setInput] = useState<string>('')
  const [result, setResult] = useState<TimestampResult>({})
  const [error, setError] = useState<string | null>(null)
  const [copiedStates, setCopiedStates] = useState<boolean[]>([])

  const { unlockAchievement } = useAchievementContext()

  const handleConvert = () => {
    setError(null)
    setResult({})
    setCopiedStates([])

    const value = input.trim()

    if (!value) {
      setError('Input cannot be empty.')
      return
    }

    const isNumeric = /^\d+$/.test(value)

    try {
      if (isNumeric) {
        const ts = parseInt(value, 10)
        const date = new Date(ts * 1000)

        if (isNaN(date.getTime())) {
          setError('Invalid timestamp.')
          return
        }

        setResult({
          readable: date.toISOString(),
          timestamp: ts,
        })
      } else {
        const date = new Date(value)

        if (isNaN(date.getTime())) {
          setError('Invalid date format.')
          return
        }

        const ts = Math.floor(date.getTime() / 1000)

        setResult({
          readable: date.toISOString(),
          timestamp: ts,
        })
      }

      // initialize copied states for 2 rows
      setCopiedStates([false, false])
    } catch {
      setError('Unable to convert this input.')
    }
  }

  const handleClear = () => {
    setInput('')
    setResult({})
    setError(null)
    setCopiedStates([])
  }

  const handleCopy = (index: number, text: string) => {
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')

    setCopiedStates((prev) => {
      const updated = [...prev]
      updated[index] = true
      return updated
    })

    setTimeout(() => {
      setCopiedStates((prev) => {
        const updated = [...prev]
        updated[index] = false
        return updated
      })
    }, 1500)
  }

  const handleAddTime = (time: number) => {
    if (!input.trim()) return

    const value = input.trim()
    const isNumeric = /^\d+$/.test(value)

    try {
      if (isNumeric) {
        const ts = parseInt(value, 10)
        const date = new Date(ts * 1000)
        date.setTime(date.getTime() + time * 1000)
        setInput(String(Math.floor(date.getTime() / 1000)))
      } else {
        const date = new Date(value)
        date.setTime(date.getTime() + time * 1000)
        setInput(date.toISOString())
      }
    } catch {}
  }

  return (
    <ToolLayout title="Timestamp Converter">
      <div className="mb-8 flex flex-col rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm">
        <h2 className="mb-2 text-lg font-semibold text-neutral-100">
          Enter a Unix timestamp or a date string
        </h2>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 1700000000 or 2024-01-01T12:00:00"
          className="rounded-lg bg-neutral-900 p-3 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-custom_blue"
        />

        <div className="mt-4 flex flex-wrap justify-between gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => {
                const now = Math.floor(Date.now() / 1000)
                setInput(String(now))
              }}
              className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700"
            >
              Now
            </button>
            <button
              onClick={() => handleAddTime(60 * 60)} // +1 hour
              disabled={!input.trim()}
              className={`rounded-lg bg-amber-600/90 px-4 py-2 text-sm font-medium text-white transition ${
                !input.trim()
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:bg-amber-500'
              }`}
            >
              +1 hour
            </button>
            <button
              onClick={() => handleAddTime(60 * 60 * 24)} // +1 day
              disabled={!input.trim()}
              className={`rounded-lg bg-amber-600/90 px-4 py-2 text-sm font-medium text-white transition ${
                !input.trim()
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:bg-amber-500'
              }`}
            >
              +1 day
            </button>
          </div>

          <div className="flex gap-3">
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
              className="rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:bg-red-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 text-neutral-100 backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold text-white">Result</h2>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
            <strong>Error:</strong> {error}
          </div>
        ) : Object.keys(result).length > 0 ? (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <ResultRow
                index={0}
                label="Readable Date (ISO)"
                value={result.readable ?? ''}
                onCopy={handleCopy}
                copied={copiedStates[0] ?? false}
              />
              <ResultRow
                index={1}
                label="Unix Timestamp"
                value={String(result.timestamp ?? '')}
                onCopy={handleCopy}
                copied={copiedStates[1] ?? false}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-neutral-400">
            Converted values will appear here.
          </p>
        )}
      </div>
    </ToolLayout>
  )
}

type ResultRowProps = {
  index: number
  label: string
  value: string
  onCopy: (index: number, text: string) => void
  copied: boolean
}

const ResultRow = ({ index, label, value, onCopy, copied }: ResultRowProps) => (
  <div className="flex items-center justify-between gap-4 rounded-lg border border-white/5 bg-neutral-900/40 p-3">
    <div className="flex-1 truncate">
      <span className="font-medium text-white">{label}: </span>
      <span className="text-neutral-300">{value}</span>
    </div>
    <button
      onClick={() => onCopy(index, value)}
      disabled={copied}
      className={`rounded-md px-2 py-1 text-xs font-medium transition ${
        copied
          ? 'cursor-default bg-neutral-900 text-custom_blue'
          : 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700 active:scale-95'
      }`}
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  </div>
)

export default TimestampConverter
