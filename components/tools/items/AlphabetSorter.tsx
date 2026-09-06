'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolEmptyHintClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { bool, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'

function sortInputLines(input: string, addSpacing: boolean): string[] {
  const rawLines = input
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const getFirstSegment = (line: string): string => {
    const trimmed = line.trim()
    const dotIndex = trimmed.indexOf('.')
    return dotIndex === -1 ? trimmed : trimmed.slice(0, dotIndex)
  }

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
    if (addSpacing) finalLines.push('')
  }

  return addSpacing ? finalLines.join('\n').trim().split('\n') : finalLines
}

function AlphabetSorterInner() {
  const [url, setUrl] = useToolUrlState({
    t: str('', { text: true }),
    space: bool(true)
  })
  const input = url.t
  const addSpacing = url.space
  const [output, setOutput] = useState<string[]>([])
  const { copied, flash } = useCopyFeedback()
  const didHydrateSort = useRef(false)

  const { unlockAchievement } = useAchievementContext()

  const isDisabled = useMemo(() => input.trim().length === 0, [input])

  const sortLines = () => {
    if (input.trim().length === 0) return
    setOutput(sortInputLines(input, addSpacing))
  }

  useEffect(() => {
    if (didHydrateSort.current) return
    didHydrateSort.current = true
    if (input.trim().length === 0) return
    setOutput(sortInputLines(input, addSpacing))
    // One-shot hydrate sort from URL; do not re-run on later edits.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const clearAll = () => {
    setUrl((s) => ({ ...s, t: '' }))
    setOutput([])
  }

  const copyAll = () => {
    if (output.length === 0) return
    navigator.clipboard.writeText(output.join('\n'))
    unlockAchievement('clipboard-master')
    flash()
  }

  return (
    <ToolLayout title="Alphabet Sorter">
      <ToolInputPanel>
        <TextAreaWithLineNumbers
          value={input}
          setValue={(v) =>
            setUrl((s) => ({
              ...s,
              t: typeof v === 'function' ? v(s.t) : v
            }))
          }
          placeholder="Paste your TEXT here..."
        />

        <div className={toolToolbarBetweenClass}>
          <label className={toolCheckboxLabelClass}>
            <input
              type="checkbox"
              checked={addSpacing}
              onChange={() => setUrl((s) => ({ ...s, space: !s.space }))}
              className="size-4 accent-custom_blue"
            />
            Add blank line between groups
          </label>

          <div className="flex gap-1.5">
            <PrimaryButton onClick={sortLines} disabled={isDisabled}>
              Sort
            </PrimaryButton>

            <ClearButton onClick={clearAll}>Clear</ClearButton>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Sorted output</h2>

          {output.length > 0 ? (
            <ToolCopyButton
              copied={copied === true}
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

export default function AlphabetSorter() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Alphabet Sorter">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <AlphabetSorterInner />
    </Suspense>
  )
}
