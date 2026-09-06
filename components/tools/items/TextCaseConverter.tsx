'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { Suspense, useMemo } from 'react'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolMediumCardClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'

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

function TextCaseConverterInner() {
  const [url, setUrl] = useToolUrlState({
    t: str('', { text: true })
  })
  const input = url.t
  const { copied, flash } = useCopyFeedback()

  const { unlockAchievement } = useAchievementContext()

  const variants = useMemo(() => buildVariants(input), [input])

  const clearAll = () => {
    setUrl({ t: '' })
  }

  const copyValue = (label: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(label)
  }

  const hasAnyOutput = variants.some((v) => v.value.length > 0)

  return (
    <ToolLayout title="Text Case Converter">
      <ToolInputPanel>
        <TextAreaWithLineNumbers
          value={input}
          setValue={(v) =>
            setUrl((s) => ({
              ...s,
              t: typeof v === 'function' ? v(s.t) : v
            }))
          }
          placeholder="Type or paste text here. Each line is converted separately for case styles."
        />

        <div className={toolToolbarEndClass}>
          <ClearButton onClick={clearAll}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Results</h2>

        {!hasAnyOutput ? (
          <p className={toolEmptyHintClass}>
            Conversions appear here as you type.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 font-mono text-sm lg:grid-cols-2">
            {variants.map(({ label, value }) => (
              <li key={label} className={toolMediumCardClass}>
                <div className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    {label}
                  </span>
                  <ToolCopyButton
                    copied={copied === label}
                    onClick={() => copyValue(label, value)}
                    disabled={!value}
                  />
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

export default function TextCaseConverter() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Text Case Converter">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <TextCaseConverterInner />
    </Suspense>
  )
}
