'use client'

import { useState } from 'react'
import TextAreaWithLineNumbers from '../TextAreaWithLineNumbers'
import ToolLayout from './ToolLayout'
import { ClearButton, PrimaryButton, SecondaryButton } from './ToolButtons'
import {
  toolErrorBoxClass,
  toolIntroTextClass,
  toolPreOutputClass,
  toolResultHeaderRowClass,
  toolResultPanelClass,
  toolSectionTitleClass,
  toolToolbarEndClass,
  ToolInputPanel
} from './toolUi'

const UrlEncoderDecoder = () => {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const encodeComponent = () => {
    if (!input) {
      setOutput('')
      setError(null)
      return
    }
    try {
      setOutput(encodeURIComponent(input))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  const decodeComponent = () => {
    if (!input.trim()) {
      setOutput('')
      setError(null)
      return
    }
    try {
      setOutput(decodeURIComponent(input.trim()))
      setError(null)
    } catch (err) {
      setError((err as Error).message)
      setOutput('')
    }
  }

  const handleClear = () => {
    setInput('')
    setOutput('')
    setError(null)
  }

  return (
    <ToolLayout title="URL encoder / decoder">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Uses <code>encodeURIComponent</code> and{' '}
            <code>decodeURIComponent</code> for query components and UTF-8 text.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste text or an encoded value..."
        />

        <div className={toolToolbarEndClass}>
          <PrimaryButton onClick={encodeComponent} disabled={!input}>
            Encode
          </PrimaryButton>
          <SecondaryButton onClick={decodeComponent} disabled={!input.trim()}>
            Decode
          </SecondaryButton>
          <ClearButton onClick={handleClear}>Clear</ClearButton>
        </div>
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Result</h2>
        </div>
        {error ? (
          <div className={toolErrorBoxClass}>{error}</div>
        ) : (
          <pre className={toolPreOutputClass}>
            {output || (
              <span className="text-neutral-500">Output appears here.</span>
            )}
          </pre>
        )}
      </div>
    </ToolLayout>
  )
}

export default UrlEncoderDecoder
