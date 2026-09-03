'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolEmptyHintClass,
  toolErrorBoxClass,
  toolHintMetaClass,
  toolIntroTextClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarBetweenClass,
  toolValueRowClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import {
  buildHref,
  createParamId,
  draftFromInspect,
  inspectUrl,
  isEditablePartKey,
  partsFromDraft,
  type EditablePartKey,
  type QueryParamDraft,
  type UrlDraft
} from '@/utils/urlInspect'

const cellInputClass =
  'ring-custom_blue/40 w-full min-w-[6rem] rounded-md border border-white/10 bg-neutral-900/80 px-2 py-1.5 font-mono text-[13px] text-neutral-100 outline-none placeholder:text-neutral-600 focus:ring-2'

const UrlInspector = () => {
  const [input, setInput] = useState('')
  const [draft, setDraft] = useState<UrlDraft | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const lastBuiltHrefRef = useRef<string | null>(null)
  const { unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (lastBuiltHrefRef.current === input) return
    lastBuiltHrefRef.current = null

    const result = inspectUrl(input)
    if (!input.trim()) {
      setDraft(null)
      setParseError(null)
      return
    }
    if (!result.ok) {
      setDraft(null)
      setParseError(result.error)
      return
    }
    setDraft(draftFromInspect(result))
    setParseError(null)
  }, [input])

  const commitDraft = (next: UrlDraft) => {
    const href = buildHref(next)
    lastBuiltHrefRef.current = href
    setDraft(next)
    setInput(href)
    setParseError(null)
  }

  const updatePart = (key: EditablePartKey, value: string) => {
    if (!draft) return
    const next: UrlDraft = { ...draft, [key]: value }
    if (key === 'hostname' && value.trim()) {
      next.relative = false
    }
    if (key === 'protocol' && value.trim()) {
      next.protocolRelative = false
      next.relative = false
    }
    commitDraft(next)
  }

  const updateParam = (
    id: string,
    field: keyof Pick<QueryParamDraft, 'name' | 'value'>,
    value: string
  ) => {
    if (!draft) return
    commitDraft({
      ...draft,
      params: draft.params.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    })
  }

  const addParam = () => {
    if (!draft) return
    commitDraft({
      ...draft,
      params: [...draft.params, { id: createParamId(), name: '', value: '' }]
    })
  }

  const removeParam = (id: string) => {
    if (!draft) return
    commitDraft({
      ...draft,
      params: draft.params.filter((row) => row.id !== id)
    })
  }

  const handleCopy = async (key: string, value: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    unlockAchievement('clipboard-master')
    setCopied(key)
    setTimeout(() => setCopied(null), 1500)
  }

  const parts = draft ? partsFromDraft(draft) : []
  const rebuiltHref = draft ? buildHref(draft) : ''

  const parseNote = draft
    ? draft.assumedHttps && draft.protocolRelative
      ? 'Protocol-relative href - parsed as HTTPS so origin and host can be shown.'
      : draft.assumedHttps && !draft.protocol
        ? 'No scheme - parsed as HTTPS.'
        : draft.relative && !draft.hostname
          ? 'Relative href - origin, host, and protocol are empty because there is no authority.'
          : null
    : null

  return (
    <ToolLayout title="URL inspector">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Split an href into origin, path, query, and hash. Edit the parts or
            the query table and the href updates. This is structural, not
            percent-encoding - use the{' '}
            <Link
              href="/t/url-encoder-decoder"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              URL encoder / decoder
            </Link>{' '}
            for that.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="https://user:pass@example.com:8443/app/users?id=1&id=2&q=hello+world#section"
        />
        <div className={toolToolbarBetweenClass}>
          <p className={`${toolHintMetaClass} max-w-xl`}>
            The box above is the rebuilt URL after table edits.
          </p>
          <div className="flex flex-wrap gap-3">
            {rebuiltHref ? (
              <ToolCopyButton
                copied={copied === 'input-href'}
                onClick={() => handleCopy('input-href', rebuiltHref)}
                idleLabel="Copy URL"
              />
            ) : null}
            <ClearButton
              onClick={() => {
                lastBuiltHrefRef.current = null
                setInput('')
                setDraft(null)
                setParseError(null)
                setCopied(null)
              }}
            >
              Clear
            </ClearButton>
          </div>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Parts</h2>
        </div>

        {!input.trim() ? (
          <p className={toolEmptyHintClass}>
            Origin, path, query, hash, and related fields appear here as you
            paste.
          </p>
        ) : parseError ? (
          <div className={toolErrorBoxClass}>{parseError}</div>
        ) : (
          <>
            {parseNote ? (
              <p className={`${toolHintMetaClass} mb-3`}>{parseNote}</p>
            ) : null}
            <ul className="space-y-2">
              {parts.map((part) => {
                const editable = isEditablePartKey(part.key)
                return (
                  <li key={part.key} className={toolValueRowClass}>
                    <span className="w-24 shrink-0 text-xs font-medium uppercase tracking-wide text-neutral-400">
                      {part.label}
                    </span>
                    {editable ? (
                      <input
                        value={part.value}
                        onChange={(e) =>
                          updatePart(
                            part.key as EditablePartKey,
                            e.target.value
                          )
                        }
                        spellCheck={false}
                        className={`${cellInputClass} flex-1`}
                        placeholder="-"
                        aria-label={part.label}
                      />
                    ) : (
                      <span className="min-w-0 flex-1 break-all font-mono text-sm text-neutral-100">
                        {part.value || (
                          <span className="text-neutral-500">-</span>
                        )}
                      </span>
                    )}
                    <ToolCopyButton
                      copied={copied === part.key}
                      onClick={() => handleCopy(part.key, part.value)}
                      disabled={!part.value}
                    />
                  </li>
                )
              })}
            </ul>
          </>
        )}
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Query parameters</h2>
          {draft ? (
            <SecondaryButton onClick={addParam}>Add parameter</SecondaryButton>
          ) : null}
        </div>

        {!input.trim() || parseError || !draft ? (
          <p className={toolEmptyHintClass}>
            Edit key and value to rebuild the query string. Duplicate keys stay
            as separate rows.{' '}
            <code className="font-mono text-neutral-300">+</code> is treated as
            a space.
          </p>
        ) : draft.params.length === 0 ? (
          <p className={toolEmptyHintClass}>
            No query string. Add a parameter to append{' '}
            <code className="font-mono text-neutral-300">?key=value</code>.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[28rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs uppercase tracking-wide text-neutral-400">
                  <th className="py-2 pr-3 font-medium">#</th>
                  <th className="py-2 pr-3 font-medium">Key</th>
                  <th className="py-2 pr-3 font-medium">Value</th>
                  <th className="w-24 py-2 font-medium">
                    <span className="sr-only">Remove</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {draft.params.map((row, index) => (
                  <tr key={row.id} className="border-b border-white/5">
                    <td className="py-2 pr-3 align-middle font-mono text-[13px] text-neutral-500">
                      {index + 1}
                    </td>
                    <td className="py-2 pr-3 align-middle">
                      <input
                        value={row.name}
                        onChange={(e) =>
                          updateParam(row.id, 'name', e.target.value)
                        }
                        spellCheck={false}
                        className={cellInputClass}
                        placeholder="key"
                        aria-label={`Query key ${index + 1}`}
                      />
                    </td>
                    <td className="py-2 pr-3 align-middle">
                      <input
                        value={row.value}
                        onChange={(e) =>
                          updateParam(row.id, 'value', e.target.value)
                        }
                        spellCheck={false}
                        className={cellInputClass}
                        placeholder="value"
                        aria-label={`Query value ${index + 1}`}
                      />
                    </td>
                    <td className="py-2 align-middle">
                      <button
                        type="button"
                        onClick={() => removeParam(row.id)}
                        className="text-xs font-medium text-red-400/90 transition hover:text-red-300"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ToolLayout>
  )
}

export default UrlInspector
