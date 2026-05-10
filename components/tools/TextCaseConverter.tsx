'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useMemo, useState } from 'react'
import TextAreaWithLineNumbers from '@/components/TextAreaWithLineNumbers'
import ToolLayout from './ToolLayout'
import { ClearButton } from './ToolButtons'

type CaseVariant = {
  label: string
  value: string
}

const capitalizeWord = (word: string) => {
  if (!word) return ''
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

const wordsFromLine = (line: string): string[] => {
  return line
    .trim()
    .replace(/[_-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

const mapLines = (input: string, fn: (line: string) => string): string => {
  const lines = input.split('\n')
  return lines.map(fn).join('\n')
}

const buildVariants = (input: string): CaseVariant[] => {
  const trimmed = input.trimEnd()
  if (!trimmed) {
    return [
      { label: 'camelCase', value: '' },
      { label: 'PascalCase', value: '' },
      { label: 'snake_case', value: '' },
      { label: 'SCREAMING_SNAKE', value: '' },
      { label: 'kebab-case', value: '' },
      { label: 'Title Case', value: '' },
      { label: 'Sentence case', value: '' },
      { label: 'lowercase', value: '' },
      { label: 'UPPERCASE', value: '' }
    ]
  }

  const camelLine = (line: string) => {
    const words = wordsFromLine(line)
    if (words.length === 0) return ''
    const lower = words.map((w) => w.toLowerCase())
    return lower[0] + lower.slice(1).map(capitalizeWord).join('')
  }

  const pascalLine = (line: string) => {
    const words = wordsFromLine(line)
    if (words.length === 0) return ''
    return words.map((w) => capitalizeWord(w)).join('')
  }

  const snakeLine = (line: string) => {
    const words = wordsFromLine(line)
    if (words.length === 0) return ''
    return words.map((w) => w.toLowerCase()).join('_')
  }

  const screamingLine = (line: string) => {
    const words = wordsFromLine(line)
    if (words.length === 0) return ''
    return words.map((w) => w.toUpperCase()).join('_')
  }

  const kebabLine = (line: string) => {
    const words = wordsFromLine(line)
    if (words.length === 0) return ''
    return words.map((w) => w.toLowerCase()).join('-')
  }

  const titleLine = (line: string) => {
    const words = wordsFromLine(line)
    if (words.length === 0) return ''
    return words.map((w) => capitalizeWord(w)).join(' ')
  }

  const sentenceLine = (line: string) => {
    const words = wordsFromLine(line)
    if (words.length === 0) return ''
    return (
      capitalizeWord(words[0]) +
      (words.length > 1
        ? ' ' + words.slice(1).map((w) => w.toLowerCase()).join(' ')
        : '')
    )
  }

  return [
    { label: 'camelCase', value: mapLines(trimmed, camelLine) },
    { label: 'PascalCase', value: mapLines(trimmed, pascalLine) },
    { label: 'snake_case', value: mapLines(trimmed, snakeLine) },
    { label: 'SCREAMING_SNAKE', value: mapLines(trimmed, screamingLine) },
    { label: 'kebab-case', value: mapLines(trimmed, kebabLine) },
    { label: 'Title Case', value: mapLines(trimmed, titleLine) },
    { label: 'Sentence case', value: mapLines(trimmed, sentenceLine) },
    { label: 'lowercase', value: mapLines(trimmed, (l) => l.toLowerCase()) },
    { label: 'UPPERCASE', value: mapLines(trimmed, (l) => l.toUpperCase()) }
  ]
}

const TextCaseConverter = () => {
  const [input, setInput] = useState('')
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const { unlockAchievement } = useAchievementContext()

  const variants = useMemo(() => buildVariants(input), [input])

  const clearAll = () => {
    setInput('')
  }

  const copyValue = (label: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    setCopiedKey(label)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const hasAnyOutput = variants.some((v) => v.value.length > 0)

  return (
    <ToolLayout title="Text Case Converter">
      <div className="flex flex-col rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-5 backdrop-blur-sm">
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Type or paste text here. Each line is converted separately for case styles."
        />

        <div className="mt-4 flex justify-end gap-2">
          <ClearButton onClick={clearAll}>Clear</ClearButton>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-4 backdrop-blur-sm sm:p-6">
        <h2 className="mb-4 text-lg font-semibold text-white">Results</h2>

        {!hasAnyOutput ? (
          <p className="text-sm text-neutral-400">
            Conversions appear here as you type.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 font-mono text-sm lg:grid-cols-2">
            {variants.map(({ label, value }) => (
              <li
                key={label}
                className="flex flex-col gap-2 rounded-xl border border-white/10 bg-neutral-900/60 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    {label}
                  </span>
                  <button
                    type="button"
                    onClick={() => copyValue(label, value)}
                    disabled={!value}
                    className={`shrink-0 rounded-md bg-neutral-800 px-2 py-1 text-xs transition ${
                      !value
                        ? 'cursor-not-allowed text-neutral-600'
                        : copiedKey === label
                          ? 'cursor-default text-custom_blue'
                          : 'text-neutral-300 hover:bg-neutral-700 active:scale-95'
                    }`}
                  >
                    {copiedKey === label ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all text-[13px] leading-relaxed text-neutral-200">
                  {value}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ToolLayout>
  )
}

export default TextCaseConverter
