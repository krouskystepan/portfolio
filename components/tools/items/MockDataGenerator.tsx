'use client'

import { Suspense, useMemo, useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton,
  RemoveButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolCompactInputClass,
  toolEmptyHintClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolLabelClass,
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
  custom,
  enumParam,
  int,
  useToolUrlState
} from '@/hooks/useToolUrlState'
import {
  DEFAULT_COUNT,
  DEFAULT_CUSTOM_PATTERN,
  DEFAULT_EXPORT,
  DEFAULT_KEY_FOR_TYPE,
  DEFAULT_SCHEMA_SERIALIZED,
  FIELD_TYPE_LABELS,
  FIELD_TYPES,
  MAX_COUNT,
  MAX_FIELDS,
  MIN_COUNT,
  MOCK_EXPORT_FORMATS,
  MOCK_PRESETS,
  PATTERN_EXAMPLES,
  activePresetId,
  cloneFields,
  exportMock,
  generateRecords,
  isCountInRange,
  parseMockSchema,
  schemaIssue,
  serializeMockSchema,
  suggestedField,
  uniqueKey,
  type MockExportFormat,
  type MockField,
  type MockFieldType
} from '@/utils/mockData'

type SchemaRow = MockField & { id: string }

let rowSeq = 0

function nextRowId() {
  rowSeq += 1
  return `field-${rowSeq}`
}

function rowsFromFields(fields: readonly MockField[]): SchemaRow[] {
  return cloneFields(fields).map((field) => ({ ...field, id: nextRowId() }))
}

function MockDataGeneratorInner() {
  const [url, setUrl] = useToolUrlState({
    s: custom(
      DEFAULT_SCHEMA_SERIALIZED,
      (raw) => serializeMockSchema(parseMockSchema(raw)),
      (value) => (value === DEFAULT_SCHEMA_SERIALIZED ? null : value),
      { text: true }
    ),
    n: int(DEFAULT_COUNT, { min: 0, max: MAX_COUNT }),
    f: enumParam<MockExportFormat>(DEFAULT_EXPORT, ['json', 'csv', 'lines'])
  })
  const [schema, setSchema] = useState<SchemaRow[]>(() =>
    rowsFromFields(parseMockSchema(url.s))
  )
  const [records, setRecords] = useState<Record<string, string>[] | null>(null)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const count = url.n
  const exportFormat = url.f

  const schemaFields = useMemo(
    () =>
      schema.map(({ key, type, pattern }) => ({
        key,
        type,
        ...(pattern != null ? { pattern } : {})
      })),
    [schema]
  )
  const presetId = activePresetId(schemaFields)
  const countOk = isCountInRange(count)
  const issue = schemaIssue(schemaFields)
  const schemaOk = issue == null
  const isGenerateDisabled = !countOk || !schemaOk

  const exportText = useMemo(() => {
    if (!records) return ''
    return exportMock(records, exportFormat)
  }, [records, exportFormat])

  const schemaHint = issue
    ? issue
    : !countOk
      ? `Count must be ${MIN_COUNT}–${MAX_COUNT}.`
      : `${schema.length}/${MAX_FIELDS} fields`

  const commitSchema = (next: SchemaRow[]) => {
    setSchema(next)
    setUrl((current) => ({
      ...current,
      s: serializeMockSchema(next)
    }))
  }

  const updateSchema = (updater: (rows: SchemaRow[]) => SchemaRow[]) => {
    setSchema((rows) => {
      const next = updater(rows)
      setUrl((current) => ({
        ...current,
        s: serializeMockSchema(next)
      }))
      return next
    })
  }

  const handlePreset = (fields: readonly MockField[]) => {
    commitSchema(rowsFromFields(fields))
  }

  const handleKeyChange = (id: string, nextKey: string) => {
    updateSchema((rows) =>
      rows.map((row) => (row.id === id ? { ...row, key: nextKey } : row))
    )
  }

  const handleTypeChange = (id: string, type: MockFieldType) => {
    updateSchema((rows) => {
      const current = rows.find((row) => row.id === id)
      if (!current || current.type === type) return rows

      const otherKeys = rows
        .filter((row) => row.id !== id)
        .map((row) => row.key)
      const stillDefault = current.key === DEFAULT_KEY_FOR_TYPE[current.type]
      const key = stillDefault
        ? uniqueKey(DEFAULT_KEY_FOR_TYPE[type], otherKeys)
        : current.key

      return rows.map((row) => {
        if (row.id !== id) return row
        const next: SchemaRow = { ...row, type, key }
        if (type === 'custom') {
          next.pattern = row.pattern || DEFAULT_CUSTOM_PATTERN
        } else {
          delete next.pattern
        }
        return next
      })
    })
  }

  const handlePatternChange = (id: string, pattern: string) => {
    updateSchema((rows) =>
      rows.map((row) => (row.id === id ? { ...row, pattern } : row))
    )
  }

  const handleRemove = (id: string) => {
    updateSchema((rows) =>
      rows.length <= 1 ? rows : rows.filter((row) => row.id !== id)
    )
  }

  const handleAddField = () => {
    if (schema.length >= MAX_FIELDS) return
    const next = suggestedField(schemaFields)
    updateSchema((rows) => [...rows, { ...next, id: nextRowId() }])
  }

  const handleGenerate = () => {
    if (isGenerateDisabled) return
    setRecords(generateRecords(schemaFields, count))
  }

  const handleClear = () => {
    setRecords(null)
  }

  const handleCopy = async () => {
    if (!exportText) return
    await navigator.clipboard.writeText(exportText)
    unlockAchievement('clipboard-master')
    flash()
  }

  return (
    <ToolLayout title="Mock / fake data generator">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Fake names, emails, phones, and addresses in the browser - obviously
            fake (<code>555</code>, <code>example.com</code>), safe for
            fixtures. Schema is in the URL so you can share a setup. Use{' '}
            <strong>Custom</strong> with a regex like{' '}
            <code>{'[A-Z]{3}-\\d{4}'}</code> for everything else.
          </p>
        }
      >
        <div>
          <p className={`${toolLabelClass} mb-2`}>Presets</p>
          <ToolChipRow>
            {MOCK_PRESETS.map((preset) => (
              <ToolChipButton
                key={preset.id}
                active={presetId === preset.id}
                tone="accent"
                title={preset.title}
                onClick={() => handlePreset(preset.fields)}
              >
                {preset.label}
              </ToolChipButton>
            ))}
          </ToolChipRow>
        </div>

        <div className="mt-4">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <p className={`${toolLabelClass} mb-0`}>Schema</p>
            <SecondaryButton
              onClick={handleAddField}
              disabled={schema.length >= MAX_FIELDS}
            >
              Add field
            </SecondaryButton>
          </div>

          <ul className="space-y-2">
            {schema.map((row, index) => (
              <li
                key={row.id}
                className="flex flex-col gap-2 rounded-lg border border-white/10 bg-neutral-900/50 p-3"
              >
                <div className="flex items-center gap-2">
                  <input
                    value={row.key}
                    onChange={(e) => handleKeyChange(row.id, e.target.value)}
                    spellCheck={false}
                    className={`${toolCompactInputClass} max-w-48 font-mono`}
                    placeholder="key"
                    aria-label={`Field key ${index + 1}`}
                  />
                  <RemoveButton
                    className="ml-auto"
                    onClick={() => handleRemove(row.id)}
                    disabled={schema.length <= 1}
                  />
                </div>
                <ToolChipRow>
                  {FIELD_TYPES.map((type) => (
                    <ToolChipButton
                      key={type}
                      active={row.type === type}
                      onClick={() => handleTypeChange(row.id, type)}
                    >
                      {FIELD_TYPE_LABELS[type]}
                    </ToolChipButton>
                  ))}
                </ToolChipRow>
                {row.type === 'custom' ? (
                  <div className="space-y-2">
                    <input
                      value={row.pattern ?? ''}
                      onChange={(e) =>
                        handlePatternChange(row.id, e.target.value)
                      }
                      spellCheck={false}
                      placeholder={DEFAULT_CUSTOM_PATTERN}
                      className={`${toolCompactInputClass} font-mono`}
                      aria-label={`Custom pattern for ${row.key || 'field'}`}
                    />
                    <ToolChipRow>
                      {PATTERN_EXAMPLES.map((example) => (
                        <ToolChipButton
                          key={example.pattern}
                          active={row.pattern === example.pattern}
                          title={example.pattern}
                          onClick={() =>
                            handlePatternChange(row.id, example.pattern)
                          }
                        >
                          {example.label}
                        </ToolChipButton>
                      ))}
                    </ToolChipRow>
                    <p className={toolHintMetaClass}>
                      Subset of regex: \d \w [A-Z] {'{n}'} (a|b). Anchors
                      ignored. Lookaheads are not supported.
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <div className="flex w-fit max-w-full flex-col gap-1">
            <label htmlFor="mock-count" className={toolLabelClass}>
              Count ({MIN_COUNT}-{MAX_COUNT})
            </label>
            <input
              id="mock-count"
              type="number"
              value={count}
              min={MIN_COUNT}
              max={MAX_COUNT}
              onChange={(e) =>
                setUrl((current) => ({
                  ...current,
                  n: parseInt(e.target.value) || 0
                }))
              }
              className={`${toolNumberInputClass} !w-14`}
              aria-label={`Count ${MIN_COUNT} to ${MAX_COUNT}`}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
            <p className={toolHintMetaClass}>{schemaHint}</p>
            <div className="flex flex-wrap justify-end gap-1.5">
              <PrimaryButton
                onClick={handleGenerate}
                disabled={isGenerateDisabled}
              >
                Generate
              </PrimaryButton>
              <ClearButton onClick={handleClear}>Clear</ClearButton>
            </div>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Export</h2>
          {records ? (
            <ToolCopyButton copied={copied === true} onClick={handleCopy} />
          ) : null}
        </div>
        <ToolChipRow className="mb-3">
          {MOCK_EXPORT_FORMATS.map((option) => (
            <ToolChipButton
              key={option.id}
              active={exportFormat === option.id}
              title={option.title}
              onClick={() =>
                setUrl((current) => ({ ...current, f: option.id }))
              }
            >
              {option.label}
            </ToolChipButton>
          ))}
        </ToolChipRow>
        <pre className={`${toolPreOutputClass} !break-words`}>
          {exportText || (
            <span className="text-neutral-500">
              Generate records, then pick a format. Switch formats without
              regenerating.
            </span>
          )}
        </pre>
      </div>
    </ToolLayout>
  )
}

export default function MockDataGenerator() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Mock / fake data generator">
          <p className={toolEmptyHintClass}>Loading…</p>
        </ToolLayout>
      }
    >
      <MockDataGeneratorInner />
    </Suspense>
  )
}
