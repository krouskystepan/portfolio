'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useState, useMemo } from 'react'
import TextAreaWithLineNumbers from '@/components/TextAreaWithLineNumbers'
import ToolLayout from './ToolLayout'

type SortOptions = { addSpacing: boolean }

const AlphabetSorter = () => {
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string[]>([])
  const [options, setOptions] = useState<SortOptions>({ addSpacing: true })
  const [copied, setCopied] = useState<boolean>(false)

  const { unlockAchievement } = useAchievementContext()

  const isDisabled = useMemo(() => input.trim().length === 0, [input])

  const getFirstSegment = (line: string): string => {
    const trimmed = line.trim()
    const dotIndex = trimmed.indexOf('.')
    return dotIndex === -1 ? trimmed : trimmed.slice(0, dotIndex)
  }

  const sortLines = () => {
    if (isDisabled) return

    const rawLines = input
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    const groups: Record<string, string[]> = {}

    for (const line of rawLines) {
      const key = getFirstSegment(line)
      if (!groups[key]) groups[key] = []
      groups[key].push(line)
    }

    const sortedKeys = Object.keys(groups).sort((a, b) => a.localeCompare(b))

    const finalLines: string[] = []

    for (const key of sortedKeys) {
      const sortedGroup = groups[key].sort((a, b) => a.localeCompare(b))
      finalLines.push(...sortedGroup)
      if (options.addSpacing) finalLines.push('')
    }

    const cleaned = options.addSpacing
      ? finalLines.join('\n').trim().split('\n')
      : finalLines

    setOutput(cleaned)
  }

  const clearAll = () => {
    setInput('')
    setOutput([])
  }

  const toggle = (key: keyof SortOptions) =>
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))

  const copyAll = () => {
    if (output.length === 0) return
    navigator.clipboard.writeText(output.join('\n'))
    unlockAchievement('clipboard-master')

    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout title="Alphabet Sorter">
      <div className="flex flex-col rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-5 backdrop-blur-sm">
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your TEXT here..."
        />

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <label className="ml-2 flex items-center gap-2 text-sm text-neutral-300">
            <input
              type="checkbox"
              checked={options.addSpacing}
              onChange={() => toggle('addSpacing')}
              className="size-4 accent-custom_blue"
            />
            Add blank line between groups
          </label>

          <div className="flex gap-2">
            <button
              onClick={sortLines}
              disabled={isDisabled}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                isDisabled
                  ? 'cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-60'
                  : 'bg-custom_blue text-white hover:opacity-90'
              }`}
            >
              Sort
            </button>

            <button
              onClick={clearAll}
              className="rounded-lg bg-red-800 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:bg-red-700"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Sorted Output</h2>

          {output.length > 0 && (
            <button
              onClick={copyAll}
              disabled={copied}
              className={`h-8 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium transition ${
                copied
                  ? 'cursor-default text-custom_blue'
                  : 'text-neutral-100 hover:bg-neutral-700 active:scale-95'
              }`}
            >
              {copied ? 'Copied All!' : 'Copy All'}
            </button>
          )}
        </div>

        <pre
          className="
          h-72 max-h-[36rem] w-full overflow-auto whitespace-pre-wrap rounded-xl border border-white/10 bg-neutral-900/60 p-4 font-mono text-[13px] leading-[1.6] text-neutral-200"
        >
          {output.join('\n')}
        </pre>
      </div>
    </ToolLayout>
  )
}

export default AlphabetSorter
