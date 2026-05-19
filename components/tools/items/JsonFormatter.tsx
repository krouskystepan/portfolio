'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { useState } from 'react'
import { toast } from 'sonner'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton, SecondaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolAccentButtonClass,
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolPanelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  toolFlexEndButtonsClass,
  ToolCopyButton
} from '@/components/tools/_shared/toolUi'

const JsonFormatter = ({ embedded = false }: { embedded?: boolean } = {}) => {
  const [input, setInput] = useState('')
  const [formatted, setFormatted] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [quoteError, setQuoteError] = useState(false)
  const [unquotedKeyError, setUnquotedKeyError] = useState(false)
  const [trailingCommaError, setTrailingCommaError] = useState(false)
  const [copied, setCopied] = useState(false)

  const { unlockAchievement } = useAchievementContext()

  const resetErrors = () => {
    setQuoteError(false)
    setUnquotedKeyError(false)
    setTrailingCommaError(false)
  }

  const handleFormat = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      const pretty = JSON.stringify(parsed, null, 2)
      setFormatted(pretty)
      setError(null)
      resetErrors()
    } catch (err) {
      const message = (err as Error).message
      setError(message)
      detectErrorType(message)
      setFormatted('')
    }
  }

  const handleMinify = () => {
    if (!input.trim()) return
    try {
      const parsed = JSON.parse(input)
      const minified = JSON.stringify(parsed)
      setFormatted(minified)
      setError(null)
      resetErrors()
    } catch (err) {
      const message = (err as Error).message
      setError(message)
      detectErrorType(message)
      setFormatted('')
    }
  }

  const detectErrorType = (message: string) => {
    resetErrors()

    const singleQuoteError =
      /Unexpected token ''?'|is not valid JSON|token ' in JSON|Unexpected token '|'|invalid character '|‘|’/i.test(
        message
      )

    const unquotedKeyErrorPattern =
      /Expected (property name|double-quoted property name)|in JSON at position|in JSON at line/i.test(
        message
      )

    const trailingCommaPattern =
      /Unexpected token }|Unexpected token ]|Trailing comma|Unexpected end of JSON input/i.test(
        message
      )

    if (singleQuoteError) setQuoteError(true)
    if (unquotedKeyErrorPattern) setUnquotedKeyError(true)
    if (trailingCommaPattern) setTrailingCommaError(true)
  }

  const handleClear = () => {
    setInput('')
    setFormatted('')
    setError(null)
    resetErrors()
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
    resetErrors()
    setError(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(formatted)
    unlockAchievement('clipboard-master')
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
      <div className={toolPanelClass}>
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your JSON here..."
        />

        <div className={toolToolbarBetweenClass}>
          {(quoteError || unquotedKeyError || trailingCommaError) && (
            <button
              type="button"
              onClick={handleFixIssues}
              className={toolAccentButtonClass}
            >
              Fix Common Issues
            </button>
          )}

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
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>

          {formatted ? (
            <ToolCopyButton copied={copied} onClick={handleCopy} />
          ) : null}
        </div>

        {error ? (
          <div className={toolErrorBoxClass}>
            <strong>Error:</strong> {error}
            <div className="mt-2 text-amber-400">
              {quoteError && (
                <div>
                  It looks like your JSON uses <b>single quotes</b> instead of
                  double quotes.
                </div>
              )}
              {unquotedKeyError && (
                <div>
                  Your JSON contains <b>unquoted keys</b>. All keys must be in
                  double quotes.
                </div>
              )}
              {trailingCommaError && (
                <div>
                  Your JSON has a <b>trailing comma</b>. Remove it before
                  parsing.
                </div>
              )}
              {(quoteError || unquotedKeyError || trailingCommaError) && (
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
