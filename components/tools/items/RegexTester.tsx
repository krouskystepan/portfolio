'use client'

import { Suspense, useMemo } from 'react'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolIntroTextClass,
  toolInputClass,
  toolLabelClass,
  toolListItemClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { str, useToolUrlState } from '@/hooks/useToolUrlState'

function RegexTesterInner() {
  const [url, setUrl] = useToolUrlState({
    p: str('[A-Za-z]+'),
    f: str('g'),
    t: str('Hello regex world', { text: true })
  })
  const { p: pattern, f: flags, t: haystack } = url

  const result = useMemo(() => {
    if (!pattern.trim()) {
      return { ok: true as const, error: null as string | null, matches: [] as string[] }
    }
    try {
      const re = new RegExp(pattern, flags.replace(/[^gimsuy]/g, ''))
      const matches = [...haystack.matchAll(re)].map((m) => {
        const idx = m.index ?? 0
        const text = m[0]
        return `"${text}" @ ${idx}`
      })
      return { ok: true as const, error: null as string | null, matches }
    } catch (err) {
      return {
        ok: false as const,
        error: (err as Error).message,
        matches: [] as string[]
      }
    }
  }, [pattern, flags, haystack])

  return (
    <ToolLayout title="Regex tester">
      <div className="grid gap-6 lg:grid-cols-2">
        <ToolInputPanel
          intro={
            <p className={toolIntroTextClass}>
              JavaScript <code>RegExp</code> with flags (e.g. <code>g</code>,{' '}
              <code>i</code>, <code>m</code>). Uses <code>matchAll</code> for
              global patterns.
            </p>
          }
        >
          <label className={toolLabelClass} htmlFor="regex-pattern">
            Pattern
          </label>
          <input
            id="regex-pattern"
            type="text"
            value={pattern}
            onChange={(e) => setUrl((s) => ({ ...s, p: e.target.value }))}
            className={`${toolInputClass} mb-4 font-mono`}
            spellCheck={false}
          />
          <label className={toolLabelClass} htmlFor="regex-flags">
            Flags
          </label>
          <input
            id="regex-flags"
            type="text"
            value={flags}
            onChange={(e) => setUrl((s) => ({ ...s, f: e.target.value }))}
            className={`${toolInputClass} mb-4 font-mono`}
            spellCheck={false}
          />
          <label className={toolLabelClass} htmlFor="regex-haystack">
            Test string
          </label>
          <TextAreaWithLineNumbers
            value={haystack}
            setValue={(v) =>
              setUrl((s) => ({
                ...s,
                t: typeof v === 'function' ? v(s.t) : v
              }))
            }
            placeholder="Text to search..."
          />
          <div className={toolToolbarEndClass}>
            <ClearButton
              onClick={() => {
                setUrl({ p: '', f: 'g', t: '' })
              }}
            >
              Clear all
            </ClearButton>
          </div>
        </ToolInputPanel>

        <div className={toolResultPanelClass}>
          <h2 className={`mb-3 ${toolSectionTitleClass}`}>Matches</h2>
          {result.error ? (
            <div className={toolErrorBoxClass}>{result.error}</div>
          ) : result.matches.length === 0 ? (
            <p className={toolEmptyHintClass}>
              {pattern.trim()
                ? 'No matches (try adding the g flag for multiple results).'
                : 'Enter a pattern to see matches.'}
            </p>
          ) : (
            <ul className="max-h-96 space-y-2 overflow-auto">
              {result.matches.map((line, i) => (
                <li key={`${line}-${i}`} className={toolListItemClass}>
                  {line}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}

export default function RegexTester() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Regex tester">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <RegexTesterInner />
    </Suspense>
  )
}
