'use client'

import { useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCheckboxLabelClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolLabelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  toolFlexEndButtonsClass,
  ToolChipButton,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { bool, enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { downloadTextFile } from '@/utils/download'

type CellValue = string | number | boolean | null

const DELIM_OPTIONS = ['comma', 'semicolon', 'tab', 'pipe'] as const
type DelimOption = (typeof DELIM_OPTIONS)[number]

const DELIM_CHAR: Record<DelimOption, string> = {
  comma: ',',
  semicolon: ';',
  tab: '\t',
  pipe: '|'
}

function coerceCell(raw: string): CellValue {
  const trimmed = raw.trim()
  if (trimmed === '') return ''
  if (/^(null)$/i.test(trimmed)) return null
  if (/^(true|false)$/i.test(trimmed)) return trimmed.toLowerCase() === 'true'
  if (/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(trimmed)) {
    const n = Number(trimmed)
    if (!Number.isNaN(n)) return n
  }
  return raw
}

function csvRowsToObjects(
  rows: string[][],
  coerce: boolean
): Record<string, CellValue>[] {
  if (rows.length < 2) {
    throw new Error('CSV must contain header and at least one row')
  }

  const headers = rows[0]

  return rows.slice(1).map((row, rowIndex) => {
    if (row.length !== headers.length) {
      throw new Error(
        `Row ${rowIndex + 2} has ${row.length} columns, expected ${headers.length}`
      )
    }

    const obj: Record<string, CellValue> = {}
    headers.forEach((header, i) => {
      const cell = row[i] ?? ''
      obj[header] = coerce ? coerceCell(cell) : cell
    })
    return obj
  })
}

function parseCSV(text: string, delimiter: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentValue = ''
  let insideQuotes = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const nextChar = text[i + 1]

    if (char === '"' && insideQuotes && nextChar === '"') {
      currentValue += '"'
      i++
    } else if (char === '"') {
      insideQuotes = !insideQuotes
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentValue.trim())
      currentValue = ''
    } else if ((char === '\n' || char === '\r') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++
      if (currentValue || currentRow.length) {
        currentRow.push(currentValue.trim())
        rows.push(currentRow)
        currentRow = []
        currentValue = ''
      }
    } else {
      currentValue += char
    }
  }

  if (currentValue || currentRow.length) {
    currentRow.push(currentValue.trim())
    rows.push(currentRow)
  }

  return rows
}

const CsvJsonConverter = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [url, setUrl] = useToolUrlState({
    csv: str('', { text: true }),
    delim: enumParam<DelimOption>('comma', DELIM_OPTIONS),
    coerce: bool(false)
  })
  const input = url.csv
  const delimiter = DELIM_CHAR[url.delim]
  const coerceTypes = url.coerce
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, flash } = useCopyFeedback()

  const { unlockAchievement } = useAchievementContext()

  const setInput = (v: React.SetStateAction<string>) =>
    setUrl((s) => ({
      ...s,
      csv: typeof v === 'function' ? v(s.csv) : v
    }))

  const convertCSVToJSON = () => {
    if (!input.trim()) return

    try {
      const rows = parseCSV(input, delimiter)
      const json = csvRowsToObjects(rows, coerceTypes)

      setOutput(JSON.stringify(json, null, 2))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  const convertJsonToCSV = () => {
    if (!input.trim()) return

    try {
      const parsed = JSON.parse(input)

      if (!Array.isArray(parsed)) {
        throw new Error('JSON must be an array of objects')
      }

      if (parsed.length === 0) {
        throw new Error('JSON array is empty')
      }

      const headers = Array.from(
        new Set(
          parsed.flatMap((obj) =>
            obj && typeof obj === 'object' ? Object.keys(obj as object) : []
          )
        )
      )

      const escapeValue = (value: unknown): string => {
        if (value === null || value === undefined) return ''

        let strVal = String(value)
        strVal = strVal.replace(/"/g, '""')

        if (
          strVal.includes('"') ||
          strVal.includes('\n') ||
          strVal.includes(delimiter)
        ) {
          strVal = `"${strVal}"`
        }

        return strVal
      }

      const rows = parsed.map((obj) =>
        headers.map((header) =>
          escapeValue(
            obj && typeof obj === 'object'
              ? (obj as Record<string, unknown>)[header]
              : ''
          )
        )
      )

      const csv = [
        headers.join(delimiter),
        ...rows.map((row) => row.join(delimiter))
      ].join('\n')

      setOutput(csv)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  const handleMinify = () => {
    if (!input.trim()) return

    try {
      const rows = parseCSV(input, delimiter)
      const json = csvRowsToObjects(rows, coerceTypes)

      setOutput(JSON.stringify(json))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    unlockAchievement('clipboard-master')
    flash()
  }

  return (
    <ToolLayout title="CSV & JSON Converter" embedded={embedded}>
      <ToolInputPanel>
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your CSV here..."
        />

        <div className={toolToolbarBetweenClass}>
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className={toolLabelClass}>Delimiter</span>
              <div className="flex flex-wrap gap-1.5">
                {DELIM_OPTIONS.map((d) => (
                  <ToolChipButton
                    key={d}
                    active={url.delim === d}
                    onClick={() => setUrl((s) => ({ ...s, delim: d }))}
                  >
                    {d === 'comma'
                      ? 'Comma'
                      : d === 'semicolon'
                        ? 'Semicolon'
                        : d === 'tab'
                          ? 'Tab'
                          : 'Pipe'}
                  </ToolChipButton>
                ))}
              </div>
            </div>
            <label className={`${toolCheckboxLabelClass} mt-5`}>
              <input
                type="checkbox"
                checked={coerceTypes}
                onChange={(e) =>
                  setUrl((s) => ({ ...s, coerce: e.target.checked }))
                }
                className="size-4 rounded border-white/20 bg-neutral-900"
              />
              Coerce numbers / booleans / null
            </label>
          </div>

          <div className={toolFlexEndButtonsClass}>
            <PrimaryButton onClick={convertCSVToJSON} disabled={!input.trim()}>
              CSV to JSON
            </PrimaryButton>
            <PrimaryButton onClick={convertJsonToCSV} disabled={!input.trim()}>
              JSON to CSV
            </PrimaryButton>
            <SecondaryButton onClick={handleMinify} disabled={!input.trim()}>
              Minify JSON
            </SecondaryButton>
            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>

          {output ? (
            <div className="flex flex-wrap gap-2">
              <SecondaryButton
                onClick={() =>
                  downloadTextFile(
                    output,
                    output.trimStart().startsWith('[') ||
                      output.trimStart().startsWith('{')
                      ? 'data.json'
                      : 'data.csv',
                    output.trimStart().startsWith('[') ||
                      output.trimStart().startsWith('{')
                      ? 'application/json;charset=utf-8'
                      : 'text/csv;charset=utf-8'
                  )
                }
              >
                Download
              </SecondaryButton>
              <ToolCopyButton copied={copied === true} onClick={handleCopy} />
            </div>
          ) : null}
        </div>

        {error ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {error}
          </div>
        ) : output ? (
          <pre className={toolPreOutputClass}>{output}</pre>
        ) : (
          <div className={toolEmptyHintClass}>
            Output will appear here after conversion.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default CsvJsonConverter
