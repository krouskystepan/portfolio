'use client'

import { Suspense, useMemo } from 'react'
import { useAchievementContext } from '@/context/AchievementContext'
import TextAreaWithLineNumbers from '@/components/tools/_shared/TextAreaWithLineNumbers'
import ToolLayout from '@/components/tools/_shared/ToolLayout'
import {
  ClearButton,
  SecondaryButton
} from '@/components/tools/_shared/ToolButtons'
import {
  toolHintMetaClass,
  toolIntroTextClass,
  toolListItemClass,
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
import { useCopyFeedback } from '@/hooks/tools/useCopyFeedback'
import { enumParam, str, useToolUrlState } from '@/hooks/useToolUrlState'
import {
  COMMON_ENTITY_REFERENCE,
  HTML_ENTITY_COUNT,
  decodeHtmlEntities,
  encodeHtmlEntities,
  type HtmlEntityEncodeMode
} from '@/utils/htmlEntities'

type CodecDirection = 'encode' | 'decode'

const DIRECTION_IDS = ['encode', 'decode'] as const satisfies readonly CodecDirection[]
const ENCODE_MODE_IDS = [
  'basic',
  'named',
  'decimal',
  'hex'
] as const satisfies readonly HtmlEntityEncodeMode[]

const ENCODE_MODES: { id: HtmlEntityEncodeMode; label: string; hint: string }[] = [
  {
    id: 'basic',
    label: 'Basic',
    hint: 'Only & < > " \' (enough for safe HTML text and attributes).'
  },
  {
    id: 'named',
    label: 'Named',
    hint: 'Basic, plus non-ASCII characters as names (&eacute;) with numeric fallback.'
  },
  {
    id: 'decimal',
    label: 'Decimal',
    hint: 'Basic, plus every non-ASCII character as &#233;.'
  },
  {
    id: 'hex',
    label: 'Hex',
    hint: 'Basic, plus every non-ASCII character as &#xE9;.'
  }
]

function HtmlEntityCodecInner() {
  const [url, setUrl] = useToolUrlState({
    t: str('', { text: true }),
    dir: enumParam<CodecDirection>('encode', DIRECTION_IDS),
    enc: enumParam<HtmlEntityEncodeMode>('basic', ENCODE_MODE_IDS)
  })
  const input = url.t
  const direction = url.dir
  const encodeMode = url.enc
  const { copied, flash } = useCopyFeedback()
  const { unlockAchievement } = useAchievementContext()

  const result = useMemo(() => {
    if (!input) return { value: '', decoded: 0, unknown: [] as string[] }
    if (direction === 'encode') {
      return {
        value: encodeHtmlEntities(input, encodeMode),
        decoded: 0,
        unknown: [] as string[]
      }
    }
    return decodeHtmlEntities(input)
  }, [input, direction, encodeMode])

  const handleCopy = async () => {
    if (!result.value) return
    await navigator.clipboard.writeText(result.value)
    unlockAchievement('clipboard-master')
    flash()
  }

  const activeHint = ENCODE_MODES.find((m) => m.id === encodeMode)?.hint

  return (
    <ToolLayout title="HTML Entity Encoder / Decoder">
      <ToolInputPanel
        intro={
          <p className={toolIntroTextClass}>
            Escape text for HTML or turn entities such as <code>&amp;amp;</code>,{' '}
            <code>&amp;eacute;</code> and <code>&amp;#x1F600;</code> back into
            characters. Decoding uses a built-in table of {HTML_ENTITY_COUNT}{' '}
            common names plus all numeric references; it never parses HTML or touches
            the DOM.
          </p>
        }
      >
        <div className="mb-4" role="tablist" aria-label="Direction">
          <ToolChipRow>
            <ToolChipButton
              active={direction === 'encode'}
              onClick={() => setUrl((s) => ({ ...s, dir: 'encode' }))}
            >
              Encode
            </ToolChipButton>
            <ToolChipButton
              active={direction === 'decode'}
              onClick={() => setUrl((s) => ({ ...s, dir: 'decode' }))}
            >
              Decode
            </ToolChipButton>
          </ToolChipRow>
        </div>

        <TextAreaWithLineNumbers
          value={input}
          setValue={(v) =>
            setUrl((s) => ({
              ...s,
              t: typeof v === 'function' ? v(s.t) : v
            }))
          }
          placeholder={
            direction === 'encode'
              ? 'Text or HTML to escape, e.g. <p>Café & crème</p>'
              : 'Entities to decode, e.g. &lt;p&gt;Caf&eacute; &amp; cr&egrave;me&lt;/p&gt;'
          }
        />

        <div className={toolToolbarBetweenClass}>
          {direction === 'encode' ? (
            <ToolChipRow>
              {ENCODE_MODES.map((m) => (
                <ToolChipButton
                  key={m.id}
                  active={encodeMode === m.id}
                  title={m.hint}
                  onClick={() => setUrl((s) => ({ ...s, enc: m.id }))}
                >
                  {m.label}
                </ToolChipButton>
              ))}
            </ToolChipRow>
          ) : (
            <span />
          )}
          <ClearButton onClick={() => setUrl((s) => ({ ...s, t: '' }))}>
            Clear
          </ClearButton>
        </div>
        {direction === 'encode' && activeHint ? (
          <p className={`${toolHintMetaClass} mt-3`}>{activeHint}</p>
        ) : null}
      </ToolInputPanel>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>
            {direction === 'encode' ? 'Encoded' : 'Decoded'}
          </h2>
          {result.value ? (
            <ToolCopyButton
              copied={copied === true}
              onClick={() => void handleCopy()}
            />
          ) : null}
        </div>
        <pre className={toolPreOutputClass}>
          {result.value || (
            <span className="text-neutral-500">Result appears here.</span>
          )}
        </pre>
        {direction === 'decode' && input ? (
          <p className={`${toolHintMetaClass} mt-3`}>
            {result.decoded.toLocaleString()} reference
            {result.decoded === 1 ? '' : 's'} decoded.
            {result.unknown.length > 0
              ? ` Not recognised (left as-is): ${result.unknown.slice(0, 8).join(' ')}${
                  result.unknown.length > 8 ? ' …' : ''
                }`
              : ''}
          </p>
        ) : null}
      </div>

      <div className={toolResultPanelClass}>
        <div className={toolResultHeaderRowClass}>
          <h2 className={toolSectionTitleClass}>Common entities</h2>
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {COMMON_ENTITY_REFERENCE.map((e) => (
            <div
              key={e.name}
              className={`${toolListItemClass} flex items-center justify-between gap-3`}
            >
              <span>{e.name}</span>
              <span className="text-xs text-neutral-400">
                {e.label}
                {e.char.trim() ? ` · ${e.char}` : ''}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <SecondaryButton
            onClick={() =>
              setUrl((s) => ({
                ...s,
                t: '<a href="/search?q=a&b">Café — “quoted” © 2026</a>'
              }))
            }
          >
            Load sample
          </SecondaryButton>
        </div>
      </div>
    </ToolLayout>
  )
}

export default function HtmlEntityCodec() {
  return (
    <Suspense
      fallback={
        <ToolLayout title="HTML Entity Encoder / Decoder">
          <p className="text-center text-sm text-neutral-400">Loading…</p>
        </ToolLayout>
      }
    >
      <HtmlEntityCodecInner />
    </Suspense>
  )
}
