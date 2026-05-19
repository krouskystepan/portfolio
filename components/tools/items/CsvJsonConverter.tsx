'use client'

import { useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton, SecondaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolPanelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolCopyButton
} from '@/components/tools/_shared/toolUi'

/** Header row + data rows → objects; validates column count per row. */
function csvRowsToObjects(rows: string[][]): Record<string, string>[] {
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

    const obj: Record<string, string> = {}
    headers.forEach((header, i) => {
      obj[header] = row[i]
    })
    return obj
  })
}

const CsvJsonConverter = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const { unlockAchievement } = useAchievementContext()

  const parseCSV = (text: string): string[][] => {
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
      } else if (char === ',' && !insideQuotes) {
        currentRow.push(currentValue.trim())
        currentValue = ''
      } else if ((char === '\n' || char === '\r') && !insideQuotes) {
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

  const convertCSVToJSON = () => {
    if (!input.trim()) return

    try {
      const rows = parseCSV(input)
      const json = csvRowsToObjects(rows)

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

      // collect ALL unique keys (important)
      const headers = Array.from(
        new Set(parsed.flatMap((obj) => Object.keys(obj)))
      )

      const escapeValue = (value: unknown): string => {
        if (value === null || value === undefined) return ''

        let str = String(value)

        // escape quotes
        str = str.replace(/"/g, '""')

        // wrap if needed
        if (/[",\n]/.test(str)) {
          str = `"${str}"`
        }

        return str
      }

      const rows = parsed.map((obj) =>
        headers.map((header) => escapeValue(obj[header]))
      )

      const csv = [headers.join(','), ...rows.map((row) => row.join(','))].join(
        '\n'
      )

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
      const rows = parseCSV(input)
      const json = csvRowsToObjects(rows)

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
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <ToolLayout title="CSV & JSON Converter" embedded={embedded}>
      <div className={toolPanelClass}>
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your CSV here..."
        />

        <div className={toolToolbarEndClass}>
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

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>

          {output ? (
            <ToolCopyButton copied={copied} onClick={handleCopy} />
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
