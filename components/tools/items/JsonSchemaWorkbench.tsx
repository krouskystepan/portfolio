'use client'

import { useRef, useState } from 'react'
import { toast } from 'sonner'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolIntroTextClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'
import { downloadTextFile, readTextFile } from '@/utils/download'
import {
  generateSchemaFromSample,
  validateAgainstSchema,
  type SchemaValidationError
} from '@/utils/jsonSchema'

const JsonSchemaWorkbench = ({
  embedded = false
}: { embedded?: boolean } = {}) => {
  const [url, setUrl] = useToolUrlState({
    sample: str('', { text: true }),
    schema: str('', { text: true })
  })
  const [errors, setErrors] = useState<SchemaValidationError[] | null>(null)
  const [validMessage, setValidMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()
  const sampleFileRef = useRef<HTMLInputElement>(null)
  const schemaFileRef = useRef<HTMLInputElement>(null)

  const setSample = (v: React.SetStateAction<string>) =>
    setUrl((s) => ({
      ...s,
      sample: typeof v === 'function' ? v(s.sample) : v
    }))

  const setSchema = (v: React.SetStateAction<string>) =>
    setUrl((s) => ({
      ...s,
      schema: typeof v === 'function' ? v(s.schema) : v
    }))

  const handleGenerate = () => {
    if (!url.sample.trim()) return
    try {
      const parsed = JSON.parse(url.sample) as unknown
      const schema = generateSchemaFromSample(parsed)
      setSchema(JSON.stringify(schema, null, 2))
      setErrors(null)
      setValidMessage(null)
    } catch (err) {
      setErrors([
        {
          path: '(sample)',
          message: err instanceof Error ? err.message : 'Invalid sample JSON'
        }
      ])
      setValidMessage(null)
    }
  }

  const handleValidate = async () => {
    if (!url.sample.trim() || !url.schema.trim()) return
    setBusy(true)
    setErrors(null)
    setValidMessage(null)
    try {
      const data = JSON.parse(url.sample) as unknown
      const schema = JSON.parse(url.schema) as object
      const result = await validateAgainstSchema(schema, data)
      if (result.valid) {
        setValidMessage('Instance is valid against the schema (draft-07 dialect via Ajv).')
        setErrors([])
      } else {
        setErrors(result.errors)
      }
    } catch (err) {
      setErrors([
        {
          path: '(input)',
          message: err instanceof Error ? err.message : 'Validation failed'
        }
      ])
    } finally {
      setBusy(false)
    }
  }

  const handleClear = () => {
    setSample('')
    setSchema('')
    setErrors(null)
    setValidMessage(null)
  }

  const handleCopySchema = () => {
    navigator.clipboard.writeText(url.schema)
    unlockAchievement('clipboard-master')
    flash()
  }

  const openFile = async (
    file: File | null,
    target: 'sample' | 'schema'
  ) => {
    if (!file) return
    try {
      const text = await readTextFile(file)
      if (target === 'sample') setSample(text)
      else setSchema(text)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open file.')
    }
  }

  return (
    <ToolLayout title="JSON Schema" embedded={embedded}>
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Generate a draft-07 schema from sample JSON, or validate an instance
            against a schema. Processing stays in your browser.
          </p>
        }
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-neutral-300">
                Sample / instance JSON
              </h3>
              <SecondaryButton onClick={() => sampleFileRef.current?.click()}>
                Open
              </SecondaryButton>
            </div>
            <TextAreaWithLineNumbers
              value={url.sample}
              setValue={setSample}
              placeholder='{"id": 1, "name": "Ada"}'
            />
          </div>
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium text-neutral-300">Schema</h3>
              <SecondaryButton onClick={() => schemaFileRef.current?.click()}>
                Open
              </SecondaryButton>
            </div>
            <TextAreaWithLineNumbers
              value={url.schema}
              setValue={setSchema}
              placeholder="Generated or pasted JSON Schema…"
            />
          </div>
        </div>

        <input
          ref={sampleFileRef}
          type="file"
          accept=".json,application/json,text/plain"
          className="hidden"
          onChange={(e) => {
            void openFile(e.target.files?.[0] ?? null, 'sample')
            e.target.value = ''
          }}
        />
        <input
          ref={schemaFileRef}
          type="file"
          accept=".json,application/json,text/plain"
          className="hidden"
          onChange={(e) => {
            void openFile(e.target.files?.[0] ?? null, 'schema')
            e.target.value = ''
          }}
        />

        <div className={toolToolbarEndClass}>
          <PrimaryButton onClick={handleGenerate} disabled={!url.sample.trim()}>
            Generate schema
          </PrimaryButton>
          <PrimaryButton
            onClick={() => void handleValidate()}
            disabled={!url.sample.trim() || !url.schema.trim() || busy}
          >
            {busy ? 'Validating…' : 'Validate'}
          </PrimaryButton>
          <SecondaryButton
            onClick={() =>
              downloadTextFile(
                url.schema,
                'schema.json',
                'application/json;charset=utf-8'
              )
            }
            disabled={!url.schema.trim()}
          >
            Download schema
          </SecondaryButton>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>
          {url.schema ? (
            <ToolCopyButton
              copied={copied === true}
              onClick={handleCopySchema}
            />
          ) : null}
        </div>

        {errors && errors.length > 0 ? (
          <div className="space-y-2">
            {errors.map((err, i) => (
              <div key={`${err.path}-${i}`} className={toolErrorBoxClass}>
                <strong>{err.path}</strong>
                <div className="mt-1">{err.message}</div>
              </div>
            ))}
          </div>
        ) : validMessage ? (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-300">
            {validMessage}
          </div>
        ) : url.schema ? (
          <pre className={toolPreOutputClass}>{url.schema}</pre>
        ) : (
          <div className={toolEmptyHintClass}>
            Generate a schema from a sample, or paste a schema and validate.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default JsonSchemaWorkbench
