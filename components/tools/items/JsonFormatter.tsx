'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useState } from 'react'
import { toast } from 'sonner'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton, SecondaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
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

const JsonFormatter = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [url, setUrl] = useToolUrlState({
    json: str('', { text: true })
  })
  const input = url.json
  const [formatted, setFormatted] = useState('')
  const [issue, setIssue] = useState<ParseIssue>(null)
  const { copied, flash } = useCopyFeedback()

  const { unlockAchievement } = useAchievementContext()

  const setInput = (v: React.SetStateAction<string>) =>
    setUrl((s) => ({
      ...s,
      json: typeof v === 'function' ? v(s.json) : v
    }))

  const hasFixableIssue = Boolean(
    issue && (issue.singleQuotes || issue.unquotedKeys || issue.trailingComma)
  )

  const handleFormat = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setFormatted(JSON.stringify(parsed, null, 2))
      setIssue(null)
    } catch (err) {
      setIssue(detectParseIssue((err as Error).message))
      setFormatted('')
    }
  }

  const handleMinify = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      setFormatted(JSON.stringify(parsed))
      setIssue(null)
    } catch (err) {
      setIssue(detectParseIssue((err as Error).message))
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

  const highlightJson = (json: string): string => {
    if (!json) return ''

    // escape HTML first
    const escaped = json
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')

    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^"\\])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d+)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        // KEY (string ending with :)
        if (/^".*":$/.test(match)) {
          return `<span class="text-blue-400">${match}</span>`
        }
        // STRING value
        if (/^"/.test(match)) {
          return `<span class="text-green-400">${match}</span>`
        }
        // NUMBER
        if (/^-?\d/.test(match)) {
          return `<span class="text-purple-400">${match}</span>`
        }
        // BOOLEAN or null
        if (/true|false|null/.test(match)) {
          return `<span class="text-amber-400">${match}</span>`
        }
        return match
      }
    )
  }

  return (
    <ToolLayout title="JSON Formatter & Validator" embedded={embedded}>
      <ToolInputPanel>
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your JSON here..."
        />

        <div className={toolToolbarBetweenClass}>
          {hasFixableIssue ? (
            <ToolChipButton active tone="accent" onClick={handleFixIssues}>
              Fix Common Issues
            </ToolChipButton>
          ) : null}

          <div className={toolFlexEndButtonsClass}>
            <PrimaryButton onClick={handleFormat} disabled={!input.trim()}>
              Format
            </PrimaryButton>

            <SecondaryButton onClick={handleMinify} disabled={!input.trim()}>
              Minify
            </SecondaryButton>

            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>

          {formatted ? (
            <ToolCopyButton copied={copied === true} onClick={handleCopy} />
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
