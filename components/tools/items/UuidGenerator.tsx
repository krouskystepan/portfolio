'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useState, useMemo, useEffect } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolEmptyHintClass,
  toolNumberInputClass,
  toolPanelClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  toolValueRowClass,
  ToolCopyButton
} from '@/components/tools/_shared/toolUi'

type UUIDOptions = {
  uppercase: boolean
  noHyphens: boolean
}

const UuidGenerator = () => {
  const [count, setCount] = useState<number>(10)
  const [uuids, setUuids] = useState<string[]>([])
  const [options, setOptions] = useState<UUIDOptions>({
    uppercase: false,
    noHyphens: false
  })
  const [copiedStates, setCopiedStates] = useState<boolean[]>([])

  const { unlockAchievement } = useAchievementContext()

  const isGenerateDisabled = useMemo(
    () => Number.isNaN(count) || count < 1 || count > 500,
    [count]
  )

  useEffect(() => {
    if (uuids.length > 0) {
      setUuids((prev) => prev.map((u) => formatUuid(u, options)))
    }
  }, [options, uuids.length])

  const handleGenerate = () => {
    if (isGenerateDisabled) return
    const out: string[] = Array.from({ length: count }, () =>
      formatUuid(generateUuidV4(), options)
    )
    setUuids(out)
    setCopiedStates(new Array(out.length + 1).fill(false))
  }

  const handleClear = () => {
    setUuids([])
  }

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
  }

  const handleLocalCopy = (index: number, id: string) => {
    handleCopy(id)
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

  const handleCopyAll = () => {
    if (uuids.length === 0) return
    handleCopy(uuids.join('\n'))
    setCopiedStates((prev) => {
      const updated = [...prev]
      updated[uuids.length] = true
      return updated
    })
    setTimeout(() => {
      setCopiedStates((prev) => {
        const updated = [...prev]
        updated[uuids.length] = false
        return updated
      })
    }, 1500)
  }

  const toggle = (key: keyof UUIDOptions) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <ToolLayout title="UUID Generator">
      <div className={toolPanelClass}>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="flex w-fit max-w-full flex-col gap-1 self-start sm:self-end">
            <label htmlFor="count" className={toolCheckboxLabelClass}>
              Count (1–500)
            </label>
            <input
              id="count"
              type="number"
              value={count}
              min={1}
              max={500}
              onChange={(e) => setCount(parseInt(e.target.value) || 0)}
              className={toolNumberInputClass}
            />
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[min(100%,280px)]">
            <div className="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 sm:justify-end">
              <label className={toolCheckboxLabelClass}>
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={() => toggle('uppercase')}
                  className="size-4 accent-custom_blue"
                />
                Uppercase
              </label>
              <label className={toolCheckboxLabelClass}>
                <input
                  type="checkbox"
                  checked={options.noHyphens}
                  onChange={() => toggle('noHyphens')}
                  className="size-4 accent-custom_blue"
                />
                No hyphens
              </label>
            </div>

            <div className={`${toolToolbarEndClass} !mt-0 flex-col sm:flex-row`}>
              <PrimaryButton onClick={handleGenerate} disabled={isGenerateDisabled}>
                Generate
              </PrimaryButton>

              <ClearButton onClick={handleClear}>Clear</ClearButton>
            </div>
          </div>
        </div>
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Generated UUIDs</h2>
          {uuids.length > 0 ? (
            <ToolCopyButton
              copied={Boolean(copiedStates[uuids.length])}
              onClick={handleCopyAll}
              idleLabel="Copy all"
              copiedLabel="Copied all!"
            />
          ) : null}
        </div>

        {uuids.length > 0 ? (
          <ul className="grid grid-cols-1 gap-2 font-mono text-sm sm:grid-cols-2">
            {uuids.map((id, index) => (
              <li key={index} className={toolValueRowClass}>
                <span className="min-w-0 flex-1 break-all font-mono text-xs leading-snug sm:text-sm">
                  {id}
                </span>
                <ToolCopyButton
                  copied={Boolean(copiedStates[index])}
                  onClick={() => handleLocalCopy(index, id)}
                />
              </li>
            ))}
          </ul>
        ) : (
          <p className={toolEmptyHintClass}>Generated UUIDs will appear here.</p>
        )}
      </div>
    </ToolLayout>
  )
}

function generateUuidV4(): string {
  // RFC 4122 v4 UUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = crypto.getRandomValues(new Uint8Array(1))[0] & 15
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

function formatUuid(uuid: string, options: UUIDOptions): string {
  let formatted = uuid.replace(/[^a-fA-F0-9]/g, '')

  if (!options.noHyphens) {
    formatted = formatted.replace(
      /^(.{8})(.{4})(.{4})(.{4})(.{12})$/,
      '$1-$2-$3-$4-$5'
    )
  }

  formatted = options.uppercase
    ? formatted.toUpperCase()
    : formatted.toLowerCase()

  return formatted
}

export default UuidGenerator
