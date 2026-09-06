'use client'

import { useState } from 'react'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  PrimaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolErrorBoxClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  toolWarningIntroClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'

function decodeBase64Url(part: string): string {
  let base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) base64 += '='.repeat(4 - pad)
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

function decodeJwt(rawInput: string): {
  header: string
  payload: string
  error: string | null
} {
  const raw = rawInput.trim()
  if (!raw) {
    return { header: '', payload: '', error: null }
  }
  const parts = raw.split('.')
  if (parts.length < 2) {
    return {
      header: '',
      payload: '',
      error: 'Expected a JWT with at least header and payload segments.'
    }
  }
  try {
    const h = JSON.parse(decodeBase64Url(parts[0]))
    const p = JSON.parse(decodeBase64Url(parts[1]))
    return {
      header: JSON.stringify(h, null, 2),
      payload: JSON.stringify(p, null, 2),
      error: null
    }
  } catch {
    return {
      header: '',
      payload: '',
      error: 'Could not decode header or payload. Check the token shape.'
    }
  }
}

export default function JwtDecoder() {
  const [input, setInput] = useState('')
  const [header, setHeader] = useState('')
  const [payload, setPayload] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const decode = () => {
    const next = decodeJwt(input)
    setHeader(next.header)
    setPayload(next.payload)
    setError(next.error)
  }

  const handleCopy = async (key: 'header' | 'payload', text: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    unlockAchievement('clipboard-master')
    flash(key)
  }

  return (
    <ToolLayout title="JWT decode (no verification)">
      <ToolInputPanel
        intro={
          <p className={toolWarningIntroClass}>
            Decodes Base64URL segments only. Signature is <strong>not</strong>{' '}
            verified - never paste production secrets here.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="eyJhbGciOiJIUzI1NiJ9..."
        />
        <div className={toolToolbarEndClass}>
          <PrimaryButton onClick={decode} disabled={!input.trim()}>
            Decode
          </PrimaryButton>
          <ClearButton
            onClick={() => {
              setInput('')
              setHeader('')
              setPayload('')
              setError(null)
            }}
          >
            Clear
          </ClearButton>
        </div>
      </ToolInputPanel>

      {error ? (
        <div className={toolResultPanelClass}>
          <div className={toolErrorBoxClass}>{error}</div>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>Header</h2>
            {header ? (
              <ToolCopyButton
                copied={copied === 'header'}
                onClick={() => handleCopy('header', header)}
              />
            ) : null}
          </div>
          <pre className={`${toolPreOutputClass} max-h-80 text-xs sm:text-sm`}>
            {header || (
              <span className="text-neutral-500">Decoded header JSON.</span>
            )}
          </pre>
        </div>
        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>Payload</h2>
            {payload ? (
              <ToolCopyButton
                copied={copied === 'payload'}
                onClick={() => handleCopy('payload', payload)}
              />
            ) : null}
          </div>
          <pre className={`${toolPreOutputClass} max-h-80 text-xs sm:text-sm`}>
            {payload || (
              <span className="text-neutral-500">Decoded payload JSON.</span>
            )}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}
