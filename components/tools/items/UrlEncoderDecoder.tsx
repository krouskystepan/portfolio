'use client'

import { useMemo, useState } from 'react'
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
  toolSegmentBarClass,
  toolSegmentTabClass,
  toolToolbarBetweenClass,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import {
  decodeUrlText,
  encodeUrlText,
  type UrlCodecMode
} from '@/utils/urlCodec'

const UrlEncoderDecoder = () => {
  const [input, setInput] = useState('')
  const [mode, setMode] = useState<UrlCodecMode>('component')
  const [copied, setCopied] = useState<'encoded' | 'decoded' | null>(null)
  const { unlockAchievement } = useAchievementContext()

  const encoded = useMemo(() => {
    if (!input) return { value: '', error: null as string | null }
    try {
      return { value: encodeUrlText(input, mode), error: null }
    } catch (err) {
      return {
        value: '',
        error: (err as Error).message || 'This text cannot be encoded.'
      }
    }
  }, [input, mode])

  const decoded = useMemo(() => decodeUrlText(input, mode), [input, mode])

  const handleCopy = async (which: 'encoded' | 'decoded', value: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    unlockAchievement('clipboard-master')
    setCopied(which)
    setTimeout(() => setCopied(null), 1500)
  }

  return (
    <ToolLayout title="URL encoder / decoder">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Encoding and decoding update as you type. Use{' '}
            <strong>Component</strong> for query values and form fields (spaces
            become <code>%20</code>). Use <strong>Full URI</strong> when you
            have a complete URL and want to keep <code>:/?#[]@!$&amp;&apos;()*+,;=</code>{' '}
            intact. To split an href into origin, path, query, and hash, use the{' '}
            <Link
              href="/t/url-inspector"
              className="text-custom_blue underline-offset-2 hover:underline"
            >
              URL inspector
            </Link>
            .
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={setInput}
          placeholder="Paste text, a query value, or an encoded string..."
        />

        <div className={toolToolbarBetweenClass}>
          <div className={`${toolSegmentBarClass} w-full sm:w-auto`}>
            {(
              [
                ['component', 'Component'],
                ['uri', 'Full URI']
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                className={toolSegmentTabClass(mode === id)}
              >
                {label}
              </button>
            ))}
          </div>
          <ClearButton
            onClick={() => {
              setInput('')
              setCopied(null)
            }}
          >
            Clear
          </ClearButton>
        </div>
        <p className={`${toolHintMetaClass} mt-3`}>
          Encoded and decoded results both appear below. Copy the one you need.
        </p>
      </ToolInputPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>Encoded</h2>
            {input && encoded.value ? (
              <ToolCopyButton
                copied={copied === 'encoded'}
                onClick={() => handleCopy('encoded', encoded.value)}
              />
            ) : null}
          </div>
          {encoded.error ? (
            <div className={toolErrorBoxClass}>{encoded.error}</div>
          ) : (
            <pre className={toolPreOutputClass}>
              {encoded.value || (
                <span className="text-neutral-500">
                  Percent-encoded output appears here.
                </span>
              )}
            </pre>
          )}
        </div>

        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>Decoded</h2>
            {input && decoded.value ? (
              <ToolCopyButton
                copied={copied === 'decoded'}
                onClick={() => handleCopy('decoded', decoded.value)}
              />
            ) : null}
          </div>
          {decoded.warning ? (
            <div className={`${toolErrorBoxClass} mb-3`}>{decoded.warning}</div>
          ) : null}
          <pre className={toolPreOutputClass}>
            {input ? (
              decoded.value
            ) : (
              <span className="text-neutral-500">
                Decoded text appears here.
              </span>
            )}
          </pre>
        </div>
      </div>
    </ToolLayout>
  )
}

export default UrlEncoderDecoder
