'use client'

import { Suspense, useEffect, useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolInputClass,
  toolIntroTextClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  toolValueRowClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'

type TimestampResult = {
  readable?: string
  timestamp?: number
}

function convertTimestamp(raw: string): {
  result: TimestampResult
  error: string | null
} {
  const value = raw.trim()

  if (!value) {
    return { result: {}, error: 'Input cannot be empty.' }
  }

  const isNumeric = /^\d+$/.test(value)

  try {
    if (isNumeric) {
      const ts = parseInt(value, 10)
      const date = new Date(ts * 1000)

      if (isNaN(date.getTime())) {
        return { result: {}, error: 'Invalid timestamp.' }
      }

      return {
        result: { readable: date.toISOString(), timestamp: ts },
        error: null
      }
    }

    const date = new Date(value)

    if (isNaN(date.getTime())) {
      return { result: {}, error: 'Invalid date format.' }
    }

    const ts = Math.floor(date.getTime() / 1000)

    return {
      result: { readable: date.toISOString(), timestamp: ts },
      error: null
    }
  } catch {
    return { result: {}, error: 'Unable to convert this input.' }
  }
}

function TimestampConverterInner() {
  const [url, setUrl] = useToolUrlState({
    t: str('', { text: true })
  })

  const input = url.t
  const [result, setResult] = useState<TimestampResult>({})
  const [error, setError] = useState<string | null>(null)
  const { copied, flash } = useCopyFeedback()

  const { unlockAchievement } = useAchievementContext()

  const applyConvert = (value: string) => {
    const { result: next, error: nextError } = convertTimestamp(value)
    setResult(next)
    setError(nextError)
  }

  useEffect(() => {
    if (input.trim()) applyConvert(input)
    // Hydrate result once from URL on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConvert = () => {
    applyConvert(input)
  }

  const handleClear = () => {
    setUrl({ t: '' })
    setResult({})
    setError(null)
  }

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(key)
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
        setUrl({ t: String(Math.floor(date.getTime() / 1000)) })
      } else {
        const date = new Date(value)
        date.setTime(date.getTime() + time * 1000)
        setUrl({ t: date.toISOString() })
      }
    } catch {}
  }

  return (
    <ToolLayout title="Timestamp Converter">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Enter a Unix timestamp or a date string and convert between them.
          </p>
        }
      >
        <input
          value={input}
          onChange={(e) => setUrl({ t: e.target.value })}
          placeholder="e.g. 1700000000 or 2024-01-01T12:00:00"
          className={toolInputClass}
        />

        <div className={toolToolbarBetweenClass}>
          <ToolChipRow>
            <ToolChipButton
              active
              tone="accent"
              onClick={() => {
                const now = Math.floor(Date.now() / 1000)
                setUrl({ t: String(now) })
              }}
            >
              Now
            </ToolChipButton>
            <ToolChipButton
              active
              tone="accent"
              disabled={!input.trim()}
              onClick={() => handleAddTime(60 * 60)}
            >
              +1 hour
            </ToolChipButton>
            <ToolChipButton
              active
              tone="accent"
              disabled={!input.trim()}
              onClick={() => handleAddTime(60 * 60 * 24)}
            >
              +1 day
            </ToolChipButton>
          </ToolChipRow>

          <div className="flex flex-wrap gap-1.5">
            <PrimaryButton onClick={handleConvert} disabled={!input.trim()}>
              Convert
            </PrimaryButton>
            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
      </ToolInputPanel>

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
                copyKey="readable"
                label="Readable Date (ISO)"
                value={result.readable ?? ''}
                onCopy={handleCopy}
                copied={copied === 'readable'}
              />
              <ResultRow
                copyKey="timestamp"
                label="Unix Timestamp"
                value={String(result.timestamp ?? '')}
                onCopy={handleCopy}
                copied={copied === 'timestamp'}
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
  copyKey: string
  label: string
  value: string
  onCopy: (key: string, text: string) => void
  copied: boolean
}

const ResultRow = ({ copyKey, label, value, onCopy, copied }: ResultRowProps) => (
  <div className={toolValueRowClass}>
    <div className="min-w-0 flex-1">
      <span className="font-medium text-white">{label}: </span>
      <span className="break-all text-neutral-300">{value}</span>
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
