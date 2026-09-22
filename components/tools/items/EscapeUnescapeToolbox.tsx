'use client'

import { Suspense, useMemo } from 'react'
import Link from 'next/link'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
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
import { useAchievementContext } from '@/context/AchievementContext'
import {
  escapeText,
  unescapeText,
  type EscapeLanguage,
  type QuoteStyle
} from '@/utils/stringEscape'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'

const LANG_IDS = [
  'c',
  'python',
  'shell'
] as const satisfies readonly EscapeLanguage[]
const QUOTE_IDS = [
  'double',
  'single',
  'ansi-c'
] as const satisfies readonly QuoteStyle[]

const LANG_LABELS: Record<EscapeLanguage, string> = {
  c: 'C',
  python: 'Python',
  shell: 'Shell'
}

function quoteOptionsFor(language: EscapeLanguage): {
  id: QuoteStyle
  label: string
}[] {
  if (language === 'shell') {
    return [
      { id: 'single', label: 'Single' },
      { id: 'double', label: 'Double' },
      { id: 'ansi-c', label: 'ANSI-C' }
    ]
  }
  return [
    { id: 'double', label: 'Double' },
    { id: 'single', label: 'Single' }
  ]
}

function defaultQuoteFor(language: EscapeLanguage): QuoteStyle {
  return language === 'shell' ? 'single' : 'double'
}

function normalizeQuote(
  language: EscapeLanguage,
  quote: QuoteStyle
): QuoteStyle {
  if (language !== 'shell' && quote === 'ansi-c') {
    return defaultQuoteFor(language)
  }
  return quote
}

function EscapeUnescapeToolboxInner() {
  const [url, setUrl] = useToolUrlState({
    t: str('', { text: true }),
    lang: enumParam<EscapeLanguage>('c', LANG_IDS),
    quote: enumParam<QuoteStyle>('double', QUOTE_IDS)
  })

  const input = url.t
  const language = url.lang
  const quoteStyle = normalizeQuote(language, url.quote)
  const { copied, flash, clear } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const escaped = useMemo(
    () => escapeText(input, language, quoteStyle),
    [input, language, quoteStyle]
  )

  const unescaped = useMemo(
    () => unescapeText(input, language, quoteStyle),
    [input, language, quoteStyle]
  )

  const handleCopy = async (which: 'escaped' | 'unescaped', value: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    unlockAchievement('clipboard-master')
    flash(which)
  }

  const setLanguage = (lang: EscapeLanguage) => {
    setUrl((s) => {
      let quote = s.quote
      if (lang !== s.lang) {
        quote =
          lang === 'shell' || s.lang === 'shell'
            ? defaultQuoteFor(lang)
            : normalizeQuote(lang, s.quote)
      }
      return { ...s, lang, quote }
    })
  }

  const quoteOptions = quoteOptionsFor(language)

  return (
    <ToolLayout title="Escape / unescape toolbox">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Escape or unescape strings for C, Python, and shell. Turn log
            escapes into readable text, or raw text into pasteable literals.
            For JS/JSON <code>\u</code> escapes use the{' '}
            <Link
              href="/t/unicode-ascii"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              Unicode / ASCII converter
            </Link>
            ; for percent-encoding use the{' '}
            <Link
              href="/t/url-encoder-decoder"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              URL encoder
            </Link>
            .
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={(v) =>
            setUrl((s) => ({
              ...s,
              t: typeof v === 'function' ? v(s.t) : v
            }))
          }
          placeholder="Paste a string literal, log escape, or raw text…"
        />

        <div className={toolToolbarBetweenClass}>
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <ToolChipRow>
              {LANG_IDS.map((id) => (
                <ToolChipButton
                  key={id}
                  active={language === id}
                  onClick={() => setLanguage(id)}
                >
                  {LANG_LABELS[id]}
                </ToolChipButton>
              ))}
            </ToolChipRow>
            <ToolChipRow>
              {quoteOptions.map(({ id, label }) => (
                <ToolChipButton
                  key={id}
                  active={quoteStyle === id}
                  onClick={() => setUrl((s) => ({ ...s, quote: id }))}
                >
                  {label}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          </div>
          <ClearButton
            onClick={() => {
              setUrl((s) => ({ ...s, t: '' }))
              clear()
            }}
          >
            Clear
          </ClearButton>
        </div>
        <p className={`${toolHintMetaClass} mt-3`}>
          Escaped and unescaped results both appear below. Copy the one you
          need.
        </p>
      </ToolInputPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>Escaped</h2>
            {input && escaped.ok && escaped.value ? (
              <ToolCopyButton
                copied={copied === 'escaped'}
                onClick={() => handleCopy('escaped', escaped.value)}
              />
            ) : null}
          </div>
          {!escaped.ok ? (
            <div className={toolErrorBoxClass}>{escaped.error}</div>
          ) : (
            <>
              {escaped.warning ? (
                <div className={`${toolErrorBoxClass} mb-3`}>
                  {escaped.warning}
                </div>
              ) : null}
              <pre className={toolPreOutputClass}>
                {escaped.value || (
                  <span className="text-neutral-500">
                    Escaped output appears here.
                  </span>
                )}
              </pre>
            </>
          )}
        </div>

        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>Unescaped</h2>
            {input && unescaped.ok && unescaped.value ? (
              <ToolCopyButton
                copied={copied === 'unescaped'}
                onClick={() => handleCopy('unescaped', unescaped.value)}
              />
            ) : null}
          </div>
          {!unescaped.ok ? (
            <div className={toolErrorBoxClass}>{unescaped.error}</div>
          ) : (
            <>
              {unescaped.warning ? (
                <div className={`${toolErrorBoxClass} mb-3`}>
                  {unescaped.warning}
                </div>
              ) : null}
              <pre className={toolPreOutputClass}>
                {input ? (
                  unescaped.value
                ) : (
                  <span className="text-neutral-500">
                    Unescaped text appears here.
                  </span>
                )}
              </pre>
            </>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}

export default function EscapeUnescapeToolbox() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Escape / unescape toolbox">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <EscapeUnescapeToolboxInner />
    </Suspense>
  )
}
