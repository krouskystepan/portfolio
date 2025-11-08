'use client'

import { useEffect, useState, useMemo } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'

type UUIDOptions = {
  uppercase: boolean
  noHyphens: boolean
}

export default function UuidGeneratorPage() {
  const [count, setCount] = useState<number>(10)
  const [uuids, setUuids] = useState<string[]>([])
  const [options, setOptions] = useState<UUIDOptions>({
    uppercase: false,
    noHyphens: false,
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
    <div>
      <h2 className="mb-8 text-center text-4xl font-bold lg:text-5xl">
        UUID Generator
      </h2>

      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-5 backdrop-blur-sm">
        <div className="flex justify-between gap-4">
          <div className="flex flex-col">
            <label htmlFor="count" className="mb-1 text-sm text-neutral-300">
              Count (1–500)
            </label>
            <input
              id="count"
              value={count}
              min={1}
              max={500}
              onChange={(e) => setCount(parseInt(e.target.value) || 0)}
              className="h-10 w-full rounded-lg border border-white/10 bg-neutral-900 px-3 text-sm text-neutral-100 outline-none focus:ring-2 focus:ring-custom_blue"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center justify-center gap-2">
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={options.uppercase}
                  onChange={() => toggle('uppercase')}
                  className="size-4 accent-custom_blue"
                />
                Uppercase
              </label>
              <label className="flex items-center gap-2 text-sm text-neutral-300">
                <input
                  type="checkbox"
                  checked={options.noHyphens}
                  onChange={() => toggle('noHyphens')}
                  className="size-4 accent-custom_blue"
                />
                No hyphens
              </label>
            </div>

            <div className="flex grow gap-2">
              <button
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
                className={`flex-1 rounded-lg px-4 text-sm font-medium transition duration-100 ${
                  isGenerateDisabled
                    ? 'cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-60'
                    : 'bg-custom_blue text-white hover:opacity-90'
                }`}
              >
                Generate
              </button>

              <button
                onClick={handleClear}
                className="rounded-lg bg-neutral-800 px-4 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700"
              >
                Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 text-neutral-100 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Generated UUIDs</h2>
          {uuids.length > 0 && (
            <button
              onClick={handleCopyAll}
              disabled={copiedStates[uuids.length]}
              className={`h-8 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium transition ${
                copiedStates[uuids.length]
                  ? 'cursor-default text-custom_blue'
                  : 'text-neutral-100 hover:bg-neutral-700 active:scale-95'
              }`}
            >
              {copiedStates[uuids.length] ? 'Copied All!' : 'Copy All'}
            </button>
          )}
        </div>

        {uuids.length > 0 ? (
          <ul className="grid grid-cols-1 gap-2 font-mono text-sm sm:grid-cols-2">
            {uuids.map((id, index) => (
              <li
                key={index}
                className="flex items-center justify-between rounded-md border border-white/10 bg-neutral-900/60 px-3 py-2"
              >
                <span className="truncate">{id}</span>
                <div className="ml-3 flex items-center gap-2">
                  <button
                    onClick={() => handleLocalCopy(index, id)}
                    disabled={copiedStates[index]}
                    className={`rounded-md bg-neutral-800 px-2 py-1 text-xs  transition ${copiedStates[index] ? 'cursor-default text-custom_blue' : 'text-neutral-300 hover:bg-neutral-700 active:scale-95'}`}
                  >
                    {copiedStates[index] ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-400">
            Generated UUIDs will appear here.
          </p>
        )}
      </div>
    </div>
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
