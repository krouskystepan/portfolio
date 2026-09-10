'use client'

import { useMemo, useState, type ReactNode } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolNumberInputClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import {
  DEFAULT_CASE,
  DEFAULT_COUNT,
  DEFAULT_EXPORT,
  DEFAULT_LENGTH,
  DEFAULT_STYLE,
  DEFAULT_UNIT,
  LOREM_CASES,
  LOREM_EXPORT_FORMATS,
  LOREM_LENGTHS,
  LOREM_STYLES,
  LOREM_UNITS,
  MIN_COUNT,
  exportLorem,
  generateLorem,
  isCountInRange,
  maxCountForUnit,
  type LoremCase,
  type LoremExportFormat,
  type LoremLength,
  type LoremStyle,
  type LoremUnit
} from '@/utils/loremIpsum'

const UNIT_LABELS: Record<LoremUnit, string> = {
  words: 'Words',
  sentences: 'Sentences',
  paragraphs: 'Paragraphs'
}

const STYLE_LABELS: Record<LoremStyle, string> = {
  classic: 'Classic ipsum',
  realistic: 'Realistic'
}

const LENGTH_LABELS: Record<LoremLength, string> = {
  short: 'Short',
  medium: 'Medium',
  long: 'Long'
}

const CASE_LABELS: Record<LoremCase, string> = {
  sentence: 'Sentence',
  lower: 'lower',
  upper: 'UPPER',
  title: 'Title Case'
}

type LoremResult = {
  parts: string[]
  unit: LoremUnit
  textCase: LoremCase
}

function ControlRow({
  label,
  htmlFor,
  children
}: {
  label: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      {htmlFor ? (
        <label
          htmlFor={htmlFor}
          className="w-16 shrink-0 text-sm font-medium text-neutral-300"
        >
          {label}
        </label>
      ) : (
        <span className="w-16 shrink-0 text-sm font-medium text-neutral-300">
          {label}
        </span>
      )}
      <div className="min-w-0">{children}</div>
    </div>
  )
}

export default function LoremGenerator() {
  const [unit, setUnit] = useState<LoremUnit>(DEFAULT_UNIT)
  const [count, setCount] = useState(DEFAULT_COUNT)
  const [style, setStyle] = useState<LoremStyle>(DEFAULT_STYLE)
  const [length, setLength] = useState<LoremLength>(DEFAULT_LENGTH)
  const [textCase, setTextCase] = useState<LoremCase>(DEFAULT_CASE)
  const [startWithLorem, setStartWithLorem] = useState(true)
  const [exportFormat, setExportFormat] =
    useState<LoremExportFormat>(DEFAULT_EXPORT)
  const [result, setResult] = useState<LoremResult | null>(null)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const maxCount = maxCountForUnit(unit)
  const isGenerateDisabled = !isCountInRange(count, unit)

  const exportText = useMemo(() => {
    if (!result) return ''
    return exportLorem(result.parts, exportFormat, result.unit, result.textCase)
  }, [result, exportFormat])

  const handleUnit = (next: LoremUnit) => {
    setUnit(next)
    const nextMax = maxCountForUnit(next)
    setCount((c) => (c > nextMax ? nextMax : c))
  }

  const handleGenerate = () => {
    if (isGenerateDisabled) return
    setResult({
      parts: generateLorem({
        unit,
        count,
        style,
        startWithLorem,
        length,
        textCase
      }),
      unit,
      textCase
    })
  }

  const handleClear = () => {
    setResult(null)
  }

  const handleCopy = async () => {
    if (!exportText) return
    await navigator.clipboard.writeText(exportText)
    unlockAchievement('clipboard-master')
    flash()
  }

  return (
    <ToolLayout title="Lorem / placeholder text">
      <ToolInputPanel>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          <ControlRow label="Unit">
            <ToolChipRow>
              {LOREM_UNITS.map((option) => (
                <ToolChipButton
                  key={option}
                  active={unit === option}
                  onClick={() => handleUnit(option)}
                >
                  {UNIT_LABELS[option]}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </ControlRow>

          <ControlRow label="Count" htmlFor="lorem-count">
            <div className="flex items-center gap-2">
              <input
                id="lorem-count"
                type="number"
                value={count}
                min={MIN_COUNT}
                max={maxCount}
                onChange={(e) => setCount(parseInt(e.target.value) || 0)}
                className={`${toolNumberInputClass} !w-14`}
                aria-label={`Count ${MIN_COUNT} to ${maxCount} ${unit}`}
              />
              <span className="whitespace-nowrap text-xs text-neutral-500">
                {MIN_COUNT}–{maxCount}
              </span>
            </div>
          </ControlRow>

          <ControlRow label="Style">
            <ToolChipRow>
              {LOREM_STYLES.map((option) => (
                <ToolChipButton
                  key={option}
                  active={style === option}
                  onClick={() => setStyle(option)}
                >
                  {STYLE_LABELS[option]}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </ControlRow>

          <ControlRow label="Length">
            <ToolChipRow>
              {LOREM_LENGTHS.map((option) => (
                <ToolChipButton
                  key={option}
                  active={length === option}
                  disabled={unit === 'words'}
                  onClick={() => setLength(option)}
                >
                  {LENGTH_LABELS[option]}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </ControlRow>

          <ControlRow label="Case">
            <ToolChipRow>
              {LOREM_CASES.map((option) => (
                <ToolChipButton
                  key={option}
                  active={textCase === option}
                  onClick={() => setTextCase(option)}
                >
                  {CASE_LABELS[option]}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </ControlRow>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          {style === 'classic' ? (
            <label className={toolCheckboxLabelClass}>
              <input
                type="checkbox"
                checked={startWithLorem}
                onChange={() => setStartWithLorem((v) => !v)}
                className="size-4 accent-custom_blue"
              />
              Start with <em>Lorem ipsum…</em>
            </label>
          ) : null}
          <div className="ml-auto flex flex-wrap gap-1.5">
            <PrimaryButton
              onClick={handleGenerate}
              disabled={isGenerateDisabled}
            >
              Generate
            </PrimaryButton>
            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Export</h2>
          {result ? (
            <ToolCopyButton copied={copied === true} onClick={handleCopy} />
          ) : null}
        </div>
        <ToolChipRow className="mb-3">
          {LOREM_EXPORT_FORMATS.map((option) => (
            <ToolChipButton
              key={option.id}
              active={exportFormat === option.id}
              title={option.title}
              onClick={() => setExportFormat(option.id)}
            >
              {option.label}
            </ToolChipButton>
          ))}
        </ToolChipRow>
        <pre className={`${toolPreOutputClass} !break-words`}>
          {exportText || (
            <span className="text-neutral-500">
              Generate text, then pick a format. Switch formats without
              regenerating.
            </span>
          )}
        </pre>
      </div>
    </ToolLayout>
  )
}
