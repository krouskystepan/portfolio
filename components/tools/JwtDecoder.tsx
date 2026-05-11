'use client'

import { useState } from 'react'
import TextAreaWithLineNumbers from '../TextAreaWithLineNumbers'
import ToolLayout from './ToolLayout'
import { ClearButton, PrimaryButton } from './ToolButtons'
import {
  toolErrorBoxClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  toolWarningIntroClass,
  ToolInputPanel
} from './toolUi'

function decodeBase64Url(part: string): string {
  let base64 = part.replace(/-/g, '+').replace(/_/g, '/')
  const pad = base64.length % 4
  if (pad) base64 += '='.repeat(4 - pad)
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0))
  return new TextDecoder('utf-8').decode(bytes)
}

const JwtDecoder = () => {
  const [input, setInput] = useState('')
  const [header, setHeader] = useState('')
  const [payload, setPayload] = useState('')
  const [error, setError] = useState<string | null>(null)

  const decode = () => {
    const raw = input.trim()
    if (!raw) {
      setHeader('')
      setPayload('')
      setError(null)
      return
    }
    const parts = raw.split('.')
    if (parts.length < 2) {
      setError('Expected a JWT with at least header and payload segments.')
      setHeader('')
      setPayload('')
      return
    }
    try {
      const h = JSON.parse(decodeBase64Url(parts[0]))
      const p = JSON.parse(decodeBase64Url(parts[1]))
      setHeader(JSON.stringify(h, null, 2))
      setPayload(JSON.stringify(p, null, 2))
      setError(null)
    } catch {
      setError('Could not decode header or payload. Check the token shape.')
      setHeader('')
      setPayload('')
    }
  }

  return (
    <ToolLayout title="JWT decode (no verification)">
      <ToolInputPanel
        intro={
          <p className={toolWarningIntroClass}>
            Decodes Base64URL segments only. Signature is{' '}
            <strong>not</strong> verified — never paste production secrets here.
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
          </div>
          <pre
            className={`${toolPreOutputClass} max-h-80 text-xs sm:text-sm`}
          >
            {header || (
              <span className="text-neutral-500">Decoded header JSON.</span>
            )}
          </pre>
        </div>
        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>Payload</h2>
          </div>
          <pre
            className={`${toolPreOutputClass} max-h-80 text-xs sm:text-sm`}
          >
            {payload || (
              <span className="text-neutral-500">Decoded payload JSON.</span>
            )}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}

export default JwtDecoder
