'use client'

import { useEffect, useMemo, useState } from 'react'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import { ClearButton } from '@/components/tools/_shared/ToolButtons'
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
  toolWarningIntroClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import {
  EXAMPLE_CURL,
  HTTP_CLIENTS,
  generateHttpCode,
  parseCurl,
  type HttpClient
} from '@/utils/curlToHttp'

const DEBOUNCE_MS = 150

export default function CurlToHttp() {
  const [input, setInput] = useState('')
  const [debounced, setDebounced] = useState('')
  const [client, setClient] = useState<HttpClient>('fetch')
  const { copied, flash, clear } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  useEffect(() => {
    if (!input.trim()) {
      setDebounced('')
      return
    }
    const timer = window.setTimeout(() => setDebounced(input), DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [input])

  const parsed = useMemo(() => {
    if (!debounced.trim()) return null
    return parseCurl(debounced)
  }, [debounced])

  const code = useMemo(() => {
    if (!parsed?.ok) return ''
    return generateHttpCode(parsed.model, client)
  }, [parsed, client])

  const handleCopy = async () => {
    if (!code) return
    await navigator.clipboard.writeText(code)
    unlockAchievement('clipboard-master')
    flash('code')
  }

  const handleClear = () => {
    setInput('')
    setDebounced('')
    clear()
  }

  return (
    <ToolLayout title="cURL → fetch / axios / Python">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Paste curl from DevTools or docs and get a live fetch, axios, or
            Python <code>requests</code> snippet you can drop into an app or the
            console. Conversion is one-way and stays in the browser.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="curl 'https://api.example.com' -H 'Accept: application/json'"
        />

        <div className={toolToolbarBetweenClass}>
          <ToolChipRow>
            <ToolChipButton
              active={false}
              onClick={() => setInput(EXAMPLE_CURL)}
            >
              Load example
            </ToolChipButton>
          </ToolChipRow>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
        <p className={`${toolHintMetaClass} mt-3`}>
          Updates as you type. Unsupported flags show as warnings instead of
          failing the convert.
        </p>
      </ToolInputPanel>

      {parsed?.ok && parsed.model.warnings.length > 0 ? (
        <div className={toolWarningIntroClass}>
          <p className="mb-2 font-medium">Notes</p>
          <ul className="list-disc space-y-1 pl-5">
            {parsed.model.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <div className="flex min-w-0 flex-wrap items-center gap-3">
            <h2 className={toolSectionTitleClass}>Result</h2>
            <div
              className="inline-flex rounded-lg border border-white/10 bg-neutral-950/70 p-0.5"
              role="tablist"
              aria-label="Output client"
            >
              {HTTP_CLIENTS.map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={client === id}
                  onClick={() => setClient(id)}
                  className={`h-8 rounded-md px-3.5 text-xs font-medium transition ${
                    client === id
                      ? 'bg-custom_blue text-white'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>
          </div>
          {code ? (
            <ToolCopyButton copied={copied === 'code'} onClick={handleCopy} />
          ) : null}
        </div>

        {!debounced.trim() ? (
          <p className={toolEmptyHintClass}>
            Paste a curl command to see fetch, axios, or Python code.
          </p>
        ) : parsed && !parsed.ok ? (
          <div className={toolErrorBoxClass}>{parsed.error}</div>
        ) : (
          <pre
            className={`${toolPreOutputClass} max-h-[32rem] whitespace-pre text-xs sm:text-sm`}
          >
            {code}
          </pre>
        )}
      </div>
    </ToolLayout>
  )
}
