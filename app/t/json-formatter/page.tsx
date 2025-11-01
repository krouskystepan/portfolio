'use client'

import TextAreaWithLineNumbers from '@/components/TextAreaWithLineNumbers'
import { useState } from 'react'
import { toast } from 'sonner'

export default function JsonFormatterPage() {
  const [input, setInput] = useState('')
  const [formatted, setFormatted] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [quoteError, setQuoteError] = useState(false)
  const [unquotedKeyError, setUnquotedKeyError] = useState(false)
  const [trailingCommaError, setTrailingCommaError] = useState(false)

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

  return (
    <div>
      <h2 className="mb-8 text-center text-4xl font-bold lg:text-5xl">
        JSON Formatter & Validator
      </h2>

      <div className="mb-8 grid grid-cols-1 gap-6">
        <div className="flex flex-col rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-5 backdrop-blur-sm">
          <h2 className="mb-2 text-lg font-semibold text-neutral-100">
            Input JSON
          </h2>

          <TextAreaWithLineNumbers
            value={input}
            setValue={setInput}
            placeholder="Paste your JSON here..."
          />

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              onClick={handleFormat}
              disabled={!input.trim()}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !input.trim()
                  ? 'cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-60'
                  : 'bg-custom_blue text-white hover:opacity-90'
              }`}
            >
              Format
            </button>

            <button
              onClick={handleMinify}
              disabled={!input.trim()}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                !input.trim()
                  ? 'cursor-not-allowed bg-neutral-800 text-neutral-500 opacity-60'
                  : 'bg-neutral-800 text-neutral-100 hover:bg-neutral-700'
              }`}
            >
              Minify
            </button>

            <button
              onClick={handleClear}
              className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-100 transition hover:bg-neutral-700"
            >
              Clear
            </button>

            {(quoteError || unquotedKeyError || trailingCommaError) && (
              <button
                onClick={handleFixIssues}
                className="rounded-lg bg-amber-600/90 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
              >
                Fix Common Issues
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 text-neutral-100 backdrop-blur-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Result</h2>
          {formatted && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(formatted)
                toast.success('Formatted JSON copied to clipboard!')
              }}
              className="rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium text-neutral-100 transition hover:bg-neutral-700 active:scale-95"
            >
              Copy
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-sm text-red-400">
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
          <pre className="relative w-full overflow-auto overflow-x-hidden text-wrap rounded-lg border border-white/10 bg-neutral-900/50 p-3 font-mono text-sm text-neutral-100">
            {formatted}
          </pre>
        ) : (
          <div className="text-sm text-neutral-400">
            Output will appear here after formatting.
          </div>
        )}
      </div>
    </div>
  )
}
