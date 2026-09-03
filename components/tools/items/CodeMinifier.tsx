'use client'

import { useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton, SecondaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
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
import {
  beautifyCode,
  minifyCode,
  type CodeKind
} from '@/utils/codeMinify'

const LANGUAGE_TABS: { id: CodeKind; label: string }[] = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'javascript', label: 'JS' },
  { id: 'python', label: 'Python' }
]

const CodeMinifier = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [codeType, setCodeType] = useState<CodeKind>('javascript')
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)

  const { unlockAchievement } = useAchievementContext()

  const run = async (action: 'beautify' | 'minify') => {
    if (!input.trim() || busy) return
    setBusy(true)
    try {
      const next =
        action === 'beautify'
          ? await beautifyCode(codeType, input)
          : await minifyCode(codeType, input)
      setOutput(next)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    } finally {
      setBusy(false)
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
    <ToolLayout title="HTML / CSS / JS / Python Minifier">
      <div className={toolPanelClass}>
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste your code here..."
        />

        <div className={toolToolbarBetweenClass}>
          <div className={`${toolSegmentBarClass} w-full sm:w-auto`}>
            {LANGUAGE_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCodeType(tab.id)}
                className={toolSegmentTabClass(codeType === tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-3">
            <PrimaryButton
              onClick={() => void run('beautify')}
              disabled={!input.trim() || busy}
            >
              Beautify
            </PrimaryButton>

            <SecondaryButton
              onClick={() => void run('minify')}
              disabled={!input.trim() || busy}
            >
              Minify
            </SecondaryButton>

            <ClearButton onClick={handleClear}>Clear</ClearButton>
          </div>
        </div>
        <p className={`${toolHintMetaClass} mt-3`}>
          {codeType === 'javascript'
            ? 'JavaScript is parsed (JS, JSX, and TypeScript). Comments including // are stripped on minify; semicolons are preserved.'
            : codeType === 'python'
              ? 'Python minify strips # comments and blank lines but keeps indentation. Beautify trims trailing space and extra blank lines.'
              : 'Minify removes comments and extra whitespace. Beautify reformats with Prettier.'}
        </p>
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
