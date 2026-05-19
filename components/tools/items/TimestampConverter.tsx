'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useState } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolAccentButtonClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolInputClass,
  toolPanelClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolSoftButtonClass,
  toolToolbarBetweenClass,
  toolValueRowClass,
  ToolCopyButton
} from '@/components/tools/_shared/toolUi'

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
          timestamp: ts
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
          timestamp: ts
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
      <div className={toolPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>
          Enter a Unix timestamp or a date string
        </h2>

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. 1700000000 or 2024-01-01T12:00:00"
          className={toolInputClass}
        />

        <div className={toolToolbarBetweenClass}>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                const now = Math.floor(Date.now() / 1000)
                setInput(String(now))
              }}
              className={toolSoftButtonClass}
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => handleAddTime(60 * 60)}
              disabled={!input.trim()}
              className={toolAccentButtonClass}
            >
              +1 hour
            </button>
            <button
              type="button"
              onClick={() => handleAddTime(60 * 60 * 24)}
              disabled={!input.trim()}
              className={toolAccentButtonClass}
            >
              +1 day
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={handleConvert} disabled={!input.trim()}>
              Convert
            </PrimaryButton>

            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
      </div>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Result</h2>

        {error ? (
          <div className={toolErrorBoxClass}>
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
          <p className={toolEmptyHintClass}>Converted values will appear here.</p>
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
  <div className={toolValueRowClass}>
    <div className="min-w-0 flex-1">
      <span className="font-medium text-white">{label}: </span>
      <span className="break-all text-neutral-300">{value}</span>
    </div>
    <ToolCopyButton copied={copied} onClick={() => onCopy(index, value)} />
  </div>
)

export default TimestampConverter
