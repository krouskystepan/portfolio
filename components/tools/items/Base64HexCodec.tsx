'use client'

import { Suspense, useMemo } from 'react'
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
  toolToolbarBetweenClass,
  ToolChipButton,
  ToolChipRow,
  ToolCopyButton,
  ToolInputPanel
} from '@/components/tools/_shared/toolUi'
import { useAchievementContext } from '@/context/AchievementContext'
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import {
  decodeText,
  encodeTextSafe,
  type BaseHexMode
} from '@/utils/base64Hex'

const MODE_IDS = [
  'base64',
  'base64url',
  'hex'
] as const satisfies readonly BaseHexMode[]

const MODE_LABELS: Record<BaseHexMode, string> = {
  base64: 'Base64',
  base64url: 'Base64URL',
  hex: 'Hex'
}

function Base64HexCodecInner() {
  const [state, setState] = useToolUrlState({
    t: str('', { text: true }),
    mode: enumParam<BaseHexMode>('base64', MODE_IDS)
  })
  const input = state.t
  const mode = state.mode
  const { copied, flash, clear } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const encoded = useMemo(() => encodeTextSafe(input, mode), [input, mode])
  const decoded = useMemo(() => decodeText(input, mode), [input, mode])

  const handleCopy = async (which: 'encoded' | 'decoded', value: string) => {
    if (!value) return
    await navigator.clipboard.writeText(value)
    unlockAchievement('clipboard-master')
    flash(which)
  }

  const encodedValue = encoded.ok ? encoded.value : ''
  const decodedValue = decoded.ok ? decoded.value : ''

  return (
    <ToolLayout title="Base64 / Hex codec">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Convert UTF-8 text to and from <strong>Base64</strong>,{' '}
            <strong>Base64URL</strong> (no padding, <code>-</code> and{' '}
            <code>_</code>), or <strong>Hex</strong>. Both directions update as
            you type. Hex input may include spaces, <code>0x</code> prefixes,
            or <code>\x</code> escapes. Everything runs in your browser.
          </p>
        }
      >
        <TextAreaWithLineNumbers
          value={input}
          setValue={(v) =>
            setState((s) => ({
              ...s,
              t: typeof v === 'function' ? v(s.t) : v
            }))
          }
          placeholder="Paste plain text to encode, or an encoded string to decode..."
        />

        <div className={toolToolbarBetweenClass}>
          <ToolChipRow>
            {MODE_IDS.map((id) => (
              <ToolChipButton
                key={id}
                active={mode === id}
                onClick={() => setState((s) => ({ ...s, mode: id }))}
              >
                {MODE_LABELS[id]}
              </ToolChipButton>
            ))}
          </ToolChipRow>
          <ClearButton
            onClick={() => {
              setState((s) => ({ ...s, t: '' }))
              clear()
            }}
          >
            Clear
          </ClearButton>
        </div>
        <p className={`${toolHintMetaClass} mt-3`}>
          Short text is mirrored in the page URL so you can share it; avoid
          pasting secrets or tokens.
        </p>
      </ToolInputPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>
              Encoded ({MODE_LABELS[mode]})
            </h2>
            {input && encodedValue ? (
              <ToolCopyButton
                copied={copied === 'encoded'}
                onClick={() => handleCopy('encoded', encodedValue)}
              />
            ) : null}
          </div>
          {!encoded.ok ? (
            <div className={toolErrorBoxClass}>{encoded.error}</div>
          ) : (
            <pre className={toolPreOutputClass}>
              {encodedValue || (
                <span className="text-neutral-500">
                  Encoded output appears here.
                </span>
              )}
            </pre>
          )}
        </div>

        <div className={toolResultPanelClass}>
          <div className={toolResultHeaderRowClass}>
            <h2 className={toolSectionTitleClass}>
              Decoded ({MODE_LABELS[mode]} → text)
            </h2>
            {input && decodedValue ? (
              <ToolCopyButton
                copied={copied === 'decoded'}
                onClick={() => handleCopy('decoded', decodedValue)}
              />
            ) : null}
          </div>
          {!decoded.ok ? (
            <div className={toolErrorBoxClass}>{decoded.error}</div>
          ) : (
            <pre className={toolPreOutputClass}>
              {input ? (
                decodedValue
              ) : (
                <span className="text-neutral-500">
                  Decoded text appears here.
                </span>
              )}
            </pre>
          )}
        </div>
      </div>
    </ToolLayout>
  )
}

export default function Base64HexCodec() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="Base64 / Hex codec">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <Base64HexCodecInner />
    </Suspense>
  )
}
