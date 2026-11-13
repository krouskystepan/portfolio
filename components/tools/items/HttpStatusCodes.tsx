'use client'

import { Suspense, useMemo } from 'react'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
import {
  toolCompactInputClass,
  toolEmptyHintClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolLabelClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import {
  HTTP_STATUS_CLASSES,
  HTTP_STATUS_CLASS_LABELS,
  getStatusClass,
  searchHttpStatusCodes,
  type HttpStatusClass
} from '@/utils/httpStatusCodes'

const CLASS_FILTERS = ['all', ...HTTP_STATUS_CLASSES] as const

const CLASS_BADGE: Record<HttpStatusClass, string> = {
  '1xx': 'bg-sky-500/15 text-sky-300',
  '2xx': 'bg-emerald-500/15 text-emerald-300',
  '3xx': 'bg-amber-500/15 text-amber-300',
  '4xx': 'bg-orange-500/15 text-orange-300',
  '5xx': 'bg-red-500/15 text-red-300'
}

function HttpStatusCodesInner() {
  const [url, setUrl] = useToolUrlState({
    q: str(''),
    c: enumParam<(typeof CLASS_FILTERS)[number]>('all', CLASS_FILTERS)
  })
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const results = useMemo(
    () => searchHttpStatusCodes(url.q, url.c),
    [url.q, url.c]
  )

  const copyCode = (code: number, name: string) => {
    navigator.clipboard.writeText(`${code} ${name}`)
    unlockAchievement('clipboard-master')
    flash(String(code))
  }

  return (
    <ToolLayout title="HTTP status codes">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Offline reference for common HTTP status codes. Search by number
            (<code>404</code>, <code>4</code>), name, or behaviour (
            <code>rate limit</code>, <code>redirect</code>).
          </p>
        }
      >
        <label className={toolLabelClass} htmlFor="http-status-search">
          Search
        </label>
        <input
          id="http-status-search"
          type="search"
          value={url.q}
          onChange={(e) => setUrl((s) => ({ ...s, q: e.target.value }))}
          placeholder="e.g. 429, unauthorized, redirect…"
          className={`${toolCompactInputClass} !h-10 !text-sm`}
          spellCheck={false}
          autoComplete="off"
        />
        <div
          className="mt-4 flex flex-wrap items-center justify-between gap-3"
          role="group"
          aria-label="Filter by status class"
        >
          <ToolChipRow>
            {CLASS_FILTERS.map((cls) => (
              <ToolChipButton
                key={cls}
                active={url.c === cls}
                onClick={() => setUrl((s) => ({ ...s, c: cls }))}
                title={
                  cls === 'all' ? 'All classes' : HTTP_STATUS_CLASS_LABELS[cls]
                }
              >
                {cls === 'all' ? 'All' : cls}
              </ToolChipButton>
            ))}
          </ToolChipRow>
          <ClearButton onClick={() => setUrl((s) => ({ ...s, q: '', c: 'all' }))}>
            Reset
          </ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h3 className={toolSectionTitleClass}>Status codes</h3>
          <span className={toolHintMetaClass} role="status" aria-live="polite">
            {results.length} result{results.length === 1 ? '' : 's'}
          </span>
        </div>

        {results.length === 0 ? (
          <p className={toolEmptyHintClass}>No status codes match your search.</p>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-white/10">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead className="bg-neutral-900/80 text-xs uppercase tracking-wide text-neutral-400">
                <tr>
                  <th scope="col" className="w-20 px-3 py-2 font-medium">
                    Code
                  </th>
                  <th scope="col" className="w-56 px-3 py-2 font-medium">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-2 font-medium">
                    Meaning / when to use
                  </th>
                  <th scope="col" className="w-20 px-3 py-2 font-medium">
                    <span className="sr-only">Copy</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {results.map((entry) => {
                  const cls = getStatusClass(entry.code)
                  return (
                    <tr
                      key={entry.code}
                      className="border-t border-white/10 align-top hover:bg-white/[0.03]"
                    >
                      <td className="p-3">
                        <span
                          className={`inline-flex rounded-md px-2 py-0.5 font-mono text-sm font-semibold ${CLASS_BADGE[cls]}`}
                          title={HTTP_STATUS_CLASS_LABELS[cls]}
                        >
                          {entry.code}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-neutral-100">
                        {entry.name}
                      </td>
                      <td className="p-3 text-neutral-300">
                        <p>{entry.description}</p>
                        <p className="mt-1 text-neutral-400">
                          <span className="text-neutral-500">Use: </span>
                          {entry.whenToUse}
                        </p>
                        {entry.testingTip ? (
                          <p className="mt-1 text-xs text-amber-200/80">
                            QA tip: {entry.testingTip}
                          </p>
                        ) : null}
                      </td>
                      <td className="p-3 text-right">
                        <ToolCopyButton
                          copied={copied === String(entry.code)}
                          onClick={() => copyCode(entry.code, entry.name)}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default function HttpStatusCodes() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="HTTP status codes">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <HttpStatusCodesInner />
    </Suspense>
  )
}
