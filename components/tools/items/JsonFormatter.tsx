'use client'

import { useAchievementContext } from '@/context/AchievementContext'
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
  toolHintMetaClass,
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
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'
import { downloadTextFile, readTextFile } from '@/utils/download'
import { sortKeysDeep } from '@/utils/jsonSort'

type ParseIssue = {
  message: string
  singleQuotes: boolean
  unquotedKeys: boolean
  trailingComma: boolean
} | null

function detectParseIssue(message: string): NonNullable<ParseIssue> {
  const singleQuotes =
    /Unexpected token ''?'|is not valid JSON|token ' in JSON|Unexpected token '|'|invalid character '|‘|’/i.test(
      message
    )

  const unquotedKeys =
    /Expected (property name|double-quoted property name)|in JSON at position|in JSON at line/i.test(
      message
    )

  const trailingComma =
    /Unexpected token }|Unexpected token ]|Trailing comma|Unexpected end of JSON input/i.test(
      message
    )

  return { message, singleQuotes, unquotedKeys, trailingComma }
}

function escapeJsonStringLiteral(text: string): string {
  return JSON.stringify(text)
}

function unescapeJsonStringLiteral(text: string): string {
  const trimmed = text.trim()
  try {
    const parsed = JSON.parse(trimmed)
    if (typeof parsed === 'string') return parsed
  } catch {
    // fall through — try wrapping
  }
  try {
    const parsed = JSON.parse(`"${trimmed.replace(/^"|"$/g, '')}"`)
    if (typeof parsed === 'string') return parsed
  } catch {
    throw new Error('Input is not a valid JSON string literal.')
  }
  throw new Error('Input is not a valid JSON string literal.')
}

const LARGE_JSON_CHARS = 100_000

/** Yield to the browser so large paste/format work does not freeze the UI. */
function yieldToUi(): Promise<void> {
  return new Promise((resolve) => {
    if (typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => resolve())
    } else {
      setTimeout(resolve, 0)
    }
  })
}

const JsonFormatter = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [url, setUrl] = useToolUrlState({
    json: str('', { text: true })
  })
  const input = url.json
  const [formatted, setFormatted] = useState('')
  const [issue, setIssue] = useState<ParseIssue>(null)
  const [busy, setBusy] = useState(false)
  const { copied, flash } = useCopyFeedback()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { unlockAchievement } = useAchievementContext()

  const setInput = (v: React.SetStateAction<string>) =>
    setUrl((s) => ({
      ...s,
      json: typeof v === 'function' ? v(s.json) : v
    }))

  const hasFixableIssue = Boolean(
    issue && (issue.singleQuotes || issue.unquotedKeys || issue.trailingComma)
  )

  const runParseTransform = async (
    transform: (parsed: unknown) => string
  ) => {
    if (!input.trim()) return
    const large = input.length >= LARGE_JSON_CHARS
    if (large) setBusy(true)
    try {
      if (large) await yieldToUi()
      const parsed = JSON.parse(input) as unknown
      if (large) await yieldToUi()
      setFormatted(transform(parsed))
      setIssue(null)
    } catch (err) {
      setIssue(detectParseIssue((err as Error).message))
      setFormatted('')
    } finally {
      if (large) setBusy(false)
    }
  }

  const handleFormat = () => {
    void runParseTransform((parsed) => JSON.stringify(parsed, null, 2))
  }

  const handleMinify = () => {
    void runParseTransform((parsed) => JSON.stringify(parsed))
  }

  const handleSortKeys = () => {
    void runParseTransform((parsed) =>
      JSON.stringify(sortKeysDeep(parsed), null, 2)
    )
  }

  const handleEscape = () => {
    if (!input) return
    setFormatted(escapeJsonStringLiteral(input))
    setIssue(null)
  }

  const handleUnescape = () => {
    if (!input.trim()) return
    try {
      setFormatted(unescapeJsonStringLiteral(input))
      setIssue(null)
    } catch (err) {
      setIssue({
        message: (err as Error).message,
        singleQuotes: false,
        unquotedKeys: false,
        trailingComma: false
      })
      setFormatted('')
    }
  }

  const handleClear = () => {
    setInput('')
    setFormatted('')
    setIssue(null)
  }

  const handleFixIssues = () => {
    let fixed = input

    fixed = fixed.replace(/'/g, '"')
    fixed = fixed.replace(/(\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
    fixed = fixed.replace(/,\s*([}\]])/g, '$1')

    try {
      const parsed = JSON.parse(fixed)
      fixed = JSON.stringify(parsed, null, 2)
    } catch (err) {
      toast.error('Could not fully fix JSON. Please check your input.')
      console.log('Could not fully fix JSON:', err)
    }

    setInput(fixed)
    setIssue(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted)
    unlockAchievement('clipboard-master')
    flash()
  }

  const handleDownload = () => {
    if (!formatted) return
    downloadTextFile(formatted, 'data.json', 'application/json;charset=utf-8')
  }

  const handleOpenFile = async (file: File | null) => {
    if (!file) return
    try {
      const text = await readTextFile(file)
      setInput(text)
      setFormatted('')
      setIssue(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to open file.')
    }
  }

  const highlightJson = (json: string): string => {
    if (!json) return ''

    const escaped = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        if (/^".*":$/.test(match)) {
          return `<span class="text-blue-400">${match}</span>`
        }
        if (/^"/.test(match)) {
          return `<span class="text-green-400">${match}</span>`
        }
        if (/^-?\d/.test(match)) {
          return `<span class="text-purple-400">${match}</span>`
        }
        if (/true|false|null/.test(match)) {
          return `<span class="text-amber-400">${match}</span>`
        }
        return match
      }
    )
  }

  const actionsDisabled = !input.trim() || busy

  return (
    <ToolLayout title="JSON Formatter & Validator" embedded={embedded}>
      <ToolInputPanel>
        <p className={`${toolHintMetaClass} mb-3`}>
          Duplicate object keys are collapsed by{' '}
          <code className="text-neutral-400">JSON.parse</code> before this tool
          runs — the last value wins, and a faithful “remove duplicates” pass is
          not available after parse.
        </p>
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your JSON here..."
        />

        <input
          ref={fileInputRef}
          type="file"
          accept=".json,.txt,application/json,text/plain"
          className="hidden"
          onChange={(e) => {
            void handleOpenFile(e.target.files?.[0] ?? null)
            e.target.value = ''
          }}
        />

        <div className={toolToolbarBetweenClass}>
          <div className="flex flex-wrap gap-1.5">
            {hasFixableIssue ? (
              <ToolChipButton active tone="accent" onClick={handleFixIssues}>
                Fix Common Issues
              </ToolChipButton>
            ) : null}
            <SecondaryButton onClick={() => fileInputRef.current?.click()}>
              Open file
            </SecondaryButton>
          </div>

          <div className={toolFlexEndButtonsClass}>
            <PrimaryButton onClick={handleFormat} disabled={actionsDisabled}>
              {busy ? 'Working…' : 'Format'}
            </PrimaryButton>
            <SecondaryButton onClick={handleMinify} disabled={actionsDisabled}>
              Minify
            </SecondaryButton>
            <SecondaryButton onClick={handleSortKeys} disabled={actionsDisabled}>
              Sort keys
            </SecondaryButton>
            <SecondaryButton onClick={handleEscape} disabled={!input || busy}>
              Escape
            </SecondaryButton>
            <SecondaryButton
              onClick={handleUnescape}
              disabled={actionsDisabled}
            >
              Unescape
            </SecondaryButton>
            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>

          {formatted ? (
            <div className="flex flex-wrap gap-2">
              <SecondaryButton onClick={handleDownload}>Download</SecondaryButton>
              <ToolCopyButton copied={copied === true} onClick={handleCopy} />
            </div>
          ) : null}
        </div>

        {issue ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {issue.message}
            <div className="mt-2 text-amber-400">
              {issue.singleQuotes && (
                <div>
                  It looks like your JSON uses <b>single quotes</b> instead of
                  double quotes.
                </div>
              )}
              {issue.unquotedKeys && (
                <div>
                  Your JSON contains <b>unquoted keys</b>. All keys must be in
                  double quotes.
                </div>
              )}
              {issue.trailingComma && (
                <div>
                  Your JSON has a <b>trailing comma</b>. Remove it before
                  parsing.
                </div>
              )}
              {hasFixableIssue && (
                <div className="mt-2">
                  Click <b>“Fix Common Issues”</b> to auto-correct it.
                </div>
              )}
            </div>
          </div>
        ) : formatted ? (
          <pre
            className={`${toolPreOutputClass} overflow-x-hidden text-wrap`}
            dangerouslySetInnerHTML={{ __html: highlightJson(formatted) }}
          />
        ) : (
          <div className={toolEmptyHintClass}>
            Output will appear here after formatting.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default JsonFormatter
