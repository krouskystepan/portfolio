'use client'

import { useAchievementContext } from '@/context/AchievementContext'
import { Suspense, useMemo } from 'react'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolListItemClass,
  toolMediumCardClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { buildUnicodeVariants, inspectUnicodeChars } from '@/utils/unicodeAscii'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'

function UnicodeAsciiConverterInner() {
  const [url, setUrl] = useToolUrlState({
    t: str('', { text: true })
  })
  const input = url.t
  const { copied, flash } = useCopyFeedback()

  const { unlockAchievement } = useAchievementContext()

  const variants = useMemo(() => buildUnicodeVariants(input), [input])
  const inspection = useMemo(() => inspectUnicodeChars(input), [input])
  const hasInput = input.length > 0

  const copyValue = (label: string, text: string) => {
    if (!text) return
    navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(label)
  }

  return (
    <ToolLayout title="Unicode / ASCII converter">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Paste text or ASCII codes. Hello becomes 72 101 108 108 111, and
            those numbers become Hello. Also handles <code>{'\\u00E9'}</code>,
            hex, and <code>U+0048</code>.
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
          placeholder="Hello  or  72 101 108 108 111"
        />
        <div className={toolToolbarEndClass}>
          <ClearButton onClick={() => setUrl({ t: '' })}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Results</h2>

        {!hasInput ? (
          <p className={toolEmptyHintClass}>
            Conversions appear here as you type.
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-3 font-mono text-sm lg:grid-cols-2">
            {variants.map(({ label, value }) => (
              <li key={label} className={toolMediumCardClass}>
                <div className="flex items-start justify-between gap-3">
                  <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-400">
                    {label}
                  </span>
                  <ToolCopyButton
                    copied={copied === label}
                    onClick={() => copyValue(label, value)}
                    disabled={!value}
                  />
                </div>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap break-all text-[13px] leading-relaxed text-neutral-200">
                  {value || (
                    <span className="text-neutral-500">
                      Empty after conversion.
                    </span>
                  )}
                </pre>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className={toolResultPanelClass}>
        <h2 className={`mb-3 ${toolSectionTitleClass}`}>Character list</h2>

        {!hasInput ? (
          <p className={toolEmptyHintClass}>
            Each character, code point, UTF-8 bytes, and ASCII stand-in.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {inspection.chars.map((row, index) => (
                <li
                  key={`${row.codePoint}-${index}`}
                  className={`${toolListItemClass} flex flex-wrap items-center justify-between gap-x-4 gap-y-1`}
                >
                  <span className="min-w-8 text-center text-base">
                    {row.char}
                  </span>
                  <span className="text-custom_blue">{row.codePoint}</span>
                  <span className="text-neutral-400">utf-8 {row.utf8}</span>
                  <span
                    className={
                      row.isAscii ? 'text-neutral-300' : 'text-amber-200/90'
                    }
                  >
                    ascii {row.ascii}
                  </span>
                </li>
              ))}
            </ul>
            {inspection.truncated ? (
              <p className={`mt-3 ${toolHintMetaClass}`}>
                Showing the first {inspection.chars.length} of{' '}
                {inspection.total} characters.
              </p>
            ) : null}
          </>
        )}
      </div>
    </ToolLayout>
  )
}

export default function UnicodeAsciiConverter() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Unicode / ASCII converter">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <UnicodeAsciiConverterInner />
    </Suspense>
  )
}
