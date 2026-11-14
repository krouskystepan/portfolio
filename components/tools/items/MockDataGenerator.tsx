'use client'

import Link from 'next/link'
import { Suspense, useMemo, useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
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
  str,
  useToolUrlState
} from '@/hooks/useToolUrlState'
import { downloadTextFile } from '@/utils/download'
import {
  DEFAULT_ARRAY_MAX,
  DEFAULT_ARRAY_MIN,
  DEFAULT_COUNT,
  DEFAULT_CUSTOM_PATTERN,
  DEFAULT_EXPORT,
  DEFAULT_KEY_FOR_TYPE,
  DEFAULT_NUMBER_DECIMALS,
  DEFAULT_NUMBER_MAX,
  DEFAULT_NUMBER_MIN,
  DEFAULT_SCHEMA_SERIALIZED,
  DEFAULT_SQL_DIALECT,
  DEFAULT_SQL_TABLE,
  FIELD_TYPE_LABELS,
  FIELD_TYPES,
  LARGE_COUNT_WARNING,
  MAX_ARRAY_LENGTH,
  MAX_COUNT,
  MAX_FIELDS,
  MAX_NUMBER_DECIMALS,
  MIN_ARRAY_LENGTH,
  MIN_COUNT,
  MOCK_EXPORT_FORMATS,
  MOCK_PRESETS,
  PATTERN_EXAMPLES,
  activePresetId,
  cloneFields,
  exportMock,
  fieldForType,
  generateRecordsProgressive,
  isArrayRangeValid,
  isCountInRange,
  parseEnumValues,
  parseKeyPath,
  parseMockSchema,
  schemaIssue,
  serializeMockSchema,
  suggestedField,
  uniqueKey,
  type MockExportFormat,
  type MockField,
  type MockFieldType,
  type MockRecord
} from '@/utils/mockData'
import {
  SAMPLE_MOCK_JSON_SCHEMA,
  emptySchemaConvertHint,
  jsonSchemaTextIssue,
  parseJsonSchemaToMockFields
} from '@/utils/mockJsonSchema'
import {
  SQL_DIALECT_LABELS,
  SQL_DIALECTS,
  tableNameIssue,
  type SqlDialect
} from '@/utils/sqlInsert'

/** Editor row: schema field plus UI-only state. */
type SchemaRow = MockField & { id: string; valuesText?: string }

const EDITOR_MODES = ['fields', 'schema'] as const
type EditorMode = (typeof EDITOR_MODES)[number]

const EXPORT_FORMAT_IDS = [
  'json',
  'csv',
  'lines',
  'sql'
] as const satisfies readonly MockExportFormat[]

const EXPORT_FILES: Record<MockExportFormat, { ext: string; mime: string }> = {
  json: { ext: 'json', mime: 'application/json;charset=utf-8' },
  csv: { ext: 'csv', mime: 'text/csv;charset=utf-8' },
  lines: { ext: 'txt', mime: 'text/plain;charset=utf-8' },
  sql: { ext: 'sql', mime: 'application/sql;charset=utf-8' }
}

/** Keep the <pre> responsive; copy / download always use the full text. */
const PREVIEW_CHAR_LIMIT = 60_000

function rowToField(row: SchemaRow): MockField {
  const field: MockField = { key: row.key, type: row.type }
  if (row.pattern != null) field.pattern = row.pattern
  if (row.min != null) field.min = row.min
  if (row.max != null) field.max = row.max
  if (row.decimals != null) field.decimals = row.decimals
  if (row.values != null) field.values = row.values
  return field
}

function numberFromInput(raw: string): number {
  return raw.trim() === '' ? Number.NaN : Number(raw)
}

function displayNumber(value: number | undefined): string | number {
  return value != null && Number.isFinite(value) ? value : ''
}

let rowSeq = 0

function nextRowId() {
  rowSeq += 1
  return `field-${rowSeq}`
}

function rowsFromFields(fields: readonly MockField[]): SchemaRow[] {
  return cloneFields(fields).map((field) => ({
    ...field,
    id: nextRowId(),
    ...(field.values ? { valuesText: field.values.join(', ') } : {})
  }))
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
    f: enumParam<MockExportFormat>(DEFAULT_EXPORT, EXPORT_FORMAT_IDS),
    amin: int(DEFAULT_ARRAY_MIN, {
      min: MIN_ARRAY_LENGTH,
      max: MAX_ARRAY_LENGTH
    }),
    amax: int(DEFAULT_ARRAY_MAX, {
      min: MIN_ARRAY_LENGTH,
      max: MAX_ARRAY_LENGTH
    }),
    tbl: str(DEFAULT_SQL_TABLE),
    d: enumParam<SqlDialect>(DEFAULT_SQL_DIALECT, SQL_DIALECTS),
    m: enumParam<EditorMode>('fields', EDITOR_MODES),
    js: str('', { text: true })
  })
  const [schema, setSchema] = useState<SchemaRow[]>(() =>
    rowsFromFields(parseMockSchema(url.s))
  )
  const [records, setRecords] = useState<MockRecord[] | null>(null)
  const [generateError, setGenerateError] = useState<string | null>(null)
  const [schemaWarnings, setSchemaWarnings] = useState<string[]>([])
  const [schemaConvertError, setSchemaConvertError] = useState<string | null>(
    null
  )
  const [busy, setBusy] = useState(false)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const count = url.n
  const exportFormat = url.f
  const editorMode = url.m
  const jsonSchemaText = url.js

  const schemaFields = useMemo(() => schema.map(rowToField), [schema])
  const presetId = activePresetId(schemaFields)
  const countOk = isCountInRange(count)
  const issue = schemaIssue(schemaFields)
  const schemaOk = issue == null

  const hasArrays = useMemo(
    () =>
      schemaFields.some((field) =>
        parseKeyPath(field.key)?.some((segment) => segment.array)
      ),
    [schemaFields]
  )
  const arrayOk = !hasArrays || isArrayRangeValid(url.amin, url.amax)
  const tableIssue = tableNameIssue(url.tbl)
  const jsonSchemaIssue = jsonSchemaTextIssue(jsonSchemaText)
  const isGenerateDisabled =
    busy ||
    !countOk ||
    (editorMode === 'fields'
      ? !schemaOk || !arrayOk
      : jsonSchemaIssue != null)

  const exportText = useMemo(() => {
    if (!records) return ''
    return exportMock(records, exportFormat, {
      table: url.tbl,
      dialect: url.d
    })
  }, [records, exportFormat, url.tbl, url.d])

  const previewText =
    exportText.length > PREVIEW_CHAR_LIMIT
      ? `${exportText.slice(0, PREVIEW_CHAR_LIMIT)}\n… preview truncated (${exportText.length.toLocaleString()} chars). Copy or download for the full output.`
      : exportText

  const schemaHint =
    editorMode === 'schema'
      ? jsonSchemaIssue
        ? jsonSchemaIssue
        : !countOk
          ? `Count must be ${MIN_COUNT}–${MAX_COUNT}.`
          : emptySchemaConvertHint()
      : issue
        ? issue
        : !countOk
          ? `Count must be ${MIN_COUNT}–${MAX_COUNT}.`
          : !arrayOk
            ? `Array length must be ${MIN_ARRAY_LENGTH}–${MAX_ARRAY_LENGTH} (min ≤ max).`
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

  const applyJsonSchema = (
    text: string
  ): { fields: MockField[]; arrayMin: number; arrayMax: number } | null => {
    try {
      const converted = parseJsonSchemaToMockFields(text)
      setSchemaWarnings(converted.warnings)
      setSchemaConvertError(null)
      setSchema(rowsFromFields(converted.fields))
      setUrl((current) => ({
        ...current,
        amin: converted.arrayMin,
        amax: converted.arrayMax,
        s: serializeMockSchema(converted.fields)
      }))
      return {
        fields: converted.fields,
        arrayMin: converted.arrayMin,
        arrayMax: converted.arrayMax
      }
    } catch (err) {
      setSchemaWarnings([])
      setSchemaConvertError(
        err instanceof Error ? err.message : 'Could not convert schema.'
      )
      return null
    }
  }

  const handlePreset = (fields: readonly MockField[]) => {
    commitSchema(rowsFromFields(fields))
    setUrl((current) => ({ ...current, m: 'fields' }))
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
        const base = fieldForType(type, key)
        if (type === 'custom' && row.pattern) base.pattern = row.pattern
        return {
          ...base,
          id: row.id,
          ...(base.values ? { valuesText: base.values.join(', ') } : {})
        }
      })
    })
  }

  const handleNumberChange = (
    id: string,
    prop: 'min' | 'max' | 'decimals',
    raw: string
  ) => {
    const value = numberFromInput(raw)
    updateSchema((rows) =>
      rows.map((row) => (row.id === id ? { ...row, [prop]: value } : row))
    )
  }

  const handleEnumChange = (id: string, text: string) => {
    updateSchema((rows) =>
      rows.map((row) =>
        row.id === id
          ? { ...row, valuesText: text, values: parseEnumValues(text) }
          : row
      )
    )
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
    updateSchema((rows) => [
      ...rows,
      {
        ...next,
        id: nextRowId(),
        ...(next.values ? { valuesText: next.values.join(', ') } : {})
      }
    ])
  }

  const handleGenerate = async () => {
    if (isGenerateDisabled) return
    setBusy(true)
    setGenerateError(null)
    try {
      let fields = schemaFields
      let arrayMin = url.amin
      let arrayMax = url.amax
      if (editorMode === 'schema') {
        const converted = applyJsonSchema(jsonSchemaText)
        if (!converted) return
        fields = converted.fields
        arrayMin = converted.arrayMin
        arrayMax = converted.arrayMax
      }
      const next = await generateRecordsProgressive(fields, count, {
        arrayMin,
        arrayMax
      })
      setRecords(next)
    } catch (err) {
      setRecords(null)
      setGenerateError(
        err instanceof Error ? err.message : 'Could not generate records.'
      )
    } finally {
      setBusy(false)
    }
  }

  const handleApplySchema = () => {
    if (jsonSchemaIssue != null) return
    const converted = applyJsonSchema(jsonSchemaText)
    if (converted) {
      setUrl((current) => ({ ...current, m: 'fields' }))
    }
  }

  const handleClear = () => {
    setRecords(null)
    setGenerateError(null)
    setSchemaConvertError(null)
    setSchemaWarnings([])
  }

  const handleDownload = () => {
    if (!exportText) return
    const { ext, mime } = EXPORT_FILES[exportFormat]
    downloadTextFile(exportText, `mock-data.${ext}`, mime)
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
            fixtures. Build a field schema (dotted keys like{' '}
            <code>customer.name</code>, arrays like <code>items[].sku</code>) or
            paste a JSON Schema subset. Generation is client-side and
            non-deterministic (CSPRNG; no seed). Large runs yield so the UI stays
            responsive.
          </p>
        }
      >
        <div>
          <p className={`${toolLabelClass} mb-2`}>Mode</p>
          <ToolChipRow>
            <ToolChipButton
              active={editorMode === 'fields'}
              onClick={() =>
                setUrl((current) => ({ ...current, m: 'fields' }))
              }
            >
              Fields
            </ToolChipButton>
            <ToolChipButton
              active={editorMode === 'schema'}
              onClick={() =>
                setUrl((current) => ({ ...current, m: 'schema' }))
              }
            >
              JSON Schema
            </ToolChipButton>
          </ToolChipRow>
        </div>

        {editorMode === 'fields' ? (
          <>
        <div className="mt-4">
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
                    placeholder="key or path.to.key"
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
                {row.type === 'number' ? (
                  <div className="flex flex-wrap items-end gap-3">
                    <label className="flex flex-col gap-1 text-xs text-neutral-400">
                      Min
                      <input
                        type="number"
                        value={displayNumber(row.min ?? DEFAULT_NUMBER_MIN)}
                        onChange={(e) =>
                          handleNumberChange(row.id, 'min', e.target.value)
                        }
                        className={toolNumberInputClass}
                        aria-label={`Minimum for ${row.key || 'field'}`}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-neutral-400">
                      Max
                      <input
                        type="number"
                        value={displayNumber(row.max ?? DEFAULT_NUMBER_MAX)}
                        onChange={(e) =>
                          handleNumberChange(row.id, 'max', e.target.value)
                        }
                        className={toolNumberInputClass}
                        aria-label={`Maximum for ${row.key || 'field'}`}
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs text-neutral-400">
                      Decimals
                      <input
                        type="number"
                        min={0}
                        max={MAX_NUMBER_DECIMALS}
                        value={displayNumber(
                          row.decimals ?? DEFAULT_NUMBER_DECIMALS
                        )}
                        onChange={(e) =>
                          handleNumberChange(row.id, 'decimals', e.target.value)
                        }
                        className={toolNumberInputClass}
                        aria-label={`Decimals for ${row.key || 'field'}`}
                      />
                    </label>
                  </div>
                ) : null}
                {row.type === 'enum' ? (
                  <div className="space-y-1">
                    <input
                      value={row.valuesText ?? (row.values ?? []).join(', ')}
                      onChange={(e) => handleEnumChange(row.id, e.target.value)}
                      spellCheck={false}
                      placeholder="active, inactive, pending"
                      className={toolCompactInputClass}
                      aria-label={`Enum values for ${row.key || 'field'}`}
                    />
                    <p className={toolHintMetaClass}>
                      Comma-separated; one value is picked per record.
                    </p>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
          {hasArrays ? (
            <div className="mt-3 flex flex-wrap items-end gap-3">
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Array min
                <input
                  type="number"
                  min={MIN_ARRAY_LENGTH}
                  max={MAX_ARRAY_LENGTH}
                  value={url.amin}
                  onChange={(e) =>
                    setUrl((current) => ({
                      ...current,
                      amin: parseInt(e.target.value) || 0
                    }))
                  }
                  className={toolNumberInputClass}
                  aria-label="Minimum array length"
                />
              </label>
              <label className="flex flex-col gap-1 text-xs text-neutral-400">
                Array max
                <input
                  type="number"
                  min={MIN_ARRAY_LENGTH}
                  max={MAX_ARRAY_LENGTH}
                  value={url.amax}
                  onChange={(e) =>
                    setUrl((current) => ({
                      ...current,
                      amax: parseInt(e.target.value) || 0
                    }))
                  }
                  className={toolNumberInputClass}
                  aria-label="Maximum array length"
                />
              </label>
              <p className={`${toolHintMetaClass} pb-1.5`}>
                Length of every <code>[]</code> array, picked per record.
              </p>
            </div>
          ) : null}
        </div>
          </>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className={`${toolLabelClass} mb-0`}>JSON Schema</p>
              <div className="flex flex-wrap gap-1.5">
                <SecondaryButton
                  onClick={() =>
                    setUrl((current) => ({
                      ...current,
                      js: SAMPLE_MOCK_JSON_SCHEMA
                    }))
                  }
                >
                  Sample
                </SecondaryButton>
                <SecondaryButton
                  onClick={handleApplySchema}
                  disabled={jsonSchemaIssue != null}
                >
                  Apply to fields
                </SecondaryButton>
              </div>
            </div>
            <TextAreaWithLineNumbers
              value={jsonSchemaText}
              setValue={(value) =>
                setUrl((current) => ({
                  ...current,
                  js:
                    typeof value === 'function' ? value(current.js) : value
                }))
              }
              placeholder="Paste a draft-07 subset schema (root type object)…"
            />
            <p className={toolHintMetaClass}>{emptySchemaConvertHint()}</p>
            {schemaConvertError ? (
              <p className="text-sm text-red-400">{schemaConvertError}</p>
            ) : null}
            {schemaWarnings.length > 0 ? (
              <ul className="space-y-1 text-xs text-amber-300/90">
                {schemaWarnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            ) : null}
          </div>
        )}

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
              className={`${toolNumberInputClass} !w-20`}
              aria-label={`Count ${MIN_COUNT} to ${MAX_COUNT}`}
            />
          </div>

          <div className="flex min-w-0 flex-1 flex-col items-end gap-2">
            <p className={toolHintMetaClass}>{schemaHint}</p>
            {count > LARGE_COUNT_WARNING && countOk ? (
              <p className="text-xs text-amber-300/90">
                Large run ({count} records): generation yields in chunks so the
                UI stays responsive; preview is truncated - use Copy or Download
                for the full set.
              </p>
            ) : null}
            <div className="flex flex-wrap justify-end gap-1.5">
              <PrimaryButton
                onClick={() => void handleGenerate()}
                disabled={isGenerateDisabled}
              >
                {busy ? 'Generating…' : 'Generate'}
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
            <div className="flex items-center gap-2">
              <SecondaryButton onClick={handleDownload}>
                Download
              </SecondaryButton>
              <ToolCopyButton copied={copied === true} onClick={handleCopy} />
            </div>
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
        {exportFormat === 'sql' ? (
          <div className="mb-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="mock-sql-table"
                className="text-xs text-neutral-400"
              >
                Table
              </label>
              <input
                id="mock-sql-table"
                value={url.tbl}
                onChange={(e) =>
                  setUrl((current) => ({ ...current, tbl: e.target.value }))
                }
                spellCheck={false}
                className={`${toolCompactInputClass} max-w-56 font-mono`}
                placeholder={DEFAULT_SQL_TABLE}
              />
              <ToolChipRow>
                {SQL_DIALECTS.map((dialect) => (
                  <ToolChipButton
                    key={dialect}
                    active={url.d === dialect}
                    onClick={() =>
                      setUrl((current) => ({ ...current, d: dialect }))
                    }
                  >
                    {SQL_DIALECT_LABELS[dialect]}
                  </ToolChipButton>
                ))}
              </ToolChipRow>
            </div>
            <p className={toolHintMetaClass}>
              {tableIssue ?? (
                <>
                  Nested objects and arrays become JSON text columns. For JSON /
                  CSV you already have, use the{' '}
                  <Link
                    href="/t/sql-insert-generator"
                    className="text-custom_blue underline-offset-2 hover:underline"
                  >
                    SQL Insert Generator
                  </Link>
                  .
                </>
              )}
            </p>
          </div>
        ) : null}
        {generateError ? (
          <p className="mb-3 text-sm text-red-400">{generateError}</p>
        ) : null}
        <pre className={`${toolPreOutputClass} !break-words`}>
          {previewText || (
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
