'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useState, useMemo } from 'react'
import TextAreaWithLineNumbers from '@/components/TextAreaWithLineNumbers'
import ToolLayout from './ToolLayout'
import { ClearButton, PrimaryButton } from './ToolButtons'
import {
  toolCheckboxLabelClass,
  toolEmptyHintClass,
  toolPanelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  ToolCopyButton
} from './toolUi'

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
      <div className={toolPanelClass}>
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your TEXT here..."
        />

        <div className={toolToolbarBetweenClass}>
          <label className={toolCheckboxLabelClass}>
            <input
              type="checkbox"
              checked={options.addSpacing}
              onChange={() => toggle('addSpacing')}
              className="size-4 accent-custom_blue"
            />
            Add blank line between groups
          </label>

          <div className="flex gap-2">
            <PrimaryButton onClick={sortLines} disabled={isDisabled}>
              Sort
            </PrimaryButton>

            <ClearButton onClick={clearAll}>Clear</ClearButton>
          </div>
        </div>
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Sorted output</h2>

          {output.length > 0 ? (
            <ToolCopyButton
              copied={copied}
              onClick={copyAll}
              idleLabel="Copy all"
              copiedLabel="Copied all!"
            />
          ) : null}
        </div>

        {output.length > 0 ? (
          <pre
            className={`${toolPreOutputClass} max-h-96 min-h-72 text-[13px] text-neutral-200`}
          >
            {output.join('\n')}
          </pre>
        ) : (
          <p className={toolEmptyHintClass}>
            Sorted lines appear here after you run Sort.
          </p>
        )}
      </div>
    </ToolLayout>
  )
}

export default AlphabetSorter
