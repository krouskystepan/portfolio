'use client'

import { useMemo, useState } from 'react'
import TextAreaWithLineNumbers from '../TextAreaWithLineNumbers'
import ToolLayout from './ToolLayout'
import { ClearButton } from './ToolButtons'
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
} from './toolUi'

const RegexTester = () => {
  const [pattern, setPattern] = useState('[A-Za-z]+')
  const [flags, setFlags] = useState('g')
  const [haystack, setHaystack] = useState('Hello regex world')

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
            onChange={(e) => setPattern(e.target.value)}
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
            onChange={(e) => setFlags(e.target.value)}
            className={`${toolInputClass} mb-4 font-mono`}
            spellCheck={false}
          />
          <label className={toolLabelClass} htmlFor="regex-haystack">
            Test string
          </label>
          <TextAreaWithLineNumbers
            value={haystack}
            setValue={setHaystack}
            placeholder="Text to search..."
          />
          <div className={toolToolbarEndClass}>
            <ClearButton
              onClick={() => {
                setPattern('')
                setFlags('g')
                setHaystack('')
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

export default RegexTester
