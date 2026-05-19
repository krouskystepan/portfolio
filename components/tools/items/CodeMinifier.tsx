'use client'

import { useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'

import prettier from 'prettier/standalone'
import parserBabel from 'prettier/plugins/babel'
import parserHtml from 'prettier/plugins/html'
import parserPostcss from 'prettier/plugins/postcss'
import { ClearButton, PrimaryButton, SecondaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolPanelClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolSegmentBarClass,
  toolSegmentTabClass,
  toolToolbarBetweenClass,
  ToolCopyButton
} from '@/components/tools/_shared/toolUi'

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
      <div className={toolPanelClass}>
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your code here..."
        />

        <div className={toolToolbarBetweenClass}>
          <div className={`${toolSegmentBarClass} w-full sm:w-auto`}>
            {(['html', 'css', 'javascript'] as CodeType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setCodeType(type)}
                className={toolSegmentTabClass(codeType === type)}
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
            Output will appear here after processing.
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default CodeMinifier
