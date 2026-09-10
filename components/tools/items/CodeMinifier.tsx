'use client'

import { Suspense, useState } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton, PrimaryButton, SecondaryButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import {
  beautifyCode,
  minifyCode,
  type CodeKind
} from '@/utils/codeMinify'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'

const LANGUAGE_TABS: { id: CodeKind; label: string }[] = [
  { id: 'html', label: 'HTML' },
  { id: 'css', label: 'CSS' },
  { id: 'javascript', label: 'JS' },
  { id: 'python', label: 'Python' }
]

const CODE_KINDS = ['html', 'css', 'javascript', 'python'] as const satisfies readonly CodeKind[]

function CodeMinifierInner() {
  const [url, setUrl] = useToolUrlState({
    code: str('', { text: true }),
    lang: enumParam<CodeKind>('javascript', CODE_KINDS)
  })
  const input = url.code
  const codeType = url.lang
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, flash } = useCopyFeedback()
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
    setUrl({ code: '', lang: codeType })
    setOutput('')
    setError(null)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    unlockAchievement('clipboard-master')
    flash()
  }

  return (
    <ToolLayout title="HTML / CSS / JS / Python Minifier">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Beautify or minify HTML, CSS, JavaScript, or Python in the browser.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={(v) =>
            setUrl((s) => ({
              ...s,
              code: typeof v === 'function' ? v(s.code) : v
            }))
          }
          placeholder="Paste your code here..."
        />

        <div className={toolToolbarBetweenClass}>
          <ToolChipRow>
            {LANGUAGE_TABS.map((tab) => (
              <ToolChipButton
                key={tab.id}
                active={codeType === tab.id}
                onClick={() => setUrl((s) => ({ ...s, lang: tab.id }))}
              >
                {tab.label}
              </ToolChipButton>
            ))}
          </ToolChipRow>

          <div className="flex flex-wrap gap-1.5">
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
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>

          {output ? (
            <ToolCopyButton copied={copied === true} onClick={handleCopy} />
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

export default function CodeMinifier() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="HTML / CSS / JS / Python Minifier">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <CodeMinifierInner />
    </Suspense>
  )
}
