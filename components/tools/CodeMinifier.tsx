'use client'

import { useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '../TextAreaWithLineNumbers'
import ToolLayout from './ToolLayout'

import prettier from 'prettier/standalone'
import parserBabel from 'prettier/plugins/babel'
import parserHtml from 'prettier/plugins/html'
import parserPostcss from 'prettier/plugins/postcss'
import { ClearButton, PrimaryButton, SecondaryButton } from './ToolButtons'

type CodeType = 'html' | 'css' | 'javascript'

const CodeMinifier = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [codeType, setCodeType] = useState<CodeType>('javascript')
  const [copied, setCopied] = useState(false)

  const { unlockAchievement } = useAchievementContext()

  const getParser = () => {
    switch (codeType) {
      case 'html':
        return { parser: 'html', plugins: [parserHtml] }
      case 'css':
        return { parser: 'css', plugins: [parserPostcss] }
      case 'javascript':
        return { parser: 'babel', plugins: [parserBabel] }
    }
  }

  const handleFormat = async () => {
    if (!input.trim()) return

    try {
      const { parser, plugins } = getParser()

      const formatted = await prettier.format(input, {
        parser,
        plugins,
        semi: true,
        singleQuote: true
      })

      setOutput(formatted)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  const handleMinify = async () => {
    if (!input.trim()) return

    try {
      const { parser, plugins } = getParser()

      const minified = await prettier.format(input, {
        parser,
        plugins,
        printWidth: Infinity,
        tabWidth: 0,
        useTabs: false,
        semi: true,
        singleQuote: true
      })

      // remove newlines + extra spaces (safe post-processing)
      const compact = minified
        .replace(/\n/g, '')
        .replace(/\s{2,}/g, ' ')
        .trim()

      setOutput(compact)
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
    <ToolLayout title="HTML / CSS / JS Minifier">
      <div className="flex flex-col rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm">
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your code here..."
        />

        <div className="mt-4 flex flex-wrap justify-between gap-3">
          <div className="flex gap-2">
            {(['html', 'css', 'javascript'] as CodeType[]).map((type) => (
              <button
                key={type}
                onClick={() => setCodeType(type)}
                className={`rounded-lg px-3 py-1.5 text-sm transition ${
                  codeType === type
                    ? 'bg-custom_blue text-white'
                    : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
                }`}
              >
                {type.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton onClick={handleFormat} disabled={!input.trim()}>
              Beautify
            </PrimaryButton>

            <SecondaryButton onClick={handleMinify} disabled={!input.trim()}>
              Minify
            </SecondaryButton>

            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
      </div>

      <div className="overflow-auto rounded-2xl border border-dashed border-white/15 bg-neutral-950/40 p-6 backdrop-blur-sm">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Result</h2>

          {output && (
            <button
              onClick={handleCopy}
              disabled={copied}
              className={`h-8 rounded-lg bg-neutral-800 px-3 py-1.5 text-xs font-medium transition ${
                copied
                  ? 'cursor-default text-custom_blue'
                  : 'text-neutral-100 hover:bg-neutral-700 active:scale-95'
              }`}
            >
              {copied ? 'Copied!' : 'Copy'}
            </button>
          )}
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-4 font-mono text-sm text-red-400">
            <strong>Error:</strong> {error}
          </div>
        ) : output ? (
          <pre className="w-full overflow-auto rounded-lg border border-white/10 bg-neutral-900/50 p-3 font-mono text-sm text-neutral-100">
            {output}
          </pre>
        ) : (
          <div className="text-sm text-neutral-400">
            Output will appear here after processing.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default CodeMinifier
